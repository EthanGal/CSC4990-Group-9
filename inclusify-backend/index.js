require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const db = require('./config/db');
const reviewRoutes = require('./routes/reviewsRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
    next();
});

// Routes
app.use('/api/scan', scanRoutes);
app.use('/reviews', reviewRoutes);
app.use('/auth', authRoutes);


app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Server setup
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
