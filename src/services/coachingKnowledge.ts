import { PlayingStyle, FormatType, AgeGroup, Drill } from '../types';

export interface TacticalPhilosophyDetail {
  name: string;
  creator: string;
  tagline: string;
  buildUpStrategy: string;
  defensivePressTrigger: string;
  keyFormations: Record<FormatType, string>;
  coachingRules: string[];
}

export const PHILOSOPHY_KNOWLEDGE: Record<PlayingStyle, TacticalPhilosophyDetail> = {
  'youth-buildout': {
    name: 'Youth Build-Out & High Press',
    creator: 'Youth Development Academy',
    tagline: 'Play-Practice-Play, Building Out, & Brave Decision Making',
    buildUpStrategy: 'Split center backs wide, goalkeeper acts as 11th outfield player. Midfield drops into half-spaces to create 3v2 build-out overloads.',
    defensivePressTrigger: 'Initiate high press on 4 visual triggers: 1) Opponent poor first touch, 2) Bouncing/weak pass, 3) Opponent back facing our goal, 4) Immediate counter-press upon loss.',
    keyFormations: {
      '5v5': '1-2-1 Diamond',
      '7v7': '2-3-1 (Build-out & Wing Width)',
      '9v9': '3-2-3 (Balanced Build-out Shape)',
      '11v11': '4-3-3 (High Wingers)'
    },
    coachingRules: [
      'Encourage players to "Be Brave" — never bench a player for trying a creative skill or making an aggressive mistake.',
      'Play-Practice-Play (PPP): Use small-sided games to teach decision making under real match pressure.',
      'Rotate players across primary and secondary positions so kids develop complete game intelligence.',
      'Recreation Mode: Equal playing time is mandatory for long-term athlete retention and enjoyment.'
    ]
  },
  'positional-play': {
    name: 'Positional Play (Tiki-Taka)',
    creator: 'Guardiola / European Academies',
    tagline: 'Numerical Overloads & Half-Space Infiltration',
    buildUpStrategy: 'Patience in possession. Pass to attract opponent to one side, then rapidly switch to free winger on weak side.',
    defensivePressTrigger: 'Immediate 6-second counter-press upon losing possession in opponent half.',
    keyFormations: {
      '5v5': '1-2-1 Diamond',
      '7v7': '3-2-1 Pyramid',
      '9v9': '3-3-2 Balanced',
      '11v11': '4-3-3 Inverted Fullbacks'
    },
    coachingRules: [
      'Always form passing triangles and diamonds around the ball carrier.',
      'Occupying half-spaces forces opponent defenders into impossible double-team decisions.',
      'Maximum 2 touches per player in mid-third to keep ball speed fast.'
    ]
  },
  'high-press': {
    name: 'High Press & Gegenpress',
    creator: 'Klopp / German School',
    tagline: 'Heavy Metal Football & Rapid Vertical Transition',
    buildUpStrategy: 'Bypass deep midfield with direct crisp passes to physical strikers, then win 2nd ball in dangerous territory.',
    defensivePressTrigger: 'All players sprint into trapping zones as soon as opponent receives ball near sidelines.',
    keyFormations: {
      '5v5': '2-2 Box',
      '7v7': '2-3-1 High Wing',
      '9v9': '3-2-3 High Line',
      '11v11': '4-3-3 Heavy Press'
    },
    coachingRules: [
      'The best playmaker in soccer is a high counter-press in the opponent defensive third.',
      'Require maximum stamina work and fast sub rotations in competitive matches.'
    ]
  },
  'low-block': {
    name: 'Compact Low Block & Counter',
    creator: 'Mourinho / Counter Specialists',
    tagline: 'Defensive Solidity & Explosive Counter Breaks',
    buildUpStrategy: 'Absorb pressure in lower 1/3, lock down central channels, then launch 30-yard diagonal passes to fast wingers.',
    defensivePressTrigger: 'Fall back into compact 2-line block at midfield circle. Press only when opponent enters outer 35 yards.',
    keyFormations: {
      '5v5': '2-2 Box',
      '7v7': '3-2-1 Solid',
      '9v9': '4-3-1 Counter',
      '11v11': '4-4-2 Flat Block'
    },
    coachingRules: [
      'Never break defensive shape to chase isolated ball carriers.',
      'Capitalize on set pieces and fast counter-break transitions.'
    ]
  },
  'custom': {
    name: 'Custom Coach Philosophy',
    creator: 'User Defined',
    tagline: 'Personalized Tactical Approach',
    buildUpStrategy: 'Custom build-out strategy defined in team settings.',
    defensivePressTrigger: 'Custom press triggers as specified by head coach.',
    keyFormations: {
      '5v5': '1-2-1',
      '7v7': '2-3-1',
      '9v9': '3-2-3',
      '11v11': '4-3-3'
    },
    coachingRules: [
      'Tailor drills and lineups according to coach notes in team profile.'
    ]
  }
};

export const DEFAULT_DRILLS: Drill[] = [
  {
    id: 'drill-1',
    title: '3v2 Build-Out Rondo',
    category: 'Passing',
    ageGroup: 'U9-U10',
    durationMinutes: 15,
    description: '3 defenders build out from GK against 2 high pressing strikers. Teaches split passes and spatial bravery.',
    coachingPoints: [
      'Center backs split all the way to the touchlines.',
      'Goalkeeper must step up as central passing pivot.',
      'Midfielder drops to form inverted triangle.'
    ],
    keyframes: [
      {
        id: 'k1',
        stepNumber: 1,
        description: 'GK plays short to right center back (RCB).',
        nodes: [
          { id: 'n1', label: 'GK', role: 'GK', x: 50, y: 88, team: 'home' },
          { id: 'n2', label: 'LCB', role: 'LB', x: 22, y: 72, team: 'home' },
          { id: 'n3', label: 'RCB', role: 'RB', x: 78, y: 72, team: 'home' },
          { id: 'n4', label: 'PRESS 1', role: 'ST', x: 45, y: 65, team: 'away' },
          { id: 'n5', label: 'PRESS 2', role: 'ST', x: 65, y: 65, team: 'away' }
        ],
        arrows: [
          { id: 'a1', startX: 50, startY: 88, endX: 78, endY: 72, type: 'pass', color: '#10b981' }
        ]
      },
      {
        id: 'k2',
        stepNumber: 2,
        description: 'RCB receives, draws press, and plays split pass to central midfielder.',
        nodes: [
          { id: 'n1', label: 'GK', role: 'GK', x: 50, y: 88, team: 'home' },
          { id: 'n2', label: 'LCB', role: 'LB', x: 22, y: 72, team: 'home' },
          { id: 'n3', label: 'RCB', role: 'RB', x: 78, y: 72, team: 'home' },
          { id: 'n6', label: 'CM', role: 'CM', x: 50, y: 48, team: 'home' },
          { id: 'n4', label: 'PRESS 1', role: 'ST', x: 68, y: 68, team: 'away' }
        ],
        arrows: [
          { id: 'a2', startX: 78, startY: 72, endX: 50, endY: 48, type: 'pass', color: '#3b82f6' }
        ]
      }
    ]
  },
  {
    id: 'drill-2',
    title: '4v4 + 2 Neutral Possession Battle Box',
    category: 'Possession',
    ageGroup: 'U11-U12',
    durationMinutes: 20,
    description: 'High-intensity possession drill in 30x20 yard grid. Encourages rapid 1-2 touch passing and body orientation.',
    coachingPoints: [
      'Open up body shape to see the entire grid before receiving.',
      'Communicate verbally: "Turn!", "Man on!", "Switch!"',
      'Neutral players always play with team in possession.'
    ],
    keyframes: [
      {
        id: 'k1',
        stepNumber: 1,
        description: 'Blue team retains possession with green neutral pivot.',
        nodes: [
          { id: 'n1', label: 'P1', role: 'CM', x: 25, y: 30, team: 'home' },
          { id: 'n2', label: 'P2', role: 'CM', x: 75, y: 30, team: 'home' },
          { id: 'n3', label: 'NEUTRAL', role: 'CAM', x: 50, y: 50, team: 'home' },
          { id: 'n4', label: 'DEF 1', role: 'CB', x: 40, y: 40, team: 'away' }
        ],
        arrows: [
          { id: 'a1', startX: 25, startY: 30, endX: 50, endY: 50, type: 'pass', color: '#10b981' }
        ]
      }
    ]
  }
];
