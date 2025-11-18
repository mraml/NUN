// /engine/chainEngine.js
import { compilePrompt } from './promptCompiler.js';
import { compileModifiers } from './modifierCompiler.js';
import { routerSelect } from './router.js'; // Import router for per-step AUTO routing

/**
 * chainEngine.runChain(chain, initialInput, opts)
 *
 * Executes a multi-step workflow, routing each step and compiling its prompt.
 *
 * @param {object} chain - The chain definition: { name, steps: [ { llm, context, modifiers, action, ... } ] }
 * @param {string} initialInput - The starting input text.
 * @param {object} opts - Options including executorFn, contextProfiles, injectionTemplates, and modelCatalog.
 * @returns {Promise<object>} The final chain result.
 */

export async function runChain(chain = { steps: [] }, initialInput = '', { 
    executorFn = null, 
    contextProfiles = {}, 
    injectionTemplates = {}, 
    modelCatalog = {} 
} = {}) {
  if (!executorFn || typeof executorFn !== 'function') {
    throw new Error('chainEngine.runChain requires an executorFn');
  }

  const results = [];
  let currentInput = initialInput;

  for (let i = 0; i < (chain.steps || []).length; i++) {
    const step = chain.steps[i];
    // Default to the overall chain context/llm if not specified per step
    const { 
        llm = 'auto', 
        context = null, // NOTE: Step context overrides overall context
        modifiers = [] 
    } = step;

    // 1. ROUTING: Determine the final model for this step
    const selectedModel = routerSelect({ 
        input: currentInput, // Route based on the output of the previous step
        context: context, 
        llmHint: llm,
        modelCatalog: modelCatalog 
    });
    
    // 2. COMPILATION: Get the step-specific context profile and modifiers
    const ctxProfile = (context && contextProfiles?.[context]) ? contextProfiles[context] : null;

    const compiledMods = compileModifiers(modifiers, injectionTemplates);
    
    // The input for this step is the output of the previous one
    const prompt = compilePrompt({ 
        input: currentInput, 
        contextProfile: ctxProfile, 
        modifiersOrdered: compiledMods.ordered 
    });

    const meta = { chainName: chain.name || 'unnamed', stepIndex: i, step };

    // 3. EXECUTION: Call the LLM Executor with the compiled prompt
    // The executorFn signature is: (model, prompt, { contextProfile, modifiers, injectionTemplates })
    const out = await executorFn(selectedModel, prompt, { 
        contextProfile: ctxProfile, 
        modifiers, 
        injectionTemplates // Pass templates for executor to recompile if needed (though it shouldn't for chains)
    });

    // 4. RESULT STORAGE and PROPAGATION
    results.push({
      stepIndex: i,
      step,
      modelUsed: selectedModel,
      prompt,
      result: out
    });

    // Propagate output to the next step's input
    currentInput = (out && out.output) ? out.output : currentInput;

    // Optional: Early termination if step returned error
    if (out && out.error) {
      console.error(`Chain termination at step ${i} due to error:`, out.error);
      return { success: false, results, error: out.error };
    }
  }

  return { success: true, results, finalOutput: currentInput };
}