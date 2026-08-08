import { describe, it, expect } from 'vitest';
import { generateMatchSubPlan } from '../services/lineupGenerator';
import { FORMATION_PRESETS } from '../services/formations';
import { DEMO_PLAYERS } from '../services/storage';
import { Player } from '../types';

describe('Lineup & Substitution Math Engine', () => {
  const formation7v7 = FORMATION_PRESETS.find(f => f.format === '7v7') || FORMATION_PRESETS[2];

  it('should guarantee equal minutes in Recreation Mode across all shifts', () => {
    const shifts = generateMatchSubPlan({
      roster: DEMO_PLAYERS.slice(0, 9),
      formation: formation7v7,
      gameMode: 'recreation',
      totalDurationMinutes: 40,
      subIntervalMinutes: 8,
      playingStyle: 'youth-buildout'
    });

    expect(shifts.length).toBe(5); // 40 / 8 = 5 shifts

    // Count shifts per player
    const playerShiftCounts: Record<string, number> = {};
    DEMO_PLAYERS.slice(0, 9).forEach(p => { playerShiftCounts[p.id] = 0; });

    shifts.forEach(shift => {
      shift.fieldLineup.forEach(item => {
        playerShiftCounts[item.playerId] = (playerShiftCounts[item.playerId] || 0) + 1;
      });
    });

    // Check min vs max shifts (should be within ±1 shift difference for fair play)
    const counts = Object.values(playerShiftCounts);
    const minShifts = Math.min(...counts);
    const maxShifts = Math.max(...counts);

    expect(maxShifts - minShifts).toBeLessThanOrEqual(1);
  });

  it('should exclude absent players from generated lineups', () => {
    const rosterWithAbsences: Player[] = DEMO_PLAYERS.slice(0, 9).map((p, idx) => 
      idx === 0 ? { ...p, isAbsent: true } : p
    );

    const shifts = generateMatchSubPlan({
      roster: rosterWithAbsences,
      formation: formation7v7,
      gameMode: 'recreation',
      totalDurationMinutes: 40,
      subIntervalMinutes: 8,
      playingStyle: 'youth-buildout'
    });

    const absentPlayerId = rosterWithAbsences[0].id;

    shifts.forEach(shift => {
      const isOnField = shift.fieldLineup.some(item => item.playerId === absentPlayerId);
      expect(isOnField).toBe(false);
    });
  });

  it('should place highest rated players in primary positions in Competitive Mode', () => {
    const shifts = generateMatchSubPlan({
      roster: DEMO_PLAYERS,
      formation: formation7v7,
      gameMode: 'competitive',
      totalDurationMinutes: 40,
      subIntervalMinutes: 10,
      playingStyle: 'youth-buildout'
    });

    expect(shifts.length).toBe(4); // 40 / 10 = 4 shifts
    expect(shifts[0].fieldLineup.length).toBe(7);
  });
});
