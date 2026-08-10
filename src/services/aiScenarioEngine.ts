import { PitchNode, TacticalArrow, TacticalCone, FormatType } from '../types';

export interface AIScenarioResult {
  title: string;
  description: string;
  isDrillMode: boolean;
  homeCount: number;
  awayCount: number;
  thirdCount: number;
  nodes: PitchNode[];
  awayNodes: PitchNode[];
  thirdNodes: PitchNode[];
  arrows: TacticalArrow[];
  cones: TacticalCone[];
  balls: Array<{ id: string; x: number; y: number }>;
  keyframes?: any[];
}

/**
 * 5-Sequence Preset: Right-Wing Overlap & Box Entry Attack
 */
export function getRightWingOverlapAttackPlay(): AIScenarioResult {
  const initialNodes: PitchNode[] = [
    { id: 'cm-1', label: 'CM', role: 'CM', x: 50, y: 50, team: 'home' },
    { id: 'rw-1', label: 'RW', role: 'RW', x: 80, y: 45, team: 'home' },
    { id: 'st-1', label: 'ST', role: 'ST', x: 50, y: 20, team: 'home' },
    { id: 'gk-1', label: 'GK', role: 'GK', x: 50, y: 90, team: 'home' },
    { id: 'lb-1', label: 'LB', role: 'LB', x: 25, y: 70, team: 'home' },
    { id: 'rb-1', label: 'RB', role: 'RB', x: 75, y: 70, team: 'home' },
  ];

  const keyframe1 = {
    id: 'seq-1',
    timestamp: 0.0,
    label: 'Seq 1: CM Through Pass to RW',
    nodes: initialNodes.map(n => {
      if (n.role === 'CM') return { ...n, y: 35 }; // CM runs up to 30-yard offensive end
      if (n.role === 'ST') return { ...n, y: 15 }; // ST moves slightly in front of goal
      if (n.role === 'RW') return { ...n, x: 82, y: 30 }; // RW runs on to ball
      return n;
    }),
    awayNodes: [],
    thirdNodes: [],
    balls: [{ id: 'ball-1', x: 82, y: 30 }],
    arrows: [
      { id: 'a1', startX: 50, startY: 50, endX: 82, endY: 30, type: 'pass' as const },
      { id: 'a2', startX: 80, startY: 45, endX: 82, endY: 30, type: 'run' as const }
    ],
    cones: []
  };

  const keyframe2 = {
    id: 'seq-2',
    timestamp: 2.0,
    label: 'Seq 2: RW Dribbles to End Line',
    nodes: initialNodes.map(n => {
      if (n.role === 'RW') return { ...n, x: 85, y: 15 }; // RW dribbles close to end line
      if (n.role === 'CM') return { ...n, x: 50, y: 25 }; // CM runs to edge of 18-yard box
      if (n.role === 'ST') return { ...n, x: 45, y: 12 };
      return n;
    }),
    awayNodes: [],
    thirdNodes: [],
    balls: [{ id: 'ball-1', x: 85, y: 15 }],
    arrows: [
      { id: 'a3', startX: 82, startY: 30, endX: 85, endY: 15, type: 'dribble' as const },
      { id: 'a4', startX: 50, startY: 35, endX: 50, endY: 25, type: 'run' as const }
    ],
    cones: []
  };

  const keyframe3 = {
    id: 'seq-3',
    timestamp: 4.0,
    label: 'Seq 3: Cutback Pass to CM at 18yd Box',
    nodes: initialNodes.map(n => {
      if (n.role === 'RW') return { ...n, x: 85, y: 15 };
      if (n.role === 'CM') return { ...n, x: 50, y: 25 };
      if (n.role === 'ST') return { ...n, x: 40, y: 10 };
      return n;
    }),
    awayNodes: [],
    thirdNodes: [],
    balls: [{ id: 'ball-1', x: 50, y: 25 }],
    arrows: [
      { id: 'a5', startX: 85, startY: 15, endX: 50, endY: 25, type: 'pass' as const }
    ],
    cones: []
  };

  const keyframe4 = {
    id: 'seq-4',
    timestamp: 6.0,
    label: 'Seq 4: CM Shoots at Goal',
    nodes: initialNodes.map(n => {
      if (n.role === 'CM') return { ...n, x: 50, y: 23 };
      if (n.role === 'ST') return { ...n, x: 38, y: 10 };
      if (n.role === 'RW') return { ...n, x: 80, y: 15 };
      return n;
    }),
    awayNodes: [],
    thirdNodes: [],
    balls: [{ id: 'ball-1', x: 50, y: 12 }],
    arrows: [
      { id: 'a6', startX: 50, startY: 23, endX: 50, endY: 2, type: 'shot' as const }
    ],
    cones: []
  };

  const keyframe5 = {
    id: 'seq-5',
    timestamp: 8.0,
    label: 'Seq 5: GOAL! (Ball in Net)',
    nodes: initialNodes.map(n => {
      if (n.role === 'CM') return { ...n, x: 50, y: 20 };
      if (n.role === 'ST') return { ...n, x: 35, y: 10 };
      if (n.role === 'RW') return { ...n, x: 75, y: 15 };
      return n;
    }),
    awayNodes: [],
    thirdNodes: [],
    balls: [{ id: 'ball-1', x: 50, y: 2 }],
    arrows: [],
    cones: []
  };

  return {
    title: 'Right-Wing Overlap & Box Entry Attack',
    description: '5-Sequence Tactical Attack: CM through ball -> RW wing run -> Cutback to 18yd box -> CM Shot -> GOAL!',
    isDrillMode: false,
    homeCount: 6,
    awayCount: 0,
    thirdCount: 0,
    nodes: initialNodes,
    awayNodes: [],
    thirdNodes: [],
    arrows: [
      { id: 'a1', startX: 50, startY: 50, endX: 82, endY: 30, type: 'pass' }
    ],
    cones: [],
    balls: [{ id: 'ball-1', x: 50, y: 50 }],
    keyframes: [keyframe1, keyframe2, keyframe3, keyframe4, keyframe5]
  };
}

export function generateAIScenario(prompt: string, format: FormatType = '11v11'): AIScenarioResult {
  const clean = prompt.toLowerCase();

  // Parse Player Counts (e.g. 3v2, 4v4, 4v2, 3v3v3, 1v1)
  let homeCount = 4;
  let awayCount = 2;
  let thirdCount = 0;
  let isDrill = true;

  const match3v3v3 = clean.match(/(\d+)v(\d+)v(\d+)/);
  const match2Way = clean.match(/(\d+)\s*v\s*(\d+)/);

  if (match3v3v3) {
    homeCount = parseInt(match3v3v3[1], 10);
    awayCount = parseInt(match3v3v3[2], 10);
    thirdCount = parseInt(match3v3v3[3], 10);
  } else if (match2Way) {
    homeCount = parseInt(match2Way[1], 10);
    awayCount = parseInt(match2Way[2], 10);
    if (clean.includes('neutral') || clean.includes('bumper') || clean.includes('3rd team')) {
      thirdCount = 2;
    }
  } else if (clean.includes('rondo')) {
    homeCount = 4;
    awayCount = 2;
  } else if (clean.includes('build out') || clean.includes('build-out') || clean.includes('high press')) {
    isDrill = false;
    homeCount = 6;
    awayCount = 5;
  }

  // Parse Ball Count
  let ballCount = 1;
  const ballMatch = clean.match(/(\d+)\s*ball/);
  if (ballMatch) {
    ballCount = Math.min(10, Math.max(1, parseInt(ballMatch[1], 10)));
  } else if (clean.includes('multi ball') || clean.includes('two balls') || clean.includes('2 balls')) {
    ballCount = 2;
  }

  // Generate Cones 🔶 based on prompt keywords
  const cones: TacticalCone[] = [];
  if (clean.includes('box') || clean.includes('rondo') || clean.includes('grid') || clean.includes('square')) {
    cones.push(
      { id: 'c1', x: 25, y: 25, color: 'orange' },
      { id: 'c2', x: 75, y: 25, color: 'orange' },
      { id: 'c3', x: 25, y: 75, color: 'orange' },
      { id: 'c4', x: 75, y: 75, color: 'orange' }
    );
  } else if (clean.includes('gate') || clean.includes('channel') || clean.includes('target')) {
    cones.push(
      { id: 'g1-l', x: 20, y: 35, color: 'yellow' },
      { id: 'g1-r', x: 20, y: 45, color: 'yellow' },
      { id: 'g2-l', x: 80, y: 35, color: 'yellow' },
      { id: 'g2-r', x: 80, y: 45, color: 'yellow' }
    );
  } else if (clean.includes('slalom') || clean.includes('dribble') || clean.includes('cone')) {
    cones.push(
      { id: 's1', x: 50, y: 80, color: 'red' },
      { id: 's2', x: 50, y: 65, color: 'orange' },
      { id: 's3', x: 50, y: 50, color: 'yellow' },
      { id: 's4', x: 50, y: 35, color: 'blue' }
    );
  }

  // Generate Home Nodes (Team A Blue 🔵)
  const homeNodes: PitchNode[] = [];
  const baseRoles: PitchNode['role'][] = ['GK', 'ST', 'CM', 'LB', 'RB', 'LW', 'RW', 'CAM', 'CDM', 'CB', 'CB'];
  for (let i = 0; i < homeCount; i++) {
    let x = 50; let y = 50;
    if (homeCount === 1) {
      x = 50; y = 70;
    } else if (homeCount === 2) {
      x = i === 0 ? 35 : 65; y = 65;
    } else if (homeCount === 3) {
      x = i === 0 ? 50 : (i === 1 ? 30 : 70); y = i === 0 ? 75 : 55;
    } else if (homeCount === 4) {
      // Rondo square layout
      x = i === 0 ? 30 : (i === 1 ? 70 : (i === 2 ? 30 : 70));
      y = i < 2 ? 75 : 35;
    } else {
      x = 20 + (i * 15) % 70;
      y = 30 + (i * 12) % 55;
    }

    homeNodes.push({
      id: 'node-' + i,
      label: `${i + 1}`,
      role: baseRoles[i] || 'CM',
      x, y,
      team: 'home'
    });
  }

  // Generate Away Nodes (Team B Red 🔴)
  const awayNodes: PitchNode[] = [];
  for (let j = 0; j < awayCount; j++) {
    let x = 50; let y = 35;
    if (awayCount === 1) {
      x = 50; y = 45;
    } else if (awayCount === 2) {
      x = j === 0 ? 42 : 58; y = 50;
    } else if (awayCount === 3) {
      x = j === 0 ? 50 : (j === 1 ? 35 : 65); y = j === 0 ? 30 : 50;
    } else {
      x = 25 + (j * 18) % 65;
      y = 25 + (j * 14) % 45;
    }

    awayNodes.push({
      id: 'away-' + (j + 1),
      label: `B${j + 1}`,
      role: j === 0 ? 'CB' : 'CM',
      x, y,
      team: 'away'
    });
  }

  // Generate 3rd Team Nodes (Team C Gold 🟡)
  const thirdNodes: PitchNode[] = [];
  for (let k = 0; k < thirdCount; k++) {
    let x = 50; let y = 50;
    if (thirdCount === 1) {
      x = 50; y = 50;
    } else if (thirdCount === 2) {
      x = 50; y = k === 0 ? 30 : 70;
    } else {
      x = 15 + (k * 22) % 75;
      y = 20 + (k * 18) % 60;
    }

    thirdNodes.push({
      id: 'third-' + (k + 1),
      label: `C${k + 1}`,
      role: 'CM',
      x, y,
      team: 'third'
    });
  }

  // Generate Tactical Vector Arrows ↗️
  const arrows: TacticalArrow[] = [];
  if (homeNodes.length >= 2) {
    arrows.push({
      id: 'a1',
      startX: homeNodes[0].x,
      startY: homeNodes[0].y,
      endX: homeNodes[1].x,
      endY: homeNodes[1].y,
      type: 'pass'
    });
  }

  if (homeNodes.length >= 3) {
    arrows.push({
      id: 'a2',
      startX: homeNodes[1].x,
      startY: homeNodes[1].y,
      endX: homeNodes[2].x,
      endY: homeNodes[2].y,
      type: 'run'
    });
  }

  if (clean.includes('shot') || clean.includes('finish') || clean.includes('counter')) {
    arrows.push({
      id: 'a3',
      startX: homeNodes[0].x,
      startY: homeNodes[0].y,
      endX: 50,
      endY: 15,
      type: 'shot'
    });
  }

  // Generate Balls ⚽
  const balls: Array<{ id: string; x: number; y: number }> = [];
  for (let b = 0; b < ballCount; b++) {
    balls.push({
      id: 'ball-' + (b + 1),
      x: 50 + (b % 2 === 0 ? b * 6 : -b * 6),
      y: 52 + Math.floor(b / 2) * 6
    });
  }

  // AI Generated Title Formatting
  let title = prompt.length > 40 ? prompt.substring(0, 38) + '...' : prompt;
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    title: `AI Scenario: ${title}`,
    description: `Auto-generated by TacticalSoccer AI engine for ${homeCount}v${awayCount}${thirdCount > 0 ? `v${thirdCount}` : ''} scenario with ${cones.length} cones and ${ballCount} ball(s).`,
    isDrillMode: isDrill,
    homeCount,
    awayCount,
    thirdCount,
    nodes: homeNodes,
    awayNodes,
    thirdNodes,
    arrows,
    cones,
    balls
  };
}
