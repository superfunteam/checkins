/** Team selection, endless carousel, completion gate, and actual poster exports. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { launch, sleep } from '../e2e/cdp.mjs';
const out = path.resolve('.e2e/teams');
fs.mkdirSync(out, { recursive: true });
fs.rmSync(out+'/profile', { recursive:true, force:true });
const base=process.env.TEAM_BASE || 'http://127.0.0.1:5175';
const url=base+'/event/twilight';
const passport=JSON.parse(fs.readFileSync('public/passports/twilight/passport.json'));
const claims=ids=>Object.fromEntries(ids.map(id=>[id,{claimed:true,claimedAt:new Date().toISOString()}]));
const allClaims=claims(passport.badges.map(b=>b.id));
const page=await launch({profile:out+'/profile'});
const click=selector=>page.eval(`document.querySelector(${JSON.stringify(selector)}).click()`);
const stored=()=>page.eval(`return JSON.parse(localStorage.getItem('passport-twilight'))`);
const center=()=>page.eval(`return document.querySelector('[data-centered=true]')?.dataset.character`);
const seed=async(data={})=>{
  await page.goto(url);
  await page.eval(`localStorage.setItem('passport-twilight',${JSON.stringify(JSON.stringify({version:1,name:'Team Tester',createdAt:new Date().toISOString(),honorSystemDismissed:true,badges:{},...data}))})`);
  await page.goto(url);await sleep(500);
};
const savePoster=async(team)=>{
  assert(await page.waitForText('Save Team Poster',25000),'Poster generated: '+await page.eval('return document.body.innerText'));
  const file=path.join(out,`twilight-team-${team}-team-tester.png`);
  fs.rmSync(file,{force:true});await page.clickText('Save Team Poster');
  for(let i=0;i<50&&!fs.existsSync(file);i++)await sleep(100);
  assert(fs.existsSync(file),'Downloaded '+team);
  const shape=await page.eval(`const t=document.querySelector('#team-export-template');t.style.display='block';t.style.position='absolute';t.style.left='-9999px';const result={team:t.dataset.team,width:t.offsetWidth,height:t.offsetHeight,scrollHeight:t.scrollHeight,portraits:t.querySelectorAll('[data-team-portrait]').length,badges:t.querySelectorAll('[data-poster-badge]').length,arches:[...t.querySelectorAll('[data-poster-badge] img')].filter(i=>i.parentElement.style.borderRadius==='50% 50% 24% 24%').length,loaded:[...t.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)};t.style.display='none';return result;`);
  assert.equal(shape.team,team);assert.equal(shape.badges,33);assert.equal(shape.arches,33);assert.equal(shape.portraits,1);assert(shape.loaded);assert(shape.scrollHeight<=shape.height);
  console.log('PASS poster',JSON.stringify(shape));return file;
};
try {
  await page.send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await page.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await page.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:out});
  await seed();assert(await page.waitForText('Choose your team.'));
  assert.equal((await stored()).teamPoll,undefined,'Browsing alone does not cast a vote');
  assert.equal(await page.eval('return document.querySelectorAll(".badge-card").length'),0,'Initial choice is required before passport');
  assert.equal(await center(),'edward');
  const peeks=await page.eval(`const w=innerWidth;return [...document.querySelectorAll('.team-carousel-slide')].map(e=>({id:e.dataset.character,center:e.dataset.centered,r:e.getBoundingClientRect().toJSON()})).filter(e=>e.r.right>0&&e.r.left<w);`);
  assert.equal(peeks.length,3,'Centered character and two peeking neighbors');
  await page.screenshot(out+'/pick-edward.png');
  for(const expected of ['jacob','charlie','edward','jacob','charlie','edward']){await click('[aria-label="Next character"]');await sleep(300);assert.equal(await center(),expected);}
  await click('[aria-label="Previous character"]');await sleep(300);assert.equal(await center(),'charlie');
  await page.screenshot(out+'/pick-charlie.png');
  // A real touch gesture loops Charlie forward to Edward.
  const rect=await page.eval(`return document.querySelector('.team-carousel').getBoundingClientRect().toJSON()`);
  const y=rect.y+rect.height/2;
  await page.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:285,y}]});
  for(const x of [260,220,180,130,95]){await page.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await sleep(30);}
  await page.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(500);assert.equal(await center(),'edward','Swipe wraps forward');
  // Native radio keyboard control, viewport extremes, and reduced motion.
  await click('input[value="charlie"]');await sleep(300);
  await page.send('Emulation.setDeviceMetricsOverride',{width:320,height:640,deviceScaleFactor:1,mobile:true});await sleep(200);
  assert(await page.eval('return document.documentElement.scrollWidth<=innerWidth'));await page.screenshot(out+'/pick-320.png');
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await click('[aria-label="Next character"]');await sleep(100);assert.equal(await center(),'edward');
  await page.send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await sleep(200);
  assert(await page.eval('return document.documentElement.scrollWidth<=innerWidth'));await page.screenshot(out+'/pick-desktop.png');
  await page.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await click('input[value="charlie"]');await page.clickText('I’m Team Charlie');assert(await page.waitForText("Team Tester's Saga"));
  assert.equal((await stored()).teamPoll.initial,'charlie');
  await page.goto(url);assert(await page.waitForText("Team Tester's Saga"));assert.equal(await center(),undefined);
  // Legacy progress without a team remains intact and receives the first poll.
  await seed({badges:claims(['first-sight'])});assert(await page.waitForText('Choose your team.'));
  await page.clickText('I’m Team Edward');assert(await page.waitForText("Team Tester's Saga"));assert((await stored()).badges['first-sight'].claimed);
  // At the last movie the final poll must wait for Forever and Immortal.
  await seed({teamPoll:{initial:'edward'},badges:claims(passport.badges.filter(b=>!['breaking-dawn-2','secret-movies','secret-immortal'].includes(b.id)).map(b=>b.id))});
  assert(await page.waitForText("Team Tester's Saga"));assert.equal(await center(),undefined);
  await page.eval(`[...document.querySelectorAll('.badge-card')].find(b=>b.textContent.includes('Breaking Dawn – Part 2')).click()`);await sleep(300);
  await page.clickText('Claim This Badge');await sleep(800);
  assert.equal(await page.eval('return document.querySelector("[role=dialog] h3")?.textContent'),'Forever');assert.equal(await center(),undefined);
  await page.clickText('Continue Saga');await sleep(400);
  assert.equal(await page.eval('return document.querySelector("[role=dialog] h3")?.textContent'),'Immortal');assert.equal(await center(),undefined);
  await page.clickText('Continue Saga');assert(await page.waitForText('Still your forever?'));await sleep(300);
  assert.equal(await center(),'edward');await page.screenshot(out+'/final-poll.png');
  await click('input[value="jacob"]');await page.clickText('Switch to Team Jacob');
  await savePoster('jacob');assert.equal((await stored()).teamPoll.initial,'edward');assert.equal((await stored()).teamPoll.final,'jacob');
  await page.screenshot(out+'/share-jacob.png');
  await page.goto(url);assert(await page.waitForText("Team Tester's Saga"));assert.equal(await center(),undefined,'No repeated final poll after confirmation');
  await page.clickText('Share My Team');assert(await page.waitForText('Save Team Poster'));
  await page.clickText('Change my final team');assert(await page.waitForText('Still your forever?'));await sleep(300);assert.equal(await center(),'jacob');
  await click('input[value="charlie"]');await page.clickText('Switch to Team Charlie');await savePoster('charlie');
  assert.equal((await stored()).teamPoll.initial,'edward');
  // Staying with the first decision gets different poster copy.
  await seed({teamPoll:{initial:'edward'},badges:allClaims});assert(await page.waitForText('Still your forever?'));await sleep(300);
  await page.clickText('Confirm Team Edward');await savePoster('edward');
  assert(await page.eval(`return document.querySelector('#team-export-template').textContent.includes('from first sight to forever')`));
  // Web Share is invoked only by a click; cancellation doesn't lose the poster.
  await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(navigator,'canShare',{value:()=>true,configurable:true});Object.defineProperty(navigator,'share',{value:async data=>{window.__shared={name:data.files[0].name,size:data.files[0].size,title:data.title};if(window.__cancelShare)throw new DOMException('Cancelled','AbortError')},configurable:true});`});
  await page.goto(url);await page.waitForText("Team Tester's Saga");await page.clickText('Share My Team');assert(await page.waitForText('Save Team Poster'));
  assert.equal(await page.eval('return window.__shared'),undefined);
  await page.clickText('Share My Team');await sleep(100);const shared=await page.eval('return window.__shared');assert(shared.size>10000&&shared.name.includes('team-edward'));
  await page.eval('window.__cancelShare=true');await page.clickText('Share My Team');await sleep(100);assert(await page.waitForText('Save Team Poster'));
  await page.clickText('Back to my badges');assert(await page.waitForText("Team Tester's Saga"));await page.clickText('Start Over');
  assert(await page.waitForText('Enter Forks'));assert.equal((await stored()).teamPoll.initial,null);assert.equal((await stored()).teamPoll.final,null);assert.equal(Object.keys((await stored()).badges).length,0);
  await page.goto(base+'/event/shire');await page.eval(`localStorage.setItem('passport-shire',JSON.stringify({version:1,name:'Frodo',createdAt:new Date().toISOString(),badges:{}}))`);await page.goto(base+'/event/shire');
  assert(await page.waitForText('The Shire Passport'));assert.equal(await center(),undefined);
  assert.deepEqual(page.logs.filter(l=>l.startsWith('[exception]')),[]);
  console.log('PASS: required first choice, three-way endless carousel and touch swipe, responsive layouts, reduced motion, saved first/final picks, legacy progress, sequential finale, all three posters, share/cancel, reset, and Shire isolation.');
} finally {page.close();page.kill();}
