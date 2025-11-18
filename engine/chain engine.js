// /engine/chainEngine.js
/**
 * chainEngine.runChain(chain, initialInput, opts)
 *
 * chain: { name, steps: [ { llm, context, modifiers, action } ] }
 * executorFn: async function({ llm, prompt, metadata }) -> { output, tokens, latency }
 *
 * Returns: { success: boolean, results: [ ... per-step ], error? }
 */

export async function runChain(chain = { steps: [] }, initialInput = '', { executorFn = null, contextProfiles = {}, injectionTemplates = {} } = {}) {
  if (!executorFn || typeof executorFn !== 'function') {
    throw new Error('chainEngine.runChain requires an executorFn');
  }

  const results = [];
  let currentInput = initialInput;

  for (let i = 0; i < (chain.steps || []).length; i++) {
    const step = chain.steps[i];
    const { llm = 'auto', context = null, modifiers = [] } = step;

    // Build prompt: locate context profile and modifier templates are assembled elsewhere.
    const ctxProfile = (context && contextProfiles?.[context]) ? contextProfiles[context] : null;

    // Compose prompt by using promptCompiler + modifierCompiler (imported lazily to avoid heavy deps)
    // We import dynamically so that engine remains pure JS module with minimal top-level cost
    const { compilePrompt } = await import('./promptCompiler.js');
    const { compileModifiers } = await import('./modifierCompiler.js');

    const compiledMods = compileModifiers(modifiers, injectionTemplates);
    const prompt = compilePrompt({ input: currentInput, contextProfile: ctxProfile, modifiersOrdered: compiledMods.ordered });

    const meta = { chainName: chain.name || 'unnamed', stepIndex: i, step };

    // execute
    const out = await executorFn({ llm, prompt, metadata: meta });

    // store result
    results.push({
      stepIndex: i,
      step,
      prompt,
      result: out
    });

    // set currentInput for next step
    // by default feed the raw output text; chain rules could override
    currentInput = (out && out.output) ? out.output : currentInput;

    // optional: early termination if step returned error
    if (out && out.error) {
      return { success: false, results, error: out.error };
    }
  }

  return { success: true, results };
}
