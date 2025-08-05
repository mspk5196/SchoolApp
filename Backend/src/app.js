const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    worker: process.env.CRON_WORKER === 'true' ? 'cron-worker' : 'web-server'
  });
});

// Cron status endpoint
app.get('/cron-status', (req, res) => {
  const cronManager = require('./cronManager');
  res.status(200).json({
    status: 'available',
    jobs: [
      { name: 'attendance-updater', schedule: '0 18 * * *', description: 'Daily attendance updates' },
      { name: 'assessment-sessions', schedule: '59 23 * * *', description: 'Create assessment sessions' },
      { name: 'academic-sessions', schedule: '30 0 * * *', description: 'Create academic sessions' },
      { name: 'overdue-check', schedule: '0 1 * * *', description: 'Check overdue levels' }
    ],
    timezone: process.env.TIMEZONE || 'Asia/Kolkata',
    worker_active: process.env.CRON_WORKER === 'true'
  });
});

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

// Initialize cron jobs only if not running as a separate worker
// This prevents duplicate cron jobs when running both web and worker processes
if (!process.env.CRON_WORKER) {
  console.log('🕐 Loading cron jobs for Railway deployment...');
  require('./cronManager');
}

module.exports = app;
