# Twilight voice notes

36 short character clips: 33 badges and three greetings. Content version 8 introduced a distinct designed voice for each of the nine speaking characters; version 10 corrects the backstory checkpoint to Edward.

## Casting and synthesis

Character identities are created with `eleven_ttv_v3` Voice Design. The complete acoustic and acting profile in `scripts/twilight/voice-cast.json` is submitted as `voice_description`; the resulting saved voice ID is used for every line by that character. These are original generated performances, not film recordings or actor voice clones.

Dialogue is generated with `eleven_v3`, Natural stability (`0.5`), similarity `0.75`, and speed `1.0`. Each request includes its line-specific emotion and delivery tags in `text`. We do not apply the old Turbo style/speaker-boost settings or speed up playback. Output is 44.1 kHz / 192 kbps MP3. Only gentle edge-silence trimming and loudness normalization are applied; in-line pauses and breaths remain.

`narration` holds the spoken words. `performance.tags` become bracketed synthesis cues. `performance.intent` is an editorial explanation of those cues, not a hidden API instruction. `synthesisText` records exactly what is sent for speech. Full character traits reach the model through Voice Design, rather than being appended as words for the speaker to read.

## Cast

### Edward

A young adult male dramatic actor with a light, low-mid baritone, neutral American accent and precise, slightly old-fashioned diction. Intimate, close-miked speech with a soft velvety resonance, a faint grain at the ends of phrases, and quiet breath between thoughts. He carries years of loneliness under youthful composure: protective, self-critical, intensely romantic, sometimes wry. Emotion lives in small shifts of pitch and a voice that briefly catches when composure slips. Natural conversational tempo; crisp consonants without an announcer's polish. Tenderness should warm the tone; danger should tighten it rather than become a theatrical growl. Clean dry studio recording, no music or effects.

Saved voice: `HuHkqhWqn7u2VPDSdzNt`. Design model: `eleven_ttv_v3`. Full request and preview candidates: `voice-design/edward.json`.

### Bella

A young adult woman dramatic actor with a low-mid feminine register, American Pacific Northwest speech and a lightly husky, airy texture. Candid, inward, intelligent and slightly awkward; she seems to discover the words as she says them. Small catches of breath, subtle vocal fry at relaxed phrase endings and an occasional broken onset convey vulnerability, without exaggerated stammering. Her dry humor is almost accidental. Under pressure her voice becomes urgent and unexpectedly firm; in romance it is close, honest and grounded. Natural compact conversational pacing, varied intonation, no sing-song narration or polished commercial brightness. Clean intimate studio speech, no background sounds.

Saved voice: `PW0cTaYMsoKkc8HrnuXb`. Design model: `eleven_ttv_v3`. Full request and preview candidates: `voice-design/bella.json`.

### Jacob

A young adult male actor with a warm mid-low register, an open chest resonance, a slight gravelly edge and an everyday American West Coast accent. Friendly and spontaneous, with a smile audible in his teasing. Athletic energy, easy confidence and fast emotional access: humor can turn into hurt or fiercely protective sincerity in one breath. Speech has buoyant pitch changes and natural contractions, without a radio-host rhythm. Let playful lines land with a small knowing lift; let vulnerable lines lose the swagger. Masculine and grounded, never a monster growl or a stereotyped accent. Conversational pace with room for a meaningful beat. Dry close-miked dramatic dialogue, no effects.

Saved voice: `Moka3likhr2g5k6ENKkJ`. Design model: `eleven_ttv_v3`. Full request and preview candidates: `voice-design/jacob.json`.

### Charlie

A middle-aged American man with a lean, weathered, slightly nasal low-mid baritone and a soft gravelly rasp. An ordinary small-town Pacific Northwest dad: tired after work, laconic, emotionally guarded, quietly protective. His delivery is dry and understated, with clipped starts, little sighs through the nose, an almost swallowed chuckle and a reluctant warmth. Mild roughness suggests late nights and beer, without drunken slurring. Jokes are tossed away with perfect deadpan timing; concern emerges as an awkward softening of the voice. Natural speech, not a booming sheriff, seductive bass, audiobook narrator or comic caricature. Clean close-miked roomless recording.

Saved voice: `Yn1ZnOMTMRamOK9TGYbL`. Design model: `eleven_ttv_v3`. Full request and preview candidates: `voice-design/charlie.json`.

### Alice

A young adult female actor with a clear bright mid-high voice, a delicate bell-like resonance and a light American accent. Quick-witted, affectionate and mischievously certain of herself. Her energy comes from playful changes of pitch, smiling consonants and little confidential drops in volume, not squeakiness or cartoon excitement. She can shift from delighted conspirator to suddenly serious warning while retaining poise. A nimble conversational rhythm, short purposeful pauses and graceful articulation; she sounds like she knows a secret and cannot quite resist sharing it. Expressive natural character dialogue, no sales-pitch enthusiasm, no music or effects.

Saved voice: `OkT905VXfWpp0HlkToBB`. Design model: `eleven_ttv_v3`. Full request and preview candidates: `voice-design/alice.json`.

### Rosalie

A young adult woman with a rich, polished low-mid feminine voice, cool American diction and a very slight smoky edge. Proud, observant and guarded, with a cutting dry wit. She speaks economically, letting the end of a sentence fall with exacting certainty. Sarcasm has a sharp eyebrow in the sound, never a cartoon villain's sneer. Affection briefly softens the hard surface; a painful memory exposes a quieter vulnerability underneath. Controlled conversational pace, beautifully clear consonants, restrained but responsive emotion. A believable dramatic actor speaking to someone nearby, not a grand theatrical monologue or an advertisement. Clean studio audio.

Saved voice: `BOk6C5wvWCtF9AYTKrgE`. Design model: `eleven_ttv_v3`. Full request and preview candidates: `voice-design/rosalie.json`.

### Jasper

A young adult man with a lean medium-low voice, lightly rough resonance and a subtle, believable Texas-influenced American accent. Measured, watchful and tightly controlled, with softened Southern vowels rather than an exaggerated drawl. He speaks like someone who is constantly managing what he feels: tension held in the breath, thoughtful pauses and occasional flashes of raw regret. Tactical instructions are concise and calm; personal memories carry an intimate wounded honesty. Natural speaking tempo, no cowboy caricature, no booming military bark, no polished narrator cadence. Clean close-miked cinematic dialogue with expressive micro-inflections and no background sound.

Saved voice: `yu0nL1iuwEpx3eLmrrph`. Design model: `eleven_ttv_v3`. Full request and preview candidates: `voice-design/jasper.json`.

### Carlisle

An adult male dramatic actor with a clear, gentle mid-low baritone, neutral educated American diction and smooth, warm resonance. Patient physician and protective father: calm authority without distance or condescension. Precise consonants, supple pitch and attentive warmth; he listens even while speaking. Gratitude feels personal, a warning is quietly firm, and urgency remains controlled rather than loud. A natural conversational pace with small considered pauses, not sleepy, sermon-like or an audiobook narrator. There is kindness and moral resolve under every line. Intimate dry studio recording, no music or ambient effects.

Saved voice: `Lbc7ZaIWjsWvCqKKmNc5`. Design model: `eleven_ttv_v3`. Full request and preview candidates: `voice-design/carlisle.json`.

### Jessica

A young adult woman with a bright mid-register American voice, a lightly nasal conversational edge and quick, lively pitch changes. Socially alert, curious and a little competitive; the friend leaning across a cafeteria table to share the interesting detail. Casual contemporary diction, slightly breathy starts, quick emphasis on a name, and a conspiratorial lowering of volume. Her wit is youthful and self-aware, with a touch of incredulity rather than mean caricature. Natural spontaneous dialogue; no announcer polish, cartoon valley-girl exaggeration or overly sugary cheer. Clean close-miked speech, no music or background noise.

Saved voice: `uwt0GvruNJ1NtHeSiR0M`. Design model: `eleven_ttv_v3`. Full request and preview candidates: `voice-design/jessica.json`.

## Review and regeneration

The first Edward, Bella, and Charlie takes were shared in the conversation for listening feedback. Automated checks verify decoding, duration, exact spoken words, audio hashes, voice identity, model and submitted direction. They do not establish that the acting sounds convincing; no human approval is inferred from a transcript. See `audio-validation.json` for measured results and approval status.

`voice-sampler.mp3` contains nine character samples. `voice-review-all.mp3` contains the entire set; matching timeline files identify every clip. `voice-review-transcript.json` ties each word check to the exact audio hash. Previous content-version-7 audio and review artifacts are retained under `audio-history/`.

To regenerate: edit the cast descriptions or line directions, run `design-voices.py` when changing a voice, run `node scripts/twilight/build-content.mjs`, then `generate-audio.py` to stage candidates. `review-audio.py --package` validates and assembles the review. `generate-audio.py --publish` installs only a complete, current, transcript-checked set. Increment the passport version for each published audio change. All API keys remain in process memory.

## Scripts and delivery

Film excerpts retain their original source links. Original party lines are labeled separately. All spoken lines remain ten words or fewer.

### Brunch — Charlie

> I made coffee. You’re gonna need it.

Delivery: A tired dad slides over a mug; the warning is affectionate, with a tiny amused lift on need it.

Submitted text: `[dryly] [warmly] I made coffee. You’re gonna need it.`

Original party dialogue.

### The Cullens Arrive — Jessica Stanley

> That’s Edward Cullen.

Delivery: Cafeteria gossip to a new friend; a quick confidential identification, interest on the name.

Submitted text: `[curious] [conspiratorial] That’s Edward Cullen.`

[Film excerpt](https://en.wikiquote.org/wiki/Twilight_(2008_film)).

### Emergency Contact — Edward

> You can Google it.

Delivery: A clipped, evasive little joke intended to stop a dangerous line of questioning.

Submitted text: `[dryly] [dismissive] You can Google it.`

[Film excerpt](https://en.wikiquote.org/wiki/Twilight_(2008_film)).

### A Very Sparkly Secret — Edward

> This is the skin of a killer, Bella.

Delivery: A vulnerable confession disguised as a warning; self-disgust catches on killer, then tenderness on Bella.

Submitted text: `[quietly] [pained] This is the skin of a killer, Bella.`

Host-provided scene sheet.

### Vampire Baseball — Rosalie

> My monkey man.

Delivery: A private, fondly teasing reaction to an outrageous stunt; smile without a big laugh.

Submitted text: `[amused] [affectionate] My monkey man.`

[Film excerpt](https://www.scribd.com/doc/28819330/Twilight-Script).

### Twilight — Bella

> I want you. Always.

Delivery: Direct desire and a settled promise; allow the second sentence to land gently.

Submitted text: `[softly] [sincere] I want you. Always.`

[Film excerpt](https://en.wikiquote.org/wiki/Twilight_(2008_film)).

### Lunch — Rosalie

> Is she even Italian?

Delivery: A sharp skeptical aside about the family cooking plan, with the emphasis on Italian.

Submitted text: `[sarcastic] [incredulous] Is she even Italian?`

[Film excerpt](https://en.wikiquote.org/wiki/Twilight_(2008_film)).

### One Drop — Bella

> Ow! Papercut.

Delivery: An involuntary little yelp, then an embarrassed everyday explanation; keep it human and quick.

Submitted text: `[startled] Ow! Papercut.`

[Film excerpt](https://thetwilightsagaguide.angelfire.com/scripts/NewMoonMovieDialogue.html).

### The Empty Forest — Edward

> You just don’t belong in my world, Bella.

Delivery: He forces himself to sound certain while breaking his own heart; controlled, no sobbing.

Submitted text: `[restrained] [sorrowful] You just don’t belong in my world, Bella.`

[Film excerpt](https://thetwilightsagaguide.angelfire.com/scripts/NewMoonMovieDialogue.html).

### A Little More Sun — Jacob

> Scrap metal. You shouldn’t have.

Delivery: An affectionate mock thank-you for an obviously terrible present; the smile is audible.

Submitted text: `[playful] [amused] Scrap metal. You shouldn’t have.`

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_New_Moon).

### Race to the Sun — Bella

> Edward, stop! I’m right here!

Delivery: She needs him to hear her in a crowd; fear tips into relief on right here, no theatrical screaming.

Submitted text: `[urgent] [calling out] Edward, stop! I’m right here!`

Original party dialogue.

### New Moon — Edward

> Marry me, Bella.

Delivery: A simple, intimate proposal with real stakes; no grand narrator cadence.

Submitted text: `[tender] [earnest] Marry me, Bella.`

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_New_Moon).

### Snack Break — Jacob

> I’m team snacks. Pass them over.

Delivery: A warm, spontaneous joke to friends; toss off the second sentence like a casual request.

Submitted text: `[playful] [confident] I’m team snacks. Pass them over.`

Original party dialogue.

### Edward’s Backstory — Edward

> I had a different life before all this.

Delivery: A brief personal admission to Bella; a trace of longing for his human life, intimate and conversational.

Submitted text: `[reflective] [wistful] I had a different life before all this.`

Original character dialogue, following the host’s Edward backstory checkpoint.

### Team Jacob Makes a Case — Jacob

> You feel something for me.

Delivery: Confidence masking the need to be chosen; lean gently on something, not a demand.

Submitted text: `[earnest] [vulnerable] You feel something for me.`

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Eclipse).

### A Heart Divided — Bella

> I’m asking you to kiss me.

Delivery: A difficult request she has finally decided to make; intimate and clear rather than sleepy.

Submitted text: `[breathless] [resolute] I’m asking you to kiss me.`

[Film excerpt](https://visual-icon.com/title/detail/?id=18602).

### Fire, Ice & One Tent — Jacob

> I am hotter than you.

Delivery: A perfectly timed friendly-rival jab; relish hotter, then let the line fall away.

Submitted text: `[smug] [teasing] I am hotter than you.`

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Eclipse).

### An Unlikely Alliance — Jasper

> Stay focused. I know how they fight.

Delivery: Quiet tactical command to allies, urgent and economical with no shouted drill-sergeant delivery.

Submitted text: `[focused] [firm] Stay focused. I know how they fight.`

Original party dialogue.

### Eclipse — Bella

> I love you more.

Delivery: A soft reply with smiling confidence; the final word settles the argument.

Submitted text: `[warmly] [certain] I love you more.`

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Eclipse).

### Until Forever — Edward

> But let’s start with forever.

Delivery: A vow offered at close range; reverent affection, almost disbelieving happiness.

Submitted text: `[tender] [smiling] But let’s start with forever.`

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Breaking_Dawn_%E2%80%93_Part_1).

### Isle Esme — Edward

> Last night was the best night of my existence.

Delivery: Private wonder after a life-changing night, warm and a little surprised by his own honesty.

Submitted text: `[intimate] [awed] Last night was the best night of my existence.`

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Breaking_Dawn_%E2%80%93_Part_1).

### A New Heartbeat — Edward

> Stay with me, Bella. I need you.

Delivery: Control is failing; he needs her to stay alive. The second sentence cracks open into raw need.

Submitted text: `[panicked] [pleading] Stay with me, Bella. I need you.`

Original party dialogue.

### Gravity Changes — Jacob

> I’ll keep her safe. Whatever it takes.

Delivery: A steady promise to protect a child; unwavering responsibility and warmth.

Submitted text: `[protective] [resolute] I’ll keep her safe. Whatever it takes.`

Original party dialogue.

### Breaking Dawn – Part 1 — Charlie

> I know, I look hot.

Delivery: An awkward dad undercuts wedding emotion with a dry joke, tossed away rather than performed for applause.

Submitted text: `[deadpan] [wry] I know, I look hot.`

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Breaking_Dawn_%E2%80%93_Part_1).

### Dinner — Charlie

> Everybody eats. That’s my only rule tonight.

Delivery: Practical hospitality from the dad at the table; a mock rule with a soft edge.

Submitted text: `[matter-of-fact] [warmly] Everybody eats. That’s my only rule tonight.`

Original party dialogue.

### Growing Beyond the Rules — Bella

> She was born, not bitten.

Delivery: A mother corrects a dangerous misunderstanding; clear contrast between born and bitten.

Submitted text: `[firm] [protective] She was born, not bitten.`

[Film excerpt](https://twilightsaga.fandom.com/wiki/Breaking_Dawn_-_Part_2_movie_quotes).

### Witnesses to the Impossible — Carlisle

> I asked for witnesses. You answered.

Delivery: Quiet appreciation to people who took a real risk; the second sentence acknowledges their courage.

Submitted text: `[grateful] [earnest] I asked for witnesses. You answered.`

Original party dialogue.

### The Snowfield Reckoning — Alice

> Now you know. That’s your future.

Delivery: An unmistakable warning delivered with eerie certainty; let future land without a theatrical growl.

Submitted text: `[grave] [confident] Now you know. That’s your future.`

[Film excerpt](https://clip.cafe/the-twilight-saga-breaking-dawn-part-2-2012/now-know-s7/).

### Breaking Dawn – Part 2 — Bella

> Forever.

Delivery: A single sincere answer to a lifelong promise; one natural word, not drawn into a whisper effect.

Submitted text: `[softly] [lovingly] Forever.`

[Film excerpt](https://twilightsaga.fandom.com/wiki/Breaking_Dawn_-_Part_2_movie_quotes).

### Forever — Edward

> You stayed through everything. Stay a little longer.

Delivery: Intimate gratitude to someone who stayed, followed by a gentle invitation with a hint of humor.

Submitted text: `[warmly] [inviting] You stayed through everything. Stay a little longer.`

Original party dialogue.

### Human Food Connoisseur — Charlie

> You ate everything? That’s my kind of team.

Delivery: Surprised admiration, then a dad joke delivered with a tiny smile.

Submitted text: `[amused] [approving] You ate everything? That’s my kind of team.`

Original party dialogue.

### Twihard — Alice

> I saw you finishing every scene. Obviously.

Delivery: A proud little victory lap, with obviously tossed off as a knowing punchline.

Submitted text: `[delighted] [mischievous] I saw you finishing every scene. Obviously.`

Original party dialogue.

### Immortal — Bella

> I was born to be a vampire.

Delivery: She finally recognizes herself; delighted conviction, with a little wonder at the realization.

Submitted text: `[confident] [awed] I was born to be a vampire.`

[Film excerpt](https://twilightsaga.fandom.com/wiki/Breaking_Dawn_-_Part_2_movie_quotes).

### greeting-1 — Bella

> Forks is growing on me.

Delivery: A quietly surprised admission that this rainy place is becoming home.

Submitted text: `[wry] [warmly] Forks is growing on me.`

[Film excerpt](https://en.wikiquote.org/wiki/Twilight_(2008_film)).

### greeting-2 — Charlie

> I’ve got coffee. Make yourself at home.

Delivery: A slightly awkward dad genuinely glad to have company; easy and unshowy.

Submitted text: `[casual] [welcoming] I’ve got coffee. Make yourself at home.`

Original party dialogue.

### greeting-3 — Alice

> I’ve seen your future. You’re staying for all five.

Delivery: A cheerful prediction shared like a secret; mock certainty without a sales pitch.

Submitted text: `[playful] [knowing] I’ve seen your future. You’re staying for all five.`

Original party dialogue.
