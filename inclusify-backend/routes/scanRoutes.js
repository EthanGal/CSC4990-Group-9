const express = require('express');
const router = express.Router();
const {scanAndGrade} = require('../controllers/scanController');
const {isValidUrl} = require('../utils/validators');

router.post ('/', async (req,res) => {
    const {urls} = req.body;
    if (!Array.isArray(urls)) {
        return res.status(400).json({error: "Invalid request format: urls is not an Array"}) //todo: clean this up
    }

    const validUrls = urls.map(url => url.trim()).filter(url => url !=='' && isValidUrl (url));
    if (validUrls.length ===0){
        return res.status(400).json({error: "No valid URLs provided"})
    }

    try {
        req.validUrls = validUrls;
        await scanAndGrade(req, res);
    } catch (error){
        console.error("Error in scanRoutes:", error);
        res.status(500).json ({error: "An error occurred during scanning."});
    }

    //todo: save reports in the database

});

module.exports = router;