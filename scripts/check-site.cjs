// Run with NODE_PATH pointing to a temporary install of playwright and axe-core.
// Start a static server first. Google requests are blocked: tests never record real conversions.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.SITE_URL || 'http://127.0.0.1:8765';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    const context = await browser.newContext();
    await context.route(/googletagmanager|googleadservices|doubleclick/, r => r.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const path of ['/', '/politica-de-privacidade.html']) {
      for (const width of [320, 375, 600, 768, 820, 1024, 1080, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + path);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${path}: overflow at ${width}`);
        for (const img of await page.locator('img').all()) {
          await img.scrollIntoViewIfNeeded();
          await page.waitForFunction(i => i.complete && i.naturalWidth > 0, await img.elementHandle());
        }
        assert.equal(await page.locator('img').evaluateAll(imgs => imgs.every(i => i.complete && i.naturalWidth > 0)), true);
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
        const violations = await page.evaluate(async () => (await axe.run()).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
        assert.deepEqual(violations, [], `${path}: accessibility at ${width}`);
      }
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(base);
    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.locator('.menu-toggle').click();
    await page.locator('#nav a[href="#terapias"]').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.locator('#cookie-reject').click();
    assert.equal(await page.evaluate(() => localStorage.getItem('semear_cookie_consent')), 'rejected');
    await page.reload();
    assert.equal(await page.locator('#cookie-banner').isVisible(), false);
    await page.locator('.cookie-settings').click();
    await page.locator('#cookie-accept').click();
    await page.reload();
    const queue = await page.evaluate(() => dataLayer.map(x => Array.from(x)));
    assert.equal(queue[0][0], 'consent');
    assert.equal(queue[0][1], 'default');
    assert.equal(queue[1][2].ad_storage, 'granted');
    await page.goto(base + '/politica-de-privacidade.html');
    await page.locator('.cookie-settings').click();
    await page.locator('#cookie-reject').click();
    await page.goto(base);
    assert.equal(await page.evaluate(() => dataLayer[0][2].ad_storage), 'denied');
    await page.locator('summary').first().click();
    assert.equal(await page.locator('details').first().getAttribute('open'), '');
    const links = await page.locator('a').evaluateAll(as => as.map(a => ({href:a.getAttribute('href'), tracked:a.classList.contains('js-whatsapp')})));
    for (const link of links) {
      if (link.href.startsWith('#')) assert.equal(await page.locator(link.href).count(), 1, link.href);
      if (link.href.includes('api.whatsapp.com')) {
        const url = new URL(link.href);
        assert.equal(url.searchParams.get('phone'), '5598999918289');
        assert.ok(url.searchParams.get('text').length > 10);
        assert.ok(link.tracked);
      }
    }
    // Exercise the actual callback and fallback locally without contacting WhatsApp or Ads.
    await page.evaluate(() => gtag_report_conversion('#callback-test'));
    const conversion = await page.evaluate(() => {
      const e = dataLayer.find(x => x[0] === 'event' && x[1] === 'conversion');
      e[2].event_callback(); e[2].event_callback(); return e[2].send_to;
    });
    assert.equal(conversion, 'AW-18007017680/99G-CIWyqIscENCRtYpD');
    assert.ok(page.url().endsWith('#callback-test'));
    await page.evaluate(() => gtag_report_conversion('#fallback-test'));
    await page.waitForURL('**/#fallback-test');
    await page.goto(base);
    await page.evaluate(() => { localStorage.setItem('semear_cookie_consent', 'invalid'); });
    await page.reload();
    assert.equal(await page.locator('#cookie-banner').isVisible(), true);
    const noStorage = await browser.newContext();
    await noStorage.route(/googletagmanager|googleadservices|doubleclick/, r => r.abort());
    await noStorage.addInitScript(() => Object.defineProperty(window, 'localStorage', {get() {throw new Error('Storage disabled');}}));
    const blocked = await noStorage.newPage();
    await blocked.goto(base); await blocked.locator('#cookie-reject').click();
    assert.equal(await blocked.locator('#cookie-banner').isVisible(), false);
    await noStorage.close();
    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: {width:375,height:812} });
    const fallback = await noJS.newPage(); await fallback.goto(base);
    assert.equal(await fallback.locator('#nav a').first().isVisible(), true);
    await fallback.locator('summary').first().click();
    assert.equal(await fallback.locator('details').first().getAttribute('open'), '');
    await noJS.close();
    assert.deepEqual(errors, []);
    console.log('PASS: 18 responsive/accessibility checks; images; anchors; menu; FAQ; consent persistence/revocation/invalid/blocked storage; conversion callback/fallback; no-JS navigation.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
