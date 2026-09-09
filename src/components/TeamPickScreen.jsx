import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { TWILIGHT_TEAMS, getTwilightTeam } from '../data/twilightTeams';
import { fadeIn } from '../utils/animations';
import './TeamScreens.css';

const wrap = index => (index % TWILIGHT_TEAMS.length + TWILIGHT_TEAMS.length) % TWILIGHT_TEAMS.length;

export default function TeamPickScreen({ finalRound = false }) {
  const { teamPoll, chooseInitialTeam, confirmFinalTeam } = useApp();
  const { getAssetUrl } = usePassport();
  const [index, setIndex] = useState(() => finalRound ? Math.max(0, TWILIGHT_TEAMS.findIndex(t => t.id === (teamPoll.final || teamPoll.initial))) : 0);
  const headingRef = useRef(null);
  const submitted = useRef(false);
  const dragged = useRef(false);
  const reduceMotion = useReducedMotion();
  const team = TWILIGHT_TEAMS[wrap(index)];
  const firstTeam = getTwilightTeam(teamPoll.initial);

  useEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const move = delta => setIndex(value => value + delta);
  const showTeam = target => {
    const forward = wrap(target - wrap(index));
    move(forward > TWILIGHT_TEAMS.length / 2 ? forward - TWILIGHT_TEAMS.length : forward);
  };
  const submit = event => {
    event.preventDefault();
    if (submitted.current) return;
    submitted.current = true;
    if (finalRound) confirmFinalTeam(team.id);
    else chooseInitialTeam(team.id);
  };

  return (
    <motion.main className="team-screen" variants={fadeIn} initial={reduceMotion ? false : 'initial'} animate="animate" exit="exit">
      <header className="team-heading">
        <p className="team-eyebrow">{finalRound ? 'THE SAGA IS COMPLETE' : 'BEFORE THE FIRST SPARK'}</p>
        <h1 ref={headingRef} tabIndex={-1} className="font-display">{finalRound ? 'Still your forever?' : 'Choose your team.'}</h1>
        <p>{finalRound ? 'Every badge. Your final choice.' : 'Pick now. Reconsider at the end.'}</p>
      </header>

      <form onSubmit={submit} className="team-pick-form">
        <div className="team-carousel" role="region" aria-roledescription="carousel" aria-label="Twilight characters" tabIndex={0} onKeyDown={event => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
        }}>
          <motion.div className="team-carousel-track" drag={reduceMotion ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} dragSnapToOrigin onDragStart={() => { dragged.current = true; }} onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 35 || Math.abs(info.velocity.x) > 400) move(info.offset.x < 0 ? 1 : -1);
            setTimeout(() => { dragged.current = false; }, 0);
          }}
          onTouchStart={event => { if (reduceMotion) dragged.current = event.touches[0].clientX; }}
          onTouchEnd={event => {
            if (reduceMotion && typeof dragged.current === 'number') {
              const delta = event.changedTouches[0].clientX - dragged.current;
              if (Math.abs(delta) > 35) move(delta < 0 ? 1 : -1);
              dragged.current = false;
            }
          }}>
            {[-2, -1, 0, 1, 2].map(offset => {
              const itemIndex = index + offset;
              const option = TWILIGHT_TEAMS[wrap(itemIndex)];
              return <motion.div key={itemIndex} aria-hidden="true" className="team-carousel-slide" data-centered={offset === 0} data-character={option.id} style={{ '--team-color': option.color, '--team-dim': option.dim }} initial={false}
                animate={{ x: `${offset * 70}%`, scale: offset === 0 ? 1 : .83, opacity: offset === 0 ? 1 : .42 }}
                transition={{ duration: reduceMotion ? 0 : .26, ease: [.22, 1, .36, 1] }}
                onClick={() => { if (!dragged.current && offset) move(offset); }}>
                <span className="team-character-stage">
                  <span className="team-aura" />
                  <span className="team-platform" />
                  <img src={getAssetUrl(option.portrait)} alt="" width="1024" height="1536" draggable="false" className="team-character" fetchpriority={offset === 0 ? 'high' : 'auto'} />
                </span>
              </motion.div>;
            })}
          </motion.div>
        </div>

        <div className="team-carousel-controls" style={{ '--team-color': team.color }}>
          <button type="button" className="team-arrow" aria-label="Previous character" onClick={() => move(-1)}>←</button>
          <div className="team-active-name" aria-live="polite" aria-atomic="true">
            <h2 className="font-display" style={{ color: team.color }}>{team.label}</h2>
            <p className="team-epithet">{team.epithet}</p>
          </div>
          <button type="button" className="team-arrow" aria-label="Next character" onClick={() => move(1)}>→</button>
        </div>
        <fieldset className="team-pagination">
          <legend className="sr-only">Choose a character to preview</legend>
          {TWILIGHT_TEAMS.map((option, optionIndex) => <label key={option.id} style={{ '--team-color': option.color }}>
            <input type="radio" name="twilight-team" value={option.id} checked={team.id === option.id} onChange={() => showTeam(optionIndex)} aria-label={option.label} />
            <span aria-hidden="true" />
          </label>)}
        </fieldset>

        <div className="team-selection-note" aria-live="polite">
          {finalRound ? <p>First pick: <strong style={{ color: firstTeam?.color }}>{firstTeam?.label}</strong>. {team.id === teamPoll.initial ? 'Still forever?' : 'Change of heart?'}</p> : <p>{team.description}</p>}
        </div>
        <button type="submit" className="btn-primary team-confirm" style={{ backgroundColor: team.color, color: team.background }}>
          {finalRound ? (team.id === teamPoll.initial ? `Confirm ${team.label}` : `Switch to ${team.label}`) : `I’m ${team.label}`}
        </button>
        <p className="team-footnote">{finalRound ? 'Your team. Your collection poster.' : 'Swipe to explore. Confirm to choose.'}</p>
      </form>
    </motion.main>
  );
}
