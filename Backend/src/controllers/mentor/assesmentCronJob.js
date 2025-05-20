// In your server setup (e.g., server.js)
const cron = require('node-cron');
const mentorController = require('./mentorController');

// Run daily at 11:59 PM
cron.schedule('59 23 * * *', () => {
  const today = new Date().toISOString().split('T')[0];
  mentorController.createAssessmentSessionsByDate(today)
    .then(created => console.log(`Created ${created} assessment sessions`))
    .catch(err => console.error('Error creating assessment sessions:', err));
});