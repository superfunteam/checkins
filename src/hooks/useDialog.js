import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { usePresence, useReducedMotion } from 'framer-motion';

const dialogs = [];
let savedPage = null;

// Keep the page still until the last dialog has completed its exit animation.
// Retained dialog children (or AnimatePresence children) clean up after exit.
export function useDialog(ref, onClose, { nativeMotion = false, backdropRef, open, onExited } = {}) {
  const reduceMotion = useReducedMotion();
  const [presence, safeToRemove] = usePresence();
  const isPresent = open ?? presence;
  const removeRef = useRef(safeToRemove);
  removeRef.current = onExited || safeToRemove;
  // Drive the sheet's animate state explicitly. This also handles a close after
  // a swipe/context update without relying on stale inherited exit variants.
  const completeExit = useCallback(definition => {
    if (!isPresent && definition === "exit") removeRef.current?.();
  }, [isPresent]);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const entry = { ref };
    if (dialogs.length === 0) {
      const body = document.body;
      savedPage = { scrollY: window.scrollY, position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
      body.style.position = 'fixed';
      body.style.top = `-${savedPage.scrollY}px`;
      body.style.width = '100%';
      body.style.overflow = 'hidden';
    }
    dialogs.push(entry);
    ref.current?.focus({ preventScroll: true });

    const onKeyDown = event => {
      if (dialogs.at(-1) !== entry) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current?.();
      }
      if (event.key !== 'Tab') return;
      const controls = [...(ref.current?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]') || [])].filter(e => e.getClientRects().length);
      const first = controls[0];
      const last = controls.at(-1);
      if (!first) { event.preventDefault(); ref.current?.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      dialogs.splice(dialogs.indexOf(entry), 1);
      if (!dialogs.length && savedPage) {
        const { scrollY, ...styles } = savedPage;
        Object.assign(document.body.style, styles);
        window.scrollTo({ top: scrollY, behavior: 'instant' });
        savedPage = null;
        if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      } else {
        dialogs.at(-1)?.ref.current?.focus({ preventScroll: true });
      }
    };
  }, [ref]);
  useLayoutEffect(() => {
    if (!nativeMotion || !ref.current) return;
    const sheet = ref.current;
    const distance = reduceMotion ? 'none' : `translateY(${isPresent ? 24 : 16}px)`;
    const options = { duration: reduceMotion ? 120 : isPresent ? 200 : 160, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };
    const surface = sheet.animate(isPresent
      ? [{ opacity: 0, transform: distance }, { opacity: 1, transform: 'none' }]
      : [{ opacity: getComputedStyle(sheet).opacity, transform: getComputedStyle(sheet).transform }, { opacity: 0, transform: distance }], options);
    const overlay = backdropRef?.current?.animate([{ opacity: isPresent ? 0 : 1 }, { opacity: isPresent ? 1 : 0 }], { duration: 160, easing: 'ease-out' });
    let cancelled = false;
    Promise.all([surface.finished, overlay?.finished]).then(() => {
      if (!cancelled && !isPresent) removeRef.current?.();
    }).catch(() => {}); // Interrupted by a reopen, a route change, or StrictMode cleanup.
    return () => { cancelled = true; surface.cancel(); overlay?.cancel(); };
  }, [nativeMotion, isPresent, reduceMotion, ref, backdropRef]);
  return { isPresent, completeExit };
}
