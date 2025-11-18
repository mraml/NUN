// /engine/modifierCompiler.js
export function compileModifiers(activeModifiers = [], injectionTemplates = {}) {
  const pre = [];
  const post = [];
  const ordered = [];

  for (const mod of activeModifiers || []) {
    const def = injectionTemplates?.[mod];
    // Handle both object config and string config if simple string was passed
    const tpl = def?.template ?? (typeof def === 'string' ? def : null);

    if (!tpl) continue;

    const phase = def?.phase || 'post';
    if (phase === 'pre') pre.push(tpl);
    else post.push(tpl);
  }

  for (const p of pre) ordered.push(p);
  for (const p of post) ordered.push(p);

  return { pre, post, ordered };
}