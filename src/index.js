const puppeteer = require('puppeteer');
const URL = require('url').URL;
const config = require('./config');
const { waitAndClick, sleep, logStep } = require('./utils');
      const { findAndClickElementWithText } = require('./utils');

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
      // Wait for Zoom UI to fully load
      await sleep(config.timeouts.preparation);
      logStep('Extracting HTML for debugging...');          
      try {
        // First click the Chat button to open the chat panel
        await findAndClickElementWithText(this.zoomFrame, 'button', 'Chat', 5000);
        logStep('Found and clicked chat button using text search strategy');
        
        // Wait a moment for the chat panel to fully load
        await sleep(2000);
        
        // Now click the chat recipient dropdown button
        try {
          await this.zoomFrame.waitForSelector(config.selectors.chatRecipientDropdown, { timeout: 5000 });
          await this.zoomFrame.click(config.selectors.chatRecipientDropdown);
          logStep('Successfully clicked chat recipient dropdown');
          
          // Wait a moment for the dropdown to fully appear
          await sleep(1000);
          
          // Now click the chat-receiver-list__appendix element
          try {
            await this.zoomFrame.waitForSelector(config.selectors.chatRecipientAppendix, { timeout: 5000 });
            await this.zoomFrame.click(config.selectors.chatRecipientAppendix);
            logStep('Successfully clicked chat recipient appendix');
            
            // Wait a moment for the recipient to be selected
            await sleep(1000);
            
            // Type "Buenos Dias" in the chat input field
            try {
              await this.zoomFrame.waitForSelector(config.selectors.chatInputField, { timeout: 5000 });
              await this.zoomFrame.click(config.selectors.chatInputField);
              await this.zoomFrame.type(config.selectors.chatInputField, 'Buenos Dias');
              logStep('Successfully typed "Buenos Dias" in the chat input field');
              
              // Wait a moment after typing
              await sleep(500);
              
              // Click the send button
              try {
                await this.zoomFrame.waitForSelector(config.selectors.chatSendButton, { timeout: 5000 });
                await this.zoomFrame.click(config.selectors.chatSendButton);
                logStep('Successfully clicked send button - message sent');
              } catch (sendError) {
                logStep(`Failed to click send button: ${sendError.message}`);
              }
            } catch (typeError) {
              logStep(`Failed to type in chat input field: ${typeError.message}`);
            }
          } catch (appendixError) {
            logStep(`Failed to click chat recipient appendix: ${appendixError.message}`);
          }
        } catch (error) {
          // If selector doesn't work, try findAndClickElementWithText as a fallback
          logStep(`Could not click recipient dropdown with selector: ${error.message}`);
          try {
            await findAndClickElementWithText(this.zoomFrame, 'button', 'Everyone', 5000);
            logStep('Found and clicked recipient dropdown using text search');
            
            // Try to click the appendix after using the text search method
            await sleep(1000);
            try {
              await this.zoomFrame.waitForSelector(config.selectors.chatRecipientAppendix, { timeout: 5000 });
              await this.zoomFrame.click(config.selectors.chatRecipientAppendix);
              logStep('Successfully clicked chat recipient appendix after text search');
              
              // Wait a moment for the recipient to be selected
              await sleep(1000);
              
              // Type "Buenos Dias" in the chat input field
              try {
                await this.zoomFrame.waitForSelector(config.selectors.chatInputField, { timeout: 5000 });
                await this.zoomFrame.click(config.selectors.chatInputField);
                await this.zoomFrame.type(config.selectors.chatInputField, 'Buenos Dias');
                logStep('Successfully typed "Buenos Dias" in the chat input field after text search');
                
                // Wait a moment after typing
                await sleep(500);
                
                // Click the send button
                try {
                  await this.zoomFrame.waitForSelector(config.selectors.chatSendButton, { timeout: 5000 });
                  await this.zoomFrame.click(config.selectors.chatSendButton);
                  logStep('Successfully clicked send button after text search - message sent');
                } catch (sendError) {
                  logStep(`Failed to click send button after text search: ${sendError.message}`);
                }
              } catch (typeError) {
                logStep(`Failed to type in chat input field after text search: ${typeError.message}`);
              }
            } catch (appendixError) {
              logStep(`Failed to click chat recipient appendix after text search: ${appendixError.message}`);
            }
          } catch (secondError) {
            logStep(`Failed to click recipient dropdown: ${secondError.message}`);
          }
        }
      } catch (error) {
        logStep(`Failed to click chat button: ${error.message}`);
      }
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

