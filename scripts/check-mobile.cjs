// Regression: document scrollWidth alone misses content clipped by overflow:hidden.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true});
  try {
    const page = await browser.newPage();
    await page.route(/googletagmanager|googleadservices|doubleclick/, r => r.abort());
    for (const path of ['/', '/politica-de-privacidade.html']) {
      for (const [width,height] of [[320,568],[360,800],[375,667],[390,844],[412,915],[430,932],[600,900],[667,375],[844,390],[1024,768],[1440,900]]) {
        for (const scale of [1,2]) {
          await page.setViewportSize({width,height});
          await page.goto((process.env.SITE_URL || 'http://127.0.0.1:8765') + path);
          if (scale === 2) await page.addStyleTag({content:'html { font-size: 200%; }'});
          const failures = await page.evaluate(() => {
            const result=[];
            for (const el of document.querySelectorAll('h1,h2,h3,p,summary,figcaption,.btn,.brand,.plan-card')) {
              if (el.closest('.clinic-track')) continue; // Intentional horizontal carousel.
              if (!el.getClientRects().length) continue;
              const box=el.getBoundingClientRect();
              if (box.width === 0) continue;
              if(box.left < -1 || box.right > innerWidth + 1 || el.scrollWidth > el.clientWidth + 2) result.push(el.textContent.slice(0,90));
            }
            return result;
          });
          assert.deepEqual(failures,[],`${path}, ${width}x${height}, text scale ${scale}`);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
        }
      }
    }
    await page.setViewportSize({width:375,height:667});
    await page.goto((process.env.SITE_URL || 'http://127.0.0.1:8765') + '/');
    await page.locator('#cookie-reject').click();
    await page.screenshot({path:'/private/tmp/semear-mobile-fixed.png'});
    await page.locator('.hero-media').screenshot({path:'/private/tmp/semear-mobile-photo-fixed.png'});
    console.log('PASS: 44 checks for clipped text and horizontal overflow, both pages, portrait/landscape, and 200% base text size.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
