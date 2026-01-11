import { useCallback, useRef, useEffect, useState } from 'react';

// Web Audio API based procedural sound generation
// These create satisfying UI sounds without needing audio files

const audioContextRef = { current: null };

// Badge sound file mapping
const BADGE_SOUND_FILES = {
  'breakfast': '/audio/badge-breakfast.mp3',
  'second-breakfast': '/audio/badge-second-breakfast.mp3',
  'elevenses': '/audio/badge-elevenses.mp3',
  'luncheon': '/audio/badge-luncheon.mp3',
  'afternoon-tea': '/audio/badge-afternoon-tea.mp3',
  'dinner': '/audio/badge-dinner.mp3',
  'supper': '/audio/badge-supper.mp3',
  'fellowship': '/audio/badge-fellowship.mp3',
  'two-towers': '/audio/badge-two-towers.mp3',
  'return-king': '/audio/badge-return-king.mp3',
  'i-will-take-it': '/audio/badge-i-will-take-it.mp3',
  'you-shall-not-pass': '/audio/badge-you-shall-not-pass.mp3',
  'my-precious': '/audio/badge-my-precious.mp3',
  'ents-go-to-war': '/audio/badge-ents-go-to-war.mp3',
  'beacons-are-lit': '/audio/badge-beacons-are-lit.mp3',
  'i-am-no-man': '/audio/badge-i-am-no-man.mp3',
  'secret-movies': '/audio/badge-secret-movies.mp3',
  'secret-meals': '/audio/badge-secret-meals.mp3',
  'secret-scenes': '/audio/badge-secret-scenes.mp3',
  'secret-ringbearer': '/audio/badge-secret-ringbearer.mp3',
};

// Greeting sound files
const GREETING_SOUND_FILES = [
  '/audio/greeting-1.mp3',
  '/audio/greeting-2.mp3',
  '/audio/greeting-3.mp3',
  '/audio/greeting-4.mp3',
  '/audio/greeting-5.mp3',
];

// Background music files by time of day
const BG_MUSIC_FILES = {
  morning: ['/audio/bg-morning-1.mp3', '/audio/bg-morning-2.mp3'],
  afternoon: ['/audio/bg-afternoon-1.mp3', '/audio/bg-afternoon-2.mp3'],
  night: ['/audio/bg-night-1.mp3', '/audio/bg-night-2.mp3'],
};

// Preloaded audio cache
const preloadedBadgeSounds = {};
const preloadedGreetings = [];
let badgeSoundsPreloaded = false;
let greetingsPreloaded = false;

// Track currently playing sounds
let currentBadgeAudio = null;
let currentGreetingAudio = null;

// Background music state
let bgMusicAudio = null;
let currentTimeOfDay = null;
let bgMusicCheckInterval = null;

// Preload all badge sounds for instant playback
export function preloadBadgeSounds() {
  if (badgeSoundsPreloaded) return Promise.resolve();

  const loadPromises = Object.entries(BADGE_SOUND_FILES).map(([badgeId, src]) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;

      // Resolve when loaded or on error (don't block on failures)
      audio.addEventListener('canplaythrough', () => {
        preloadedBadgeSounds[badgeId] = audio;
        resolve();
      }, { once: true });

      audio.addEventListener('error', () => {
        console.warn(`Failed to preload badge sound: ${badgeId}`);
        resolve();
      }, { once: true });

      // Start loading
      audio.load();
    });
  });

  return Promise.all(loadPromises).then(() => {
    badgeSoundsPreloaded = true;
    console.log('Badge sounds preloaded');
  });
}

// Stop any currently playing badge sound
export function stopBadgeSound() {
  if (currentBadgeAudio) {
    currentBadgeAudio.pause();
    currentBadgeAudio.currentTime = 0;
    currentBadgeAudio = null;
  }
}

// Play a badge sound by badge ID (stops any previous sound first)
export function playBadgeSound(badgeId, volume = 0.7) {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Stop any currently playing badge sound
  stopBadgeSound();

  const audio = preloadedBadgeSounds[badgeId];
  if (audio) {
    // Clone the audio for playback
    const clone = audio.cloneNode();
    clone.volume = volume;
    currentBadgeAudio = clone;
    clone.play().catch(e => console.warn('Badge sound play failed:', e));

    // Clear reference when sound ends naturally
    clone.addEventListener('ended', () => {
      if (currentBadgeAudio === clone) {
        currentBadgeAudio = null;
      }
    }, { once: true });
  } else {
    // Fallback: try to play directly if not preloaded
    const src = BADGE_SOUND_FILES[badgeId];
    if (src) {
      const fallback = new Audio(src);
      fallback.volume = volume;
      currentBadgeAudio = fallback;
      fallback.play().catch(e => console.warn('Badge sound play failed:', e));

      fallback.addEventListener('ended', () => {
        if (currentBadgeAudio === fallback) {
          currentBadgeAudio = null;
        }
      }, { once: true });
    }
  }
}

// Preload greeting sounds for instant playback
export function preloadGreetingSounds() {
  if (greetingsPreloaded) return Promise.resolve();

  const loadPromises = GREETING_SOUND_FILES.map((src, index) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = src;

      audio.addEventListener('canplaythrough', () => {
        preloadedGreetings[index] = audio;
        resolve();
      }, { once: true });

      audio.addEventListener('error', () => {
        console.warn(`Failed to preload greeting sound: ${index + 1}`);
        resolve();
      }, { once: true });

      audio.load();
    });
  });

  return Promise.all(loadPromises).then(() => {
    greetingsPreloaded = true;
    console.log('Greeting sounds preloaded');
  });
}

// Stop any currently playing greeting sound
export function stopGreetingSound() {
  if (currentGreetingAudio) {
    currentGreetingAudio.pause();
    currentGreetingAudio.currentTime = 0;
    currentGreetingAudio = null;
  }
}

// Play a random greeting sound
export function playRandomGreeting(volume = 0.8) {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Stop any currently playing greeting
  stopGreetingSound();

  // Pick a random greeting
  const randomIndex = Math.floor(Math.random() * GREETING_SOUND_FILES.length);
  const audio = preloadedGreetings[randomIndex];

  if (audio) {
    const clone = audio.cloneNode();
    clone.volume = volume;
    currentGreetingAudio = clone;
    clone.play().catch(e => console.warn('Greeting sound play failed:', e));

    clone.addEventListener('ended', () => {
      if (currentGreetingAudio === clone) {
        currentGreetingAudio = null;
      }
    }, { once: true });
  } else {
    // Fallback: play directly if not preloaded
    const src = GREETING_SOUND_FILES[randomIndex];
    if (src) {
      const fallback = new Audio(src);
      fallback.volume = volume;
      currentGreetingAudio = fallback;
      fallback.play().catch(e => console.warn('Greeting sound play failed:', e));

      fallback.addEventListener('ended', () => {
        if (currentGreetingAudio === fallback) {
          currentGreetingAudio = null;
        }
      }, { once: true });
    }
  }
}

// Get time of day for background music selection
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 13) return 'morning';      // Before 1pm
  if (hour < 19) return 'afternoon';    // 1pm - 7pm
  return 'night';                        // After 7pm
}

// Start background music (call on first user interaction)
export function startBackgroundMusic(volume = 0.5) {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // If already playing, don't restart
  if (bgMusicAudio && !bgMusicAudio.paused) {
    return;
  }

  const timeOfDay = getTimeOfDay();
  currentTimeOfDay = timeOfDay;

  // Pick a random track for this time of day
  const tracks = BG_MUSIC_FILES[timeOfDay];
  const randomIndex = Math.floor(Math.random() * tracks.length);
  const src = tracks[randomIndex];

  bgMusicAudio = new Audio(src);
  bgMusicAudio.volume = volume;
  bgMusicAudio.loop = true;
  bgMusicAudio.play().catch(e => console.warn('Background music play failed:', e));

  // Set up interval to check for time-of-day changes (every minute)
  if (!bgMusicCheckInterval) {
    bgMusicCheckInterval = setInterval(() => {
      updateBackgroundMusicForTime(volume);
    }, 60000); // Check every minute
  }

  console.log(`Background music started: ${timeOfDay}`);
}

// Stop background music
export function stopBackgroundMusic() {
  if (bgMusicAudio) {
    bgMusicAudio.pause();
    bgMusicAudio.currentTime = 0;
    bgMusicAudio = null;
  }
  if (bgMusicCheckInterval) {
    clearInterval(bgMusicCheckInterval);
    bgMusicCheckInterval = null;
  }
  currentTimeOfDay = null;
}

// Check and update background music if time of day changed
export function updateBackgroundMusicForTime(volume = 0.5) {
  const timeOfDay = getTimeOfDay();

  // If time of day changed, switch tracks
  if (timeOfDay !== currentTimeOfDay && bgMusicAudio) {
    console.log(`Time of day changed: ${currentTimeOfDay} -> ${timeOfDay}`);
    currentTimeOfDay = timeOfDay;

    // Pick a random track for the new time of day
    const tracks = BG_MUSIC_FILES[timeOfDay];
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const src = tracks[randomIndex];

    // Crossfade to new track
    const oldAudio = bgMusicAudio;
    const newAudio = new Audio(src);
    newAudio.volume = 0;
    newAudio.loop = true;

    newAudio.play().then(() => {
      // Fade out old, fade in new over 2 seconds
      let fadeProgress = 0;
      const fadeInterval = setInterval(() => {
        fadeProgress += 0.05;
        if (fadeProgress >= 1) {
          oldAudio.pause();
          newAudio.volume = volume;
          bgMusicAudio = newAudio;
          clearInterval(fadeInterval);
        } else {
          oldAudio.volume = volume * (1 - fadeProgress);
          newAudio.volume = volume * fadeProgress;
        }
      }, 100); // 20 steps over 2 seconds
    }).catch(e => console.warn('Background music transition failed:', e));
  }
}

function getAudioContext() {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContextRef.current;
}

// Resume audio context on user interaction (required by browsers)
function ensureAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

// Sound generators
const sounds = {
  // Crisp button tap - short click
  snap: (ctx, volume) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  },

  // Modal slide up - smooth whoosh
  shoop: (ctx, volume) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  },

  // Modal dismiss - quick reverse whoosh
  fwip: (ctx, volume) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(volume * 0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  },

  // Badge stamp - weighty thunk
  thunk: (ctx, volume) => {
    // Low frequency punch
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.frequency.setValueAtTime(150, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);

    gain1.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // Click transient
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.frequency.setValueAtTime(1000, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03);

    gain2.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.03);
  },

  // Secret unlock - magical chime
  chime: (ctx, volume) => {
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const startTime = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume * 0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  },

  // Error - gentle bonk
  bonk: (ctx, volume) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  },

  // Final certification - triumphant horn fanfare
  horn: (ctx, volume) => {
    // Three note fanfare: G4, C5, E5
    const notes = [
      { freq: 392.00, start: 0, duration: 0.3 },      // G4
      { freq: 523.25, start: 0.25, duration: 0.3 },   // C5
      { freq: 659.25, start: 0.5, duration: 0.6 },    // E5 (held longer)
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, ctx.currentTime);

      const startTime = ctx.currentTime + note.start;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume * 0.2, startTime + 0.05);
      gain.gain.setValueAtTime(volume * 0.2, startTime + note.duration - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);

      osc.start(startTime);
      osc.stop(startTime + note.duration);
    });
  },
};

export function useSound() {
  const [isEnabled, setIsEnabled] = useState(true);
  const hasInteracted = useRef(false);

  // Enable audio context on first user interaction
  useEffect(() => {
    const enableAudio = () => {
      if (!hasInteracted.current) {
        hasInteracted.current = true;
        ensureAudioContext();
      }
    };

    window.addEventListener('click', enableAudio, { once: true });
    window.addEventListener('touchstart', enableAudio, { once: true });

    return () => {
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('touchstart', enableAudio);
    };
  }, []);

  const play = useCallback((soundName, volume = 0.5) => {
    if (!isEnabled) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    try {
      const ctx = ensureAudioContext();
      const soundFn = sounds[soundName];

      if (soundFn) {
        soundFn(ctx, volume);
      } else {
        console.warn(`Sound "${soundName}" not found`);
      }
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }, [isEnabled]);

  return { play, isEnabled, setIsEnabled };
}

// Sound trigger mapping for convenience
export const UI_SOUNDS = {
  buttonTap: 'snap',
  modalOpen: 'shoop',
  modalClose: 'fwip',
  badgeClaim: 'thunk',
  secretUnlock: 'chime',
  error: 'bonk',
  certification: 'horn',
};
