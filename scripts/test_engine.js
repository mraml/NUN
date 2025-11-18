// scripts/test_engine.js
import { detectContext } from '../engine/contextDetector.js';
import { compileModifiers } from '../engine/modifierCompiler.js';
import { compilePrompt } from '../engine/promptCompiler.js';
import { routerSelect, DEFAULT_MODEL_CATALOG } from '../engine/router.js'; // if you export DEFAULT
import { runLLM } from '../backend/services/executor.js';

const contextProfiles = {
  'deep-work': { name: 'deep-work', prefix: '# DEEP WORK PROTOCOL\n- Step-by-step\n---', keywords: ['debug', 'optimize', 'refactor'] },
  'creative': { name: 'creative', prefix: '# CREATIVE PROTOCOL\n- Freeform\n---', keywords: ['write', 'story'] }
};

const injectionTemplates = {
  'eli5': { phase: 'post', template: '[MOD: Explain like I am five]' },
  'test-first': { phase: 'pre', template: '[MOD: Provide tests first]' }
};

async function run() {
  const input = 'Help me debug this failing function and write tests';
  const detection = detectContext({ text: input, contextProfiles, minMatches: 1 });
  console.log('detection', detection);

  const router = routerSelect({ input, context: detection.context, llmHint: 'auto', modelCatalog: {
    claude: { strengths: ['reasoning', 'creative'], latency: 1200, cost: 0.6 },
    gemini: { strengths: ['code'], latency: 400, cost: 0.35 }
  }, routingConfig: { preferLowLatency: false }});
  console.log('router chose:', router);

  const mods = compileModifiers(['test-first', 'eli5'], injectionTemplates);
  const prompt = compilePrompt({ input, contextProfile: contextProfiles[detection.context], modifiersOrdered: mods.ordered });
  console.log('compiled prompt:\n', prompt);

  const out = await runLLM(router, input, { contextProfile: contextProfiles[detection.context], modifiers: ['test-first', 'eli5'], injectionTemplates });
  console.log('executor output:\n', out.output.slice(0, 400));
}

run().catch(e => console.error(e));
