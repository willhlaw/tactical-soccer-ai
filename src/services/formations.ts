import { FormationPreset, FormatType } from '../types';

export const FORMATION_PRESETS: FormationPreset[] = [
  // --- 5v5 Formations (U6-U8) ---
  {
    id: '5v5-1-2-1',
    name: '1-2-1 (Diamond)',
    format: '5v5',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: 'GK' },
      { role: 'CB', x: 50, y: 68, label: 'DEF' },
      { role: 'LM', x: 25, y: 48, label: 'L-MID' },
      { role: 'RM', x: 75, y: 48, label: 'R-MID' },
      { role: 'ST', x: 50, y: 22, label: 'FWD' },
    ]
  },
  {
    id: '5v5-2-2',
    name: '2-2 (Box)',
    format: '5v5',
    nodes: [
      { role: 'GK', x: 50, y: 88, label: 'GK' },
      { role: 'LB', x: 30, y: 68, label: 'L-DEF' },
      { role: 'RB', x: 70, y: 68, label: 'R-DEF' },
      { role: 'LW', x: 30, y: 30, label: 'L-FWD' },
      { role: 'RW', x: 70, y: 30, label: 'R-FWD' },
    ]
  },

  // --- 7v7 Formations (U9-U10) ---
  {
    id: '7v7-2-3-1',
    name: '2-3-1 (Coach Rory Favorite)',
    format: '7v7',
    nodes: [
      { role: 'GK', x: 50, y: 90, label: 'GK' },
      { role: 'LB', x: 30, y: 72, label: 'LCB' },
      { role: 'RB', x: 70, y: 72, label: 'RCB' },
      { role: 'LM', x: 20, y: 45, label: 'LM' },
      { role: 'CM', x: 50, y: 48, label: 'CM' },
      { role: 'RM', x: 80, y: 45, label: 'RM' },
      { role: 'ST', x: 50, y: 20, label: 'ST' },
    ]
  },
  {
    id: '7v7-3-2-1',
    name: '3-2-1 (Pyramid)',
    format: '7v7',
    nodes: [
      { role: 'GK', x: 50, y: 90, label: 'GK' },
      { role: 'LB', x: 22, y: 72, label: 'LB' },
      { role: 'CB', x: 50, y: 75, label: 'CB' },
      { role: 'RB', x: 78, y: 72, label: 'RB' },
      { role: 'LM', x: 35, y: 45, label: 'LCM' },
      { role: 'RM', x: 65, y: 45, label: 'RCM' },
      { role: 'ST', x: 50, y: 20, label: 'ST' },
    ]
  },

  // --- 9v9 Formations (U11-U12) ---
  {
    id: '9v9-3-2-3',
    name: '3-2-3 (Coach Rory Favorite)',
    format: '9v9',
    nodes: [
      { role: 'GK', x: 50, y: 90, label: 'GK' },
      { role: 'LB', x: 25, y: 72, label: 'LB' },
      { role: 'CB', x: 50, y: 75, label: 'CB' },
      { role: 'RB', x: 75, y: 72, label: 'RB' },
      { role: 'CDM', x: 38, y: 52, label: 'LCM' },
      { role: 'CAM', x: 62, y: 52, label: 'RCM' },
      { role: 'LW', x: 20, y: 25, label: 'LW' },
      { role: 'ST', x: 50, y: 20, label: 'ST' },
      { role: 'RW', x: 80, y: 25, label: 'RW' },
    ]
  },
  {
    id: '9v9-3-3-2',
    name: '3-3-2 (Balanced)',
    format: '9v9',
    nodes: [
      { role: 'GK', x: 50, y: 90, label: 'GK' },
      { role: 'LB', x: 25, y: 72, label: 'LB' },
      { role: 'CB', x: 50, y: 75, label: 'CB' },
      { role: 'RB', x: 75, y: 72, label: 'RB' },
      { role: 'LM', x: 20, y: 48, label: 'LM' },
      { role: 'CM', x: 50, y: 50, label: 'CM' },
      { role: 'RM', x: 80, y: 48, label: 'RM' },
      { role: 'ST', x: 38, y: 22, label: 'LST' },
      { role: 'ST', x: 62, y: 22, label: 'RST' },
    ]
  },

  // --- 11v11 Formations (U13+) ---
  {
    id: '11v11-4-3-3',
    name: '4-3-3 (Attack)',
    format: '11v11',
    nodes: [
      { role: 'GK', x: 50, y: 90, label: 'GK' },
      { role: 'LB', x: 18, y: 74, label: 'LB' },
      { role: 'LCB', x: 38, y: 76, label: 'LCB' },
      { role: 'RCB', x: 62, y: 76, label: 'RCB' },
      { role: 'RB', x: 82, y: 74, label: 'RB' },
      { role: 'CDM', x: 50, y: 58, label: 'CDM' },
      { role: 'CM', x: 32, y: 45, label: 'LCM' },
      { role: 'CAM', x: 68, y: 45, label: 'RCM' },
      { role: 'LW', x: 20, y: 22, label: 'LW' },
      { role: 'ST', x: 50, y: 18, label: 'ST' },
      { role: 'RW', x: 80, y: 22, label: 'RW' },
    ]
  },
  {
    id: '11v11-4-4-2',
    name: '4-4-2 (Classic)',
    format: '11v11',
    nodes: [
      { role: 'GK', x: 50, y: 90, label: 'GK' },
      { role: 'LB', x: 18, y: 74, label: 'LB' },
      { role: 'LCB', x: 38, y: 76, label: 'LCB' },
      { role: 'RCB', x: 62, y: 76, label: 'RCB' },
      { role: 'RB', x: 82, y: 74, label: 'RB' },
      { role: 'LM', x: 18, y: 46, label: 'LM' },
      { role: 'CM', x: 40, y: 48, label: 'LCM' },
      { role: 'CM', x: 60, y: 48, label: 'RCM' },
      { role: 'RM', x: 82, y: 46, label: 'RM' },
      { role: 'ST', x: 38, y: 20, label: 'LST' },
      { role: 'ST', x: 62, y: 20, label: 'RST' },
    ]
  }
];

export function getFormationsForFormat(format: FormatType): FormationPreset[] {
  return FORMATION_PRESETS.filter(f => f.format === format);
}
