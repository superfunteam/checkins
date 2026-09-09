import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { getTwilightTeam } from '../data/twilightTeams';
import { BADGE_SHAPES } from '../utils/badgeStyles';

export default function TeamExportTemplate() {
  const { name, teamPoll } = useApp();
  const { badges, getAssetUrl, meta } = usePassport();
  const team = getTwilightTeam(teamPoll.final);
  const first = getTwilightTeam(teamPoll.initial);
  if (!team) return null;
  const stayed = first?.id === team.id;
  return (
    <div id="team-export-template" data-team={team.id} style={{ display: 'none', width: 1080, minHeight: 2160, padding: 48, boxSizing: 'border-box', backgroundColor: team.background, color: '#f4f0e9', fontFamily: 'Google Sans Flex, sans-serif' }}>
      <div style={{ position: 'relative', height: 650, overflow: 'hidden', borderBottom: `1px solid ${team.dim}`, marginBottom: 30 }}>
        <div style={{ fontSize: 15, letterSpacing: 5, color: team.color }}>THE TWILIGHT PASSPORT · COMPLETE COLLECTION</div>
        <div style={{ position: 'absolute', left: 0, top: 110, width: 520, zIndex: 2 }}>
          <p style={{ fontSize: 28, letterSpacing: 12, color: team.color, margin: '0 0 8px' }}>TEAM</p>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 82, lineHeight: 1.05, letterSpacing: -3, fontWeight: 700, margin: 0 }}>{team.name.toUpperCase()}</h1>
          <p style={{ fontSize: 16, letterSpacing: 4, color: team.color, margin: '24px 0 48px' }}>{team.motif}</p>
          <p style={{ fontFamily: 'Crimson Text, serif', fontStyle: 'italic', fontSize: 32, lineHeight: 1.3, margin: '0 0 30px', maxWidth: 440 }}>{stayed ? 'Some things really are forever.' : 'The saga changed my heart.'}</p>
          <p style={{ fontSize: 30, fontWeight: 600, margin: '0 0 8px', maxWidth: 460, overflowWrap: 'anywhere' }}>{name}</p>
          <p style={{ fontSize: 17, color: team.color, margin: 0 }}>{stayed ? `${team.label}, from first sight to forever.` : `Started ${first?.label}. Ended ${team.label}.`}</p>
          <p style={{ fontSize: 18, letterSpacing: 2, margin: '32px 0 0', color: '#e6e1d9' }}>5 FILMS · 20 SCENES · 4 MEALS</p>
        </div>
        <div style={{ position: 'absolute', right: 16, bottom: 26, width: 390, height: 36, borderRadius: '50%', backgroundColor: team.dim, border: `3px solid ${team.color}`, boxShadow: `0 0 32px ${team.dim}` }} />
        <img data-team-portrait src={getAssetUrl(team.portrait)} alt={team.label} crossOrigin="anonymous" style={{ position: 'absolute', right: -6, bottom: 26, width: 470, height: 600, objectFit: 'contain' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 28, margin: 0 }}>Every moment. Mine forever.</h2>
        <span style={{ color: team.color, fontWeight: 700, fontSize: 22 }}>{badges.length}/{badges.length} BADGES</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '24px 16px' }}>
        {[...badges].sort((a, b) => a.order - b.order).map(badge => (
          <div key={badge.id} data-poster-badge={badge.id} style={{ textAlign: 'center' }}>
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: BADGE_SHAPES.arch, border: '7px solid #f4f0e9', overflow: 'hidden', boxSizing: 'border-box', backgroundColor: team.surface }}>
              <img src={getAssetUrl(badge.image)} alt={badge.name} crossOrigin="anonymous" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <p style={{ margin: '9px 0 0', fontSize: 14, lineHeight: 1.25, minHeight: 36, color: '#f0eae2' }}>{badge.name}</p>
          </div>
        ))}
      </div>
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${team.dim}`, paddingTop: 24, marginTop: 32, color: team.color, fontSize: 16 }}>
        <span>{meta.hosts?.names?.length ? `A saga with ${meta.hosts.names.join(' & ')}` : 'From first sight to forever.'}</span>
        <span>twilight.checkins.party</span>
      </footer>
    </div>
  );
}
