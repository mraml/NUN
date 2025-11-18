// /engine/modifierCompiler.js
/**
 * modifierCompiler
 *
 * Accepts:
 *  - activeModifiers: array/string set of modifier keys (order matters)
 *  - injectionTemplates: object mapping modifierKey -> { phase: 'pre'|'post', template: string }
 *
 * Returns:
 *  - { pre: [...], post: [...], ordered: [...] } where ordered = [...pre, ...post]
 *
 * Note: By default modifiers are appended as post-instructions if phase not specified.
 */

export function compileModifiers(activeModifiers = [], injectionTemplates = {}) {
  const pre = [];
  const post = [];
  const ordered = [];

  for (const mod of activeModifiers || []) {
    const def = injectionTemplates?.[mod];
    const tpl = def?.template ?? def ?? null;

    if (!tpl) continue;

    const phase = def?.phase || 'post';
    if (phase === 'pre') pre.push(tpl);
    else post.push(tpl);
  }

  // ordered: pre-phase modifiers first, then post-phase
  for (const p of pre) ordered.push(p);
  for (const p of post) ordered.push(p);

  return { pre, post, ordered };
}
