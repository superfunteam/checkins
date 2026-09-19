import fs from 'node:fs';
import { voiceLines, voices, voiceSettings, voiceModel } from './voice-lines.mjs';

// Host-provided timestamps are cues, not independently verified timecodes.
// Keep shipped badge IDs stable so existing guests retain their claims.
const file = 'public/passports/twilight/passport.json';
const passport = JSON.parse(fs.readFileSync(file, 'utf8'));
const films = [
  { id: 'twilight', name: 'Twilight', start: '11:35', end: '13:32', edition: 'Extended Edition' },
  { id: 'new-moon', name: 'New Moon', start: '13:40', end: '15:45', edition: 'Extended Edition' },
  { id: 'eclipse', name: 'Eclipse', start: '15:55', end: '17:58', edition: 'Extended Edition' },
  { id: 'breaking-dawn-1', name: 'Breaking Dawn – Part 1', start: '18:05', end: '19:57', edition: 'Extended Edition' },
  { id: 'breaking-dawn-2', name: 'Breaking Dawn – Part 2', start: '20:05', end: '21:58', edition: 'Theatrical Edition' },
];
const minutes = t => t.split(':').reduce((h, m) => +h * 60 + +m);
const clock = m => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')}${m >= 720 ? 'pm' : 'am'} ish`;
const offsetMinutes = t => { const [h,m,s] = t.split(':').map(Number); return h * 60 + m + s / 60; };
const badges = [];
const production = [];
const style = 'Use case: stylized-concept. ONE square collectible achievement illustration for a Twilight viewing party. Lush hand-painted gothic romance novel cover meets premium fantasy role-playing video game inventory art. Visible oil brushwork, luminous cinematic atmosphere, exquisite materials, emotionally expressive fictional characters. Moody blue-green Pacific Northwest colors, silver highlights, rich burgundy accents; adapt the lighting to this scene. Bold central composition readable at 120 pixels. Full-bleed square painting; important subjects within central 75 percent for circle and arch UI crops. No words, lettering, logos, watermark, UI, border, panels or collage. Fully clothed characters, no nudity, no graphic gore. Do not imitate a photographic movie still. Scene: ';
function add(id, type, name, time, shortDesc, longDesc, imageScene, extra = {}) {
  badges.push({ id, type, name, time, shortDesc, longDesc, instruction: type === 'movie' ? 'Finish the film to claim.' : type === 'meal' ? 'Enjoy the meal to claim.' : type === 'scene' ? 'Watch this scene to claim.' : undefined, image: `assets/images/badges/badge-${id}.webp`, sound: `assets/audio/badges/badge-${id}.mp3`, ...extra });
  if (!voiceLines[id]) throw new Error(`Missing dialogue for ${id}`);
  production.push({ id, name, ...voiceLines[id], imagePrompt: style + imageScene });
}
function scene(filmId, id, name, offset, shortDesc, longDesc, art) {
  const film = films.find(f => f.id === filmId);
  add(id, 'scene', name, clock(Math.floor(minutes(film.start) + offsetMinutes(offset))), shortDesc, `${film.name} · ~${offset}\n\n${longDesc}`, art, { movieId: filmId, movieOffset: offset });
}

add('breakfast', 'meal', 'Brunch', '11:00am ish', 'Fuel for forever', 'Brunch before brooding. Fill your plate, pour the coffee, and prepare for five films of questionable decisions. Charlie would approve.', 'A sumptuous rustic brunch still life in Charlie Swan’s cozy kitchen: eggs, pancakes, berries, steaming coffee, a red apple, rain on the window and evergreen forest beyond. Warm amber inside, moody teal outside. No people.');

scene('twilight', 'first-sight', 'The Cullens Arrive', '0:08:45', 'Enter the Cullens', 'Bella spots Edward across the cafeteria. Beautiful, mysterious, and apparently above eating lunch. Forks just got interesting.', 'FIRST SIGHT OF THE CULLENS. Fully clothed brunette Bella in a blue jacket notices pale bronze-haired Edward across a rainy school cafeteria. Four elegant Cullen siblings softly behind him. An untouched red apple. Intense eye contact.');
scene('twilight', 'the-van', 'Emergency Contact', '0:27:00', 'One inconvenient handprint', 'Edward stops Tyler’s van with one hand. Bella notices. His cover story now has a very inconvenient dent.', 'Edward in a dark coat braces his palm against the deeply dented blue side of a sliding van, shielding fully clothed Bella crouched beside a red pickup in a rain-glazed school parking lot. Dramatic frozen impact, no injuries, silver rain.');
scene('twilight', 'skin-of-a-killer', 'A Very Sparkly Secret', '1:04:00', 'Sunlight spills secrets', 'Sunlight reveals Edward’s sparkle; the Cullen house reveals his family. Immortality comes with secrets, excellent windows, and ambitious dinner plans.', 'A luminous faceted diamond-like crystal held in an antique silver setting rests among white wildflowers in a sunlit forest meadow. Shafts of sunlight scatter a thousand tiny rainbow sparkles across blue-green cedar boughs. A delicate red ribbon suggests a shared secret. Symbolic supernatural revelation, tranquil romantic landscape, no people.');
scene('twilight', 'vampire-baseball', 'Vampire Baseball', '1:12:00', 'Thunder. Bats. Trouble.', 'Thunder hides the hits. Alice pitches; the Cullens play. Then James, Laurent, and Victoria arrive. So much for a friendly game.', 'Alice Cullen with a dark pixie cut pitches in a damp forest clearing, normal baseball held behind her shoulder, grounded athletic anatomy and quiet storm lighting. Natural cinematic realism with restrained painterly detail. No giant foreground ball or extreme foreshortening.');
add('twilight', 'movie', 'Twilight', '1:32pm ish', 'First film complete', 'James’s hunt is over. Bella and Edward make it to prom. One film down; the yearning is just getting started.', 'FINAL TWILIGHT MOVIE ACHIEVEMENT. Bella in a modest deep-blue prom dress and Edward in a dark suit dance beneath a glowing gazebo at night, blue woodland behind them, a luminous red apple subtly nestled in foreground ivy. Lush sweeping romantic finale art.', { startTime: '11:35am ish', edition: 'Extended Edition' });
add('lunch', 'meal', 'Lunch', '1:35pm ish', 'Refuel before heartbreak', 'Refuel before New Moon. Heartbreak and questionable motorcycle decisions are easier to handle after a proper lunch.', 'Rich warm lunch still life: toasted sandwiches, steaming soup, fries, a red apple and a glass of water on a rainy Pacific Northwest diner table. Red vinyl booth, misty pines through window. Cozy delicious painted fantasy-game feast.');

scene('new-moon', 'paper-cut', 'One Drop', '0:11:00', 'Birthday, interrupted', 'One birthday gift. One paper cut. Jasper loses control, and Bella discovers how fragile a human is among vampires.', 'Elegant Cullen birthday table: an open gift with torn silver wrapping, white flowers, candlelit cake; tense pale blond Jasper in dark clothing recoils in background while Bella draws back her hand. A single tiny ruby spot on paper, no wounds or gore. Suspenseful burgundy and teal.');
scene('new-moon', 'the-goodbye', 'The Empty Forest', '0:20:00', 'Love leaves Forks', 'Edward leaves to keep Bella safe. Her world falls quiet; the months pass. Forks keeps raining, because of course it does.', 'Brunette Bella alone at the center of an immense mossy cedar forest as distant Edward in a dark coat disappears into silver fog. Fallen orange leaves, monumental trees, a quiet aching composition. Fully clothed, no distressing injury.');
scene('new-moon', 'garage-days', 'A Little More Sun', '0:48:00', 'Motorcycles and second chances', 'Two broken motorcycles, one patient friend. Jacob brings warmth back into Bella’s life. The engines—and the heart—need a little work.', 'Fully clothed Bella and Jacob with short black hair and warm brown skin laughing while repairing two old motorcycles in a rustic garage. Tools, warm work lamp, rainy window, glowing friendship and amber light, respectful contemporary clothing with no stereotyped motifs.');
scene('new-moon', 'volterra', 'Race to the Sun', '1:39:00', 'Beat the sunlight', 'Bella races through Volterra to stop Edward stepping into sunlight. Reunion secured; vampire government paperwork still pending.', 'Bella in a modest green shirt races through a sunlit Italian square of red-cloaked festivalgoers toward Edward standing fully clothed in the shadow of a stone doorway. Grand clock tower and fountain. Urgent motion, blood-red cloaks, golden noon and cool shadow.');
add('new-moon', 'movie', 'New Moon', '3:45pm ish', 'Second film complete', 'Heartbreak, motorcycles, emergency Italy. Bella and Edward reunite, but the Volturi have conditions. Two films down; nobody can make a simple call.', 'FINAL NEW MOON MOVIE ACHIEVEMENT. A copper full moon over La Push sea cliffs, a powerful russet wolf on the cliff, Bella and Edward reunited fully clothed in the lower center, distant Italian clock tower suggested in mist. Epic wistful painted cover with gold and dark teal.', { startTime: '1:40pm ish', edition: 'Extended Edition' });
add('late-night-snack', 'meal', 'Snack Break', '3:50pm ish', 'Team Sweet or Salty', 'Team Sweet. Team Salty. Finally, a rivalry solved by having both. Grab a bite before Eclipse turns up the heat.', 'A lavish snack-break still life of overflowing popcorn, chocolate squares, fresh strawberries, pretzels and steaming mugs on a rustic cedar table; a rainlit window, low copper moon, red napkin. Inviting lush painterly game feast, no people.');

scene('eclipse', 'cullen-origins', 'Edward’s Backstory', '0:47:00', 'Before Bella, before forever', 'Before Bella, before Forks, Edward had another life. Meet the human behind the vampire—and the past he still carries.', 'A century of Cullen family history: an antique silver pocket watch, aged family portrait of elegant pale Edward and Carlisle in early twentieth-century civilian suits, a weathered journal, dried white rose, modern glass Cullen home glimpsed through forest mist. Deep reflective gilded oil painting, no readable writing.');
scene('eclipse', 'jacobs-confession', 'Team Jacob Makes a Case', '1:10:00', 'Jacob makes his case', 'Jacob wants Bella to choose him—and a human future. His feelings are clear. The choice is still hers.', 'Fully clothed Jacob in a dark casual shirt speaks earnestly to fully clothed Bella on a coastal forest path, respectful distance between them, wind through pines, warm amber edge light on Jacob versus cool blue on Bella. Emotional conversation, no grabbing or kissing.');
// Host corrected the sequence: tent before the requested kiss. Approximate cues
// use licensed clips sum-eclipse-020 (01:24:44) and -022 (01:31:27).
scene('eclipse', 'the-kiss', 'A Heart Divided', '1:31:27', 'A heart divided', 'Bella asks Jacob to kiss her. For a moment, another future feels possible. This time, she makes the invitation.', 'Tender nonsexual closed-mouth kiss between fully clothed Bella in a heavy blue jacket and Jacob in a dark shirt, shoulders and faces framed by misty snowy mountain pines. YA romantic painting with soft golden dawn rim light, modest and gentle.');
scene('eclipse', 'the-tent', 'Fire, Ice & One Tent', '1:24:44', 'Fire meets ice', 'Bella is freezing. Edward runs cold. Jacob supplies the warmth—and never lets Edward forget it. The world’s least relaxing camping trip.', 'Small warmly lit canvas tent in a dramatic snowy mountain night, flap open to reveal fully clothed Bella bundled in blankets with Jacob nearby for warmth and pale Edward seated watchfully apart. Three quiet figures, intimate shelter against vast icy blue storm, no nudity.');
scene('eclipse', 'newborn-battle', 'An Unlikely Alliance', '1:40:00', 'An unlikely alliance', 'Cullens and wolves unite against Victoria’s newborn army. Jasper’s lessons become survival skills. For once, everybody is on the same team.', 'Powerful russet and gray wolves leap alongside agile fully clothed Cullen vampires through a misty green forest clearing against distant shadowy attackers. Pale blond Jasper leads with a commanding outstretched arm, dynamic epic fantasy battle painting, no blood, no severed limbs.');
add('eclipse', 'movie', 'Eclipse', '5:58pm ish', 'Third film complete', 'Newborn army defeated. Tent diplomacy survived. Bella chooses her future. Three films down; Alice can finally start planning that wedding.', 'FINAL ECLIPSE MOVIE ACHIEVEMENT. A magnificent eclipsed sun crowns two intersecting silver and red ribbons, a white rose and a wolf silhouetted below, fully clothed Bella with Edward and Jacob at either side in a misty mountain panorama. Elegant epic painted romance composition.', { startTime: '3:55pm ish', edition: 'Extended Edition' });

scene('breaking-dawn-1', 'the-wedding', 'Until Forever', '0:25:00', 'Forever starts here', 'White flowers, trembling hands, forever spoken aloud. Bella and Edward marry beneath Alice’s extravagant canopy. Crying counts as participation.', 'Adult newlyweds Bella in an elegant modest long-sleeved white bridal gown and Edward in a black wedding suit exchange rings under cascading white wisteria in a woodland wedding aisle. Warm sunlight and silver forest, tender joyful painterly romance, no lettering.');
scene('breaking-dawn-1', 'isle-esme', 'Isle Esme', '0:55:00', 'RIP, honeymoon pillows', 'Moonlight. Ocean air. Ruined pillows. Bella and Edward reach Isle Esme; the furniture discovers it wasn’t built for vampire newlyweds.', 'Tasteful symbolic honeymoon aftermath, NO PEOPLE: luxurious tropical island bedroom open to moonlit sea, white curtains billowing, scattered white pillow feathers, a cracked carved wooden headboard, two wedding rings on bedside table. Romantic candlelight and silver tropical night, no sexual imagery.');
scene('breaking-dawn-1', 'renesmee-born', 'A New Heartbeat', '1:42:00', 'One new heartbeat', 'Renesmee is born. Edward fights to save Bella, giving her one last chance at forever. Everything changes with a heartbeat.', 'Symbolic tender birth scene with NO medical procedure or gore: a tiny peacefully sleeping infant Renesmee wrapped securely in an ivory blanket in a wooden cradle, pale Edward’s protective hand on its rim, a single warm sunrise shaft in Cullen glass-house room. Hope amid deep blue shadows.');
scene('breaking-dawn-1', 'imprinting', 'Gravity Changes', '1:45:00', 'Gravity changes', 'Jacob’s world shifts toward protecting Renesmee. The pack’s oldest rules turn an enemy into someone he must keep safe.', 'Protective guardianship symbolism, absolutely no romance: a huge gentle russet wolf stands watch a respectful distance from an ivory baby cradle in a moonlit forest glade, warm protective halo around cradle, silver-blue pines and a small star. Tender safe mythic storybook game painting.');
add('breaking-dawn-1', 'movie', 'Breaking Dawn – Part 1', '7:57pm ish', 'Fourth film complete', 'Vows exchanged. Pillows destroyed. Renesmee born. Bella opens her eyes to a new life. Four films down; forever just got complicated.', 'FINAL BREAKING DAWN PART ONE ACHIEVEMENT. Two intertwined silver wedding rings rest atop white wedding petals, a crimson dawn reflected in a large luminous feminine eye suggested subtly in clouds, white feathers drift over a tropical ocean merging into blue forest. Symbolic elegant oil-painted finale.', { startTime: '6:05pm ish', edition: 'Extended Edition' });
add('dinner', 'meal', 'Dinner', '8:00pm ish', 'Feed your coven', 'Four films behind you. One snowfield ahead. Gather your coven and eat like a human. Forever can wait five minutes.', 'Lavish candlelit dinner in the Cullen glass house, roasted vegetables, pasta, crusty bread and sparkling water on a long elegant table, red cloth napkins, white flowers, twilight forest through enormous windows. Warm welcoming epic painted feast, no people.');

scene('breaking-dawn-2', 'rapid-growth', 'Growing Beyond the Rules', '0:30:00', 'Growing beyond the rules', 'Renesmee grows impossibly fast and shares memories through touch. Born, not bitten: the vampire world is about to meet an exception.', 'Little Renesmee fully dressed in a cream cardigan rests her small hand on adult Bella’s cheek in the Cullen home, faint luminous memory motes like fireflies, a height-marked wooden door with no legible numbers behind them. Tender mother-child wonder, golden morning, non-romantic.');
scene('breaking-dawn-2', 'the-witnesses', 'Witnesses to the Impossible', '1:00:00', 'Witness the impossible', 'Carlisle gathers witnesses from around the world to prove Renesmee’s nature. Extraordinary gifts, one shared purpose, absolutely no spare bedrooms.', 'An international gathering of distinct adult vampire witnesses of varied ethnicities in elegant contemporary traveling clothes stand in a semicircle outside the glowing Cullen glass house at snowy dusk. Carlisle welcomes them; one subtle electrical glimmer and one elemental mist suggest supernatural gifts. Respectful, no ethnic caricatures, epic council painting.');
scene('breaking-dawn-2', 'the-battle', 'The Snowfield Reckoning', '1:36:00', 'The final reckoning', 'The Volturi face the Cullens across the snow. Alice reveals what a battle could cost. Hold your breath—and keep watching.', 'Two great opposing lines on a snowy forest battlefield: red-lined black-cloaked Volturi opposite fully clothed Cullen allies and enormous wolves. Adult Bella stands centrally projecting a subtle luminous protective shield, Edward beside her. Ethereal vision-like fractured light at edges. Epic action, no gore or decapitation.');
add('breaking-dawn-2', 'movie', 'Breaking Dawn – Part 2', '9:58pm ish', 'Final film complete', 'Bella shares her memories with Edward. The family has a future. Five films down; farewell credits end around 10:07.', 'FINAL BREAKING DAWN PART TWO ACHIEVEMENT. Adult Bella and Edward fully clothed embrace tenderly in a luminous wildflower meadow, their child Renesmee safely playing at a distance, brilliant dawn beyond dark evergreen mountains, subtle shield-like silver halo. Hopeful sumptuous romance novel final-page oil painting.', { startTime: '8:05pm ish', edition: 'Theatrical Edition' });

function secret(id, name, short, long, art, ids, hint, finale = false) {
  add(id, 'secret', name, undefined, short, long, art, { unlockCondition: { type: 'all', badgeIds: ids }, unlockHint: hint, ...(finale ? { finale: true } : {}) });
}
secret('secret-movies', 'Forever', 'All films complete', 'Five films, one forever. From the first glance in Forks to the final meadow, you stayed. The Cullens recognize commitment.', 'Ultimate ALL FIVE MOVIES achievement: five radiant silver stars form a crown over a single luminous red apple, entwined silver wedding rings and white meadow flowers, rising dawn across the Pacific Northwest mountains. Rich royal burgundy, silver and gold, exceptionally beautiful fantasy legendary-item painting.', films.map(f => f.id), 'Complete all 5 films');
secret('secret-meals', 'Human Food Connoisseur', 'Every meal conquered', 'Brunch, lunch, snack, dinner: every human meal conquered. Your mortal metabolism thanks you. Charlie’s proud; Edward still doesn’t understand popcorn.', 'ALL MEALS achievement: ornate silver platter crowned with a radiant red apple, golden bread, berries, chocolate and a steaming coffee cup, four candles, cozy Cullen dinner table in a blue forest. A sumptuous legendary feast still life, elegant not cartoon. ', ['breakfast', 'lunch', 'late-night-snack', 'dinner'], 'Enjoy all 4 meals');
secret('secret-scenes', 'Twihard', 'Every scene witnessed', 'Twenty moments, every checkpoint. From cafeteria glances to the snowfield, you caught it all. Welcome to the Forks unofficial historical society.', 'ALL SCENES legendary achievement: an open antique illustrated journal with blank luminous pages, a crystal prism reflecting a tiny thunderbolt, a silver crescent, white wedding flower and wolf silhouette, red ribbon bookmark, blue evergreen boughs and gold sparkles. One cohesive still life, no panels, no writing. ', badges.filter(b => b.type === 'scene').map(b => b.id), 'Witness all 20 scenes');
secret('secret-immortal', 'Immortal', 'The complete saga', 'Every film. Every scene. Every meal. You came to Forks and earned forever. Welcome to the family. Act surprised when you sparkle.', 'ULTIMATE IMMORTAL achievement: a magnificent silver crown of interwoven evergreen branches holds a ruby apple-shaped jewel, gold light rises through an open circle like an eternal eclipse, white wedding blossoms and glittering crystal droplets. Legendary fantasy video game reward, transcendent gothic romance oil painting.', ['secret-movies', 'secret-meals', 'secret-scenes'], 'Complete films, scenes, and meals', true);

badges.sort((a,b) => {
  if (a.type === 'secret' || b.type === 'secret') return (a.type === 'secret') - (b.type === 'secret');
  const parse = s => { const [,h,m,p] = s.match(/(\d+):(\d+)(am|pm)/); return (+h % 12) * 60 + +m + (p === 'pm' ? 720 : 0); };
  return parse(a.time) - parse(b.time);
}).forEach((b,i) => b.order = i + 1);
passport.version = Math.max(10, passport.version || 1);
delete passport._notes;
passport.settings = { ...passport.settings, badgeShape: 'arch' };
passport.theme.mode = 'dark';
passport.theme.colors = {
  "primary": {
    "50": "#172c31",
    "100": "#22383c",
    "200": "#345159",
    "300": "#56747b",
    "400": "#9fbab9",
    "500": "#bbceca",
    "600": "#d4dfd8",
    "700": "#dbe6df",
    "800": "#e6eee8",
    "900": "#f2f5ed"
  },
  "accent": {
    "50": "#2d1821",
    "100": "#41222d",
    "200": "#60303d",
    "300": "#854455",
    "400": "#bb6e81",
    "500": "#933f55",
    "600": "#e8a6b4",
    "700": "#f0bec8",
    "800": "#f7d4db",
    "900": "#fce8ec"
  },
  "background": {
    "50": "#17282e",
    "100": "#0f1c22",
    "200": "#22343b",
    "300": "#354950",
    "400": "#516970",
    "500": "#788f95"
  },
  "text": {
    "50": "#0f1c22",
    "100": "#17282e",
    "200": "#293e45",
    "300": "#7e969b",
    "400": "#a1b2b5",
    "500": "#b3c1c2",
    "600": "#c7d0d0",
    "700": "#e0e5e2",
    "800": "#f0eee8",
    "900": "#faf7f0"
  },
  "highlight": "#e3a6b5",
  "danger": {
    "500": "#c45161",
    "600": "#e87c89",
    "700": "#f3acb5"
  }
};
passport.pwa = { ...passport.pwa, themeColor: '#0f1c22', backgroundColor: '#0f1c22' };
passport.badges = badges;
passport.schedule = { dayStart: '10:30', dayEnd: '22:07' };
passport.features.badgeSounds = true;
passport.features.greetingSounds = true;
passport.features.teamPoll = true;
passport.content.splash.subtitle = 'A rain-soaked journey from first sight to forever';
passport.content.splash.heroImage = 'assets/images/badges/badge-twilight.webp';
passport.content.splash.heroEmoji = null;
passport.content.name.prompt = 'Your name for the Forks register?';
passport.content.explainer.body = [
  'Five films, twenty scenes, four meals. Rain, romance, questionable decisions. Twilight starts at 11:35.',
  'Tap badges as you watch and eat. Collection bonuses unlock automatically. Claim them all to become Immortal.'
];
passport.content.explainer.quote = 'Some forevers come with badges.';
passport.content.explainer.disclaimer = 'Times are approximate. Follow the scene on screen. The honor system applies.';
passport.content.badgeModal.honorSystemText = 'Claim what you watched or ate. The Cullens trust you. Even Edward.';
passport.content.passport.certifySubtext = 'Save your day in Forks';
passport.content.certification.body = ['From first sight to forever, you were there.', 'Save your passport. Forks remembers.'];
passport.content.certification.footnote = 'Back to Austin. Bring sunglasses.';
passport.content.certification.completionMessages = { perfect: 'Every badge. Forever yours.', high: 'The Cullens salute you.', medium: 'You belong in Forks.', low: 'Your forever has begun.' };
passport.content.checklist.description = 'Toggle badges to correct mistakes. Bonuses unlock automatically.';
passport.content.secretUnlock.certifyButton = 'Save My Passport';
passport.content.certificate.subtitle = 'From first sight to forever';
passport.content.certificate.completed = 'has journeyed through the Twilight Saga';
passport.content.certificate.footer = 'Forks remembers.';
passport.content.schedule.title = 'Today’s Saga · 11:35am Start';
passport.audio.greetings = [1,2,3].map(i => `assets/audio/greetings/greeting-${i}.mp3`);
fs.writeFileSync(file, JSON.stringify(passport, null, 2) + '\n');

// Preserve the revised art direction when rebuilding the content handoff.
production.find(b => b.id === 'vampire-baseball').imagePrompt = JSON.parse(fs.readFileSync('docs/twilight/final-art/baseball-revision.json', 'utf8')).prompt;

const greetings = [1, 2, 3].map(i => ({ id: `greeting-${i}`, ...voiceLines[`greeting-${i}`] }));
fs.writeFileSync('docs/twilight/production.json', JSON.stringify({ model: voiceModel, voiceSettings, imageMode: 'built-in image_gen', style, films, voices, badges: production, greetings }, null, 2) + '\n');
console.log(`Wrote ${badges.length} badges, ${production.length + greetings.length} voice scripts, and the complete image prompt set.`);
