require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');  // Import the authentication routes
const scanRoutes = require('./routes/scanRoutes');
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
   next();
});

// Routes
app.use('/auth', authRoutes);  // Authentication routes (e.g., /auth/register, /auth/login)
app.use('/api/scan', scanRoutes);  // Scanning routes

// Test route to confirm server is running
app.get('/', (req, res) => {
   res.send('Backend is running!');
});

// Server setup
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
