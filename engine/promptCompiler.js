// /engine/promptCompiler.js
/**
 * Prompt Compiler
 * - Accepts: { input, contextProfile, modifiersOrdered }
 * - Produces a single compiled prompt string
 *
 * This is intentionally conservative — doesn't call models or mutate input
 */

export function compilePrompt({ input = '', contextProfile = null, modifiersOrdered = [] } = {}) {
  const lines = [];

  if (contextProfile && contextProfile.prefix) {
    lines.push(contextProfile.prefix.trim());
  }

  // Add the main user input
  lines.push(input.trim());

  // Append modifier injections (already formatted by modifierCompiler)
  if (Array.isArray(modifiersOrdered) && modifiersOrdered.length) {
    lines.push('');
    modifiersOrdered.forEach(m => {
      if (typeof m === 'string' && m.trim()) {
        lines.push(m.trim());
      }
    });
  }

  // metadata footer (timestamp left out for testability; executor can add metadata)
  return lines.join('\n\n');
}
