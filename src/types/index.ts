export type AgeGroup = 'U6-U8' | 'U9-U10' | 'U11-U12' | 'U13+';
export type FormatType = '5v5' | '7v7' | '9v9' | '11v11';

export type PositionRole = 
  | 'GK' 
  | 'CB' | 'LB' | 'RB' | 'LCB' | 'RCB'
  | 'CM' | 'CDM' | 'CAM' | 'LM' | 'RM'
  | 'ST' | 'CF' | 'LW' | 'RW' | 'FW';

export interface PlayerAttributes {
  speed: number;       // 1-10
  dribbling: number;   // 1-10
  passing: number;     // 1-10
  stamina: number;     // 1-10
  defending: number;   // 1-10
}

export interface Player {
  id: string;
  name: string;
  number: number;
  isAbsent: boolean;
  absenceReason?: string;
  preferredPositions: PositionRole[];
  attributes: PlayerAttributes;
  notes?: string;
  avatarColor?: string;
}

export type PlayingStyle = 
  | 'youth-buildout'   // Build-up play, 3-2-3 / 2-3-1, trigger press, play-practice-play
  | 'positional-play'  // Guardiola / Tiki-Taka half-space overloads
  | 'high-press'       // Gegenpressing rapid vertical transitions
  | 'low-block'        // Compact defensive rigor & counter-attacks
  | 'custom';          // Custom prompt-defined philosophy

export type TeamRole = 'coach' | 'assistant_coach' | 'manager' | 'communications' | 'parent';

export interface TeamMember {
  uid: string;
  email: string;
  displayName: string;
  role: TeamRole;
  joinedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  teamIds: string[];
  activeTeamId: string;
}

export interface Team {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  format: FormatType;
  playingStyle: PlayingStyle;
  customStyleNotes?: string;
  preferredFormationId?: string;
  roster: Player[];
  ownerId?: string;
  inviteCode?: string;
  members?: TeamMember[];
}

export interface PitchNode {
  id: string;
  label: string;
  role: PositionRole;
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
  assignedPlayerId?: string;
  team: 'home' | 'away' | 'third';
}

export interface TacticalCone {
  id: string;
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
  color: 'orange' | 'yellow' | 'blue' | 'red';
}

export interface TacticalArrow {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: 'pass' | 'run' | 'dribble' | 'shot';
  color?: string;
}

export interface FormationPreset {
  id: string;
  name: string;
  format: FormatType;
  nodes: { role: PositionRole; x: number; y: number; label: string }[];
}

export type GameMode = 'recreation' | 'competitive';

export interface MatchSubShift {
  shiftIndex: number;
  startTime: number;
  endTime: number;
  minute: number;
  period: number;
  fieldLineup: { role: PositionRole; playerId: string }[];
  benchPlayerIds: string[];
}

export interface DrillKeyframe {
  id: string;
  stepNumber: number;
  description: string;
  nodes: PitchNode[];
  arrows: TacticalArrow[];
}

export interface Drill {
  id: string;
  title: string;
  category: 'Passing' | 'Possession' | 'Shooting' | 'Defending' | 'Small-Sided Game';
  ageGroup: AgeGroup;
  durationMinutes: number;
  description: string;
  coachingPoints: string[];
  keyframes: DrillKeyframe[];
  isCustom?: boolean;
}

export interface TacticalKeyframe {
  id: string;
  timestamp: number; // in seconds (0.0, 2.0, 4.0)
  label: string; // e.g. "Sequence 1", "Sequence 2"
  nodes: PitchNode[];
  awayNodes: PitchNode[];
  thirdNodes: PitchNode[];
  balls: Array<{ id: string; x: number; y: number }>;
  arrows: TacticalArrow[];
  cones: TacticalCone[];
}

export interface TacticalScenario {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  format: FormatType;
  formationName: string;
  isDrillMode: boolean;
  homeCount: number;
  awayCount: number;
  thirdCount: number;
  nodes: PitchNode[];
  awayNodes: PitchNode[];
  thirdNodes: PitchNode[];
  arrows: TacticalArrow[];
  cones: TacticalCone[];
  ballPos: { x: number; y: number };
  balls?: Array<{ id: string; x: number; y: number }>;
  keyframes?: TacticalKeyframe[];
}

export interface AICoachMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'apply_formation' | 'apply_sub_matrix' | 'update_profile' | 'add_drill';
    payload: any;
  };
}
