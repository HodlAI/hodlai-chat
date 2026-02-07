
const puppeteer = require('puppeteer');

(async () => {
    // Launch browser (no sandbox for root environment)
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({width: 1280, height: 960});
    
    // Navigate
    console.log('Navigating to https://ai.hodlai.fun...');
    await page.goto('https://ai.hodlai.fun', {waitUntil: 'networkidle2'});
    
    // Capture screenshot
    console.log('Taking screenshot...');
    await page.screenshot({path: 'screenshot.png', fullPage: true});
    
    console.log('Done: screenshot.png');
    await browser.close();
})();
