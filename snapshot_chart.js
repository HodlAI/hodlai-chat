const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none']
  });
  const page = await browser.newPage();
  
  // Set viewport to a wide desktop view for better chart visibility
  await page.setViewportSize({ width: 1280, height: 800 });

  const url = 'https://dexscreener.com/bsc/0x233BE6ff451C87D3bde3bAb2A8c0c0CdF872003c';
  console.log(`Navigating to ${url}...`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch (e) {
    console.log('Navigation timeout or error, continuing anyway...');
  }

  console.log('Waiting for chart render...');
  // Try to wait for the chart canvas or container
  try {
    await page.waitForSelector('.custom-chart', { timeout: 15000 });
  } catch (e) {
    console.log('Chart selector not found immediately, waiting fixed time...');
    await page.waitForTimeout(5000);
  }

  // Remove potential overlays/popups if possible (simple heuristic)
  await page.evaluate(() => {
    const dialogs = document.querySelectorAll('[role="dialog"], .chakra-modal__content');
    dialogs.forEach(el => el.remove());
  });

  console.log('Taking screenshot...');
  await page.screenshot({ path: 'chart_daily.png', fullPage: false });
  
  console.log('Screenshot saved to chart_daily.png');
  await browser.close();
})();
