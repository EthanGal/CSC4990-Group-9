require ('dotenv').config();
const express = require('express');
const cors = require('cors')
const puppeteer = require('puppeteer');
const mysql = require('mysql');
const {response} = require("express");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({ //TODO: Secure database parameters
    host: "inclusifydb.ce3e42isu88z.us-east-1.rds.amazonaws.com",
    user: "dbMasterLog",
    password:"inclusifyDBPWD",
    database:"Inclusify",
});

db.connect(err => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Connected to the database');
});

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
        await page.goto(url, {timeout: 40000, waitUntil:'domcontentloaded'});

        await page.waitForSelector('body', {timeout: 20000});

        const title = await page.title();
        const htmlContent = await page.evaluate(() => document.body.innerHTML.substring(0,200));
        const accessibilityScore = Math.floor(Math.random()*100);

        await browser.close();

        console.log(`test title: ${title} + ${htmlContent}` );
        return {url, title, htmlContent, accessibilityScore};


    } catch (error) {
        console.log(`FLAG2: Error Scanning ${url}:`);
        return {url, error: error.message};
    }
}

app.post ('/scan', async (req,res) => {
    const {urls} = req.body;
    if (!Array.isArray(urls)) {
        return res.status(400).json({error: "Invalid request format: urls is not an Array"}) //todo: clean this up
    }

    const validUrls = urls.map(url => url.trim()).filter(url => url !=='' && isValidUrl (url));
   if (validUrls.length ===0){
       return res.status(400).json({error: "No valid URLs provided"})
   }
   try {
       const results = await Promise.all(validUrls.map(url => scanWebsite(url)));
       res.json({success: true, reports: results});
   } catch (error){
       res.status(500).json ({error: "An error occurred during scanning."});
   }

    //todo: save reports in the database

})

const isValidUrl = (url) => {
    try{
        new URL(url);
        return true;
    } catch (err){
        return false;
    }
}
app.get ('/', (req,res) =>{
   res.send('Backend works Test1')
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));