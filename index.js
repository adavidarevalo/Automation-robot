const puppeteer = require('puppeteer');

async function openZoomMeeting() {
    try {
      console.log("Launching browser...");
      // Launch the browser
      const browser = await puppeteer.launch({
        headless: false, // Set to false to see the browser in action
        args: ["--start-maximized", "--no-sandbox", "--disable-setuid-sandbox"],
      });

      console.log("Creating new page...");
      // Create a new page
      const page = await browser.newPage();

      console.log("Setting viewport...");
      // Set viewport to a decent size
      await page.setViewport({ width: 1366, height: 768 });

      console.log("Navigating to Zoom URL...");
      // Navigate to the Zoom URL
      await page.goto(
        "https://byupathway.zoom.us/j/8013624576?pwd=MGZ5SnQ1b2RzVFZUS3lFNDlnbnhHUT09#success"
      );

      console.log("Waiting for Join from browser button...");
      // Wait for the 'Join from your browser' link to appear and click it
      await page.waitForSelector('a[role="button"][web_client=""]', {
        timeout: 15000,
      });
      await page.click('a[role="button"][web_client=""]');

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get iframe content
      const frames = await page.frames();

      // Find and click the continue without mic/camera button
      console.log("Looking for continue without mic/camera button...");
      const frame = frames[1];

      console.log("frame ", frame);

      if (frame) {
        await frame.waitForSelector(
          'div[role="button"].continue-without-mic-camera'
        );
        await frame.click('div[role="button"].continue-without-mic-camera');
        console.log("Clicked continue without mic/camera button");

        // Wait 10 seconds and try to click again
        console.log("Waiting 10 seconds to click again...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          await frame.click('div[role="button"].continue-without-mic-camera');
          console.log("Clicked continue button again after 10 seconds");
        } catch (err) {
          console.log(
            "Button not found after 10 seconds, may have already been handled"
          );
        }
      } else {
        console.log("Could not find the Zoom frame");
      }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

openZoomMeeting();
