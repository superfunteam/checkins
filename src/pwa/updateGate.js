/**
 * Update gate
 *
 * A new build is downloaded by the service worker in the background. We only
 * swap it in (which reloads the page) when the guest is not in the middle of
 * something: no modal or sheet open, not mid-onboarding. A hidden tab is
 * always a safe moment. Guest state lives in localStorage, so the reload lands
 * back on the passport screen with every badge intact.
 */

let busy = false;
let pendingReload = null;
let listening = false;

function maybeRun() {
  if (!pendingReload) return;
  const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  if (busy && !hidden) return;
  const run = pendingReload;
  pendingReload = null;
  run();
}

/** Called by the app whenever its "mid-interaction" state changes. */
export function setUpdateBusy(isBusy) {
  busy = Boolean(isBusy);
  maybeRun();
}

/** Called by the service-worker layer when a new build is waiting. */
export function scheduleReload(run) {
  pendingReload = run;
  if (!listening && typeof document !== 'undefined') {
    listening = true;
    document.addEventListener('visibilitychange', maybeRun);
  }
  maybeRun();
}

/** For debugging in the console: is an update queued? */
export function hasPendingReload() {
  return pendingReload !== null;
}
