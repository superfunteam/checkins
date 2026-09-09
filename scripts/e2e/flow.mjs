/**
 * Party-readiness end-to-end check. Builds the app, serves it with `vite
 * preview`, and drives a headless Chrome through: guest onboarding, badge
 * claim + honor system, secret unlock, a new build waiting while a modal is
 * open then applying silently, a passport.json edit appearing without reload,
 * a second consecutive update, the Shire passport, and subdomain host mode.
 *
 *   npm run test:e2e        (needs Google Chrome installed; set CHROME to override)
 *
 * Screenshots land in .e2e/shots/.
 */
import { launch, sleep } from './cdp.mjs';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
const REPO = process.cwd(); const S = path.join(REPO, '.e2e'); const BASE = 'http://localhost:4173';
fs.mkdirSync(S + '/shots', { recursive: true });
const results = []; const ok = (name, cond, extra='') => { results.push((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : '')); };
fs.rmSync(S + '/profile', { recursive: true, force: true });
execSync('VITE_BUILD_ID=e2e-1 npm run build', { cwd: REPO, stdio: 'ignore' });
const preview = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { cwd: REPO, stdio: 'ignore' });
for (let i = 0; i < 60; i++) { try { await fetch(BASE); break; } catch { await sleep(250); } }
const page = await launch({ profile: S + '/profile' });
try {
  await page.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await page.goto(BASE + '/event/twilight'); await sleep(2000);
  await page.screenshot(S + '/shots/01-splash.png');
  ok('splash shows Enter Forks', await page.clickText('Enter Forks'));
  ok('name prompt', await page.waitForText('Forks High School'));
  await sleep(600); await page.screenshot(S + '/shots/02-name.png');
  await page.eval(`const i=[...document.querySelectorAll('input')].find(i=>i.offsetParent!==null); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; set.call(i,'Bella Tester'); i.dispatchEvent(new Event('input',{bubbles:true}));`);
  await sleep(200); ok('continue', await page.clickText('Continue'));
  ok('explainer greets by name', await page.waitForText('Welcome to Forks, Bella Tester', 30000));
  await sleep(800); await page.screenshot(S + '/shots/03-explainer.png');
  ok('begin', await page.clickText('Begin My Saga'));
  ok('required first team pick', await page.waitForText('Choose your team.'));
  await page.eval(`document.querySelector('input[value="edward"]').click()`);
  ok('choose Edward', await page.clickText('I’m Team Edward'));
  ok('passport screen', await page.waitForText("Bella Tester's Saga"));
  await sleep(1500); await page.screenshot(S + '/shots/04-passport.png');
  const grid = await page.eval(`const imgs=[...document.querySelectorAll('.badge-card img')]; return {cards:document.querySelectorAll('.badge-card').length, loaded:imgs.filter(i=>i.complete&&i.naturalWidth>0).length, broken:imgs.filter(i=>i.complete&&i.naturalWidth===0).length, progress:(document.body.innerText.match(/(\\d+)\\/(\\d+)/)||[])[0], build: window.__BUILD_ID__, sw: !!navigator.serviceWorker.controller}`);
  ok('33 badge cards, all images load', grid.cards===33 && grid.loaded===33 && grid.broken===0, JSON.stringify(grid));
  ok('service worker controlling, build e2e-1', grid.sw && grid.build==='e2e-1');

  // Claim breakfast through the modal + honor system
  await page.eval(`[...document.querySelectorAll('.badge-card')].find(c=>c.textContent.includes('Brunch')).click()`);
  ok('badge modal opens', await page.waitForText('Claim This Badge')); await sleep(700);
  await page.screenshot(S + '/shots/05-badge-modal.png');
  await page.clickText('Claim This Badge');
  ok('honor system prompt', await page.waitForText('I So Swear')); await sleep(300);
  await page.eval(`const cb=document.querySelector('input[type=checkbox]'); if(cb && !cb.checked) cb.click();`);
  await page.clickText('I So Swear'); await sleep(1500);
  await page.screenshot(S + '/shots/06-claimed.png');
  await page.eval(`document.querySelector('.modal-backdrop')?.click()`); await sleep(800);
  ok('progress 1/29 after claim', await page.waitForText('1/29'));

  // Claim all five films -> secret "Forever" should auto-unlock
  for (const film of ['Twilight','New Moon','Eclipse','Breaking Dawn – Part 1','Breaking Dawn – Part 2']) {
    await page.eval(`[...document.querySelectorAll('.badge-card')].find(c=>c.textContent.trim().startsWith(${JSON.stringify(film)})).click()`);
    await page.waitForText('Claim This Badge'); await sleep(400);
    await page.clickText('Claim This Badge'); await sleep(300);
    if (await page.eval(`return document.body.innerText.includes('I So Swear')`)) { await page.clickText('I So Swear'); }
    await sleep(900); await page.eval(`document.querySelector('.modal-backdrop')?.click()`); await sleep(700);
  }
  ok('secret unlock modal for Forever', await page.waitForText('Secret Badge Unlocked', 8000));
  await sleep(1200); await page.screenshot(S + '/shots/07-secret-unlock.png');

  // While a modal is open, a new build must NOT reload the page.
  execSync('VITE_BUILD_ID=e2e-2 npm run build', { cwd: REPO, stdio: 'ignore' });
  await page.eval(`const r=await navigator.serviceWorker.getRegistration(); await r.update();`);
  await sleep(6000);
  const during = await page.eval(`return {build: window.__BUILD_ID__, modal: document.body.innerText.includes('Secret Badge Unlocked'), waiting: !!(await navigator.serviceWorker.getRegistration()).waiting}`);
  ok('new build waits while modal open', during.build==='e2e-1' && during.modal && during.waiting, JSON.stringify(during));
  await page.clickText('Continue Saga');
  let after; for (let i=0;i<30;i++){ await sleep(500); after = await page.eval(`return {build: window.__BUILD_ID__, name: JSON.parse(localStorage.getItem('passport-twilight')).name, progress:(document.body.innerText.match(/(\\d+)\\/(\\d+)/)||[])[0]}`).catch(()=>null); if (after && after.build==='e2e-2') break; }
  ok('silent reload to e2e-2 once modal closed, state intact', after && after.build==='e2e-2' && after.name==='Bella Tester' && after.progress==='6/29', JSON.stringify(after));
  await sleep(1500); await page.screenshot(S + '/shots/08-after-update.png');

  // Live content: edit the served passport.json (new badge + version bump)
  const pj = REPO + '/dist/passports/twilight/passport.json'; const d = JSON.parse(fs.readFileSync(pj,'utf8'));
  d.version += 1; d.badges.splice(1,0,{id:'e2e-live-badge',type:'scene',name:'Live Update Test',time:'11:40am ish',shortDesc:'A birthday goes very wrong',longDesc:'One drop of blood.',instruction:'Watch this scene to claim this badge.',image:'assets/images/badges/badge-volterra.webp',order:1.5});
  fs.writeFileSync(pj, JSON.stringify(d,null,2));
  await page.eval(`window.dispatchEvent(new Event('focus'))`); await sleep(3000);
  const live = await page.eval(`const imgs=[...document.querySelectorAll('.badge-card img')]; return {cards:document.querySelectorAll('.badge-card').length, v2: imgs.filter(i=>i.getAttribute('src').includes('?v=${d.version}')).length, paperCut: document.body.innerText.includes('Live Update Test'), progress:(document.body.innerText.match(/(\\d+)\\/(\\d+)/)||[])[0], build: window.__BUILD_ID__}`);
  ok('new badge appears without reload, assets re-versioned', live.cards===34 && live.v2===34 && live.paperCut && live.progress==='6/30' && live.build==='e2e-2', JSON.stringify(live));
  await sleep(800); await page.screenshot(S + '/shots/09-live-badge.png');

  // A second deploy in the same session must also apply (no modal open).
  execSync('VITE_BUILD_ID=e2e-3 npm run build', { cwd: REPO, stdio: 'ignore' });
  await page.eval(`await window.__checkinsUpdate.registration.update();`);
  let third; for (let i=0;i<30;i++){ await sleep(500); third = await page.eval(`return {build: window.__BUILD_ID__, progress:(document.body.innerText.match(/(\\d+)\\/(\\d+)/)||[])[0]}`).catch(()=>null); if (third && third.build==='e2e-3') break; }
  ok('second consecutive update applies silently', third && third.build==='e2e-3' && third.progress==='6/29', JSON.stringify(third));

  // Shire regression: returning guest lands on passport with all art loading
  await page.goto(BASE + '/event/shire');
  await page.eval(`localStorage.setItem('passport-shire', JSON.stringify({version:1,name:'Frodo',createdAt:new Date().toISOString(),honorSystemDismissed:true,badges:{}}))`);
  await page.goto(BASE + '/event/shire'); await sleep(2500);
  const shire = await page.eval(`const imgs=[...document.querySelectorAll('.badge-card img')]; await Promise.all(imgs.map(i=>i.complete?null:new Promise(r=>{i.onload=r;i.onerror=r;}))); return {title: document.title, cards: document.querySelectorAll('.badge-card').length, loaded: imgs.filter(i=>i.naturalWidth>0).length, manifest: document.querySelector('link[rel=manifest]')?.getAttribute('href'), font: getComputedStyle(document.querySelector('h1')).fontFamily}`);
  ok('shire passport unaffected', shire.title==='The Shire Passport' && shire.cards===20 && shire.loaded===20 && shire.manifest==='/passports/shire/manifest.webmanifest', JSON.stringify(shire));
  await page.screenshot(S + '/shots/11-shire.png');

  // Host mode in the same browser
  await page.goto('http://twilight.localhost:4173/'); await sleep(1500);
  const host = await page.eval(`return {title: document.title, manifest: document.querySelector('link[rel=manifest]')?.getAttribute('href'), splash: document.body.innerText.includes('Enter Forks') || document.body.innerText.includes('Saga')}`);
  ok('host mode serves passport at /', host.title==='The Twilight Passport' && host.manifest==='/passports/twilight/manifest.host.webmanifest' && host.splash, JSON.stringify(host));
  await page.screenshot(S + '/shots/10-host-mode.png');
} catch (e) { results.push('ERROR ' + (e.stack || e)); }
finally { console.log(results.join('\n')); console.log('--- console:'); console.log(page.logs.filter(l=>!l.includes('[log]')).join('\n') || '(no warnings/errors)'); console.log(page.logs.filter(l=>l.includes('[log]')).slice(0,12).join('\n')); page.close(); page.kill(); preview.kill(); const failed = results.some(r => !r.startsWith('PASS')); console.log(failed ? 'E2E FAILED' : 'E2E OK'); process.exit(failed ? 1 : 0); }
