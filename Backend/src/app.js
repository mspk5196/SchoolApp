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

app.use('/api/auth', require('./routes/auth'));
app.use('/api/general', require('./routes/generalRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/coordinator', require('./routes/coordinatorRoutes'));
app.use('/api/mentor', require('./routes/mentorRoutes'));


module.exports = app;