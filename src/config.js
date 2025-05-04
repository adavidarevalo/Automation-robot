const CONFIG = {
  browser: {
    headless: true,
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
    url: "https://byupathway.zoom.us/j/8013624576?pwd=MGZ5SnQ1b2RzVFZUS3lFNDlnbnhHUT09#success",
    userName: "Angel David Arevalo",
  },
  selectors: {
    joinFromBrowser: 'a[role="button"][web_client=""]',
    continueWithoutDevices: 'div[role="button"].continue-without-mic-camera',
    nameInput: "#input-for-name",
    joinButton: "button.preview-join-button",
    muteButton: 'button.preview-video__control-button[aria-label="Mute"]',
    cameraToggle: 'button.preview__toggle[aria-label="More video controls"]',
    fakeCamOption:
      'li.preview__dropdown-menuitem[aria-label="Select a Camera FakeCam"]',
  },
};

module.exports = CONFIG;
