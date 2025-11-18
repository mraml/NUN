import { runLLM } from '../services/executor.js';
import { routerSelect } from '../services/router.js';

export async function runModel(req, res) {
  try {
    const { input, llm, context, modifiers } = req.body;

    const selected = llm === 'auto'
      ? routerSelect({ input, context })
      : llm;

    const result = await runLLM(selected, input, { context, modifiers });

    res.json({
      modelUsed: selected,
      output: result.output,
      tokens: result.tokens,
      latency_ms: result.latency
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Model execution failed.' });
  }
}
