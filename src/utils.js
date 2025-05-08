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
    
  // Define window: 5 minutes before and 5 minutes after (reduced from 20 minutes)
  const windowStart = moment(now).subtract(5, 'minutes');
  const windowEnd = moment(now).add(5, 'minutes');
  
  // Find the closest meeting within the time window
  let closestMeeting = null;
  let smallestDifference = Infinity;

  console.log('Current time:', now.format('HH:mm'));
  console.log('Current day:', currentDay);

  for (const meeting of meetings) {
    if (meeting.day === currentDay) {
      // Parse meeting time with moment using 24h format
      const [hours, minutes] = meeting.time.split(':');
      const meetingTime = moment().tz('America/Denver')
        .hours(parseInt(hours, 10))
        .minutes(parseInt(minutes, 10))
        .seconds(0)
        .milliseconds(0);

      console.log(`Checking meeting: ${meeting.title}`);
      console.log(`Meeting time: ${meeting.time} -> ${meetingTime.format('HH:mm')}`);

      
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
  
  // Debug log
  if (closestMeeting) {
    
    // Return the meeting object - ensure it has all required properties
    return {
      url: closestMeeting.url,
      password: closestMeeting.password || null,  // May be undefined for some meetings
      title: closestMeeting.title
    };
  } else {
    // Return default values as an object
    return {
      url: "https://zoom.us",
      password: null,
      title: "No scheduled meeting"
    };
  }
}

/**
 * Encuentra y hace clic en un elemento que contiene un texto específico
 * @param {Page|Frame} context - Page o Frame de Puppeteer donde buscar
 * @param {string} selector - Selector base para buscar elementos
 * @param {string} text - Texto a buscar dentro de los elementos
 * @param {number} timeout - Tiempo máximo de espera en ms
 */
async function findAndClickElementWithText(context, selector, text, timeout = 15000) {
  logStep(`Buscando elemento '${selector}' que contenga texto '${text}'`);
  
  const startTime = Date.now();
  let found = false;
  
  while (Date.now() - startTime < timeout && !found) {
    try {
      // Evaluar dentro del contexto para encontrar elementos que coincidan
      found = await context.evaluate((sel, txt) => {
        const elements = Array.from(document.querySelectorAll(sel));
        const targetElement = elements.find(el => {
          // Buscar en el texto del elemento
          if (el.textContent.toLowerCase().includes(txt.toLowerCase())) {
            return true;
          }
          
          // Buscar en los hijos span
          const spans = Array.from(el.querySelectorAll('span'));
          return spans.some(span => 
            span.textContent.toLowerCase().includes(txt.toLowerCase())
          );
        });
        
        if (targetElement) {
          targetElement.click();
          return true;
        }
        return false;
      }, selector, text);
      
      if (found) {
        logStep(`Elemento con texto '${text}' encontrado y clicado exitosamente`);
        return true;
      }
      
      // Esperar un poco antes de intentar de nuevo
      await sleep(500);
    } catch (error) {
      // Continuar intentando si hay un error
      await sleep(500);
    }
  }
  
  if (!found) {
    logStep(`No se pudo encontrar el elemento con texto '${text}' después de ${timeout}ms`);
    throw new Error(`No se pudo encontrar el elemento con texto: ${text}`);
  }
  
  return found;
}

module.exports = {
  findNearestMeeting,
  waitAndClick,
  sleep,
  logStep,
  findAndClickElementWithText,
};
