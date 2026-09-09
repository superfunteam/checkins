import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { getTwilightTeam } from '../data/twilightTeams';
import { createPassportPng, downloadPng, passportFilename } from '../utils/exportPng';
import { fadeIn } from '../utils/animations';
import TeamExportTemplate from './TeamExportTemplate';
import './TeamScreens.css';

export default function TeamShareScreen() {
  const { name, teamPoll, allBadgesComplete, goToScreen, SCREENS } = useApp();
  const { badges, getAssetUrl } = usePassport();
  const team = getTwilightTeam(teamPoll.final);
  const headingRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [retry, setRetry] = useState(0);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!allBadgesComplete) { goToScreen(SCREENS.PASSPORT, { silent: true }); return; }
    let cancelled = false;
    let url;
    setImage(null);
    setError('');
    createPassportPng({ templateSelector: '#team-export-template', scale: 1 }).then(blob => {
      if (cancelled) return;
      url = URL.createObjectURL(blob);
      const file = new File([blob], passportFilename(name, 'twilight', team.id), { type: 'image/png' });
      let canShare = false;
      try { canShare = Boolean(navigator.canShare?.({ files: [file] })); } catch { /* Download works in every supported browser. */ }
      setImage({ blob, url, file, canShare });
    }).catch(() => { if (!cancelled) setError('Artwork couldn’t load. Check your connection, then retry.'); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [name, team.id, retry, allBadgesComplete, badges, getAssetUrl, goToScreen, SCREENS]);

  const share = async () => {
    if (!image || sharing) return;
    setSharing(true);
    setStatus('');
    try {
      await navigator.share({ files: [image.file], title: `Forever ${team.label}`, text: `Every badge collected. Forever ${team.label}.` });
    } catch (err) {
      if (err.name !== 'AbortError') setStatus('Sharing unavailable. Save your poster instead.');
    } finally { setSharing(false); }
  };

  return (
    <>
    <motion.main className="team-screen" variants={fadeIn} initial={reduceMotion ? false : 'initial'} animate="animate" exit="exit">
      <header className="team-heading" style={{ marginBottom: 24 }}>
        <p className="team-eyebrow" style={{ color: team.color }}>YOUR FINAL VERDICT</p>
        <h1 ref={headingRef} tabIndex={-1} className="font-display">Forever {team.label}.</h1>
        <p>Every badge. Your side of the story.</p>
      </header>
      {image ? <img className="team-share-preview" src={image.url} alt={`${name}’s complete Twilight collection poster: ${team.label}, character portrait and all ${badges.length} badges.`} /> : <div className="team-selection-note" role="status">{error || 'Preparing your poster…'}</div>}
      <div className="team-share-actions">
        {error && <button type="button" className="btn-primary" onClick={() => setRetry(value => value + 1)}>Try again</button>}
        {image?.canShare && <button type="button" className="btn-primary" disabled={sharing} onClick={share} style={{ backgroundColor: team.color, color: team.background }}>Share My Team</button>}
        {image && <button type="button" className={image.canShare ? 'btn-secondary' : 'btn-primary'} style={!image.canShare ? { backgroundColor: team.color, color: team.background } : undefined} onClick={() => { downloadPng(image.blob, image.file.name); setStatus('Poster ready to save.'); }}>Save Team Poster</button>}
        <p className="team-share-status" role="status">{status}</p>
        <button type="button" className="team-share-link" disabled={sharing} onClick={() => goToScreen(SCREENS.TEAM_FINAL)}>Change my final team</button>
        <button type="button" className="team-share-link" disabled={sharing} onClick={() => goToScreen(SCREENS.PASSPORT)}>Back to my badges</button>
      </div>
    </motion.main>
    <TeamExportTemplate />
    </>
  );
}
