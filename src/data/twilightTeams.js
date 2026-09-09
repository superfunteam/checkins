export const TWILIGHT_TEAMS = [
  {
    id: 'edward', name: 'Edward', label: 'Team Edward',
    epithet: 'The beautiful danger', description: 'Mystery. Moonlight. Forever.',
    color: '#a9d9ee', dim: '#518baa', background: '#101e30', surface: '#1b354b',
    portrait: 'assets/images/teams/edward.webp', motif: 'MOONLIGHT & FOREVER',
  },
  {
    id: 'jacob', name: 'Jacob', label: 'Team Jacob',
    epithet: 'The familiar warmth', description: 'Warmth worth choosing.',
    color: '#f6bd82', dim: '#ba7347', background: '#2b1b18', surface: '#493026',
    portrait: 'assets/images/teams/jacob.webp', motif: 'WILDFIRE & DEVOTION',
  },
  {
    id: 'charlie', name: 'Charlie', label: 'Team Charlie',
    epithet: 'The dad. The legend.', description: 'Mustache. Beer. Dad.',
    color: '#b9d99d', dim: '#6f9967', background: '#172820', surface: '#2b4533',
    portrait: 'assets/images/teams/charlie.webp', motif: 'STEADY HEART & STRONG COFFEE',
  },
];

export const getTwilightTeam = id => TWILIGHT_TEAMS.find(team => team.id === id) || null;

export function readTeamPoll(value) {
  const initial = getTwilightTeam(value?.initial)?.id || null;
  return {
    initial,
    final: initial ? getTwilightTeam(value?.final)?.id || null : null,
    initialPickedAt: value?.initialPickedAt || null,
    finalPickedAt: value?.finalPickedAt || null,
  };
}
