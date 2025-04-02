require("dotenv").config();
const mysql = require("mysql2");
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:3306,
    connectTimeout: 10000 // Increase timeout in case of delays
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to the database.");
});

module.exports = db;
