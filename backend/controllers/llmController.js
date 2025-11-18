// /backend/controllers/llmController.js
import { runLLM } from '../services/executor.js';
import { routerSelect } from '../../engine/router.js';
import { config as engineConfig } from '../../engine/config.js'; // Load shared config

export async function runModel(req, res) {
  try {
    const { input, llm, context, modifiers } = req.body;

    const selectedModel = llm === 'auto'
      ? routerSelect({ 
          input, 
          context, 
          modelCatalog: engineConfig.modelCatalog 
        })
      : llm;

    const contextProfile = engineConfig.contextProfiles[context];
    
    const result = await runLLM(selectedModel, input, { 
        contextProfile, 
        modifiers, 
        injectionTemplates: engineConfig.injectionTemplates 
    });

    res.json({
      modelUsed: selectedModel,
      output: result.output,
      tokens: result.tokens,
      latency_ms: result.latency
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Model execution failed.' });
  }
}