import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { launch, sleep } from '../e2e/cdp.mjs';

const out = path.resolve('.e2e/twilight-content');
fs.mkdirSync(out, {recursive:true});
const certificate=out+'/twilight-team-edward-twilight-qa.png';
if(fs.existsSync(certificate))fs.unlinkSync(certificate);
const passport = JSON.parse(fs.readFileSync('public/passports/twilight/passport.json'));
const server = spawn('npx', ['vite','preview','--port','4174','--strictPort'], {stdio:'ignore'});
let page;
try {
  for(let i=0;i<40;i++){try{await fetch('http://localhost:4174');break;}catch{await sleep(250);}}
  fs.rmSync(out+'/profile',{recursive:true,force:true});
  page = await launch({profile:out+'/profile'});
  await page.send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await page.send('Page.bringToFront');
  await page.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await page.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:out});
  await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__audioChecks=[]; const original=HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play=function(){const src=this.src; const result=original.call(this); result.then(()=>window.__audioChecks.push({src,ok:true}),e=>window.__audioChecks.push({src,ok:false,error:e.name}));return result;};`});
  const url='http://localhost:4174/event/twilight';
  await page.send('Network.enable');
  await page.send('Network.setBlockedURLs',{urls:['*/assets/index-*.js']});
  await page.goto(url);
  assert.equal(await page.eval('return getComputedStyle(document.body).backgroundColor'),'rgb(15, 28, 34)','Dark first paint works before React loads');
  await page.send('Network.setBlockedURLs',{urls:[]});
  await page.goto(url);
  const seed = async badges => {
    await page.eval(`localStorage.setItem('passport-twilight', ${JSON.stringify(JSON.stringify({version:1,name:'Twilight QA',createdAt:new Date().toISOString(),honorSystemDismissed:true,teamPoll:{initial:'edward'},badges}))})`);
    await page.goto(url); await page.waitForText("Twilight QA's Saga"); await sleep(500);
  };
  const claims = ids => Object.fromEntries(ids.map(id=>[id,{claimed:true,claimedAt:new Date().toISOString()}]));
  const click = async (selector, text) => {
    const point=await page.eval(`const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.textContent.trim()===${JSON.stringify(text)} || (${JSON.stringify(selector)}==='.badge-card' && e.textContent.includes(${JSON.stringify(text)}))); if(!e) throw new Error('Missing '+${JSON.stringify(text)});e.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>setTimeout(r,200));const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};`);
    await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});
    await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});
  };
  const stored = () => page.eval(`return JSON.parse(localStorage.getItem('passport-twilight')).badges`);
  const claim = async name => {await click('.badge-card',name);assert(await page.waitForText('Claim This Badge'));await sleep(500);await click('button','Claim This Badge');await sleep(2300);};

  await seed(claims(passport.badges.filter(b=>b.type==='scene'&&b.id!=='first-sight').map(b=>b.id)));
  const appearance=await page.eval(`return {mode:getComputedStyle(document.documentElement).colorScheme,body:getComputedStyle(document.body).backgroundColor,header:getComputedStyle(document.querySelector('header')).backgroundColor,arches:document.querySelectorAll('.badge-shape-arch').length,otherShapes:document.querySelectorAll('.badge-shape-circle,.badge-shape-square').length};`);
  assert.equal(appearance.mode,'dark');assert.equal(appearance.body,appearance.header);assert.equal(appearance.arches,33);assert.equal(appearance.otherShapes,0);
  await page.screenshot(out+'/dark-passport.png');
  console.log('PASS: dark first paint, dark default in a light browser, all 33 Gowalla arches.',appearance);
  await claim('The Cullens Arrive');
  let state=await stored();
  assert(state['secret-scenes']?.claimed && !state['secret-movies']?.claimed,'Only all-scenes should unlock');
  const audio=await page.eval('return window.__audioChecks');
  assert(audio.some(a=>a.ok&&a.src.includes('badge-first-sight.mp3')),'Scene audio plays after a real click');
  assert(audio.some(a=>a.ok&&a.src.includes('badge-secret-scenes.mp3')),'Collection voice plays');
  await page.screenshot(out+'/scene-bonus.png');
  console.log('PASS: all 20 scenes unlock Twihard; real user clicks play scene and bonus narration.');

  await seed({...state,...claims(['breakfast','lunch','late-night-snack'])});
  await claim('Dinner');state=await stored();
  await page.screenshot(out+'/meal-bonus.png');
  assert(state['secret-meals']?.claimed && !state['secret-immortal']?.claimed,'Meal bonus does not bypass films: '+JSON.stringify(state));
  console.log('PASS: four meals unlock their bonus without prematurely unlocking Immortal.');
  await seed({...state,...claims(['twilight','new-moon','eclipse','breaking-dawn-1'])});
  await claim('Breaking Dawn – Part 2');state=await stored();
  assert(state['secret-movies']?.claimed && state['secret-immortal']?.claimed);
  assert.equal(Object.values(state).filter(b=>b.claimed).length,33);
  await page.screenshot(out+'/immortal.png');
  await page.goto(url); assert(await page.waitForText('Still your forever?'));await sleep(400);
  await click('button','Confirm Team Edward');
  assert(await page.waitForText('Save Team Poster'));
  await click('button','Save Team Poster');
  for(let i=0;i<80&&!fs.existsSync(certificate);i++) await sleep(250);
  assert(fs.existsSync(certificate),'Certificate is downloaded with Twilight filename');
  const geometry=await page.eval(`const t=document.querySelector('#team-export-template');t.style.display='block';t.style.position='absolute';t.style.left='-9999px'; const r={height:t.offsetHeight,scrollHeight:t.scrollHeight,images:t.querySelectorAll('img').length,arches:[...t.querySelectorAll('img')].filter(i=>i.parentElement.style.borderRadius==='50% 50% 24% 24%').length};t.style.display='none';return r;`);
  assert(geometry.height>1920 && geometry.scrollHeight<=geometry.height,'All badges fit within certificate');
  assert.equal(geometry.images,34);assert.equal(geometry.arches,33,'Poster uses arches throughout');
  console.log('PASS: all 33 badges unlock Immortal and export without cropping.',JSON.stringify(geometry));
  console.log('Certificate:',certificate);
} finally {
  page?.close();page?.kill();server.kill();
}
