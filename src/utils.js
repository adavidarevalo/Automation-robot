const { timeouts } = require('./config');
const meetings = require('./data.json');

async function waitAndClick(frame, selector, options = {}) {
  const timeout = options.timeout || timeouts.element;
  await frame.waitForSelector(selector, { timeout });
  await frame.click(selector);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logStep(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function findNearestMeeting() {
  // Get current time in Provo timezone (UTC-6)
  const now = new Date();
  const provoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));
  const currentDay = provoTime.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentHour = provoTime.getHours();
  const currentMinute = provoTime.getMinutes();

  let nearestMeeting = null;
  let minDifference = Infinity;

  for (const meeting of meetings) {
    if (meeting.day === currentDay) {
      const [time, period] = meeting.time.split(' ');
      const [hours, minutes] = time.split(':');
      let meetingHours = parseInt(hours);
      const meetingMinutes = parseInt(minutes);

      // Convert to 24-hour format
      if (period === 'PM' && meetingHours !== 12) {
        meetingHours += 12;
      } else if (period === 'AM' && meetingHours === 12) {
        meetingHours = 0;
      }

      // Calculate time difference in minutes
      const meetingTimeInMinutes = meetingHours * 60 + meetingMinutes;
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const difference = meetingTimeInMinutes - currentTimeInMinutes;

      // Only consider future meetings (positive difference)
      if (difference > 0 && difference < minDifference) {
        minDifference = difference;
        nearestMeeting = meeting;
      }
    }
  }

  return nearestMeeting ? nearestMeeting.link : null;
}

module.exports = {
  waitAndClick,
  sleep,
  logStep,
  findNearestMeeting,
};
