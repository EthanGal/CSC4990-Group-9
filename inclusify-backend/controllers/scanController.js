const puppeteer = require('puppeteer');

const scanWebsite = async (url) => {
    if (!url || !url.startsWith("http")) {
        return {url, error: "Invalid URL format"}
    }

    console.log(`FLAG1: Scanning:${url}`);

    try {
        const browser = await puppeteer.launch ({
            headless: "new",
            ignoreHTPPSErrors: true,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36")
        await page.setExtraHTTPHeaders({"Accept-Language": "en-US,en;q=0.9"})
        await page.goto(url, {timeout: 50000, waitUntil:'domcontentloaded'});

        await page.waitForSelector('body', {timeout: 20000});

        const title = await page.title();
        const htmlContent = await page.evaluate(() => document.body.innerHTML.substring(0,200));
        const accessibilityScore = Math.floor(Math.random()*100);

        await browser.close();

        console.log(`test title: ${title} + Content: ${htmlContent}`);
        return {url, title, htmlContent, accessibilityScore};


    } catch (error) {
        console.log(`FLAG2: Error Scanning ${url}:`);
        return {url, error: error.message};
    }
};

module.exports = {scanWebsite};