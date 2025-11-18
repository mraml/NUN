export function compilePrompt(input, context, modifiers) {
  let result = input;

  if (context) result = `[Context: ${context}]\n` + result;
  if (modifiers?.length) result += `\n\nModifiers: ${modifiers.join(', ')}`;

  return result;
}
