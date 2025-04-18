const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/scans', async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    try {
        // Fetching paginated results with ratingID
        const query = `
            SELECT 
            w.webID, 
            w.webName, 
            w.webURL, 
            u.username, 
            a.totalScore, 
            a.LatestGrade, 
            a.Date,
            a.ratingID,  -- Add ratingID here
            (SELECT revBody FROM userReviews WHERE userReviews.webID = w.webID ORDER BY revDate DESC LIMIT 1) AS latestComment,
            (SELECT revDate FROM userReviews WHERE userReviews.webID = w.webID ORDER BY revDate DESC LIMIT 1) AS latestCommentDate,
            (SELECT COUNT(*) FROM userReviews WHERE userReviews.webID = w.webID) AS commentCount
            FROM Websites w
            JOIN Users u ON w.userID = u.userID
            JOIN accessRatings a ON w.webID = a.webID
            WHERE a.Date = (
                SELECT MAX(a2.Date) FROM accessRatings a2 WHERE a2.webID = w.webID
            )
            ORDER BY a.Date DESC
            LIMIT ? OFFSET ?;
        `;

        const [results] = await pool.query(query, [limit, offset]);

        // Debug: Output to verify the query result
        console.log('Paginated Results:', results);

        // Fetching the total count of matching records
        const [[{ total }]] = await pool.query(`
        SELECT COUNT(*) AS total
        FROM (
            SELECT 
                w.webID
            FROM Websites w
            JOIN Users u ON w.userID = u.userID
            JOIN accessRatings a ON w.webID = a.webID
            WHERE a.Date = (
                SELECT MAX(a2.Date) FROM accessRatings a2 WHERE a2.webID = w.webID
            )
            ORDER BY a.Date DESC
        ) AS sub;
        `);

        // Debug: Output the total count
        console.log('Total Count:', total);

        res.json({ results, total });
    } catch (error) {
        console.error("Error fetching paginated reviews:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/comments/:webID', async (req, res) => {
    const { webID } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT u.username, ur.revDate, ur.revBody as commentBody, ur.ratingID
             FROM userReviews ur
             JOIN Users u ON u.userID = ur.userID
             WHERE ur.webID = ?`,
            [webID]
        );

        res.json(rows || []);
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/comment', async (req, res) => {
    try {
        const { webID, comment, userID } = req.body;

        // Get the most recent ratingID for this webID
        const [ratingRows] = await pool.query(
            `SELECT ratingID FROM accessRatings WHERE webID = ? ORDER BY Date DESC LIMIT 1`,
            [webID]
        );

        const ratingID = ratingRows[0]?.ratingID;

        const query = `
            INSERT INTO userReviews (revBody, webID, userID, revDate, ratingID)
            VALUES (?, ?, ?, NOW(), ?)
        `;
        await pool.query(query, [comment, webID, userID, ratingID]);

        res.status(200).json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
