require("dotenv").config();
const mysql = require("mysql2/promise");


// Create a connection pool (recommended for performance)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    connectTimeout: 11000
});

// Test the connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to the database.");
        connection.release();
    } catch (err) {
        console.error("Database connection failed:", err);
    }
})();

module.exports = pool;
