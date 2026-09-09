import assert from 'node:assert/strict';
import { preloadBadgeSounds, playBadgeSound, preloadGreetingSounds, playRandomGreeting } from '../../src/hooks/useSound.js';

const pending = [];
const played = [];
globalThis.window = { matchMedia: () => ({matches: false}) };
globalThis.Audio = class {
  constructor() { this.events = {}; }
  addEventListener(event, fn) { this.events[event] = fn; }
  load() { pending.push(this); }
  cloneNode() { const clone = new Audio(); clone.src = this.src; return clone; }
  play() { played.push(this.src); return Promise.resolve(); }
  pause() {}
};
const finish = audio => audio.events.canplaythrough();
const old = preloadBadgeSounds([{badgeId:'twilight',soundUrl:'/old.mp3?v=1'}]);
const latest = preloadBadgeSounds([{badgeId:'twilight',soundUrl:'/new.mp3?v=2'}]);
finish(pending.pop()); await latest;
finish(pending.pop()); await old;
playBadgeSound('twilight');
assert.equal(played.pop(), '/new.mp3?v=2', 'An older preload must not replace new event audio');
await preloadBadgeSounds([{badgeId:'twilight',soundUrl:'/new.mp3?v=2'}]);
assert.equal(pending.length, 0, 'Identical config does not redownload');
const shire = preloadBadgeSounds([{badgeId:'twilight',soundUrl:'/shire.mp3'}]);
finish(pending.pop()); await shire; playBadgeSound('twilight');
assert.equal(played.pop(), '/shire.mp3', 'Switching events replaces badge audio even when IDs coincide');
const a = preloadGreetingSounds(['/old-greeting.mp3']);
const b = preloadGreetingSounds(['/new-greeting.mp3']);
finish(pending.pop()); await b; finish(pending.pop()); await a;
playRandomGreeting();
assert.equal(played.pop(), '/new-greeting.mp3', 'Late greeting loads cannot leak across events');
console.log('PASS: event switching, version refresh, deduplication, and stale badge/greeting preload protection.');
