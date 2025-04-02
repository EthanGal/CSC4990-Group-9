const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into the correct table with correct column names
        const query = "INSERT INTO Users (userName, userPass) VALUES (?, ?)";
        db.query(query, [username, hashedPassword], (err, result) => {
            if (err) {
                console.error("Database error:", err.sqlMessage || err);
                return res.status(500).json({ message: "Database error.", error: err.sqlMessage || err });
            }
            res.status(201).json({ message: "User registered successfully!" });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});
// Login Route
// Login Route
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if user exists
    const query = "SELECT * FROM Users WHERE userName = ?";
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error("Database error:", err.sqlMessage || err);
            return res.status(500).json({ message: "Database error.", error: err.sqlMessage || err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const user = results[0];

        // Check if userPass is missing
        if (!user.userPass) {
            console.error("Error: userPass is undefined. Check database column names.");
            return res.status(500).json({ message: "Server error: Invalid database response." });
        }

        // Compare passwords
        try {
            const isMatch = await bcrypt.compare(password, user.userPass);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid username or password." });
            }

            // Generate JWT token
            const token = jwt.sign({ userID: user.userID }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.status(200).json({ message: "Login successful!", token });
        } catch (error) {
            console.error("Error comparing passwords:", error);
            res.status(500).json({ message: "Server error.", error: error.message });
        }
    });
});

module.exports = router;
