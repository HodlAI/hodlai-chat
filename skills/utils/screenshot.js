const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // critical for docker/vms
      '--disable-gpu'
    ] 
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  console.log('Navigating to DexScreener...');
  try {
      // 60s timeout, commit is enough to start
      await page.goto('https://dexscreener.com/bsc/0x233BE6ff451C87D3bde3bAb2A8c0c0CdF872003c', { 
        timeout: 60000, 
        waitUntil: 'commit' 
      });
      
      console.log('Loaded (commit). Waiting 15s for rendering...');
      await page.waitForTimeout(15000); 
      
      console.log('Taking screenshot...');
      const title = await page.title();
      console.log(`Page title: ${title}`);
      
      await page.screenshot({ path: 'dexscreener.png', fullPage: false });
      console.log('Screenshot saved to dexscreener.png');
  } catch (e) {
      console.error('Error:', e);
  } finally {
      await browser.close();
  }
})();
