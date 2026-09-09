// Short character dialogue. Film excerpts and original party lines are labeled
// separately; the voice cast is licensed stock TTS, not the film actors.
export const voices = {
  edward: { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', direction: 'Smooth American voice; direct, intimate, conversational.' },
  bella: { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', direction: 'Young American voice; candid, quick, understated.' },
  jacob: { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', direction: 'Energetic American voice; warm, confident, conversational.' },
  charlie: { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', direction: 'Grounded American voice; dry, casual delivery.' },
  alice: { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', direction: 'Bright American voice; quick, playful, clear.' },
};
export const voiceSettings = { stability: 0.45, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 1.12 };
export const voiceModel = 'eleven_turbo_v2_5';

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
  breakfast: original('Charlie', 'charlie', 'I made coffee. You’re going to need it.'),
  'first-sight': quote('Jessica Stanley', 'alice', 'That’s Edward Cullen.', 'twilight'),
  'the-van': quote('Edward', 'edward', 'You can Google it.', 'twilight'),
  'skin-of-a-killer': quote('Edward', 'edward', 'This is the skin of a killer, Bella.', 'Host-provided scene sheet'),
  'vampire-baseball': quote('Rosalie', 'alice', 'My monkey man.', 'baseball'),
  twilight: quote('Bella', 'bella', 'I want you. Always.', 'twilight'),
  lunch: quote('Rosalie', 'alice', 'Is she even Italian?', 'twilight'),
  'paper-cut': quote('Bella', 'bella', 'Ow! Papercut.', 'newMoonDialogue'),
  'the-goodbye': quote('Edward', 'edward', 'You just don’t belong in my world, Bella.', 'newMoonDialogue'),
  'garage-days': quote('Jacob', 'jacob', 'Scrap metal. You shouldn’t have.', 'newMoon'),
  volterra: original('Bella', 'bella', 'Edward, stop! I’m right here!'),
  'new-moon': quote('Edward', 'edward', 'Marry me, Bella.', 'newMoon'),
  'late-night-snack': original('Jacob', 'jacob', 'I’m team snacks. Pass them over.'),
  'cullen-origins': quote('Jasper', 'charlie', 'I thought what I had with Maria was love.', 'eclipse'),
  'jacobs-confession': quote('Jacob', 'jacob', 'You feel something for me.', 'eclipse'),
  'the-kiss': quote('Bella', 'bella', 'I’m asking you to kiss me.', 'kiss'),
  'the-tent': quote('Jacob', 'jacob', 'I am hotter than you.', 'eclipse'),
  'newborn-battle': original('Jasper', 'charlie', 'Stay focused. I know how they fight.'),
  eclipse: quote('Bella', 'bella', 'I love you more.', 'eclipse'),
  'the-wedding': quote('Edward', 'edward', 'But let’s start with forever.', 'dawn1'),
  'isle-esme': quote('Edward', 'edward', 'Last night was the best night of my existence.', 'dawn1'),
  'renesmee-born': original('Edward', 'edward', 'Stay with me, Bella. I need you.'),
  imprinting: original('Jacob', 'jacob', 'I’ll keep her safe. Whatever it takes.'),
  'breaking-dawn-1': quote('Charlie', 'charlie', 'I know, I look hot.', 'dawn1'),
  dinner: original('Charlie', 'charlie', 'Everybody eats. That’s my only rule tonight.'),
  'rapid-growth': quote('Bella', 'bella', 'She was born, not bitten.', 'dawn2'),
  'the-witnesses': original('Carlisle', 'charlie', 'I asked for witnesses. You answered.'),
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
