import { Player, FormationPreset, GameMode, MatchSubShift, PositionRole, PlayingStyle } from '../types';

export interface LineupGeneratorConfig {
  roster: Player[];
  formation: FormationPreset;
  gameMode: GameMode;
  totalDurationMinutes: number; // e.g. 40 or 60
  subIntervalMinutes: number;   // e.g. 8 or 10
  playingStyle: PlayingStyle;
}

export function generateMatchSubPlan(config: LineupGeneratorConfig): MatchSubShift[] {
  const activePlayers = config.roster.filter(p => !p.isAbsent);
  const fieldSpots = config.formation.nodes;
  const numFieldPlayers = fieldSpots.length;

  if (activePlayers.length < numFieldPlayers) {
    // If not enough players, fill what we have
    return [{
      minute: 0,
      period: 1,
      fieldLineup: activePlayers.map((p, idx) => ({
        role: fieldSpots[idx]?.role || 'CM',
        playerId: p.id
      })),
      benchPlayerIds: []
    }];
  }

  const numShifts = Math.max(1, Math.floor(config.totalDurationMinutes / config.subIntervalMinutes));
  const shifts: MatchSubShift[] = [];

  // Track total minutes / shift counts per player
  const playerShiftCount: Record<string, number> = {};
  activePlayers.forEach(p => { playerShiftCount[p.id] = 0; });

  for (let shiftIdx = 0; shiftIdx < numShifts; shiftIdx++) {
    const shiftMinute = shiftIdx * config.subIntervalMinutes;
    const periodNumber = Math.floor((shiftIdx / numShifts) * 2) + 1; // Half 1 or Half 2

    let selectedFieldLineup: { role: PositionRole; playerId: string }[] = [];
    const usedPlayerIds = new Set<string>();

    if (config.gameMode === 'recreation') {
      // --- RECREATION MODE (Equal Minutes & Position Rotation) ---
      // Step 1: Select Goalie for this shift
      const gkSpot = fieldSpots.find(s => s.role === 'GK');
      if (gkSpot) {
        // Find players who prefer GK and have lowest shift counts
        const gkCandidates = activePlayers
          .filter(p => p.preferredPositions.includes('GK'))
          .sort((a, b) => (playerShiftCount[a.id] || 0) - (playerShiftCount[b.id] || 0));

        const gkPlayer = gkCandidates[0] || activePlayers.sort((a, b) => (playerShiftCount[a.id] || 0) - (playerShiftCount[b.id] || 0))[0];
        if (gkPlayer) {
          selectedFieldLineup.push({ role: 'GK', playerId: gkPlayer.id });
          usedPlayerIds.add(gkPlayer.id);
          playerShiftCount[gkPlayer.id] = (playerShiftCount[gkPlayer.id] || 0) + 1;
        }
      }

      // Step 2: Fill remaining field spots prioritize players with LEAST shift minutes
      const nonGkSpots = fieldSpots.filter(s => s.role !== 'GK');
      const availablePlayers = activePlayers
        .filter(p => !usedPlayerIds.has(p.id))
        .sort((a, b) => {
          // Sort by shift count ascending, then by attribute balance
          const diff = (playerShiftCount[a.id] || 0) - (playerShiftCount[b.id] || 0);
          if (diff !== 0) return diff;
          return Math.random() - 0.5; // randomize ties for fair rotation
        });

      nonGkSpots.forEach((spot, i) => {
        const candidate = availablePlayers[i];
        if (candidate) {
          selectedFieldLineup.push({ role: spot.role, playerId: candidate.id });
          usedPlayerIds.add(candidate.id);
          playerShiftCount[candidate.id] = (playerShiftCount[candidate.id] || 0) + 1;
        }
      });

    } else {
      // --- COMPETITIVE MODE (ADP / Travel / Optimal Performance) ---
      // Score each player for each position node
      fieldSpots.forEach(spot => {
        const sortedForSpot = activePlayers
          .filter(p => !usedPlayerIds.has(p.id))
          .sort((a, b) => {
            const scoreA = calculatePlayerPositionScore(a, spot.role, config.playingStyle);
            const scoreB = calculatePlayerPositionScore(b, spot.role, config.playingStyle);
            return scoreB - scoreA;
          });

        const bestPlayer = sortedForSpot[0];
        if (bestPlayer) {
          selectedFieldLineup.push({ role: spot.role, playerId: bestPlayer.id });
          usedPlayerIds.add(bestPlayer.id);
          playerShiftCount[bestPlayer.id] = (playerShiftCount[bestPlayer.id] || 0) + 1;
        }
      });
    }

    const benchPlayerIds = activePlayers.filter(p => !usedPlayerIds.has(p.id)).map(p => p.id);

    shifts.push({
      minute: shiftMinute,
      period: periodNumber,
      fieldLineup: selectedFieldLineup,
      benchPlayerIds: benchPlayerIds
    });
  }

  return shifts;
}

function calculatePlayerPositionScore(player: Player, role: PositionRole, style: PlayingStyle): number {
  let score = 50;

  // Position preference bonus
  const prefIndex = player.preferredPositions.indexOf(role);
  if (prefIndex === 0) score += 35;      // 1st choice
  else if (prefIndex === 1) score += 20; // 2nd choice
  else if (prefIndex === 2) score += 10; // 3rd choice

  // Attribute weights based on role & playing style
  const attrs = player.attributes;

  if (role === 'GK') {
    score += (attrs.defending * 3) + (attrs.stamina * 2);
  } else if (role.includes('CB') || role === 'LB' || role === 'RB') {
    score += (attrs.defending * 4) + (attrs.speed * 2) + (attrs.passing * 2);
    if (style === 'coach-rory') score += (attrs.passing * 3); // Coach Rory build-out from back demands passing CBs!
  } else if (role.includes('M') || role.includes('DM') || role.includes('AM')) {
    score += (attrs.passing * 4) + (attrs.stamina * 3) + (attrs.dribbling * 2);
  } else { // Forwards / Strikers
    score += (attrs.speed * 4) + (attrs.dribbling * 3) + (attrs.passing * 2);
    if (style === 'high-press' || style === 'coach-rory') score += (attrs.stamina * 3); // High press requires high stamina FW
  }

  return score;
}
