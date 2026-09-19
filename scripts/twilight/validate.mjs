import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = 'public/passports/twilight';
const p = JSON.parse(fs.readFileSync(`${root}/passport.json`));
const production = JSON.parse(fs.readFileSync('docs/twilight/production.json'));
const audio = JSON.parse(fs.readFileSync('docs/twilight/audio-receipts.json'));
const transcripts = JSON.parse(fs.readFileSync('docs/twilight/voice-review-transcript.json'));
const dialogue = [...production.badges, ...production.greetings];
assert.equal(production.model, 'eleven_v3');
assert.equal(production.voiceSettings.speed, 1);
assert.equal(Object.keys(production.voices).length, 9);
assert.equal(new Set(Object.values(production.voices).map(voice => voice.id)).size, 9, 'Each character has a distinct voice');
for (const [character, voice] of Object.entries(production.voices)) {
  const design = JSON.parse(fs.readFileSync(`docs/twilight/voice-design/${character}.json`));
  assert.equal(design.request.model_id, 'eleven_ttv_v3');
  assert.equal(design.request.voice_description, voice.designDescription, `Traits sent to Voice Design: ${character}`);
  assert.equal(design.voiceId, voice.id);
  assert.equal(design.designHash, voice.designHash);
}
assert.equal(dialogue.length, 36);
for (const line of dialogue) {
  assert(line.narration.trim().split(/\s+/).length <= 10, `Keep ${line.id} punchy`);
  assert(line.character && production.voices[line.voice], line.id);
  assert(['film-quote', 'original-character-line'].includes(line.kind), line.id);
  if (line.kind === 'film-quote') assert(line.source, line.id);
  assert(!/[\[\]…]/.test(line.narration), `Keep spoken words separate from direction: ${line.id}`);
  assert(line.performance.tags.length > 0 && line.performance.intent, `Direct each performance: ${line.id}`);
  assert.equal(line.synthesisText, `${line.performance.tags.map(tag => `[${tag}]`).join(' ')} ${line.narration}`);
  const receipt = audio[line.id];
  assert.equal(receipt?.model, production.model, `Regenerate ${line.id}`);
  assert.equal(receipt.voiceId, production.voices[line.voice].id, line.id);
  assert.equal(receipt.castDesignHash, production.voices[line.voice].designHash, line.id);
  assert.deepEqual(receipt.voiceSettings, production.voiceSettings, line.id);
  assert.equal(receipt.request.model_id, 'eleven_v3', line.id);
  assert.equal(receipt.request.text, line.synthesisText, `Performance directions actually sent: ${line.id}`);
  assert.equal(receipt.spokenText, line.narration, line.id);
  assert(receipt.durationSeconds > 0.3 && receipt.durationSeconds <= 8, line.id);
  const greeting = line.id.startsWith('greeting-');
  const file = `${root}/assets/audio/${greeting ? 'greetings' : 'badges'}/${greeting ? '' : 'badge-'}${line.id}.mp3`;
  const hash = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(hash, receipt.audioSha256, `Published audio matches receipt: ${line.id}`);
  assert.equal(transcripts.clips[line.id].audioSha256, hash, line.id);
  assert.equal(transcripts.clips[line.id].wordsMatch, true, `Spoken words verified: ${line.id}`);
}
const ids = new Set(p.badges.map(b => b.id));
assert.equal(ids.size, 33);
assert.equal(p.badges.length, 33);
const ofType = type => p.badges.filter(b => b.type === type);
for (const [type, count] of Object.entries({scene:20, movie:5, meal:4, secret:4})) assert.equal(ofType(type).length, count, type);
for (const [secret, type] of [['secret-movies','movie'],['secret-scenes','scene'],['secret-meals','meal']]) {
  assert.deepEqual(new Set(p.badges.find(b => b.id === secret).unlockCondition.badgeIds), new Set(ofType(type).map(b => b.id)), secret);
}
assert.deepEqual(new Set(p.badges.find(b => b.id === 'secret-immortal').unlockCondition.badgeIds), new Set(['secret-movies','secret-scenes','secret-meals']));
assert.equal(p.schedule.dayStart, '10:30');
assert.equal(p.schedule.dayEnd, '22:07');
assert.deepEqual(ofType('meal').map(b => [b.name,b.time]), [['Brunch','11:00am ish'],['Lunch','1:35pm ish'],['Snack Break','3:50pm ish'],['Dinner','8:00pm ish']]);
const parse = time => { const [,h,m,period] = time.match(/(\d+):(\d+)(am|pm)/); return (+h % 12) * 60 + +m + (period === 'pm' ? 720 : 0); };
for (const b of p.badges) {
  assert(b.name && b.shortDesc && b.longDesc);
  assert(b.order > 0);
  assert(fs.statSync(path.join(root, b.image)).size > 1000, b.image);
  assert(fs.statSync(path.join(root, b.sound)).size > 1000, b.sound);
  if (b.type === 'scene') {
    const [h,m,s] = b.movieOffset.split(':').map(Number);
    const movie = p.badges.find(f => f.id === b.movieId);
    assert.equal(parse(b.time), Math.floor(parse(movie.startTime) + h * 60 + m + s / 60), b.id);
    assert(parse(b.time) <= parse(movie.time), b.id);
  }
  const script = production.badges.find(s => s.id === b.id);
  assert(script?.narration && script?.imagePrompt);
}
assert.equal(new Set(p.badges.map(b=>b.order)).size, 33);
assert.equal(p.audio.greetings.length, 3);
for (const greeting of p.audio.greetings) assert(fs.statSync(path.join(root,greeting)).size > 1000);
const art = JSON.parse(fs.readFileSync('docs/twilight/art-samples.json'));
assert.equal(art.samples.length, 5, 'Preserve the five approved samples');
const finalArt = JSON.parse(fs.readFileSync('docs/twilight/final-art/manifest.json'));
assert.deepEqual(new Set(finalArt.images.map(i=>i.id)), ids, 'Every badge has generated final artwork');
assert.equal(finalArt.images.length, 33);
for (const image of finalArt.images) {
  assert(fs.statSync(path.join('docs/twilight/final-art',image.original)).size > 100000);
  assert(fs.statSync(image.asset).size > 50000, 'Final optimized art, not a placeholder: '+image.id);
  assert(image.prompt);
}
assert.equal(p.settings.badgeShape, 'arch');
assert.equal(p.theme.mode, 'dark');
assert.equal(p.pwa.backgroundColor, p.theme.colors.background['100']);
assert.equal(p.version, 10);
assert.equal(p.features.teamPoll, true);
const teams = JSON.parse(fs.readFileSync('docs/twilight/team-art/manifest.json'));
assert.deepEqual(teams.images.map(image => image.id), ['edward', 'jacob', 'charlie']);
for (const image of teams.images) assert(fs.statSync(image.asset).size > 20000);
assert(p.features.badgeSounds && p.features.greetingSounds && p.features.secretBadges);
console.log('PASS: 33 badges, all 20 host scene offsets, five film completions, four meals, four exact bonus conditions, 36 audio files, 33 final illustrations, uniform Gowalla arches.');
