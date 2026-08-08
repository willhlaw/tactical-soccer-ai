import { FormationPreset, FormatType } from '../types';

export const FORMATION_PRESETS: FormationPreset[] = [
  // ================= 5v5 Formations =================
  {
    id: '5v5-diamond',
    name: '1-2-1 Diamond (Balanced)',
    format: '5v5',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'CB', x: 50, y: 70, label: '2' },
      { role: 'LM', x: 25, y: 48, label: '3' },
      { role: 'RM', x: 75, y: 48, label: '4' },
      { role: 'ST', x: 50, y: 22, label: '5' },
    ]
  },
  {
    id: '5v5-box',
    name: '2-2 Box (Solid Defense & Press)',
    format: '5v5',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'LB', x: 30, y: 68, label: '2' },
      { role: 'RB', x: 70, y: 68, label: '3' },
      { role: 'LW', x: 30, y: 30, label: '4' },
      { role: 'RW', x: 70, y: 30, label: '5' },
    ]
  },
  {
    id: '5v5-pyramid',
    name: '2-1-1 Pyramid (Counter Attack)',
    format: '5v5',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'LB', x: 32, y: 72, label: '2' },
      { role: 'RB', x: 68, y: 72, label: '3' },
      { role: 'CM', x: 50, y: 48, label: '4' },
      { role: 'ST', x: 50, y: 22, label: '5' },
    ]
  },
  {
    id: '5v5-attacking-y',
    name: '1-1-2 Attacking Y (High Press)',
    format: '5v5',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'CB', x: 50, y: 72, label: '2' },
      { role: 'CM', x: 50, y: 48, label: '3' },
      { role: 'LW', x: 30, y: 24, label: '4' },
      { role: 'RW', x: 70, y: 24, label: '5' },
    ]
  },

  // ================= 7v7 Formations =================
  {
    id: '7v7-buildout-wide',
    name: '2-3-1 US Soccer Build-Out (Standard)',
    format: '7v7',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'LB', x: 25, y: 72, label: '2' },
      { role: 'RB', x: 75, y: 72, label: '3' },
      { role: 'LM', x: 20, y: 48, label: '4' },
      { role: 'CM', x: 50, y: 48, label: '5' },
      { role: 'RM', x: 80, y: 48, label: '6' },
      { role: 'ST', x: 50, y: 20, label: '7' },
    ]
  },
  {
    id: '7v7-pyramid',
    name: '3-2-1 Defensive Pyramid',
    format: '7v7',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'LB', x: 25, y: 74, label: '2' },
      { role: 'CB', x: 50, y: 74, label: '3' },
      { role: 'RB', x: 75, y: 74, label: '4' },
      { role: 'LM', x: 35, y: 46, label: '5' },
      { role: 'RM', x: 65, y: 46, label: '6' },
      { role: 'ST', x: 50, y: 20, label: '7' },
    ]
  },
  {
    id: '7v7-attacking-split',
    name: '1-3-2 Attacking Split (High Wingers)',
    format: '7v7',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'CB', x: 50, y: 74, label: '2' },
      { role: 'LM', x: 20, y: 50, label: '3' },
      { role: 'CM', x: 50, y: 50, label: '4' },
      { role: 'RM', x: 80, y: 50, label: '5' },
      { role: 'LW', x: 35, y: 22, label: '6' },
      { role: 'RW', x: 65, y: 22, label: '7' },
    ]
  },
  {
    id: '7v7-balanced-pairs',
    name: '2-2-2 Balanced Pairs',
    format: '7v7',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'LB', x: 30, y: 72, label: '2' },
      { role: 'RB', x: 70, y: 72, label: '3' },
      { role: 'LM', x: 30, y: 46, label: '4' },
      { role: 'RM', x: 70, y: 46, label: '5' },
      { role: 'LW', x: 35, y: 22, label: '6' },
      { role: 'RW', x: 65, y: 22, label: '7' },
    ]
  },

  // ================= 9v9 Formations =================
  {
    id: '9v9-high-wingers',
    name: '3-2-3 Balanced Build-Out & High Press',
    format: '9v9',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'LB', x: 20, y: 72, label: '2' },
      { role: 'CB', x: 50, y: 74, label: '3' },
      { role: 'RB', x: 80, y: 72, label: '4' },
      { role: 'CDM', x: 38, y: 52, label: '5' },
      { role: 'CAM', x: 62, y: 52, label: '6' },
      { role: 'LW', x: 20, y: 25, label: '7' },
      { role: 'ST', x: 50, y: 20, label: '8' },
      { role: 'RW', x: 80, y: 25, label: '9' },
    ]
  },
  {
    id: '9v9-332-control',
    name: '3-3-2 Midfield Control Shape',
    format: '9v9',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'LB', x: 22, y: 74, label: '2' },
      { role: 'CB', x: 50, y: 74, label: '3' },
      { role: 'RB', x: 78, y: 74, label: '4' },
      { role: 'LM', x: 20, y: 48, label: '5' },
      { role: 'CM', x: 50, y: 48, label: '6' },
      { role: 'RM', x: 80, y: 48, label: '7' },
      { role: 'ST', x: 38, y: 22, label: '8' },
      { role: 'ST', x: 62, y: 22, label: '9' },
    ]
  },
  {
    id: '9v9-431-solid',
    name: '4-3-1 Back Four Defense',
    format: '9v9',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'LB', x: 18, y: 74, label: '2' },
      { role: 'LCB', x: 38, y: 76, label: '3' },
      { role: 'RCB', x: 62, y: 76, label: '4' },
      { role: 'RB', x: 82, y: 74, label: '5' },
      { role: 'LM', x: 25, y: 48, label: '6' },
      { role: 'CM', x: 50, y: 48, label: '7' },
      { role: 'RM', x: 75, y: 48, label: '8' },
      { role: 'ST', x: 50, y: 22, label: '9' },
    ]
  },
  {
    id: '9v9-242-overload',
    name: '2-4-2 Wingback Overload',
    format: '9v9',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: '1' },
      { role: 'LCB', x: 35, y: 74, label: '2' },
      { role: 'RCB', x: 65, y: 74, label: '3' },
      { role: 'LM', x: 18, y: 48, label: '4' },
      { role: 'CDM', x: 38, y: 52, label: '5' },
      { role: 'CAM', x: 62, y: 52, label: '6' },
      { role: 'RM', x: 82, y: 48, label: '7' },
      { role: 'ST', x: 38, y: 22, label: '8' },
      { role: 'ST', x: 62, y: 22, label: '9' },
    ]
  },

  // ================= 11v11 Formations =================
  {
    id: '11v11-433-attack',
    name: '4-3-3 Modern High Press & Possession',
    format: '11v11',
    nodes: [
      { role: 'GK', x: 50, y: 90, label: '1' },
      { role: 'LB', x: 15, y: 75, label: '2' },
      { role: 'LCB', x: 38, y: 78, label: '3' },
      { role: 'RCB', x: 62, y: 78, label: '4' },
      { role: 'RB', x: 85, y: 75, label: '5' },
      { role: 'CDM', x: 50, y: 58, label: '6' },
      { role: 'CM', x: 32, y: 45, label: '7' },
      { role: 'CAM', x: 68, y: 45, label: '8' },
      { role: 'LW', x: 18, y: 22, label: '9' },
      { role: 'ST', x: 50, y: 18, label: '10' },
      { role: 'RW', x: 82, y: 22, label: '11' },
    ]
  },
  {
    id: '11v11-442-flat',
    name: '4-4-2 Classic Flat Shape',
    format: '11v11',
    nodes: [
      { role: 'GK', x: 50, y: 90, label: '1' },
      { role: 'LB', x: 15, y: 75, label: '2' },
      { role: 'LCB', x: 38, y: 78, label: '3' },
      { role: 'RCB', x: 62, y: 78, label: '4' },
      { role: 'RB', x: 85, y: 75, label: '5' },
      { role: 'LM', x: 18, y: 48, label: '6' },
      { role: 'CM', x: 38, y: 50, label: '7' },
      { role: 'CM', x: 62, y: 50, label: '8' },
      { role: 'RM', x: 82, y: 48, label: '9' },
      { role: 'ST', x: 38, y: 20, label: '10' },
      { role: 'ST', x: 62, y: 20, label: '11' },
    ]
  },
  {
    id: '11v11-4231-pivot',
    name: '4-2-3-1 Double Pivot Control',
    format: '11v11',
    nodes: [
      { role: 'GK', x: 50, y: 90, label: '1' },
      { role: 'LB', x: 15, y: 75, label: '2' },
      { role: 'LCB', x: 38, y: 78, label: '3' },
      { role: 'RCB', x: 62, y: 78, label: '4' },
      { role: 'RB', x: 85, y: 75, label: '5' },
      { role: 'CDM', x: 38, y: 60, label: '6' },
      { role: 'CDM', x: 62, y: 60, label: '7' },
      { role: 'LM', x: 20, y: 38, label: '8' },
      { role: 'CAM', x: 50, y: 38, label: '9' },
      { role: 'RM', x: 80, y: 38, label: '10' },
      { role: 'ST', x: 50, y: 18, label: '11' },
    ]
  },
  {
    id: '11v11-352-wingbacks',
    name: '3-5-2 Wingback Overload',
    format: '11v11',
    nodes: [
      { role: 'GK', x: 50, y: 90, label: '1' },
      { role: 'LCB', x: 28, y: 78, label: '2' },
      { role: 'CB', x: 50, y: 80, label: '3' },
      { role: 'RCB', x: 72, y: 78, label: '4' },
      { role: 'LM', x: 12, y: 48, label: '5' },
      { role: 'CDM', x: 38, y: 55, label: '6' },
      { role: 'CAM', x: 50, y: 42, label: '7' },
      { role: 'CDM', x: 62, y: 55, label: '8' },
      { role: 'RM', x: 88, y: 48, label: '9' },
      { role: 'ST', x: 38, y: 20, label: '10' },
      { role: 'ST', x: 62, y: 20, label: '11' },
    ]
  }
];

export function getFormationsForFormat(format: FormatType): FormationPreset[] {
  return FORMATION_PRESETS.filter(f => f.format === format);
}
