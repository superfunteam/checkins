/** Motion regressions: run against `npm run dev -- --port 5175` (or MOTION_BASE). */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { launch, sleep } from '../e2e/cdp.mjs';
const out='.e2e/motion';fs.mkdirSync(out,{recursive:true});
const base=process.env.MOTION_BASE || 'http://127.0.0.1:5175';
fs.rmSync(out+'/profile',{recursive:true,force:true});
const page=await launch({profile:out+'/profile'});
const key=async key=>{await page.send('Input.dispatchKeyEvent',{type:'keyDown',key});await page.send('Input.dispatchKeyEvent',{type:'keyUp',key});};
const click=selector=>page.eval(`document.querySelector(${JSON.stringify(selector)}).click()`);
const seed=async(badges={})=>{
  await page.goto(base+'/event/twilight');
  await page.eval(`localStorage.setItem('passport-twilight',${JSON.stringify(JSON.stringify({version:1,name:'Motion QA',createdAt:new Date().toISOString(),honorSystemDismissed:true,teamPoll:{initial:'edward'},badges}))})`);
  await page.goto(base+'/event/twilight');assert(await page.waitForText("Motion QA's Saga"));await sleep(450);
};
try {
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await page.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await page.send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await page.send('Page.bringToFront');
  await seed();
  await page.send('Performance.enable');
  const before=await page.send('Performance.getMetrics');
  const samples=await page.eval(`const samples=[],start=performance.now(); [...document.querySelectorAll('.badge-card')].find(b=>b.textContent.includes('The Cullens Arrive')).click(); await new Promise(resolve=>{function frame(){const sheet=document.querySelector('.modal-content'),img=sheet?.querySelector('img');let opacity=1;for(let e=img;e;e=e.parentElement)opacity*=Number(getComputedStyle(e).opacity);samples.push({ms:Math.round(performance.now()-start),opacity:img?opacity:0}); if(performance.now()-start<500)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame)});return samples;`);
  const after=await page.send('Performance.getMetrics');
  const metrics={imageVisibleMs:samples.find(s=>s.opacity>.9)?.ms,layoutCount:after.metrics.find(m=>m.name==='LayoutCount').value-before.metrics.find(m=>m.name==='LayoutCount').value};
  assert(metrics.imageVisibleMs<350,JSON.stringify(metrics));
  assert(metrics.layoutCount<=10,JSON.stringify(metrics));
  const firstHeight=await page.eval('return document.querySelector(".modal-content").getBoundingClientRect().height');
  await key('ArrowRight');await sleep(350);
  assert.equal(await page.eval('return document.querySelector("#badge-dialog-title").textContent'),'Emergency Contact');
  assert.equal(await page.eval('return document.querySelector(".modal-content").getBoundingClientRect().height'),firstHeight);
  // Closing a claimed badge must not later close the next badge opened by a swipe.
  await page.clickText('Claim This Badge');await sleep(60);await key('ArrowRight');await sleep(650);
  assert.equal(await page.eval('return document.querySelector("#badge-dialog-title")?.textContent'),'A Very Sparkly Secret');
  await key('Escape');await sleep(350);
  const originalScroll=await page.eval(`const b=[...document.querySelectorAll('.badge-card')].find(b=>b.textContent.includes('Race to the Sun'));b.scrollIntoView({block:'center',behavior:'instant'});b.focus({preventScroll:true});window.__motionButton=b;return window.scrollY;`);
  assert(originalScroll>100,JSON.stringify(await page.eval('return {y:window.scrollY,body:document.body.style.cssText,height:document.documentElement.scrollHeight,dialogs:[...document.querySelectorAll("[role=dialog]")].map(e=>e.innerText.slice(0,100)),card:window.__motionButton.getBoundingClientRect().toJSON()}')));
  await page.eval('window.__motionButton.click()');await sleep(350);
  assert(await page.eval('return document.body.style.position==="fixed" && document.activeElement.getAttribute("role")==="dialog"'));
  const exitStart=await page.eval(`document.querySelector('[aria-label="Close badge"]').click();await new Promise(requestAnimationFrame);return {mounted:!!document.querySelector('[role="dialog"]'),locked:document.body.style.position==='fixed'};`);
  assert(exitStart.mounted && exitStart.locked,'Dialog and scroll lock survive the exit');
  await sleep(350);
  const restored=await page.eval('return {scroll:window.scrollY,focus:document.activeElement===window.__motionButton,locked:document.body.style.position,dialog:!!document.querySelector("[role=dialog]")}');
  assert(Math.abs(restored.scroll-originalScroll)<2,JSON.stringify(restored));assert(restored.focus&&!restored.locked&&!restored.dialog,JSON.stringify(restored));
  await click('[aria-label="Open schedule"]');await sleep(300);
  await key('Tab');assert(await page.eval('return document.querySelector("[role=dialog]").contains(document.activeElement)'));
  await key('Escape');await sleep(300);assert(!await page.eval('return !!document.querySelector("[role=dialog]")'));
  await page.clickText('Certify My Passport');await sleep(300);assert(await page.eval('return document.querySelector("[role=dialog]").contains(document.activeElement)'));
  await page.clickText('Review Badges');await sleep(100);
  await key('Escape');await sleep(300);assert(!await page.eval('return !!document.querySelector("[role=dialog]")'));
  // Prefer-reduced-motion should preserve static art and full claim functionality.
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await seed();
  const reduced=await page.eval(`const b=document.querySelector('.badge-card');b.click();await new Promise(requestAnimationFrame);const transforms=[];for(let i=0;i<18;i++){transforms.push(getComputedStyle(document.querySelector('.modal-content')).transform);await new Promise(requestAnimationFrame);}return transforms;`);
  assert(reduced.every(t=>t==='none'),'Reduced-motion sheet must not move: '+reduced);
  await page.screenshot(out+'/reduced-motion.png');await key('Escape');await sleep(300);
  // Newly unlocked bonuses must be presented one at a time, even on double click.
  const passport=JSON.parse(fs.readFileSync('public/passports/twilight/passport.json'));
  const claims=Object.fromEntries(passport.badges.filter(b=>b.type!=='secret'&&b.id!=='breaking-dawn-2').map(b=>[b.id,{claimed:true,claimedAt:new Date().toISOString()}]));
  // Mark the two already-earned categories, then final movie yields Forever + Immortal.
  for(const id of ['secret-scenes','secret-meals'])claims[id]={claimed:true,claimedAt:new Date().toISOString()};
  await seed(claims);
  await page.eval(`[...document.querySelectorAll('.badge-card')].find(b=>b.textContent.includes('Breaking Dawn – Part 2')).click()`);await sleep(300);await page.clickText('Claim This Badge');await sleep(700);
  assert.equal(await page.eval('return document.querySelector("[role=dialog] h3")?.textContent'),'Forever');
  await page.eval(`const b=[...document.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.includes('Continue'));b.click();b.click();`);await sleep(400);
  assert.equal(await page.eval('return document.querySelector("[role=dialog] h3")?.textContent'),'Immortal');
  await page.clickText('Continue Saga');await sleep(350);assert(!await page.eval('return !!document.querySelector("[role=dialog]")'));
  // No audio-ready events or hung image may prevent first-time onboarding.
  await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.Image=class {set src(value){} }; window.Audio=class {addEventListener(){} removeEventListener(){} load(){} pause(){} play(){return Promise.resolve()} };`});
  await page.eval('localStorage.removeItem("passport-twilight")');await page.goto(base+'/event/twilight');
  await page.clickText('Enter Forks');assert(await page.waitForText('Forks High School'));await sleep(300);await page.clickText('Continue');
  assert(await page.waitForText('Begin My Saga',8500),'Hung media must not trap onboarding');
  fs.writeFileSync(out+'/metrics.json',JSON.stringify({baseline:{imageVisibleMs:952,layoutCount:35},after:metrics,restoredScroll:restored.scroll,reducedMotion:true,bonusQueue:true,hungMediaRecovery:true},null,2));
  console.log('PASS: immediate badge image, stable swipe height, claim timer cancellation, complete exits, scroll/focus restoration, schedule/certificate Escape, reduced motion, bonus queue, hung media recovery.',metrics);
  const errors=page.logs.filter(l=>l.startsWith('[exception]'));assert.deepEqual(errors,[]);
} finally { page.close();page.kill(); }
