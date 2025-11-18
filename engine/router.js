// /engine/router.js
import { readAnalytics } from './analyticsCore.js'; // Import analytics to inform routing decisions

/**
 * routerSelect
 * - payload: { input, context, llmHint, modelCatalog, routingConfig }
 *
 * Implements Phase 4: Scoring based on keywords, context, complexity, and historical performance.
 *
 * @returns: selected model key string
 */

function analyzeComplexity(input) {
  const tokenCount = input.split(/\s+/).filter(Boolean).length;
  // Simple scoring: High complexity if over 300 tokens (indicates deep work or large content)
  const complexityScore = tokenCount > 300 ? 5 : (tokenCount > 100 ? 3 : 1);
  return { tokenCount, complexityScore };
}

export function routerSelect({ input = '', context = null, llmHint = 'auto', modelCatalog = {}, routingConfig = { preferLowLatency: false, preferLowCost: true } } = {}) {
  if (!input) {
    const fallback = Object.keys(modelCatalog)[0] || 'claude';
    return fallback;
  }

  if (llmHint && llmHint !== 'auto') return llmHint;

  const lower = input.toLowerCase();
  const complexity = analyzeComplexity(input);
  const scores = {};
  
  // Get historical performance data
  const analytics = readAnalytics();

  // Basic keyword mapping (same as before)
  const keywordMap = {
    code: ['code', 'debug', 'function', 'api', 'sql', 'npm', 'js', 'javascript', 'python'],
    reasoning: ['why', 'analyze', 'evaluate', 'decide', 'trade-offs', 'compare'],
    creative: ['write', 'story', 'poem', 'compose', 'creative', 'imagine']
  };

  for (const [modelKey, meta] of Object.entries(modelCatalog || {})) {
    let s = 0;
    const strengths = meta.strengths || [];

    // 1. KEYWORD & STRENGTH MATCHING (Base Score)
    for (const [type, kws] of Object.entries(keywordMap)) {
      for (const kw of kws) {
        if (lower.includes(kw)) {
          if (strengths.includes(type)) s += 2; // Strong match
          else s += 1; // Weak match
        }
      }
    }
    
    // 2. CONTEXTUAL BOOST (Bias based on active context)
    if (context && strengths.includes(context.split('-')[0])) { // e.g., 'deep-work' matches 'deep' or 'work'
        s += 3; // Direct context strength match
    }
    
    // 3. COMPLEXITY SCORING (Prefer powerful models for complexity)
    // Assume high-cost models (like GPT-4, or the most costly in the catalog) are better for complexity
    const isHighCostModel = meta.cost > 0.7; 
    if (isHighCostModel) {
        s += complexity.complexityScore * 1.5;
    }
    
    // 4. HISTORICAL ANALYTICS BIAS (Adaptiveness)
    const usageCount = analytics.llms?.[modelKey] || 0;
    const totalSessions = analytics.sessions || 1;
    const historicalPreference = usageCount / totalSessions; // Higher usage gives a slight passive boost
    s += historicalPreference * 5; // Scale to be relevant but not dominant

    // 5. USER PREFERENCE OVERRIDES (Latency/Cost)
    if (routingConfig.preferLowLatency && meta.latency) {
        // Models with lower latency get a higher score (max score is 1.0 if latency is 0)
        s += Math.max(0, 1 - meta.latency / 2000) * 4;
    }
    if (routingConfig.preferLowCost && meta.cost) {
        // Models with lower cost get a higher score (max score is 1.0 if cost is 0)
        s += Math.max(0, 1 - meta.cost) * 4;
    }

    scores[modelKey] = s;
  }

  // Choose model with highest score
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (!best) return Object.keys(modelCatalog)[0] || 'claude';
  
  return best[0];
}