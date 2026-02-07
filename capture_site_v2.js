const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Viewport size for a nice desktop view
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    console.log('Navigating to http://localhost:4001...');
    await page.goto('http://localhost:4001', { waitUntil: 'networkidle' });
    
    // Slight delay to ensure animations/rendering settles
    await page.waitForTimeout(2000);

    console.log('Capturing screenshot...');
    await page.screenshot({ path: 'hodlai_v2_deployment.png', fullPage: true });
    
    console.log('Screenshot saved to hodlai_v2_deployment.png');
  } catch (err) {
    console.error('Error capturing screenshot:', err);
  } finally {
    await browser.close();
  }
})();
