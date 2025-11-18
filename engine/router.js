// /engine/router.js
/**
 * routerSelect
 * - payload: { input, context, llmHint, modelCatalog, routingConfig }
 *
 * modelCatalog sample:
 * {
 *   "claude": { strengths: ["reasoning"], latency: 1200, cost: 0.6 },
 *   "gemini": { strengths: ["code"], latency: 400, cost: 0.35 }
 * }
 *
 * routingConfig:
 *  - preferLowLatency: boolean
 *  - preferLowCost: boolean
 *
 * Returns: selected model key string
 */

export function routerSelect({ input = '', context = null, llmHint = 'auto', modelCatalog = {}, routingConfig = {} } = {}) {
  if (!input) {
    // fallback to default model
    const fallback = Object.keys(modelCatalog)[0] || 'claude';
    return fallback;
  }

  // if user explicitly picks
  if (llmHint && llmHint !== 'auto') return llmHint;

  const lower = input.toLowerCase();
  // Basic keyword mapping (can be extended or moved to config)
  const keywordMap = {
    code: ['code', 'debug', 'function', 'api', 'sql', 'npm', 'js', 'javascript', 'python'],
    reasoning: ['why', 'analyze', 'evaluate', 'decide', 'trade-offs', 'compare'],
    creative: ['write', 'story', 'poem', 'compose', 'creative', 'imagine']
  };

  // score models
  const scores = {};
  for (const [modelKey, meta] of Object.entries(modelCatalog || {})) {
    let s = 0;
    const strengths = meta.strengths || [];

    // keyword matching
    for (const [type, kws] of Object.entries(keywordMap)) {
      for (const kw of kws) {
        if (lower.includes(kw)) {
          // if model strengths match type, reward
          if (strengths.includes(type)) s += 2;
          else s += 1;
        }
      }
    }

    // prefer low-latency or low-cost if requested
    if (routingConfig.preferLowLatency && meta.latency) s += Math.max(0, 1 - meta.latency / 2000);
    if (routingConfig.preferLowCost && meta.cost) s += Math.max(0, 1 - meta.cost);

    scores[modelKey] = s;
  }

  // choose model with highest score
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (!best) return Object.keys(modelCatalog)[0] || 'claude';
  return best[0];
}
