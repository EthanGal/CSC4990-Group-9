const express = require('express');
const {scanWebsite} = require('../controllers/scanController');
const {isValidUrl} = require('../utils/validators');

const router = express.Router();

router.post('/scan',async (req, res) => {
    const {urls} = req.body;

    if (!Array.isArray(urls)) {
        return res.status(400).json({error: "Invalid request format: urls is not an Array"}) //todo: clean this up
    }

    const validUrls = urls.map(url => url.trim()).filter(url => url !== '' && isValidUrl(url));
    if (validUrls.length === 0) {
        return res.status(400).json({error: "No valid URLs provided"})
    }

    try {
        const results = await Promise.all(validUrls.map(url => scanWebsite(url)));
        res.json({success: true, reports: results});
    } catch (error) {
        res.status(500).json({error: "An error occurred during scanning."});
    }

    //todo: save reports in the database
});

module.exports = router;