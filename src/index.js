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

  /**
   * Sends a predefined message to everyone in the Zoom chat
   * Uses robust element finding techniques to locate UI elements
   */
  async sendAdminMessage() {
    const MESSAGE = "Sorry, I don't have a microphone.";

    logStep("Opening chat panel...");
    try {
      await sleep(config.timeouts.chatPreparation);
      await sleep(config.timeouts.chatPreparation);

      await this._clickChatButton();
      await sleep(2000); // Wait for chat panel to load

      await this._selectChatRecipient();
      await sleep(1000); // Wait for recipient selection

      await this._typeAndSendChatMessage(MESSAGE);

      logStep("Admin message sent successfully");
    } catch (error) {
      logStep(`Error sending admin message: ${error.message}`);
      // Continue execution even if sending message fails
    }
  }
  
  /**
   * Clicks the chat button to open the chat panel
   * @private
   */
  async _clickChatButton() {
    try {
      // Obtener y guardar el HTML del frame
      const frameHtml = await this.zoomFrame.evaluate(
        () => document.documentElement.outerHTML
      );
      const fs = require("fs");
      fs.writeFileSync("zoom_frame_html.txt", frameHtml);
      logStep("Frame HTML guardado en zoom_frame_html.txt");

      // Try to find and click using text search first (most robust)
      await findAndClickElementWithText(this.zoomFrame, "button", "Chat", 5000);
      logStep("Found and clicked chat button using text search");
      return true;
    } catch (error) {
      // Fallback to selector
      try {
        await this.zoomFrame.waitForSelector(config.selectors.chatButton, { timeout: 5000 });
        await this.zoomFrame.click(config.selectors.chatButton);
        logStep('Found and clicked chat button using selector');
        return true;
      } catch (selectorError) {
        logStep(`Failed to click chat button: ${error.message}`);
        throw new Error('Could not open chat panel');
      }
    }
  }
  
  /**
   * Selects the recipient for the chat message
   * @private
   */
  async _selectChatRecipient() {
    try {
      // Try first approach - using selectors
      await this.zoomFrame.waitForSelector(config.selectors.chatRecipientDropdown, { timeout: 5000 });
      await this.zoomFrame.click(config.selectors.chatRecipientDropdown);
      logStep('Clicked chat recipient dropdown using selector');
      
      await sleep(1000);
      

      await this.zoomFrame.waitForSelector(config.selectors.chatRecipientAppendix, { timeout: 5000 });
      await this.zoomFrame.click(config.selectors.chatRecipientAppendix);
      logStep('Clicked chat recipient appendix using selector');
      return true;
    } catch (error) {
      // Fallback approach - using text search
      try {
        await findAndClickElementWithText(this.zoomFrame, 'button', 'Everyone', 5000);
        logStep('Selected recipient using text search');
        
        await sleep(1000);
        
        await this.zoomFrame.waitForSelector(
          config.selectors.chatRecipientAppendix,
          { timeout: 10000 }
        );
        await this.zoomFrame.click(config.selectors.chatRecipientAppendix);
        logStep('Clicked chat recipient appendix after text search');
        return true;
      } catch (textSearchError) {
        logStep(`Failed to select chat recipient: ${error.message}`);
        throw new Error('Could not select chat recipient');
      }
    }
  }
  
  /**
   * Types and sends a message in the chat
   * @param {string} message - The message to send
   * @private
   */
  async _typeAndSendChatMessage(message) {
    try {
      // Type the message
      await this.zoomFrame.waitForSelector(config.selectors.chatInputField, { timeout: 5000 });
      await this.zoomFrame.click(config.selectors.chatInputField);
      await this.zoomFrame.type(config.selectors.chatInputField, message);
      logStep(`Successfully typed message in chat field`);
      
      await sleep(500);
      
      // Send the message
      await this.zoomFrame.waitForSelector(config.selectors.chatSendButton, { timeout: 5000 });
      await this.zoomFrame.click(config.selectors.chatSendButton);
      logStep('Successfully clicked send button - message sent');
      return true;
    } catch (error) {
      logStep(`Failed to type or send message: ${error.message}`);
      throw new Error('Could not send chat message');
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
      logStep("Successfully joined Zoom meeting!");
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

  //Utah South Area | The Eternal Family | 200 | Ferguson
  //Utah South Area | The Divine Gift of Forgiveness | 290 | Dean