const { runAttendanceUpdater } = require('./attendanceCron');

runAttendanceUpdater().then(() => {
  console.log('Manual attendance update finished.');
  process.exit(0);
}).catch(err => {
  console.error('Error running attendance updater:', err);
  process.exit(1);
});