require ('dotenv').config();
const express = require('express');
const cors = require('cors')
const scanRoutes = require ('./routes/scanRoutes');
const db = require ('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
   console.log("Middleware check - Body Parser Applied");
   next();
});

app.use('/api/scan', scanRoutes);

app.get ('/', (req,res) =>{
   res.send('Backend is running!')
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));