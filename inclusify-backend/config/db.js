const mysql = require('mysql');
require ('dotenv').config();

const db = mysql.createConnection({ //TODO: Secure database parameters
    host: process.env.DB_HOST || 'inclusifydb.ce3e42isu88z.us-east-1.rds.amazonaws.com' ,
    user: process.env.DB_USER || 'dbMasterLog',
    password:process.env.DB_PASSWORD ||'inclusifyDBPWD',
    database:process.env.DB_NAME || 'Inclusify',
});


db.connect(err => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Connected to the database');
});

module.exports = db;