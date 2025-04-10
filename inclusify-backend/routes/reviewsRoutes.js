const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/scans', async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    try {
        const query = `
            SELECT 
            w.webID, 
            w.webName, 
            w.webURL, 
            u.username, 
            a.totalScore, 
            a.LatestGrade, 
            a.Date,
            (SELECT revBody FROM userReviews WHERE userReviews.webID = w.webID ORDER BY revDate DESC LIMIT 1) AS latestComment,
            (SELECT COUNT(*) FROM userReviews WHERE userReviews.webID = w.webID) AS commentCount
            FROM Websites w
            JOIN Users u ON w.userID = u.userID
            JOIN accessRatings a ON w.webID = a.webID
            ORDER BY a.Date DESC
            LIMIT ? OFFSET ?;
            `;

        const [results] = await pool.query(query, [limit, offset]);

        const [[{total}]] = await pool.query(`
            SELECT COUNT(*) as total FROM Websites;
        `);

        res.json({results, total});
    } catch (error) {
        console.error("Error fetching paginated reviews:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

router.get('/comments/:webID', async (req, res) => {
    const {webID} = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT u.username, ur.revDate, ur.revBody as commentBody
             FROM userReviews ur
             JOIN Users u ON u.userID = ur.userID
             WHERE ur.webID = ?`, [webID]
        );

        res.json(rows || []);
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({error: "Server error"});
    }
});

router.post('/comment', async (req, res) => {
    try {
        const {webID, comment, userID} = req.body;
        const query = `
            INSERT INTO userReviews (revBody, webID, userID, revDate)
            VALUES (?, ?, ?, NOW())
        `;
        await pool.query(query, [comment, webID, userID]);
        res.status(200).json({message: 'Comment added successfully'});
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;
