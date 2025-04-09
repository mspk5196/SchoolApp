const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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

module.exports = app;
