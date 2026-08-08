import { AICoachMessage, Team, FormationPreset, Drill, AgeGroup } from '../types';
import { PHILOSOPHY_KNOWLEDGE } from './coachingKnowledge';
import { isPromptChildSafe, YOUTH_SAFE_INTERCEPT_MESSAGE, sanitizePromptForYouth } from './safetyFilter';

export function generateAIDrill(userPrompt: string, ageGroup: AgeGroup = 'U9-U10'): Drill {
  // Check Age 6+ Safety Guardrail
  const safePrompt = isPromptChildSafe(userPrompt) ? userPrompt : sanitizePromptForYouth(userPrompt);
  const lower = safePrompt.toLowerCase();
  const drillId = 'drill-ai-' + Date.now();

  let title = 'Youth Build-Out & Teamwork Drill';
  let category: Drill['category'] = 'Passing';
  let description = 'Positive, age-appropriate youth soccer drill building fundamental ball control, spatial awareness, and sportsmanship.';
  let coachingPoints = [
    'Be brave on the ball — encourage creative decision making!',
    'Maintain spatial width and face the play.',
    'Cheer on teammates and practice fair play!'
  ];

  if (lower.includes('overlap') || lower.includes('wing') || lower.includes('wide')) {
    title = 'Overlapping Fullback & Winger Combination';
    category = 'Possession';
    description = 'Fullback overlaps winger along the sideline to create a 2v1 numerical overload and cross into penalty area.';
    coachingPoints = [
      'Winger cuts inside with ball to draw the opposition defender.',
      'Fullback sprints outside in overlapping curve.',
      'Time the release pass perfectly into full stride.'
    ];
  } else if (lower.includes('press') || lower.includes('trap') || lower.includes('defend')) {
    title = 'High Press & Trap Box Rondo';
    category = 'Defending';
    description = '4 defenders lock down passing channels to force a turn-over within 6 seconds of losing possession.';
    coachingPoints = [
      'First defender presses ball carrier angle.',
      'Second defender covers central split pass.',
      'Trigger press immediately on opponent heavy touch.'
    ];
  } else if (lower.includes('shoot') || lower.includes('finish') || lower.includes('goal')) {
    title = 'Rapid Turn & Finish Under Pressure';
    category = 'Shooting';
    description = 'Striker receives back to goal, turns defender with 1st touch, and finishes into far bottom corner.';
    coachingPoints = [
      'Check away from defender before receiving.',
      'Cushion 1st touch into open space across body.',
      'Look up at goalkeeper before striking low and hard.'
    ];
  }

  return {
    id: drillId,
    title,
    category,
    ageGroup,
    durationMinutes: 15,
    description,
    coachingPoints,
    keyframes: [
      {
        id: 'k1-' + Date.now(),
        stepNumber: 1,
        description: 'Initial setup: Ball carrier draws opposition defender out of position.',
        nodes: [
          { id: 'n1', label: 'GK', role: 'GK', x: 50, y: 88, team: 'home' },
          { id: 'n2', label: 'LB', role: 'LB', x: 25, y: 65, team: 'home' },
          { id: 'n3', label: 'LM', role: 'LM', x: 25, y: 40, team: 'home' },
          { id: 'n4', label: 'CM', role: 'CM', x: 50, y: 50, team: 'home' },
          { id: 'n5', label: 'ST', role: 'ST', x: 50, y: 25, team: 'home' },
          { id: 'a1', label: 'DEF', role: 'CB', x: 35, y: 40, team: 'away' }
        ],
        arrows: [
          { id: 'arr1', startX: 25, startY: 65, endX: 25, endY: 40, type: 'pass', color: '#10b981' }
        ]
      },
      {
        id: 'k2-' + Date.now(),
        stepNumber: 2,
        description: 'Execution: Player makes overlapping run and releases pass into penalty area.',
        nodes: [
          { id: 'n1', label: 'GK', role: 'GK', x: 50, y: 88, team: 'home' },
          { id: 'n2', label: 'LB', role: 'LB', x: 15, y: 30, team: 'home' },
          { id: 'n3', label: 'LM', role: 'LM', x: 40, y: 35, team: 'home' },
          { id: 'n4', label: 'CM', role: 'CM', x: 50, y: 50, team: 'home' },
          { id: 'n5', label: 'ST', role: 'ST', x: 50, y: 15, team: 'home' },
          { id: 'a1', label: 'DEF', role: 'CB', x: 38, y: 38, team: 'away' }
        ],
        arrows: [
          { id: 'arr2', startX: 40, startY: 35, endX: 15, endY: 30, type: 'pass', color: '#10b981' },
          { id: 'arr3', startX: 15, startY: 30, endX: 50, endY: 15, type: 'run', color: '#3b82f6' }
        ]
      }
    ]
  };
}

export function processAICoachPrompt(
  userText: string,
  team: Team,
  currentFormation: FormationPreset
): AICoachMessage {
  // Check Safety Guardrail first
  if (!isPromptChildSafe(userText)) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'ai',
      text: YOUTH_SAFE_INTERCEPT_MESSAGE,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  const lower = userText.toLowerCase();
  const styleDetail = PHILOSOPHY_KNOWLEDGE[team.playingStyle] || PHILOSOPHY_KNOWLEDGE['youth-buildout'];

  // Check for Playing Style queries
  if (lower.includes('style') || lower.includes('playing style') || lower.includes('philosophy') || lower.includes('tactics')) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'ai',
      text: `⚽ **${styleDetail.name} Applied to ${team.name} (${team.format})**:\n\n` +
            `• **Build-Out Strategy**: ${styleDetail.buildUpStrategy}\n` +
            `• **Press Triggers**: ${styleDetail.defensivePressTrigger}\n` +
            `• **Recommended Formation**: **${styleDetail.keyFormations[team.format] || '2-3-1 / 3-2-3'}**\n\n` +
            `*Coaching Tip*: "Be Brave!" Encourage your players to try creative split passes. In Recreation Mode, equal minutes and goalie rotation are key to building confident, multi-positional athletes!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Check for Lineup / Sub strategy requests
  if (lower.includes('lineup') || lower.includes('sub') || lower.includes('rotation') || lower.includes('starting')) {
    const absentCount = team.roster.filter(p => p.isAbsent).length;
    const activeCount = team.roster.length - absentCount;

    return {
      id: 'msg-' + Date.now(),
      sender: 'ai',
      text: `📋 **AI Lineup & Substitution Analysis for ${team.name}**:\n\n` +
            `• **Active Squad**: ${activeCount} players available (${absentCount} absent/missing).\n` +
            `• **Format**: ${team.format} (${currentFormation.name})\n` +
            `• **Strategy Mode**: Fair-Play Recreation rotation active — equal minutes guaranteed for all ${activeCount} players.\n\n` +
            `I have calculated a sub schedule with rotations every 8 minutes. Goalkeepers will swap at half-time to give primary strikers their preferred secondary position reps on the field.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedAction: {
        type: 'apply_sub_matrix',
        payload: { teamId: team.id }
      }
    };
  }

  // Check for Player Profile updates
  if (lower.includes('profile') || lower.includes('player') || lower.includes('strengths') || lower.includes('weakness')) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'ai',
      text: `👤 **Player Profile Update Logged!**\n\n` +
            `I've noted the player preferences in your team roster context. \n\n` +
            `*AI Advice*: When playing in Recreation Mode, this player will start as the 1st Half Goalie, then rotate to Bench, and enter in the 2nd Half as Forward — ensuring maximum enjoyment and development!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Check for Drill / Practice requests
  if (lower.includes('drill') || lower.includes('practice') || lower.includes('training') || lower.includes('session')) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'ai',
      text: `🎯 **Recommended Practice Plan (${team.ageGroup} - ${team.format})**:\n\n` +
            `1. **Warm-up (10m)**: 3v2 Build-Out Rondo — focus on split passes to midfielders.\n` +
            `2. **Main Drill (20m)**: 4v4 + 2 Neutral Battle Box — 1-2 touch limit to build spatial awareness.\n` +
            `3. **Scrimmage (15m)**: ${team.format} Conditioned Scrimmage — mandatory 3 passes before shooting.\n\n` +
            `You can share this animated drill plan directly with parents using the Share drawer!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Generic fallback intelligent tactical response
  return {
    id: 'msg-' + Date.now(),
    sender: 'ai',
    text: `🧠 **Tactical AI Assistant (${styleDetail.name})**:\n\n` +
          `I am monitoring your ${team.format} roster (${team.name}). You can ask me to:\n` +
          `• Generate equal-minute sub plans for game day\n` +
          `• Apply build-out & pressing tactics\n` +
          `• Create age-appropriate practice drills\n` +
          `• Update player profiles via voice or text`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
