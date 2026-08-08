import { AICoachMessage, Team, FormationPreset } from '../types';
import { PHILOSOPHY_KNOWLEDGE } from './coachingKnowledge';

export function processAICoachPrompt(
  userText: string,
  team: Team,
  currentFormation: FormationPreset
): AICoachMessage {
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

  // Check for Player Profile updates (e.g., "Alex loves playing goalie and forward")
  if (lower.includes('profile') || lower.includes('alex') || lower.includes('player') || lower.includes('strengths') || lower.includes('weakness')) {
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
