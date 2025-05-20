const cron = require('node-cron');
const { checkOverdueLevels } = require('./mentorController');

cron.schedule('0 1 * * *', () => {
  console.log('Running daily overdue check...');
  checkOverdueLevels();
});