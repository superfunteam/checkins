# Twilight voice notes

36 short character clips: 33 badges and three greetings. The previous third-person narration has been replaced throughout.

## Delivery

Five licensed stock ElevenLabs voices, using `eleven_turbo_v2_5`, speed 1.12, stability 0.45 and style 0. No actor voice cloning or film soundtrack recordings. Plain dialogue without performance tags; conservative leading/trailing silence removal and loudness normalization. The app plays at normal rate.

## Cast

- **Edward / Eric:** Smooth American voice; direct, intimate, conversational.
- **Bella / Laura:** Young American voice; candid, quick, understated.
- **Jacob / Liam:** Energetic American voice; warm, confident, conversational.
- **Charlie / Roger:** Grounded American voice; dry, casual delivery.
- **Alice / Jessica:** Bright American voice; quick, playful, clear.

Roger also reads Jasper and Carlisle; Jessica also reads Rosalie and Jessica Stanley. Character names identify the dialogue role, not the voice actor.

## Review

All 36 clips decode and match the current scripts/cast/settings. Duration: 0.63–2.53 seconds, 52.95 seconds total (previously 528.20). Scribe v2 transcribed the full set with every word matching after punctuation, case and word-spacing normalization. This checks intelligibility and missing words; it is not human listening approval.

`voice-sampler.mp3` plays Edward’s sparkly-skin line, Jacob’s tent line, Charlie’s wedding quip, Bella’s vampire line and Alice’s all-scenes quip. `voice-review-all.mp3` contains all 36 in production order; its complete transcript is `voice-review-transcript.json`.

## Scripts and attribution

Film excerpts have source links. Original character lines are newly written for the party and are not presented as movie quotations. Punctuation is normalized for speech. Lines chosen for final-movie badges are thematic excerpts from that film, not necessarily its final spoken line.

### Brunch — Charlie

I made coffee. You’re going to need it.

Original party dialogue.

### The Cullens Arrive — Jessica Stanley

That’s Edward Cullen.

[Film excerpt](https://en.wikiquote.org/wiki/Twilight_(2008_film)).

### Emergency Contact — Edward

You can Google it.

[Film excerpt](https://en.wikiquote.org/wiki/Twilight_(2008_film)).

### A Very Sparkly Secret — Edward

This is the skin of a killer, Bella.

Film excerpt supplied in the host’s scene sheet.

### Vampire Baseball — Rosalie

My monkey man.

[Film excerpt](https://www.scribd.com/doc/28819330/Twilight-Script).

### Twilight — Bella

I want you. Always.

[Film excerpt](https://en.wikiquote.org/wiki/Twilight_(2008_film)).

### Lunch — Rosalie

Is she even Italian?

[Film excerpt](https://en.wikiquote.org/wiki/Twilight_(2008_film)).

### One Drop — Bella

Ow! Papercut.

[Film excerpt](https://thetwilightsagaguide.angelfire.com/scripts/NewMoonMovieDialogue.html).

### The Empty Forest — Edward

You just don’t belong in my world, Bella.

[Film excerpt](https://thetwilightsagaguide.angelfire.com/scripts/NewMoonMovieDialogue.html).

### A Little More Sun — Jacob

Scrap metal. You shouldn’t have.

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_New_Moon).

### Race to the Sun — Bella

Edward, stop! I’m right here!

Original party dialogue.

### New Moon — Edward

Marry me, Bella.

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_New_Moon).

### Snack Break — Jacob

I’m team snacks. Pass them over.

Original party dialogue.

### A Century of Secrets — Jasper

I thought what I had with Maria was love.

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Eclipse).

### Team Jacob Makes a Case — Jacob

You feel something for me.

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Eclipse).

### A Heart Divided — Bella

I’m asking you to kiss me.

[Film excerpt](https://visual-icon.com/title/detail/?id=18602).

### Fire, Ice & One Tent — Jacob

I am hotter than you.

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Eclipse).

### An Unlikely Alliance — Jasper

Stay focused. I know how they fight.

Original party dialogue.

### Eclipse — Bella

I love you more.

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Eclipse).

### Until Forever — Edward

But let’s start with forever.

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Breaking_Dawn_%E2%80%93_Part_1).

### Isle Esme — Edward

Last night was the best night of my existence.

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Breaking_Dawn_%E2%80%93_Part_1).

### A New Heartbeat — Edward

Stay with me, Bella. I need you.

Original party dialogue.

### Gravity Changes — Jacob

I’ll keep her safe. Whatever it takes.

Original party dialogue.

### Breaking Dawn – Part 1 — Charlie

I know, I look hot.

[Film excerpt](https://en.wikiquote.org/wiki/The_Twilight_Saga:_Breaking_Dawn_%E2%80%93_Part_1).

### Dinner — Charlie

Everybody eats. That’s my only rule tonight.

Original party dialogue.

### Growing Beyond the Rules — Bella

She was born, not bitten.

[Film excerpt](https://twilightsaga.fandom.com/wiki/Breaking_Dawn_-_Part_2_movie_quotes).

### Witnesses to the Impossible — Carlisle

I asked for witnesses. You answered.

Original party dialogue.

### The Snowfield Reckoning — Alice

Now you know. That’s your future.

[Film excerpt](https://clip.cafe/the-twilight-saga-breaking-dawn-part-2-2012/now-know-s7/).

### Breaking Dawn – Part 2 — Bella

Forever.

[Film excerpt](https://twilightsaga.fandom.com/wiki/Breaking_Dawn_-_Part_2_movie_quotes).

### Forever — Edward

You stayed through everything. Stay a little longer.

Original party dialogue.

### Human Food Connoisseur — Charlie

You ate everything? That’s my kind of team.

Original party dialogue.

### Twihard — Alice

I saw you finishing every scene. Obviously.

Original party dialogue.

### Immortal — Bella

I was born to be a vampire.

[Film excerpt](https://twilightsaga.fandom.com/wiki/Breaking_Dawn_-_Part_2_movie_quotes).

### greeting-1 — Bella

Forks is growing on me.

[Film excerpt](https://en.wikiquote.org/wiki/Twilight_(2008_film)).

### greeting-2 — Charlie

I’ve got coffee. Make yourself at home.

Original party dialogue.

### greeting-3 — Alice

I’ve seen your future. You’re staying for all five.

Original party dialogue.

## Rebuilding

Edit `scripts/twilight/voice-lines.mjs`, then run the content builder. The audio generator takes the key from the environment or hidden stdin; `--replace` archives changed clips and validates temporary output before replacing live assets. Matching scripts, voices and settings are skipped. The retired narration, receipts and sampler remain in `audio-history/`.
