const { createTodayAcademicSessions } = require('./mentorController');
const cron = require('node-cron');
require('dotenv').config();

cron.schedule('5 0 * * *', async () => {
  try {
    // Create a mock res object with minimal functionality
    const fakeRes = {
      json: (data) => console.log('✅ Academic sessions creation result:', data),
      status: () => fakeRes, // allow .status().json()
    };
    await createTodayAcademicSessions({}, fakeRes);
  } catch (error) {
    console.error('❌ Cron job error:', error);
  }
});

// (async () => {
//   const { createTodayAcademicSessions } = require('./mentorController');
//   await createTodayAcademicSessions({}, {
//     status: () => ({ json: console.log }),
//     json: console.log,
//   });
// })();
