/**
 * Age 6+ Content Safety & Profanity Guardrail Filter
 * Ensures child-safe output compliant with youth sports guidelines.
 */

// Inappropriate or non-child-friendly terms list
const BLOCKED_PATTERNS = [
  /kill/i, /attack/i, /destroy/i, /hate/i, /hurt/i, /fight/i, /punch/i, /curse/i, /swear/i,
  /damn/i, /hell/i, /crap/i, /ass/i, /bitch/i, /fuck/i, /shit/i, /dick/i, /cock/i, /pussy/i,
  /weapon/i, /gun/i, /knife/i, /blood/i, /violence/i, /death/i, /nude/i, /sex/i, /porn/i
];

/**
 * Validates whether user prompt is child-safe (Age 6+)
 */
export function isPromptChildSafe(text: string): boolean {
  if (!text) return true;
  return !BLOCKED_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Sanitizes and rewrites any unsafe input into a positive youth soccer context
 */
export function sanitizePromptForYouth(text: string): string {
  if (!text) return text;
  let sanitized = text;
  
  BLOCKED_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, 'play fair');
  });

  return sanitized;
}

/**
 * Generates a friendly, child-safe response when an inappropriate prompt is intercepted
 */
export const YOUTH_SAFE_INTERCEPT_MESSAGE = 
  "🛡️ **Youth Safety Guardrail Active (Age 6+ Safe)**:\n\n" +
  "TacticalSoccer AI is strictly tailored for positive youth athlete development, sportsmanship, and fair play. " +
  "Please keep all prompts focused on fun soccer skills, build-out tactics, and teamwork!";
