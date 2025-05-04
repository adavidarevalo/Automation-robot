const puppeteer = require('puppeteer');
const URL = require('url').URL;

// Configuration
const CONFIG = {
  browserOptions: {
    headless: false,
    args: ["--start-maximized", "--no-sandbox", "--disable-setuid-sandbox", "--use-fake-ui-for-media-stream"],
  },
  viewport: { width: 1366, height: 768 },
  zoomUrl:
    "https://byupathway.zoom.us/j/8013624576?pwd=MGZ5SnQ1b2RzVFZUS3lFNDlnbnhHUT09#success",
  userName: "David Arevalo",
};

// Selectors
const SELECTORS = {
  joinFromBrowser: 'a[role="button"][web_client=""]',
  continueWithoutDevices: 'div[role="button"].continue-without-mic-camera',
  nameInput: '#input-for-name',
  joinButton: 'button.preview-join-button'
};

async function initializeBrowser() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch(CONFIG.browserOptions);
  
  // Set up permissions
  const context = browser.defaultBrowserContext();
  await context.clearPermissionOverrides();
  const zoomUrl = new URL(CONFIG.zoomUrl);
  await context.overridePermissions(zoomUrl.origin, ['camera', 'microphone']);
  
  const page = await context.newPage();
  await page.setViewport(CONFIG.viewport);
  return { browser, page };
}

async function navigateToZoom(page) {
  console.log("Navigating to Zoom URL...");
  await page.goto(CONFIG.zoomUrl);
  await page.waitForSelector(SELECTORS.joinFromBrowser, { timeout: 15000 });
  await page.click(SELECTORS.joinFromBrowser);
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function handleMuteMeeting(frame) {
  console.log("Handling mute meeting...");
  try {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await frame.waitForSelector(
      'button.preview-video__control-button[aria-label="Mute"]',
      { timeout: 15000 }
    );
    await frame.click(
      'button.preview-video__control-button[aria-label="Mute"]'
    );
    console.log("Clicked mute button");
  } catch (error) {
    throw new Error(`Failed to mute meeting: ${error.message}`);
  }
}

async function handleChangeCamera(frame) {
  console.log("Handling camera change...");
  try {
    await frame.waitForSelector(
      'button.preview__toggle[aria-label="More video controls"]',
      { timeout: 15000 }
    );
    await frame.click(
      'button.preview__toggle[aria-label="More video controls"]'
    );
    console.log("Clicked video controls toggle");
  } catch (error) {
    throw new Error(`Failed to change camera: ${error.message}`);
  }
}

async function joinMeeting(frame) {
  try {
    await frame.waitForSelector(SELECTORS.nameInput, { timeout: 15000 });
    await frame.type(SELECTORS.nameInput, CONFIG.userName);
    console.log("Typed name into input field");

    await frame.waitForSelector(SELECTORS.joinButton);
    await frame.click(SELECTORS.joinButton);
    console.log("Clicked Join button");
  } catch (error) {
    throw new Error(`Failed to join meeting: ${error.message}`);
  }
}

async function openZoomMeeting() {
  let browser;
  try {
    // Initialize browser and page
    const { browser: b, page } = await initializeBrowser();
    browser = b;

    // Navigate to Zoom
    await navigateToZoom(page);

    // Get the Zoom meeting frame
    const frames = await page.frames();
    const zoomFrame = frames[1];

    if (!zoomFrame) {
      throw new Error("Could not find the Zoom frame");
    }

    // Handle meeting join flow
    await handleMuteMeeting(zoomFrame);
    await handleChangeCamera(zoomFrame);
    // await joinMeeting(zoomFrame);
  } catch (error) {
    console.error("An error occurred:", error.message);
  } finally {
    // Ensure browser cleanup
    if (browser) {
      // Uncomment the following line if you want the browser to close automatically
      // await browser.close();
    }
  }
}

openZoomMeeting();
