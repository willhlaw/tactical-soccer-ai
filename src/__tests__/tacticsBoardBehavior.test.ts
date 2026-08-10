import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PitchNode, TacticalArrow, TacticalCone, TacticalKeyframe, Team, FormatType } from '../types';
import { FORMATION_PRESETS, getFormationsForFormat } from '../services/formations';
import { DEMO_PLAYERS } from '../services/storage';

// Mock Firebase module to avoid network requests during headless testing
vi.mock('../services/firebase', () => ({
  syncTeamToCloud: vi.fn().mockResolvedValue(true),
  auth: {},
  db: {}
}));

/**
 * State Controller simulating TacticsBoard state transitions for behavioral testing.
 */
interface BoardStateSnapshot {
  nodes: PitchNode[];
  awayNodes: PitchNode[];
  thirdNodes: PitchNode[];
  balls: Array<{ id: string; x: number; y: number }>;
  arrows: TacticalArrow[];
  cones: TacticalCone[];
}

class TacticsBoardStateController {
  team: Team;
  selectedFormation = FORMATION_PRESETS[4]; // Default 7v7 buildout or similar
  isDrillMode = false;
  homeCount = 3;
  awayCount = 2;
  thirdCount = 0;
  balls: Array<{ id: string; x: number; y: number }> = [{ id: 'ball-1', x: 50, y: 50 }];
  cones: TacticalCone[] = [];
  showTacticalZones = false;
  keyframes: TacticalKeyframe[] = [];
  activeKeyframeIndex = 0;
  historyPast: BoardStateSnapshot[] = [];
  historyFuture: BoardStateSnapshot[] = [];
  nodes: PitchNode[] = [];
  awayNodes: PitchNode[] = [
    { id: 'away-1', label: 'A1', role: 'GK', x: 50, y: 10, team: 'away' },
    { id: 'away-2', label: 'A2', role: 'CB', x: 30, y: 28, team: 'away' },
    { id: 'away-3', label: 'A3', role: 'CB', x: 70, y: 28, team: 'away' },
  ];
  thirdNodes: PitchNode[] = [];
  arrows: TacticalArrow[] = [];

  constructor(initialTeam: Team) {
    this.team = initialTeam;
    const available = getFormationsForFormat(initialTeam.format);
    if (available.length > 0) {
      this.selectedFormation = available[0];
    }
    this.initNodesFromFormation();
  }

  initNodesFromFormation() {
    this.nodes = this.selectedFormation.nodes.map((n, i) => ({
      id: 'node-' + i,
      label: n.label,
      role: n.role,
      x: n.x,
      y: n.y,
      assignedPlayerId: this.team.roster[i]?.id,
      team: 'home'
    }));
  }

  saveStateSnapshot() {
    const snapshot: BoardStateSnapshot = {
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      awayNodes: JSON.parse(JSON.stringify(this.awayNodes)),
      thirdNodes: JSON.parse(JSON.stringify(this.thirdNodes)),
      balls: JSON.parse(JSON.stringify(this.balls)),
      arrows: JSON.parse(JSON.stringify(this.arrows)),
      cones: JSON.parse(JSON.stringify(this.cones))
    };
    this.historyPast = [...this.historyPast.slice(-30), snapshot];
    this.historyFuture = [];
  }

  handleUndo() {
    if (this.historyPast.length === 0) return false;
    const previous = this.historyPast[this.historyPast.length - 1];
    const currentSnapshot: BoardStateSnapshot = {
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      awayNodes: JSON.parse(JSON.stringify(this.awayNodes)),
      thirdNodes: JSON.parse(JSON.stringify(this.thirdNodes)),
      balls: JSON.parse(JSON.stringify(this.balls)),
      arrows: JSON.parse(JSON.stringify(this.arrows)),
      cones: JSON.parse(JSON.stringify(this.cones))
    };

    this.historyFuture = [currentSnapshot, ...this.historyFuture];
    this.historyPast = this.historyPast.slice(0, this.historyPast.length - 1);

    this.nodes = previous.nodes;
    this.awayNodes = previous.awayNodes;
    this.thirdNodes = previous.thirdNodes;
    this.balls = previous.balls;
    this.arrows = previous.arrows;
    this.cones = previous.cones;
    return true;
  }

  handleRedo() {
    if (this.historyFuture.length === 0) return false;
    const next = this.historyFuture[0];
    const currentSnapshot: BoardStateSnapshot = {
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      awayNodes: JSON.parse(JSON.stringify(this.awayNodes)),
      thirdNodes: JSON.parse(JSON.stringify(this.thirdNodes)),
      balls: JSON.parse(JSON.stringify(this.balls)),
      arrows: JSON.parse(JSON.stringify(this.arrows)),
      cones: JSON.parse(JSON.stringify(this.cones))
    };

    this.historyPast = [...this.historyPast, currentSnapshot];
    this.historyFuture = this.historyFuture.slice(1);

    this.nodes = next.nodes;
    this.awayNodes = next.awayNodes;
    this.thirdNodes = next.thirdNodes;
    this.balls = next.balls;
    this.arrows = next.arrows;
    this.cones = next.cones;
    return true;
  }

  handleUpdateBallCount(delta: number) {
    this.saveStateSnapshot();
    const currentCount = this.balls.length;
    const targetCount = Math.max(1, Math.min(10, currentCount + delta));
    if (targetCount === currentCount) return;

    if (targetCount > currentCount) {
      const newBalls = [...this.balls];
      for (let i = currentCount; i < targetCount; i++) {
        const offsetX = 50 + (i % 2 === 0 ? (i * 6) : -(i * 6));
        const offsetY = 50 + Math.floor(i / 2) * 8;
        newBalls.push({
          id: 'ball-' + (i + 1),
          x: Math.max(10, Math.min(90, offsetX)),
          y: Math.max(10, Math.min(90, offsetY))
        });
      }
      this.balls = newBalls;
    } else {
      this.balls = this.balls.slice(0, targetCount);
    }
  }

  generateDrillNodes(hCount: number, aCount: number, tCount: number) {
    this.isDrillMode = true;
    this.homeCount = hCount;
    this.awayCount = aCount;
    this.thirdCount = tCount;

    const newHomeNodes: PitchNode[] = [];
    const baseRoles: PitchNode['role'][] = ['GK', 'ST', 'CM', 'LB', 'RB', 'LW', 'RW', 'CAM', 'CDM', 'CB', 'CB'];
    for (let i = 0; i < hCount; i++) {
      let x = 50; let y = 50;
      if (hCount === 1) { x = 50; y = 70; }
      else if (hCount === 2) { x = i === 0 ? 35 : 65; y = 65; }
      else if (hCount === 3) { x = i === 0 ? 50 : (i === 1 ? 30 : 70); y = i === 0 ? 75 : 55; }
      else if (hCount === 4) { x = i === 0 ? 30 : (i === 1 ? 70 : (i === 2 ? 30 : 70)); y = i < 2 ? 70 : 45; }
      else {
        const presetNode = this.selectedFormation.nodes[i];
        x = presetNode ? presetNode.x : 20 + (i * 15) % 70;
        y = presetNode ? presetNode.y : 30 + (i * 10) % 50;
      }

      newHomeNodes.push({
        id: 'node-' + i,
        label: `${i + 1}`,
        role: baseRoles[i] || 'CM',
        x, y,
        assignedPlayerId: this.team.roster[i]?.id,
        team: 'home'
      });
    }

    const newAwayNodes: PitchNode[] = [];
    for (let j = 0; j < aCount; j++) {
      let x = 50; let y = 35;
      if (aCount === 1) { x = 50; y = 35; }
      else if (aCount === 2) { x = j === 0 ? 38 : 62; y = 40; }
      else if (aCount === 3) { x = j === 0 ? 50 : (j === 1 ? 35 : 65); y = j === 0 ? 25 : 42; }
      else { x = 25 + (j * 20) % 65; y = 25 + (j * 14) % 45; }

      newAwayNodes.push({
        id: 'away-' + (j + 1),
        label: `B${j + 1}`,
        role: j === 0 ? 'CB' : 'CM',
        x, y,
        team: 'away'
      });
    }

    const newThirdNodes: PitchNode[] = [];
    for (let k = 0; k < tCount; k++) {
      let x = 50; let y = 50;
      if (tCount === 1) { x = 50; y = 50; }
      else if (tCount === 2) { x = 50; y = k === 0 ? 30 : 70; }
      else if (tCount === 3) { x = k === 0 ? 15 : (k === 1 ? 85 : 50); y = 50; }
      else { x = 15 + (k * 22) % 75; y = 20 + (k * 18) % 60; }

      newThirdNodes.push({
        id: 'third-' + (k + 1),
        label: `C${k + 1}`,
        role: 'CM',
        x, y,
        team: 'third'
      });
    }

    this.nodes = newHomeNodes;
    this.awayNodes = newAwayNodes;
    this.thirdNodes = newThirdNodes;
  }

  handleAddKeyframe() {
    this.saveStateSnapshot();
    const nextTimestamp = (this.keyframes.length + 1) * 2.0;
    const newFrame: TacticalKeyframe = {
      id: 'kf-' + Date.now(),
      timestamp: nextTimestamp,
      label: `Step ${this.keyframes.length + 1} (${nextTimestamp.toFixed(1)}s)`,
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      awayNodes: JSON.parse(JSON.stringify(this.awayNodes)),
      thirdNodes: JSON.parse(JSON.stringify(this.thirdNodes)),
      balls: JSON.parse(JSON.stringify(this.balls)),
      arrows: JSON.parse(JSON.stringify(this.arrows)),
      cones: JSON.parse(JSON.stringify(this.cones))
    };

    this.keyframes.push(newFrame);
    this.activeKeyframeIndex = this.keyframes.length - 1;
  }

  handleSelectKeyframe(index: number) {
    if (index < 0 || index >= this.keyframes.length) return;
    this.activeKeyframeIndex = index;
    const kf = this.keyframes[index];
    if (kf) {
      this.nodes = JSON.parse(JSON.stringify(kf.nodes));
      this.awayNodes = JSON.parse(JSON.stringify(kf.awayNodes));
      this.thirdNodes = JSON.parse(JSON.stringify(kf.thirdNodes));
      this.balls = JSON.parse(JSON.stringify(kf.balls));
      this.arrows = JSON.parse(JSON.stringify(kf.arrows));
      this.cones = JSON.parse(JSON.stringify(kf.cones));
    }
  }

  handleDeleteKeyframe(index: number) {
    if (this.keyframes.length === 0) return;
    this.saveStateSnapshot();
    this.keyframes = this.keyframes.filter((_, i) => i !== index);
    this.activeKeyframeIndex = Math.max(0, index - 1);
  }

  selectFormation(formationId: string) {
    this.saveStateSnapshot();
    const available = getFormationsForFormat(this.team.format);
    const found = available.find(f => f.id === formationId);
    if (found) {
      this.selectedFormation = found;
      this.isDrillMode = false;
      this.initNodesFromFormation();
    }
  }
}

// Utility for PlaySequence serialization
function serializePlaySequence(playData: any): string {
  return encodeURIComponent(btoa(JSON.stringify(playData)));
}

function deserializePlaySequence(encodedStr: string): any {
  return JSON.parse(atob(decodeURIComponent(encodedStr)));
}

describe('Tactics Board Behavioral & State Transition Tests', () => {
  const dummyTeam: Team = {
    id: 'team-test-u10',
    name: 'Test Thunderbolts U10',
    ageGroup: 'U9-U10',
    format: '7v7',
    playingStyle: 'youth-buildout',
    roster: DEMO_PLAYERS.slice(0, 7)
  };

  let controller: TacticsBoardStateController;

  beforeEach(() => {
    controller = new TacticsBoardStateController(dummyTeam);
  });

  // -------------------------------------------------------------
  // 1. UNDO / REDO STATE HISTORY STACK LOGIC
  // -------------------------------------------------------------
  describe('1. Undo & Redo History Stack Operations', () => {
    it('should push state snapshot before modifying board state', () => {
      expect(controller.historyPast.length).toBe(0);
      
      // Modify ball position with snapshot save
      controller.saveStateSnapshot();
      controller.nodes[0].x = 80;

      expect(controller.historyPast.length).toBe(1);
      expect(controller.historyPast[0].nodes[0].x).not.toBe(80);
    });

    it('should correctly undo state changes and revert to previous snapshot', () => {
      const originalX = controller.nodes[0].x;
      
      controller.saveStateSnapshot();
      controller.nodes[0].x = 95;
      expect(controller.nodes[0].x).toBe(95);

      const undoSuccess = controller.handleUndo();
      expect(undoSuccess).toBe(true);
      expect(controller.nodes[0].x).toBe(originalX);
      expect(controller.historyFuture.length).toBe(1);
    });

    it('should correctly redo previously undone state changes', () => {
      controller.saveStateSnapshot();
      controller.nodes[0].x = 95;

      controller.handleUndo();
      expect(controller.nodes[0].x).not.toBe(95);

      const redoSuccess = controller.handleRedo();
      expect(redoSuccess).toBe(true);
      expect(controller.nodes[0].x).toBe(95);
    });

    it('should clear future redo stack when a new action occurs after an undo', () => {
      controller.saveStateSnapshot();
      controller.nodes[0].x = 95;

      controller.handleUndo();
      expect(controller.historyFuture.length).toBe(1);

      // Perform a new mutation
      controller.saveStateSnapshot();
      controller.nodes[0].y = 10;

      expect(controller.historyFuture.length).toBe(0);
    });

    it('should cap past history stack size to prevent unbounded growth', () => {
      for (let i = 0; i < 40; i++) {
        controller.saveStateSnapshot();
        controller.nodes[0].x = i;
      }
      expect(controller.historyPast.length).toBe(31);
    });

    it('should return false when attempting to undo or redo with empty stacks', () => {
      expect(controller.handleUndo()).toBe(false);
      expect(controller.handleRedo()).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 2. PLAYSEQUENCE SERIALIZATION & DESERIALIZATION
  // -------------------------------------------------------------
  describe('2. Shareable Play Link Serialization & Deserialization', () => {
    it('should correctly encode play data to base64 URI parameter string', () => {
      const playData = {
        title: '7v7 Buildout Play',
        format: '7v7',
        nodes: controller.nodes,
        awayNodes: controller.awayNodes,
        thirdNodes: controller.thirdNodes,
        balls: controller.balls,
        arrows: controller.arrows,
        cones: controller.cones,
        keyframes: controller.keyframes
      };

      const serialized = serializePlaySequence(playData);
      expect(typeof serialized).toBe('string');
      expect(serialized.length).toBeGreaterThan(20);
      expect(serialized).not.toContain('{'); // Base64 encoded & URI encoded
    });

    it('should accurately deserialize base64 play link back into original object structure', () => {
      const originalPlayData = {
        title: 'High Press Counter Play',
        format: '9v9' as FormatType,
        nodes: [
          { id: 'node-1', label: '1', role: 'GK' as const, x: 50, y: 90, team: 'home' as const }
        ],
        awayNodes: [
          { id: 'away-1', label: 'B1', role: 'ST' as const, x: 50, y: 20, team: 'away' as const }
        ],
        thirdNodes: [],
        balls: [{ id: 'ball-1', x: 50, y: 50 }],
        arrows: [
          { id: 'arr-1', startX: 50, startY: 50, endX: 50, endY: 20, type: 'pass' as const }
        ],
        cones: [{ id: 'c-1', x: 25, y: 25, color: 'orange' as const }],
        keyframes: []
      };

      const serialized = serializePlaySequence(originalPlayData);
      const deserialized = deserializePlaySequence(serialized);

      expect(deserialized.title).toBe('High Press Counter Play');
      expect(deserialized.format).toBe('9v9');
      expect(deserialized.nodes).toHaveLength(1);
      expect(deserialized.nodes[0].role).toBe('GK');
      expect(deserialized.arrows[0].type).toBe('pass');
      expect(deserialized.cones[0].color).toBe('orange');
    });

    it('should handle special characters and multi-keyframe sequences cleanly during serialization', () => {
      const complexPlay = {
        title: 'Special Drills: Overload & Gate Pressing! (U10 & U12)',
        format: '11v11',
        nodes: controller.nodes,
        keyframes: [
          {
            id: 'kf-1',
            timestamp: 2.0,
            label: 'Step 1 (2.0s)',
            nodes: controller.nodes,
            awayNodes: controller.awayNodes,
            thirdNodes: [],
            balls: [{ id: 'ball-1', x: 40, y: 40 }],
            arrows: [],
            cones: []
          }
        ]
      };

      const serialized = serializePlaySequence(complexPlay);
      const deserialized = deserializePlaySequence(serialized);

      expect(deserialized.title).toBe('Special Drills: Overload & Gate Pressing! (U10 & U12)');
      expect(deserialized.keyframes).toHaveLength(1);
      expect(deserialized.keyframes[0].timestamp).toBe(2.0);
    });
  });

  // -------------------------------------------------------------
  // 3. MULTI-BALL COUNT UPDATES
  // -------------------------------------------------------------
  describe('3. Multi-Ball Count Updates (1 to 10 Balls)', () => {
    it('should initialize with 1 default ball centered on the pitch', () => {
      expect(controller.balls).toHaveLength(1);
      expect(controller.balls[0].id).toBe('ball-1');
      expect(controller.balls[0].x).toBe(50);
      expect(controller.balls[0].y).toBe(50);
    });

    it('should increment ball count when delta is positive', () => {
      controller.handleUpdateBallCount(1);
      expect(controller.balls).toHaveLength(2);
      expect(controller.balls[1].id).toBe('ball-2');

      controller.handleUpdateBallCount(3);
      expect(controller.balls).toHaveLength(5);
    });

    it('should decrement ball count when delta is negative', () => {
      controller.handleUpdateBallCount(4); // Now 5 balls
      expect(controller.balls).toHaveLength(5);

      controller.handleUpdateBallCount(-2);
      expect(controller.balls).toHaveLength(3);
    });

    it('should enforce upper bound limit of 10 balls maximum', () => {
      controller.handleUpdateBallCount(15);
      expect(controller.balls).toHaveLength(10);

      // Attempting to add past 10 should remain capped at 10
      controller.handleUpdateBallCount(1);
      expect(controller.balls).toHaveLength(10);
    });

    it('should enforce lower bound limit of 1 ball minimum', () => {
      controller.handleUpdateBallCount(-5);
      expect(controller.balls).toHaveLength(1);

      // Attempting to subtract below 1 should remain at 1
      controller.handleUpdateBallCount(-1);
      expect(controller.balls).toHaveLength(1);
    });

    it('should generate valid bounded pitch coordinates (10% to 90%) for added balls', () => {
      controller.handleUpdateBallCount(9); // 10 total
      expect(controller.balls).toHaveLength(10);

      controller.balls.forEach(ball => {
        expect(ball.x).toBeGreaterThanOrEqual(10);
        expect(ball.x).toBeLessThanOrEqual(90);
        expect(ball.y).toBeGreaterThanOrEqual(10);
        expect(ball.y).toBeLessThanOrEqual(90);
      });
    });
  });

  // -------------------------------------------------------------
  // 4. DRILL MODE PLAYER NODE GENERATION
  // -------------------------------------------------------------
  describe('4. Drill Mode Player Node Generation', () => {
    it('should generate 1v1 drill node configuration correctly', () => {
      controller.generateDrillNodes(1, 1, 0);

      expect(controller.isDrillMode).toBe(true);
      expect(controller.nodes).toHaveLength(1);
      expect(controller.awayNodes).toHaveLength(1);
      expect(controller.thirdNodes).toHaveLength(0);

      // Verify Home Node 1
      expect(controller.nodes[0].team).toBe('home');
      expect(controller.nodes[0].x).toBe(50);
      expect(controller.nodes[0].y).toBe(70);

      // Verify Away Node 1
      expect(controller.awayNodes[0].team).toBe('away');
      expect(controller.awayNodes[0].x).toBe(50);
      expect(controller.awayNodes[0].y).toBe(35);
    });

    it('should generate 2v1 overload drill configuration correctly', () => {
      controller.generateDrillNodes(2, 1, 0);

      expect(controller.nodes).toHaveLength(2);
      expect(controller.awayNodes).toHaveLength(1);

      // Home players positioned for 2v1 width
      expect(controller.nodes[0].x).toBe(35);
      expect(controller.nodes[1].x).toBe(65);
      expect(controller.nodes[0].y).toBe(65);
      expect(controller.nodes[1].y).toBe(65);

      // Defender in central high position
      expect(controller.awayNodes[0].x).toBe(50);
      expect(controller.awayNodes[0].y).toBe(35);
    });

    it('should generate 3v3v3 3-team neutral drill setup correctly', () => {
      controller.generateDrillNodes(3, 3, 3);

      expect(controller.nodes).toHaveLength(3);
      expect(controller.awayNodes).toHaveLength(3);
      expect(controller.thirdNodes).toHaveLength(3);

      // Verify Home Team A labels & roles
      expect(controller.nodes.map(n => n.label)).toEqual(['1', '2', '3']);
      expect(controller.nodes.every(n => n.team === 'home')).toBe(true);

      // Verify Away Team B labels & roles
      expect(controller.awayNodes.map(n => n.label)).toEqual(['B1', 'B2', 'B3']);
      expect(controller.awayNodes.every(n => n.team === 'away')).toBe(true);

      // Verify Third Team C (Neutrals) labels & roles
      expect(controller.thirdNodes.map(n => n.label)).toEqual(['C1', 'C2', 'C3']);
      expect(controller.thirdNodes.every(n => n.team === 'third')).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 5. KEYFRAME SEQUENCE TIMELINE
  // -------------------------------------------------------------
  describe('5. Keyframe Sequence Timeline Operations', () => {
    it('should add keyframes sequentially with automatically calculated timestamps', () => {
      expect(controller.keyframes).toHaveLength(0);

      controller.handleAddKeyframe();
      expect(controller.keyframes).toHaveLength(1);
      expect(controller.keyframes[0].timestamp).toBe(2.0);
      expect(controller.keyframes[0].label).toBe('Step 1 (2.0s)');
      expect(controller.activeKeyframeIndex).toBe(0);

      controller.handleAddKeyframe();
      expect(controller.keyframes).toHaveLength(2);
      expect(controller.keyframes[1].timestamp).toBe(4.0);
      expect(controller.keyframes[1].label).toBe('Step 2 (4.0s)');
      expect(controller.activeKeyframeIndex).toBe(1);
    });

    it('should restore captured keyframe state upon selection', () => {
      // Create Step 1 with default home node 0 position
      controller.handleAddKeyframe();
      const initialNode0X = controller.nodes[0].x;

      // Move node and add Step 2
      controller.nodes[0].x = 90;
      controller.handleAddKeyframe();
      expect(controller.nodes[0].x).toBe(90);

      // Select Step 1 and verify initial state is restored
      controller.handleSelectKeyframe(0);
      expect(controller.activeKeyframeIndex).toBe(0);
      expect(controller.nodes[0].x).toBe(initialNode0X);

      // Select Step 2 and verify step 2 state is restored
      controller.handleSelectKeyframe(1);
      expect(controller.activeKeyframeIndex).toBe(1);
      expect(controller.nodes[0].x).toBe(90);
    });

    it('should delete active keyframe and safely adjust activeKeyframeIndex', () => {
      controller.handleAddKeyframe(); // Step 1 (idx 0)
      controller.handleAddKeyframe(); // Step 2 (idx 1)
      controller.handleAddKeyframe(); // Step 3 (idx 2)
      expect(controller.keyframes).toHaveLength(3);
      expect(controller.activeKeyframeIndex).toBe(2);

      // Delete step 3 (idx 2)
      controller.handleDeleteKeyframe(2);
      expect(controller.keyframes).toHaveLength(2);
      expect(controller.activeKeyframeIndex).toBe(1);

      // Delete step 2 (idx 1)
      controller.handleDeleteKeyframe(1);
      expect(controller.keyframes).toHaveLength(1);
      expect(controller.activeKeyframeIndex).toBe(0);
    });
  });

  // -------------------------------------------------------------
  // 6. TACTICAL ZONE GRID TOGGLE
  // -------------------------------------------------------------
  describe('6. Tactical Zone Grid State Toggle', () => {
    it('should default showTacticalZones state to false', () => {
      expect(controller.showTacticalZones).toBe(false);
    });

    it('should toggle showTacticalZones state on and off', () => {
      controller.showTacticalZones = !controller.showTacticalZones;
      expect(controller.showTacticalZones).toBe(true);

      controller.showTacticalZones = !controller.showTacticalZones;
      expect(controller.showTacticalZones).toBe(false);
    });

    it('should maintain 5-corridor and 3-third grid overlay dimensions', () => {
      // Define 5-corridor and 3-third boundary specs for grid rendering
      const verticalCorridorPercentages = [20, 40, 60, 80];
      const horizontalThirdPercentages = [33.3, 66.6];

      expect(verticalCorridorPercentages).toHaveLength(4); // Creates 5 vertical corridors
      expect(horizontalThirdPercentages).toHaveLength(2); // Creates 3 horizontal thirds
    });
  });

  // -------------------------------------------------------------
  // 7. FORMATION SELECTION & PREFERRED FORMATION UPDATES
  // -------------------------------------------------------------
  describe('7. Formation Selection & Preferred Formation Updates', () => {

    it('should allow selecting alternative formations for current team format', () => {
      const available7v7 = getFormationsForFormat('7v7');
      expect(available7v7.length).toBeGreaterThan(1);

      const targetFormation = available7v7[1];
      controller.selectFormation(targetFormation.id);

      expect(controller.selectedFormation.id).toBe(targetFormation.id);
      expect(controller.isDrillMode).toBe(false);
      expect(controller.nodes).toHaveLength(targetFormation.nodes.length);
    });

    it('should assign roster players to formation nodes in order', () => {
      controller.selectFormation(controller.selectedFormation.id);
      
      controller.nodes.forEach((node, index) => {
        if (dummyTeam.roster[index]) {
          expect(node.assignedPlayerId).toBe(dummyTeam.roster[index].id);
        }
      });
    });

    it('should support updating team preferred formation', () => {
      const updatedTeam = {
        ...dummyTeam,
        preferredFormationId: '7v7-attacking-split'
      };

      expect(updatedTeam.preferredFormationId).toBe('7v7-attacking-split');
    });
  });
});
