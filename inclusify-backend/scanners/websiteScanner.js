const db = require('../config/db.js');
const puppeteer = require("puppeteer"); //use puppeteer to launch a headless chrome browser, navigate to website, and extract data

let id = 1;

const getUserID = (userID) => {
    id = userID;
    console.log(`User ID: ${id}`);
}
module.exports = {getUserID};

async function saveWebsite(title, url) {
    let connection;
    try {
        connection = await db.getConnection();

        const [rows] = await connection.query(
            'SELECT 1 FROM Websites WHERE webURL = ?',
            [url]
        );
        if (rows.length > 0) {
            console.log('Website already exists in DB!');
        } else {
            await connection.execute(
                'INSERT INTO Websites (webName, webURL, userID) VALUES (?, ?, ?)',
                [title, url, id]
            );
            console.log('Website Inserted!')
        }
    } catch (error) {
        console.error('MySQL error', error.message);
    } finally {
        if (connection) connection.release();
    }
}

const scanWebsite = async (url) => {
    //launch the browser
    const browser = await puppeteer.launch({
        headless: "new", //runs in headless mode, (no UI)
        ignoreHTTPSErrors: true,
        args: [
            '--disable-blink-features=AutomationControlled', //disables automation detection (allows robots.txt bypass)
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    try {
        const page = await browser.newPage(); //opens new tab in the browser
        //mimics a real browser
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        );
        await page.setExtraHTTPHeaders({"Accept-Language": "en-US,en;q=0.9"}) //forces the page to load in english
        await page.goto(url, {timeout: 50000, waitUntil: 'domcontentloaded'}); //loads page, waits for DOM content to load

        await page.waitForSelector('body', {timeout: 20000});//ensures page loads properly

        //extract page data
        const title = await page.title();
        await saveWebsite(title, url);
        const htmlContent = await page.evaluate(() => document.body.innerHTML);
        const detectedFonts = await page.evaluate(() => {
            const elements = [...document.querySelectorAll('*')];
            const fontFamilies = elements.map(el => {
                const font = window.getComputedStyle(el).fontFamily;
                return font && font !== 'none' ? font : null;
            }).filter(font => font !== null);

            return [...new Set(fontFamilies)]; // Remove duplicates
        }
        );

        const fontSizesWithLineNumbers = await page.evaluate(() => {
            const elements = [...document.querySelectorAll('*')];

            // Function to extract the line number from HTML source
            const getLineNumberFromHTML = (element) => {
                const htmlString = document.documentElement.outerHTML;
                const elementHTML = element.outerHTML;

                // Find the index of the element's HTML in the document string
                const index = htmlString.indexOf(elementHTML);

                // Calculate the line number based on index (adjust for your case)
                const lines = htmlString.slice(0, index).split('\n');
                return lines.length;
            };

            // Get font sizes with actual line numbers
            return elements.map(el => {
                const fontSize = window.getComputedStyle(el).fontSize;
                const lineNumber = getLineNumberFromHTML(el); // Get exact line number in HTML
                return { fontSize, lineNumber };
            });
        });

        console.log(fontSizesWithLineNumbers);

        const fontSizes = await page.evaluate(() => {
            const elements = [...document.querySelectorAll('*')];
            return [...new Set(elements.map(el => window.getComputedStyle(el).fontSize))]
        });
        const extractedData = await page.evaluate(() => {
            const elements = [...document.querySelectorAll('*')];
            let extractedData = [];

            //full html for detecting line numbers
            const htmlSource = document.documentElement.innerHTML.split("\n");

            elements.forEach(el => {
                const styles = window.getComputedStyle(el);
                const textColor = styles.color;
                const bgColor = styles.backgroundColor;
                const borderColor = styles.borderColor;

                let lineNumber = "Unknown";
                if (el.outerHTML) {
                    const index = htmlSource.findIndex(line => line.includes(el.outerHTML.trim().slice(0, 50)));
                    if (index !== -1) {
                        lineNumber = index + 1;
                    }
                }

                if (textColor && textColor !== 'rgba(0, 0, 0, 0)') {
                    extractedData.push({color: textColor, element: el.outerHTML, lineNumber});
                }
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                    extractedData.push({color: bgColor, element: el.outerHTML, lineNumber});
                }
                if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
                    extractedData.push({color: borderColor, element: el.outerHTML, lineNumber});
                }
            });

            return extractedData;
        });

        await browser.close(); //closes browser
        console.log("Extracted fonts:", detectedFonts);

        console.log(`Scanned title: ${title}`);

        //returns page data for evaluation (called in accessibilityGrader)
        return {
            url,
            title,
            htmlContent,
            detectedFonts,
            fontSizes,
            fontSizesWithLineNumbers,
            extractedData // Keeps colors and elements together as an array of objects
        };


    } catch (error) {
        console.log(`Error Scanning ${url}:`, error.message);
        return {url, error: error.message};
    }
};

module.exports = {scanWebsite};