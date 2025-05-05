// Avoid circular dependency with config.js
const meetings = require('./data.json');
const moment = require('moment-timezone');

async function waitAndClick(frame, selector, options = {}) {
  const timeout = options.timeout || 15000; // Default timeout: 15 seconds
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
  // Get current time in Denver timezone (America/Denver)
  const now = moment().tz('America/Denver');
  const currentDay = now.format('dddd').toLowerCase();
    
  // Define window: 20 minutes before and 20 minutes after
  const windowStart = moment(now).subtract(20, 'minutes');
  const windowEnd = moment(now).add(20, 'minutes');
  
  // Find the closest meeting within the time window
  let closestMeeting = null;
  let smallestDifference = Infinity;

  for (const meeting of meetings) {
    if (meeting.day === currentDay) {
      // Parse meeting time with moment
      const meetingTime = moment(meeting.time, 'h:mm A').tz('America/Denver');
      
      // Set meeting time to today
      meetingTime.year(now.year()).month(now.month()).date(now.date());
      
      // Check if meeting is within our window
      if (meetingTime.isBetween(windowStart, windowEnd, null, '[]')) {
        // Calculate the absolute time difference in minutes
        const timeDifference = Math.abs(meetingTime.diff(now, 'minutes'));
        
        // If this meeting is closer than the previous closest, update it
        if (timeDifference < smallestDifference) {
          smallestDifference = timeDifference;
          closestMeeting = meeting;
        }
      }
    }
  }
  
  // Return the meeting data or default values
  if (closestMeeting) {
    // Debug log
    console.log('🚀 ~ findNearestMeeting ~ found closest meeting:', closestMeeting.title);
    
    // Return the meeting object - ensure it has all required properties
    return {
      url: closestMeeting.url,
      password: closestMeeting.password || null,  // May be undefined for some meetings
      title: closestMeeting.title
    };
  } else {
    console.log('🚀 ~ findNearestMeeting ~ no meeting found within time window');
    // Return default values as an object
    return {
      url: "https://zoom.us",
      password: null,
      title: "No scheduled meeting"
    };
  }
}

module.exports = {
  waitAndClick,
  sleep,
  logStep,
  findNearestMeeting,
};
