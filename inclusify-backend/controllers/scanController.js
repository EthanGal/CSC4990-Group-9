const {scanWebsite} = require("../scanners/websiteScanner");
const {calculateAccessibilityGrade} = require("../grading/accessibilityGrader");

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
            const gradeResult = calculateAccessibilityGrade(
                scanResult.htmlContent,
                scanResult.detectedFonts,
                scanResult.fontSizes,
                scanResult.extractedData
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
        }

        res.json({success: true, reports});
    } catch (error) {
        console.error("Scanning error:", error);
        res.status(500).json({error: "Failed to process scan request."});
    }
}

module.exports = {scanAndGrade};