// /backend/services/executor.js
import { compilePrompt } from '../../engine/promptCompiler.js';
import { compileModifiers } from '../../engine/modifierCompiler.js';
import { recordSession } from '../../engine/analyticsCore.js';
import { config } from '../utils/config.js';

/**
 * ADAPTER: Google Gemini (Gemini Pro)
 */
async function callGemini(prompt) {
  if (!config.GOOGLE_API_KEY) throw new Error("Missing GOOGLE_API_KEY");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.GOOGLE_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini API Error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  // Extract text from Gemini response structure
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return {
    output: text,
    // Gemini usage metadata often provides token counts, but fallback to estimation if missing
    tokens: data.usageMetadata?.totalTokenCount || prompt.split(/\s+/).length, 
  };
}

/**
 * ADAPTER: Anthropic (Claude 3.5 Sonnet)
 */
async function callClaude(prompt) {
  if (!config.ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY");

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Claude API Error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    output: data.content[0].text,
    tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0
  };
}

/**
 * ADAPTER: OpenAI (GPT-4o)
 */
async function callOpenAI(prompt) {
  if (!config.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`OpenAI API Error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    output: data.choices[0].message.content,
    tokens: data.usage?.total_tokens || 0
  };
}

/**
 * Main Execution Function
 */
export async function runLLM(model = 'claude', input = '', { 
    contextProfile = null, 
    modifiers = [], 
    injectionTemplates = {}, 
    isCompiled = false 
} = {}) {
  
  // 1. Compile Prompt (if not already compiled by Chain Engine)
  let prompt = input;
  if (!isCompiled) {
    const compiledMods = compileModifiers(modifiers, injectionTemplates);
    prompt = compilePrompt({ input, contextProfile, modifiersOrdered: compiledMods.ordered });
  }

  const start = Date.now();
  let result = { output: '', tokens: 0 };

  // 2. Route to the correct adapter
  try {
    // Normalize model string (handle 'auto' mapped names)
    const target = model.toLowerCase();

    if (target.includes('gemini')) {
      result = await callGemini(prompt);
    } else if (target.includes('claude')) {
      result = await callClaude(prompt);
    } else if (target.includes('gpt')) {
      result = await callOpenAI(prompt);
    } else {
      // Fallback to Gemini if unknown, or error out
      console.warn(`Unknown model '${model}', defaulting to Gemini...`);
      result = await callGemini(prompt);
    }
  } catch (error) {
    console.error("LLM Provider Failed:", error);
    // Return error state to frontend rather than crashing
    return {
      output: `⚠ PROVIDER ERROR (${model}): ${error.message}`,
      tokens: 0,
      latency: Date.now() - start,
      error: true
    };
  }

  const latency = Date.now() - start;

  // 3. Record Analytics
  try {
    const contextName = (contextProfile && contextProfile.name) || 'none';
    recordSession({ context: contextName, llm: model, tokens: result.tokens });
  } catch (e) {
    console.warn('analytics record failed', e);
  }

  return {
    output: result.output,
    tokens: result.tokens,
    latency
  };
}