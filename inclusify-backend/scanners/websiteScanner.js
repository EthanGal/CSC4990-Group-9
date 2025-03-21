const puppeteer = require("puppeteer"); //use puppeteer to launch a headless chrome browser, navigate to website, and extract data

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
        const htmlContent = await page.evaluate(() => document.body.innerHTML);
        const bodyText = await page.evaluate(() => document.body.innerText);

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
                        lineNumber = index + 1; // Convert index to 1-based line number
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

        console.log(`Scanned title: ${title}`);

        //returns page data for evaluation (called in accessibilityGrader)
        return {
            url,
            title,
            htmlContent,
            bodyText,
            fontSizes,
            extractedData // Keeps colors and elements together as an array of objects
        };


    } catch (error) {
        console.log(`Error Scanning ${url}:`, error.message);
        return {url, error: error.message};
    }
};

module.exports = {scanWebsite};