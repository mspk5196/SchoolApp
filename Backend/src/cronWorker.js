// Cron Worker for Railway deployment
// This process handles all scheduled tasks
require('dotenv').config();
const db = require('./config/db');

// Set environment to indicate this is a worker process
process.env.CRON_WORKER = 'true';

console.log('🚀 Starting Railway Cron Worker...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Timezone: ${process.env.TIMEZONE || 'Asia/Kolkata'}`);

// Test database connection
db.ping((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Import and start cron jobs
require('./cronManager');

// Keep the worker process alive
process.on('SIGINT', () => {
  console.log('🛑 Cron worker shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Cron worker terminating...');
  process.exit(0);
});

console.log('✅ Cron worker started successfully');

// Keep process alive
setInterval(() => {
  console.log(`💓 Cron worker heartbeat - ${new Date().toISOString()}`);
}, 300000); // Every 5 minutes
