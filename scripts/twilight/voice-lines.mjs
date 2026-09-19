import fs from 'node:fs';

// Full casting traits are sent to ElevenLabs Voice Design. Its saved voice IDs
// carry that identity into synthesis; per-line tags direct the performance.
export const voices = JSON.parse(fs.readFileSync(new URL('./voice-cast.json', import.meta.url), 'utf8'));
export const voiceSettings = { stability: 0.5, similarity_boost: 0.75, speed: 1.0 };
export const voiceModel = 'eleven_v3';

const sources = {
  twilight: 'https://en.wikiquote.org/wiki/Twilight_(2008_film)',
  baseball: 'https://www.scribd.com/doc/28819330/Twilight-Script',
  newMoon: 'https://en.wikiquote.org/wiki/The_Twilight_Saga:_New_Moon',
  newMoonDialogue: 'https://thetwilightsagaguide.angelfire.com/scripts/NewMoonMovieDialogue.html',
  eclipse: 'https://en.wikiquote.org/wiki/The_Twilight_Saga:_Eclipse',
  kiss: 'https://visual-icon.com/title/detail/?id=18602',
  dawn1: 'https://en.wikiquote.org/wiki/The_Twilight_Saga:_Breaking_Dawn_%E2%80%93_Part_1',
  dawn2: 'https://twilightsaga.fandom.com/wiki/Breaking_Dawn_-_Part_2_movie_quotes',
  vision: 'https://clip.cafe/the-twilight-saga-breaking-dawn-part-2-2012/now-know-s7/',
};
const quote = (character, voice, narration, source) => ({ character, voice, narration, kind: 'film-quote', source: sources[source] || source });
const original = (character, voice, narration) => ({ character, voice, narration, kind: 'original-character-line' });

export const voiceLines = {
  breakfast: original('Charlie', 'charlie', 'I made coffee. You’re gonna need it.'),
  'first-sight': quote('Jessica Stanley', 'jessica', 'That’s Edward Cullen.', 'twilight'),
  'the-van': quote('Edward', 'edward', 'You can Google it.', 'twilight'),
  'skin-of-a-killer': quote('Edward', 'edward', 'This is the skin of a killer, Bella.', 'Host-provided scene sheet'),
  'vampire-baseball': quote('Rosalie', 'rosalie', 'My monkey man.', 'baseball'),
  twilight: quote('Bella', 'bella', 'I want you. Always.', 'twilight'),
  lunch: quote('Rosalie', 'rosalie', 'Is she even Italian?', 'twilight'),
  'paper-cut': quote('Bella', 'bella', 'Ow! Papercut.', 'newMoonDialogue'),
  'the-goodbye': quote('Edward', 'edward', 'You just don’t belong in my world, Bella.', 'newMoonDialogue'),
  'garage-days': quote('Jacob', 'jacob', 'Scrap metal. You shouldn’t have.', 'newMoon'),
  volterra: original('Bella', 'bella', 'Edward, stop! I’m right here!'),
  'new-moon': quote('Edward', 'edward', 'Marry me, Bella.', 'newMoon'),
  'late-night-snack': original('Jacob', 'jacob', 'I’m team snacks. Pass them over.'),
  'cullen-origins': original('Edward', 'edward', 'I had a different life before all this.'),
  'jacobs-confession': quote('Jacob', 'jacob', 'You feel something for me.', 'eclipse'),
  'the-kiss': quote('Bella', 'bella', 'I’m asking you to kiss me.', 'kiss'),
  'the-tent': quote('Jacob', 'jacob', 'I am hotter than you.', 'eclipse'),
  'newborn-battle': original('Jasper', 'jasper', 'Stay focused. I know how they fight.'),
  eclipse: quote('Bella', 'bella', 'I love you more.', 'eclipse'),
  'the-wedding': quote('Edward', 'edward', 'But let’s start with forever.', 'dawn1'),
  'isle-esme': quote('Edward', 'edward', 'Last night was the best night of my existence.', 'dawn1'),
  'renesmee-born': original('Edward', 'edward', 'Stay with me, Bella. I need you.'),
  imprinting: original('Jacob', 'jacob', 'I’ll keep her safe. Whatever it takes.'),
  'breaking-dawn-1': quote('Charlie', 'charlie', 'I know, I look hot.', 'dawn1'),
  dinner: original('Charlie', 'charlie', 'Everybody eats. That’s my only rule tonight.'),
  'rapid-growth': quote('Bella', 'bella', 'She was born, not bitten.', 'dawn2'),
  'the-witnesses': original('Carlisle', 'carlisle', 'I asked for witnesses. You answered.'),
  'the-battle': quote('Alice', 'alice', 'Now you know. That’s your future.', 'vision'),
  'breaking-dawn-2': quote('Bella', 'bella', 'Forever.', 'dawn2'),
  'secret-movies': original('Edward', 'edward', 'You stayed through everything. Stay a little longer.'),
  'secret-meals': original('Charlie', 'charlie', 'You ate everything? That’s my kind of team.'),
  'secret-scenes': original('Alice', 'alice', 'I saw you finishing every scene. Obviously.'),
  'secret-immortal': quote('Bella', 'bella', 'I was born to be a vampire.', 'dawn2'),
  'greeting-1': quote('Bella', 'bella', 'Forks is growing on me.', 'twilight'),
  'greeting-2': original('Charlie', 'charlie', 'I’ve got coffee. Make yourself at home.'),
  'greeting-3': original('Alice', 'alice', 'I’ve seen your future. You’re staying for all five.'),
};

// Only these bracketed performance cues and the short spoken line are sent as
// TTS text. Keep directions separate from the words guests are meant to hear.
export const performances = {
  breakfast: { tags: ['dryly', 'warmly'], intent: 'A tired dad slides over a mug; the warning is affectionate, with a tiny amused lift on need it.' },
  'first-sight': { tags: ['curious', 'conspiratorial'], intent: 'Cafeteria gossip to a new friend; a quick confidential identification, interest on the name.' },
  'the-van': { tags: ['dryly', 'dismissive'], intent: 'A clipped, evasive little joke intended to stop a dangerous line of questioning.' },
  'skin-of-a-killer': { tags: ['quietly', 'pained'], intent: 'A vulnerable confession disguised as a warning; self-disgust catches on killer, then tenderness on Bella.' },
  'vampire-baseball': { tags: ['amused', 'affectionate'], intent: 'A private, fondly teasing reaction to an outrageous stunt; smile without a big laugh.' },
  twilight: { tags: ['softly', 'sincere'], intent: 'Direct desire and a settled promise; allow the second sentence to land gently.' },
  lunch: { tags: ['sarcastic', 'incredulous'], intent: 'A sharp skeptical aside about the family cooking plan, with the emphasis on Italian.' },
  'paper-cut': { tags: ['startled'], intent: 'An involuntary little yelp, then an embarrassed everyday explanation; keep it human and quick.' },
  'the-goodbye': { tags: ['restrained', 'sorrowful'], intent: 'He forces himself to sound certain while breaking his own heart; controlled, no sobbing.' },
  'garage-days': { tags: ['playful', 'amused'], intent: 'An affectionate mock thank-you for an obviously terrible present; the smile is audible.' },
  volterra: { tags: ['urgent', 'calling out'], intent: 'She needs him to hear her in a crowd; fear tips into relief on right here, no theatrical screaming.' },
  'new-moon': { tags: ['tender', 'earnest'], intent: 'A simple, intimate proposal with real stakes; no grand narrator cadence.' },
  'late-night-snack': { tags: ['playful', 'confident'], intent: 'A warm, spontaneous joke to friends; toss off the second sentence like a casual request.' },
  'cullen-origins': { tags: ['reflective', 'wistful'], intent: 'A brief personal admission to Bella; a trace of longing for his human life, intimate and conversational.' },
  'jacobs-confession': { tags: ['earnest', 'vulnerable'], intent: 'Confidence masking the need to be chosen; lean gently on something, not a demand.' },
  'the-kiss': { tags: ['breathless', 'resolute'], intent: 'A difficult request she has finally decided to make; intimate and clear rather than sleepy.' },
  'the-tent': { tags: ['smug', 'teasing'], intent: 'A perfectly timed friendly-rival jab; relish hotter, then let the line fall away.' },
  'newborn-battle': { tags: ['focused', 'firm'], intent: 'Quiet tactical command to allies, urgent and economical with no shouted drill-sergeant delivery.' },
  eclipse: { tags: ['warmly', 'certain'], intent: 'A soft reply with smiling confidence; the final word settles the argument.' },
  'the-wedding': { tags: ['tender', 'smiling'], intent: 'A vow offered at close range; reverent affection, almost disbelieving happiness.' },
  'isle-esme': { tags: ['intimate', 'awed'], intent: 'Private wonder after a life-changing night, warm and a little surprised by his own honesty.' },
  'renesmee-born': { tags: ['panicked', 'pleading'], intent: 'Control is failing; he needs her to stay alive. The second sentence cracks open into raw need.' },
  imprinting: { tags: ['protective', 'resolute'], intent: 'A steady promise to protect a child; unwavering responsibility and warmth.' },
  'breaking-dawn-1': { tags: ['deadpan', 'wry'], intent: 'An awkward dad undercuts wedding emotion with a dry joke, tossed away rather than performed for applause.' },
  dinner: { tags: ['matter-of-fact', 'warmly'], intent: 'Practical hospitality from the dad at the table; a mock rule with a soft edge.' },
  'rapid-growth': { tags: ['firm', 'protective'], intent: 'A mother corrects a dangerous misunderstanding; clear contrast between born and bitten.' },
  'the-witnesses': { tags: ['grateful', 'earnest'], intent: 'Quiet appreciation to people who took a real risk; the second sentence acknowledges their courage.' },
  'the-battle': { tags: ['grave', 'confident'], intent: 'An unmistakable warning delivered with eerie certainty; let future land without a theatrical growl.' },
  'breaking-dawn-2': { tags: ['softly', 'lovingly'], intent: 'A single sincere answer to a lifelong promise; one natural word, not drawn into a whisper effect.' },
  'secret-movies': { tags: ['warmly', 'inviting'], intent: 'Intimate gratitude to someone who stayed, followed by a gentle invitation with a hint of humor.' },
  'secret-meals': { tags: ['amused', 'approving'], intent: 'Surprised admiration, then a dad joke delivered with a tiny smile.' },
  'secret-scenes': { tags: ['delighted', 'mischievous'], intent: 'A proud little victory lap, with obviously tossed off as a knowing punchline.' },
  'secret-immortal': { tags: ['confident', 'awed'], intent: 'She finally recognizes herself; delighted conviction, with a little wonder at the realization.' },
  'greeting-1': { tags: ['wry', 'warmly'], intent: 'A quietly surprised admission that this rainy place is becoming home.' },
  'greeting-2': { tags: ['casual', 'welcoming'], intent: 'A slightly awkward dad genuinely glad to have company; easy and unshowy.' },
  'greeting-3': { tags: ['playful', 'knowing'], intent: 'A cheerful prediction shared like a secret; mock certainty without a sales pitch.' },
};
for (const [id, line] of Object.entries(voiceLines)) {
  const performance = performances[id];
  if (!performance) throw new Error(`Missing performance direction: ${id}`);
  line.performance = performance;
  line.synthesisText = `${performance.tags.map(tag => `[${tag}]`).join(' ')} ${line.narration}`;
}
