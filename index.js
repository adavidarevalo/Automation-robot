const puppeteer = require('puppeteer');

async function openZoomMeeting() {
    try {
        console.log('Launching browser...');
        // Launch the browser
        const browser = await puppeteer.launch({
            headless: false, // Set to false to see the browser in action
            args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
        });

        console.log('Creating new page...');
        // Create a new page
        const page = await browser.newPage();
        
        console.log('Setting viewport...');
        // Set viewport to a decent size
        await page.setViewport({ width: 1366, height: 768 });

        console.log('Navigating to Zoom URL...');
        // Navigate to the Zoom URL
        await page.goto('https://byupathway.zoom.us/j/8013624576?pwd=MGZ5SnQ1b2RzVFZUS3lFNDlnbnhHUT09#success');

        console.log('Waiting for Join from browser button...');
        // Wait for the 'Join from your browser' link to appear and click it
        await page.waitForSelector('.ReactModal__Overlay.ReactModal__Overlay--after-open', { timeout: 15000 });
        await page.click('a[role="button"][web_client=""]');

        console.log('Waiting for page navigation...');
        // Wait for navigation after clicking 'Join from browser'
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        console.log('Waiting 10 seconds before attempting to click continue button...');



    } catch (error) {
        console.error('An error occurred:', error);
    }
}

openZoomMeeting();
