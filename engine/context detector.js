// /engine/contextDetector.js
/**
 * contextDetector
 * Simple keyword-scoring detector.
 *
 * API:
 *   detectContext({ text, contextProfiles, minMatches = 1 })
 * returns { context: string|null, scores: {ctx:score,...} }
 */

export function detectContext({ text = '', contextProfiles = {}, minMatches = 1 } = {}) {
  const lower = (text || '').toLowerCase();
  const scores = {};

  for (const [ctx, profile] of Object.entries(contextProfiles || {})) {
    let score = 0;
    if (Array.isArray(profile.keywords)) {
      for (const kw of profile.keywords) {
        if (!kw) continue;
        if (lower.includes(kw.toLowerCase())) score += 1;
      }
    }
    scores[ctx] = score;
  }

  // Choose best
  const bestEntry = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (!bestEntry) return { context: null, scores };

  const [bestCtx, bestScore] = bestEntry;
  return { context: bestScore >= minMatches ? bestCtx : null, scores };
}
