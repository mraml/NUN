// /engine/promptCompiler.js
export function compilePrompt({ input = '', contextProfile = null, modifiersOrdered = [] } = {}) {
  const lines = [];

  if (contextProfile && contextProfile.prefix) {
    lines.push(contextProfile.prefix.trim());
  }

  // Add the main user input
  lines.push(input.trim());

  // Append modifier injections
  if (Array.isArray(modifiersOrdered) && modifiersOrdered.length) {
    lines.push('');
    modifiersOrdered.forEach(m => {
      if (typeof m === 'string' && m.trim()) {
        lines.push(m.trim());
      }
    });
  }

  return lines.join('\n\n');
}