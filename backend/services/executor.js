// /backend/services/executor.js
import { compilePrompt } from '../../engine/promptCompiler.js';
import { compileModifiers } from '../../engine/modifierCompiler.js';
import { recordSession } from '../../engine/analyticsCore.js';

/**
 * executor.runLLM(model, input, options)
 * - For now, a placeholder that returns a deterministic stub response.
 * - Once Phase 2 begins, replace the `simulateModelCall` with real provider calls.
 */

async function simulateModelCall({ model, prompt }) {
  // simulated latency
  const start = Date.now();
  await new Promise(r => setTimeout(r, 200)); // 200ms fake latency
  const latency = Date.now() - start;

  return {
    output: `[[SIMULATED ${model.toUpperCase()} RESPONSE]]\n\n${prompt}`,
    tokens: prompt.split(/\s+/).length,
    latency
  };
}

export async function runLLM(model = 'claude', input = '', { contextProfile = null, modifiers = [], injectionTemplates = {} } = {}) {
  // build modifiers and compiled prompt
  const compiledMods = compileModifiers(modifiers, injectionTemplates);
  const prompt = compilePrompt({ input, contextProfile, modifiersOrdered: compiledMods.ordered });

  // In future: call provider based on model
  const result = await simulateModelCall({ model, prompt });

  // record lightweight analytics
  try {
    recordSession({ context: (contextProfile && contextProfile.name) || 'none', llm: model, tokens: result.tokens });
  } catch (e) {
    console.warn('analytics record failed', e);
  }

  return result;
}
