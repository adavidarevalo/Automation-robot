const puppeteer = require('puppeteer');
const URL = require('url').URL;
const config = require('./config');
const { waitAndClick, sleep, logStep } = require('./utils');

class ZoomAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.zoomFrame = null;
  }

  async initialize() {
    logStep('Initializing browser...');
    this.browser = await puppeteer.launch(config.browser);
    
    const context = this.browser.defaultBrowserContext();
    await context.clearPermissionOverrides();
    
    const zoomUrl = new URL(config.zoom.url);
    await context.overridePermissions(zoomUrl.origin, ['camera', 'microphone']);
    
    this.page = await context.newPage();
    await this.page.setViewport(config.viewport);
  }

  async navigateToZoom() {
    logStep('Navigating to Zoom meeting...');
    await this.page.goto(config.zoom.url);
  }

  async setupZoomFrame() {
    const frames = await this.page.frames();
    this.zoomFrame = frames[1];
    
    if (!this.zoomFrame) {
      throw new Error('Could not find Zoom meeting frame');
    }
  }

  async muteMicrophone() {
    logStep('Muting microphone...');
    await sleep(config.timeouts.preparation);
    await waitAndClick(this.zoomFrame, config.selectors.muteButton);
  }

  async switchToFakeCam() {
    logStep("Switching to FakeCam...");

    // Take a screenshot after switching to FakeCam
    logStep("Taking screenshot of FakeCam setup...");
    logStep("Screenshot saved as fakecam-screenshot.png");
    await waitAndClick(this.zoomFrame, config.selectors.cameraToggle);
    await sleep(config.timeouts.transition);
    await waitAndClick(this.zoomFrame, config.selectors.fakeCamOption);
  }

  async joinMeeting() {
    logStep('Joining meeting...');
    await this.zoomFrame.type(config.selectors.nameInput, config.zoom.userName);
    
    // Check if password field exists and if we have a password in config
    try {
      const passwordFieldExists = await this.zoomFrame.$(config.selectors.passwordInput);
      if (passwordFieldExists && config.zoom.password) {
        logStep('Entering meeting password...');
        await this.zoomFrame.type(config.selectors.passwordInput, config.zoom.password);
      }
    } catch (error) {
      logStep('No password field found or not required');
    }
    
    await waitAndClick(this.zoomFrame, config.selectors.joinButton);
  }

  async sendAdminMessage() {
    logStep('Opening chat panel...');
    try {
      // Wait for chat button to be available
      await sleep(config.timeouts.preparation);
      
      // Click on the chat button to open the chat panel
      await this.page.waitForSelector(config.selectors.chatButton);
      await this.page.click(config.selectors.chatButton);
      logStep('Chat panel opened');
    } catch (error) {
      logStep(`Error opening chat panel: ${error.message}`);
      // Continue execution even if sending message fails
    }
  }

  async start() {
    try {
      await this.initialize();
      await this.navigateToZoom();
      await this.setupZoomFrame();
      await this.muteMicrophone();
      // await this.switchToFakeCam();
      await this.joinMeeting();
      logStep('Successfully joined Zoom meeting!');
      await this.sendAdminMessage();
    } catch (error) {
      logStep(`Error: ${error.message}`);
      throw error;
    }
  }
}

// Start the automation
const automation = new ZoomAutomation();
automation.start().catch(error => {
  console.error('Automation failed:', error);
  process.exit(1);
});

