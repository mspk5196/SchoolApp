const express = require('express');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Only serve static files for actual local uploads, not Cloudinary URLs
app.use('/uploads', (req, res, next) => {
  // Don't serve Cloudinary URLs through static middleware
  if (req.url.includes('cloudinary.com') || req.url.startsWith('/http')) {
    return res.status(404).send('Not found');
  }
  next();
}, express.static('uploads'));

// Log requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`, req.body);
  next();
});

// Routes
app.use('/api', require('./routes/auth'));

app.use('/api', require('./routes/student'));
app.use('/api', require('./routes/coordinator'));
app.use('/api', require('./routes/mentor'));
app.use('/api', require('./routes/admin'));
app.use('/api', require('./routes/message'));


module.exports = app;
