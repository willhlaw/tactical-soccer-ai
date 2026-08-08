import { describe, it, expect } from 'vitest';
import { isPromptChildSafe, sanitizePromptForYouth } from '../services/safetyFilter';
import { generateAIDrill, processAICoachPrompt } from '../services/aiEngine';
import { INITIAL_TEAMS } from '../services/storage';
import { FORMATION_PRESETS } from '../services/formations';

describe('Age 6+ Safety & Content Guardrails', () => {
  it('should pass normal soccer prompts', () => {
    expect(isPromptChildSafe('Overlapping winger and fullback drill')).toBe(true);
    expect(isPromptChildSafe('3v2 build out rondo')).toBe(true);
  });

  it('should intercept inappropriate prompts', () => {
    expect(isPromptChildSafe('kill the defender')).toBe(false);
    expect(isPromptChildSafe('attack aggressively with violence')).toBe(false);
  });

  it('should sanitize unsafe input into positive youth soccer terms', () => {
    const sanitized = sanitizePromptForYouth('kill the defense');
    expect(sanitized).toContain('play fair');
  });

  it('should return youth safety guardrail message when AI prompt is unsafe', () => {
    const response = processAICoachPrompt('kill opponent team', INITIAL_TEAMS[0], FORMATION_PRESETS[0]);
    expect(response.text).toContain('Youth Safety Guardrail Active');
  });
});
