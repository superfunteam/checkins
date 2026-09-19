/** Frame-by-frame checks for the visible close flash, with real touch input.
 * Run against Vite or production with MOTION_BASE=https://twilight.checkins.party.
 * Uses a separate Chrome profile; never changes an attendee's passport.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { launch, sleep } from '../e2e/cdp.mjs';

const out = '.e2e/dialog-motion';
const base = process.env.MOTION_BASE || 'http://127.0.0.1:5175';
fs.mkdirSync(out, { recursive: true });
fs.rmSync(`${out}/profile`, { recursive: true, force: true });
const page = await launch({ profile: `${out}/profile` });
const results = [];

async function tap(selector) {
  const point = await page.eval(`
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error('Missing target: ' + ${JSON.stringify(selector)});
    const box = element.getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  `);
  await page.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  await sleep(30);
  await page.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function trace() {
  await page.eval(`
    window.__frames = [];
    const start = performance.now();
    const sample = () => {
      const sheet = document.querySelector('.badge-detail-sheet');
      const overlay = document.querySelector('.modal-backdrop');
      const card = window.__card;
      const sheetStyle = sheet && getComputedStyle(sheet);
      const rect = sheet?.getBoundingClientRect();
      __frames.push({
        ms: performance.now() - start,
        mounted: !!sheet,
        opacity: sheet ? Number(sheetStyle.opacity) : 0,
        overlay: overlay ? Number(getComputedStyle(overlay).opacity) : 0,
        top: rect?.top, height: rect?.height,
        title: sheet?.querySelector('h2')?.textContent,
        pages: sheet?.querySelectorAll('.badge-detail-page').length || 0,
        locked: document.body.style.position === 'fixed',
        cardTop: card?.getBoundingClientRect().top,
        cardLeft: card?.getBoundingClientRect().left,
        cardWidth: card?.getBoundingClientRect().width,
      });
      window.__frameRequest = requestAnimationFrame(sample);
    };
    sample();
  `);
}

async function frames(label) {
  const samples = await page.eval('cancelAnimationFrame(__frameRequest); return __frames;');
  results.push({ label, samples });
  return samples;
}

function monotonic(samples, property, increasing, label) {
  for (let i = 1; i < samples.length; i++) {
    const delta = samples[i][property] - samples[i - 1][property];
    assert(increasing ? delta >= -0.015 : delta <= 0.015,
      `${label}: ${property} reversed between frames ${i - 1}/${i}: ${JSON.stringify(samples.slice(i - 1, i + 1))}`);
  }
}

function closed(samples, label) {
  assert(samples.some(s => s.mounted), `${label}: must sample the exiting sheet`);
  assert(!samples.at(-1).mounted && !samples.at(-1).locked, `${label}: sheet and scroll lock must be removed`);
  monotonic(samples, 'opacity', false, label);
  monotonic(samples, 'overlay', false, label);
  assert(samples.every(s => !s.mounted || s.locked), `${label}: keep page locked throughout exit`);
}

async function prepareCard(index) {
  return page.eval(`
    const card = document.querySelectorAll('.badge-card')[${index}];
    card.scrollIntoView({ block: 'center', behavior: 'instant' });
    card.focus({ preventScroll: true });
    window.__card = card;
    return { scroll: window.scrollY, title: card.querySelector('p').textContent.trim() };
  `);
}

async function openCard(index, label) {
  const initial = await prepareCard(index);
  await trace();
  await tap(`.badge-card:nth-child(${index + 1})`);
  await sleep(350);
  const samples = await frames(`${label}: open`);
  monotonic(samples, 'opacity', true, label);
  const mounted = samples.filter(s => s.mounted);
  assert.equal(mounted.at(-1)?.opacity, 1, `${label}: fully visible`);
  assert(mounted.every(s => s.pages === 1 && s.locked), `${label}: one page, locked before paint`);
  assert(mounted.every(s => Math.abs(s.height - mounted[0].height) < 1), `${label}: stable sheet height`);
  // Card press scale can change its bounds slightly; body locking must not shift the grid.
  assert(Math.abs(samples[0].cardTop - samples.at(-1).cardTop) < 2, `${label}: underlying grid jumped vertically`);
  assert(Math.abs(samples[0].cardLeft - samples.at(-1).cardLeft) < 2, `${label}: underlying grid jumped horizontally`);
  return initial;
}

async function closeCard(initial, label, selector = '[aria-label="Close badge"]') {
  await trace();
  await tap(selector);
  await sleep(320);
  closed(await frames(`${label}: close`), label);
  const restored = await page.eval('return { scroll: window.scrollY, focus: document.activeElement === __card };');
  assert(Math.abs(restored.scroll - initial.scroll) < 2, `${label}: scroll restored`);
  assert(restored.focus, `${label}: focus returned to the originating card`);
}

async function seed() {
  await page.goto(`${base}/event/twilight`);
  await page.eval(`localStorage.setItem('passport-twilight', JSON.stringify({
    version: 1, name: 'Motion QA', createdAt: new Date().toISOString(),
    honorSystemDismissed: true, teamPoll: { initial: 'edward' }, badges: {},
  }));`);
  await page.goto(`${base}/event/twilight`);
  assert(await page.waitForText("Motion QA's Saga"));
  await sleep(400);
}

try {
  await page.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await page.send('Page.bringToFront');
  await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await seed();
  // Slower devices made the original opacity-0 -> opacity-1 flash especially visible.
  await page.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  for (const index of [0, 1, 8, 18]) {
    const initial = await openCard(index, `mobile ${index}`);
    await closeCard(initial, `mobile ${index}`);
  }

  const initial = await openCard(1, 'swipe');
  await page.screenshot(`${out}/mobile-sheet.png`);
  await trace();
  await page.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 310, y: 360 }] });
  for (let i = 1; i <= 6; i++) {
    await page.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 310 - i * 30, y: 360 }] });
    await sleep(16);
  }
  await page.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(230);
  const swipe = await frames('touch swipe');
  assert.equal(swipe.at(-1).title, 'Emergency Contact');
  assert(swipe.every(s => s.pages === 1 && s.opacity === 1), 'Swipe keeps one page in a fully visible sheet');
  assert(swipe.every(s => Math.abs(s.top - swipe[0].top) < 1), 'Swiping must not move the sheet');
  await closeCard(initial, 'after swipe');
  await page.screenshot(`${out}/mobile-closed.png`);

  // Interrupt an opening at an exact animation time; the close must start from
  // that rendered frame, not flash to a fully open sheet before fading away.
  await prepareCard(1);
  await page.eval(`
    __card.click();
    await new Promise(requestAnimationFrame);
    const sheet = document.querySelector('.badge-detail-sheet');
    for (const element of [sheet, document.querySelector('.modal-backdrop')]) {
      for (const animation of element.getAnimations()) { animation.pause(); animation.currentTime = 45; }
    }
  `);
  await trace();
  await page.eval(`document.querySelector('[aria-label="Close badge"]').click();`);
  await sleep(350);
  const interrupted = await frames('close during entry');
  assert(interrupted[0].opacity > 0 && interrupted[0].opacity < 1, 'Entry was interrupted mid-animation');
  closed(interrupted, 'close during entry');

  // Reopen during exit, including a duplicate close and a pending claim timer.
  await openCard(2, 'rapid reopen');
  await page.clickText('Claim This Badge');
  await page.eval(`
    const close = document.querySelector('[aria-label="Close badge"]');
    close.click(); close.click();
    await new Promise(requestAnimationFrame);
    for (const element of [document.querySelector('.badge-detail-sheet'), document.querySelector('.modal-backdrop')]) {
      for (const animation of element.getAnimations()) { animation.pause(); animation.currentTime = 70; }
    }
  `);
  await trace();
  // Intentional programmatic reopen exercises the lifecycle even while the
  // backdrop correctly prevents actual taps from reaching underlying cards.
  await page.eval('__card.click();');
  await sleep(650);
  const reopened = await frames('reopen during exit');
  monotonic(reopened, 'opacity', true, 'reopen during exit');
  assert.equal(reopened.at(-1).opacity, 1, 'Old claim timer cannot close the reopened badge');
  await trace();
  await tap('[aria-label="Close badge"]');
  await sleep(320);
  closed(await frames('reopened close'), 'reopened close');

  await page.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  const desktop = await openCard(12, 'desktop');
  await closeCard(desktop, 'desktop');

  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await openCard(0, 'reduced motion');
  const transform = await page.eval('return getComputedStyle(document.querySelector(".badge-detail-sheet")).transform;');
  assert.equal(transform, 'none');
  await trace();
  await tap('[aria-label="Close badge"]');
  await sleep(150);
  closed(await frames('reduced motion close'), 'reduced motion close');

  assert.deepEqual(page.logs.filter(line => line.startsWith('[exception]')), []);
  console.log(`PASS: ${results.length} frame traces; no flashes, interrupted/reopened sheets, real touch swipe, scroll/focus restoration, desktop and reduced motion.`);
} finally {
  fs.writeFileSync(`${out}/frames.json`, JSON.stringify(results, null, 2));
  page.close(); page.kill();
}
