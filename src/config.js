const { findNearestMeeting } = require("./utils");

const CONFIG = {
  browser: {
    headless: false,
    args: [
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--use-fake-ui-for-media-stream",
    ],
  },
  viewport: { width: 1366, height: 768 },
  timeouts: {
    element: 15000,
    transition: 2000,
    preparation: 5000,
  },
  zoom: {
    url: findNearestMeeting().url,
    password: findNearestMeeting().password,
    userName: "Angel Arevalo",
  },
  selectors: {
    joinFromBrowser: 'a[role="button"][web_client=""]',
    continueWithoutDevices: 'div[role="button"].continue-without-mic-camera',
    nameInput: "#input-for-name",
    passwordInput: "#input-for-pwd",
    joinButton: "button.preview-join-button",
    muteButton: '#preview-audio-control-button',
    cameraToggle: 'button.preview__toggle[aria-label="More video controls"]',
    fakeCamOption:
      'li.preview__dropdown-menuitem[aria-label="Select a Camera FakeCam"]',
    chatButton: 'button.footer-button-base__button[aria-label="open the chat panel"]',
    chatRecipientDropdown: 'button.chat-receiver-list__receiver[aria-label*="Send chat to"]',
    chatRecipientAppendix: '.chat-receiver-list__appendix',
  },
};

module.exports = CONFIG;
