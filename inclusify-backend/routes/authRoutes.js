const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const {getUserID} = require("../scanners/websiteScanner");
require("dotenv").config();


const router = express.Router();

// Register Route
// Register Route
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Check if username already exists
        const [existingUsers] = await db.query("SELECT * FROM Users WHERE userName = ?", [username]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Username already exists." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const query = "INSERT INTO Users (userName, userPass) VALUES (?, ?)";
        await db.query(query, [username, hashedPassword]);

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("Error during registration:", err.sqlMessage || err.message);
        res.status(500).json({ message: "Registration failed.", error: err.sqlMessage || err.message });
    }
});


// Login Route
router.post("/login", async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required."});
    }

    try {
        const query = "SELECT * FROM Users WHERE userName = ?";
        const [results] = await db.query(query, [username]);

        if (results.length === 0) {
            return res.status(401).json({message: "Invalid username or password."});
        }

        const user = results[0];

        if (!user.userPass) {
            return res.status(500).json({message: "Server error: userPass missing in DB."});
        }

        const isMatch = await bcrypt.compare(password, user.userPass);
        if (!isMatch) {
            return res.status(401).json({message: "Invalid username or password."});
        }

        // Generate JWT token
        const token = jwt.sign({userID: user.userID}, process.env.JWT_SECRET, {expiresIn: "1h"});

        res.status(200).json({
            message: "Login successful!",
            token,
            userID: user.userID,
            username: user.userName
        });


    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({message: "Server error during login.", error: err.message});
    }
});

module.exports = router;
