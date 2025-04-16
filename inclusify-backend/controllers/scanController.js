const {scanWebsite} = require("../scanners/websiteScanner");
const {calculateAccessibilityGrade} = require("../grading/accessibilityGrader");
const db = require('../config/db.js');

async function sendFinalScoreToDB(url, score, grade, gradeDetails) {
    let connection;
    let DBSuccess = false;
    try{
        connection = await db.getConnection();
        const [rows] = await connection.query(
            'SELECT webID FROM Websites WHERE webURL = ?', [url]
        );

        if (rows.length > 0) {
            const id = rows[0].webID;
            console.log('Recording Score for WebID:', id);
            await connection.execute(
                'INSERT INTO accessRatings (TotalScore, WebID, LatestGrade) VALUES (?, ?, ?)',
                [score, id, grade]
            );
            console.log('Successfully updated Website Score');
            DBSuccess = true;
        } else {
            console.log('No website found for that URL.');
        }

    } catch (error) {
        console.error('MySQL error', error.message);
    } finally {
        if (connection) connection.release();
    }

    if (DBSuccess) {
        try {
            connection = await db.getConnection();
            const [rows] = await connection.query(
                'SELECT RatingID FROM accessRatings ORDER BY Date DESC LIMIT 1;'
            );

            if (rows.length > 0) {
                const id = rows[0].RatingID;
                console.log('Recording Feature Scores for Rating:', id);

                await connection.execute(
                    `INSERT INTO featEval (FeatName, FeatScore, RatingID) VALUES 
                    (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)`,
                    [
                        'html', gradeDetails.html.score, id,
                        'Font Styles', gradeDetails.fontReadability.score, id,
                        'Font Size', gradeDetails.fontSize.score, id,
                        'Aria Compliance', gradeDetails.aria.score, id,
                        'Alt Text', gradeDetails.altText.score, id,
                        'Contrast', gradeDetails.contrast.score, id,
                        'Tab Navigation', gradeDetails.tabNavigation.score, id
                    ]
                );
            }
            console.log('Feature Scores Recorded Successfully!')
        } catch (error) {
            console.error('MySQL error', error.message);
        } finally {
            if (connection) connection.release();
        }
    }
}

async function scanAndGrade(req, res) {
    console.log("Incoming request received in scanAndGrade!");
    console.log("req.body:", req.body);
    if (!req.validUrls) {
        return res.status(400).json({error: "No valid URLs found for scanning."});
    }

    try {
        const reports = [];

        for (const url of req.validUrls) {
            console.log(`Scanning: ${url}`);

            let scanResult;
            try {
                scanResult = await scanWebsite(url);
                console.log(`Scan completed: ${url}`);
                console.log(`--------------------------------`);
            } catch (scanError) {
                console.error(`Error scanning ${url}:`, scanError);
                reports.push({url, error: "Failed to scan website."});
                continue;
            }

            if (!scanResult || !scanResult.htmlContent) {
                console.error(`No HTML content found for ${url}`);
                reports.push({url, error: "No HTML content found."});
                continue;
            }

            // Start the grading process
            const gradeResult = await calculateAccessibilityGrade(
                scanResult.htmlContent,
                scanResult.detectedFonts,
                scanResult.fontSizes,
                scanResult.extractedData,
                scanResult.fontSizesWithLineNumbers
            );

            // Console output for debugging
            console.log(`Scan Complete for: ${scanResult.title}`);
            console.log(`URL: ${url}`);
            console.log(`Title: ${scanResult.title}`);
            console.log(`Accessibility Grade: ${gradeResult.finalScore.toFixed(2)}`);
            console.log("Breakdown:", gradeResult.details);
            console.log("-----------------------------------");

            reports.push({
                url,
                title: scanResult.title,
                finalScore: gradeResult.finalScore.toFixed(2),
                grade: gradeResult.grade,
                criteriaScores: gradeResult.details
            });

            await sendFinalScoreToDB(url, gradeResult.finalScore.toFixed(2), gradeResult.grade, gradeResult.details);

        }

        res.json({success: true, reports});
    } catch (error) {
        console.error("Scanning error:", error);
        res.status(500).json({error: "Failed to process scan request."});
    }
}

module.exports = {scanAndGrade};