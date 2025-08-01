const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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
