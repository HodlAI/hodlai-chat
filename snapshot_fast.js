const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none']
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('Navigating...');
  // Force shorter timeout to fail fast
  try {
      await page.goto('https://dexscreener.com/bsc/0x233BE6ff451C87D3bde3bAb2A8c0c0CdF872003c', { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
      console.log('Navigation partially timed out, proceeding...');
  }

  console.log('Rendering...');
  await page.waitForTimeout(5000); // Wait for scripts

  console.log('Snapshot...');
  await page.screenshot({ path: 'chart_retry.png' });
  
  console.log('Done.');
  await browser.close();
})();
