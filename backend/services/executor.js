export async function runLLM(model, prompt, config = {}) {
  // Later phases will add:
  // - OpenAI calls
  // - Anthropic
  // - Gemini
  // - Local models

  return {
    output: `[placeholder response from ${model}]`,
    tokens: 0,
    latency: 0
  };
}
