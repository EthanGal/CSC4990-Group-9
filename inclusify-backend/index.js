require ('dotenv').config();
const express = require('express');
const cors = require('cors')
const puppeteer = require('puppeteer');
const mysql = require('mysql');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({ //TODO: Secure database parameters
    host: "inclusifydb.ce3e42isu88z.us-east-1.rds.amazonaws.com",
    user: "dbMasterLog",
    password:"inclusifyDBPWD",
    database:"Inclusify",
});

db.connect(err => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Connected to the database');
});

app.get ('/', (req,res) =>{
   res.send('Backend works Test1')
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));