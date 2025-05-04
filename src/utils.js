const { timeouts } = require('./config');

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

module.exports = {
  waitAndClick,
  sleep,
  logStep,
};
