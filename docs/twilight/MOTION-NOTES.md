# Badge dialog motion

## September 19, 2026 fix

The badge sheet's Web Animations API exit had the default `fill: auto`.
After fading to zero, it reverted to its unanimated opacity of one before
React unmounted it. At 4× CPU slowdown, frame sampling reproduced a full-opacity
flash on four of four touch-driven closes.

The sheet and backdrop now retain their final frames until removal. Interrupted
animations preserve their current styles before cancellation, so closing during
entry or reopening during exit continues from the visible position. Page scroll
locking and restoration happen in layout effects, before painting.

The sheet uses a 200 ms, 16 px entrance and a 160 ms exit. Reduced-motion mode
has no sheet animation. Badge navigation keeps the same sheet, replaces the
content directly, and uses one short incoming transition. It no longer retains
outgoing art or uses an elastic drag spring. Claiming updates the button without
scaling the badge. Closing cancels pending claim timers and makes the sheet inert.

## Regression checks

Run Vite on port 5175, then:

```sh
node scripts/twilight/dialog-motion.mjs
node scripts/twilight/motion-smoke.mjs
npm run test:e2e
```

`dialog-motion.mjs` checks every animation frame, including the completion boundary
the previous end-state tests missed. Its 19 traces cover real CDP touch input,
repeated opening/closing at multiple scroll positions, swiping, interrupted entry,
reopening during exit, claim timer cancellation, desktop, reduced motion, and
scroll/focus restoration. Results and screenshots are written to the ignored
`.e2e/dialog-motion/` directory. `MOTION_BASE` can point at a production origin;
the test uses an isolated browser profile.

The original four-close reproduction produced zero flashes after this fix.
Tests use Chromium with mobile viewport emulation, including 4× CPU slowdown.
