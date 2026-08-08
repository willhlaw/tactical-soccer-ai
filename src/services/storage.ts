import { Team, Drill, PlayingStyle, AgeGroup, FormatType, Player } from '../types';

const TEAMS_STORAGE_KEY = 'tactical_soccer_teams_v1';
const ACTIVE_TEAM_ID_KEY = 'tactical_soccer_active_team_id';
const DRILLS_STORAGE_KEY = 'tactical_soccer_drills_v1';
const PRO_STATUS_KEY = 'tactical_soccer_ai_pro_active';

export const DEMO_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Alex Martinez',
    number: 13,
    isAbsent: false,
    preferredPositions: ['ST', 'FW', 'GK'],
    attributes: { speed: 9, dribbling: 9, passing: 8, stamina: 8, defending: 5 },
    avatarColor: '#ef4444',
    notes: 'Fast striker, strong right foot. Can also play goalie in Rec mode.'
  },
  {
    id: 'p2',
    name: 'Liam Henderson',
    number: 1,
    isAbsent: false,
    preferredPositions: ['GK', 'CB'],
    attributes: { speed: 6, dribbling: 5, passing: 7, stamina: 7, defending: 9 },
    avatarColor: '#3b82f6',
    notes: 'Primary goalkeeper, loud voice, good distribution.'
  },
  {
    id: 'p3',
    name: 'Mateo Silva',
    number: 10,
    isAbsent: false,
    preferredPositions: ['CAM', 'CM', 'LW'],
    attributes: { speed: 8, dribbling: 10, passing: 9, stamina: 7, defending: 4 },
    avatarColor: '#10b981',
    notes: 'Playmaker, great vision for split passes.'
  },
  {
    id: 'p4',
    name: 'Noah Bennett',
    number: 4,
    isAbsent: false,
    preferredPositions: ['CB', 'CDM', 'RB'],
    attributes: { speed: 7, dribbling: 6, passing: 8, stamina: 9, defending: 9 },
    avatarColor: '#8b5cf6',
    notes: 'Solid defender, strong tackle, good leadership.'
  },
  {
    id: 'p5',
    name: 'Ethan Parker',
    number: 7,
    isAbsent: false,
    preferredPositions: ['RW', 'RM', 'ST'],
    attributes: { speed: 9, dribbling: 8, passing: 7, stamina: 8, defending: 5 },
    avatarColor: '#f59e0b',
    notes: 'Speedy winger, loves cross-field balls.'
  },
  {
    id: 'p6',
    name: 'Lucas Rossi',
    number: 8,
    isAbsent: false,
    preferredPositions: ['CM', 'CDM', 'LB'],
    attributes: { speed: 7, dribbling: 7, passing: 8, stamina: 9, defending: 7 },
    avatarColor: '#ec4899',
    notes: 'High stamina, box-to-box midfielder.'
  },
  {
    id: 'p7',
    name: 'Mason Miller',
    number: 3,
    isAbsent: false,
    preferredPositions: ['LB', 'LM', 'CB'],
    attributes: { speed: 8, dribbling: 7, passing: 7, stamina: 8, defending: 8 },
    avatarColor: '#06b6d4',
    notes: 'Reliable left back, overlaps well.'
  },
  {
    id: 'p8',
    name: 'Benjamin Carter',
    number: 9,
    isAbsent: false,
    preferredPositions: ['ST', 'CF'],
    attributes: { speed: 8, dribbling: 8, passing: 7, stamina: 7, defending: 4 },
    avatarColor: '#84cc16',
    notes: 'Target forward, clinical finisher.'
  },
  {
    id: 'p9',
    name: 'Oliver Wright',
    number: 2,
    isAbsent: false,
    preferredPositions: ['RB', 'RM', 'CB'],
    attributes: { speed: 7, dribbling: 6, passing: 7, stamina: 8, defending: 8 },
    avatarColor: '#6366f1',
    notes: 'Disciplined defender, great positional discipline.'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-u10-rec',
    name: 'Thunderbolts U10 (Rec)',
    ageGroup: 'U9-U10',
    format: '7v7',
    playingStyle: 'youth-buildout',
    customStyleNotes: 'Focus on 2-3-1 shape, building out from the back, and trigger pressing on weak touches.',
    roster: DEMO_PLAYERS.slice(0, 9)
  },
  {
    id: 'team-u12-travel',
    name: 'Vipers ADP U12 (Select)',
    ageGroup: 'U11-U12',
    format: '9v9',
    playingStyle: 'youth-buildout',
    customStyleNotes: '3-2-3 formation, high press counter attack, quick wing play.',
    roster: DEMO_PLAYERS
  }
];

export function getLocalTeams(): Team[] {
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(INITIAL_TEAMS));
      return INITIAL_TEAMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading teams from storage:', e);
    return INITIAL_TEAMS;
  }
}

export function saveLocalTeams(teams: Team[]): void {
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch (e) {
    console.error('Error saving teams:', e);
  }
}

export function getActiveTeamId(): string {
  const teams = getLocalTeams();
  const savedId = localStorage.getItem(ACTIVE_TEAM_ID_KEY);
  if (savedId && teams.some(t => t.id === savedId)) {
    return savedId;
  }
  return teams[0]?.id || 'team-u10-rec';
}

export function setActiveTeamId(id: string): void {
  localStorage.setItem(ACTIVE_TEAM_ID_KEY, id);
}

export function getAIProStatus(): boolean {
  return localStorage.getItem(PRO_STATUS_KEY) === 'true';
}

export function setAIProStatus(active: boolean): void {
  localStorage.setItem(PRO_STATUS_KEY, active ? 'true' : 'false');
}
