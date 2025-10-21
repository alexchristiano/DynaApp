// Basic Express server setup for MERN backend
const express = require('express');
require('dotenv').config();
const connectDB = require('./db');
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.get('/', (req, res) => {
  res.send('Hello from MERN backend!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
