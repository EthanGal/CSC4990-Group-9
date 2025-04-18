const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get('/', async (req, res) => {
    const { userID } = req.query;
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    try {
        const [results] = await db.query(`
            SELECT 
                w.webID,
                w.webURL,
                w.webName,
                w.Date,
                a.TotalScore,
                a.LatestGrade
            FROM Websites w
            LEFT JOIN (
                SELECT ar.*
                FROM accessRatings ar
                JOIN (
                    SELECT webID, MAX(Date) AS maxDate
                    FROM accessRatings
                    GROUP BY webID
                ) latest ON ar.webID = latest.webID AND ar.Date = latest.maxDate
            ) a ON w.webID = a.webID
            WHERE w.userID = ?
            ORDER BY w.Date DESC
            LIMIT ? OFFSET ?
        `, [userID, limit, offset]);

        const [[{ count }]] = await db.query(`
            SELECT COUNT(*) as count FROM Websites WHERE userID = ?
        `, [userID]);

        res.json({ results, total: count });
    } catch (err) {
        console.error("Failed to fetch user scans:", err);
        res.status(500).send('Failed to fetch user scans');
    }
});

module.exports = router;
