const puppeteer = require ("puppeteer");

const scanWebsite = async (url) => {
    const browser = await puppeteer.launch ({
        headless: "new",
        ignoreHTTPSErrors: true,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    try {

        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        );
        await page.setExtraHTTPHeaders({"Accept-Language": "en-US,en;q=0.9"})
        await page.goto(url, {timeout: 50000, waitUntil:'domcontentloaded'});

        await page.waitForSelector('body', {timeout: 20000});

        const title = await page.title();
        const htmlContent = await page.evaluate(() => document.body.innerHTML);
        const bodyText = await page.evaluate(() => document.body.innerText);

        const fontSizes = await page.evaluate(() => {
            const elements = [...document.querySelectorAll('*')];
            return [...new Set(elements.map(el => window.getComputedStyle(el).fontSize))]
        });
        await browser.close();

        console.log(`Scanned title: ${title}`);
        return {url, title, htmlContent, bodyText, fontSizes};

    } catch (error) {
        console.log(`Error Scanning ${url}:`, error.message);
        return {url, error: error.message};
    }
};

module.exports = {scanWebsite};