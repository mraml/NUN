// /engine/config.js
export const config = {
  defaultModel: 'claude',
  contextProfiles: {
    'deep-work': {
      name: 'deep-work',
      prefix: '# DEEP WORK PROTOCOL\n- Technical precision\n- Step-by-step reasoning\n- Include edge cases\n\n---\n',
      keywords: ['debug', 'refactor', 'optimize', 'design', 'architecture', 'implement', 'code', 'function']
    },
    'shallow-work': {
      name: 'shallow-work',
      prefix: '# SHALLOW WORK PROTOCOL\n- Fast answers\n- 2-3 options max\n- Clear next steps\n\n---\n',
      keywords: ['quick', 'fast', 'simple', 'summarize', 'list']
    },
    'creative': {
      name: 'creative',
      prefix: '# CREATIVE PROTOCOL\n- Multiple perspectives\n- Unconventional approaches\n- Possibilities not prescriptions\n\n---\n',
      keywords: ['write', 'create', 'compose', 'design', 'brainstorm', 'imagine', 'story']
    },
    'learning': {
      name: 'learning',
      prefix: '# LEARNING PROTOCOL\n- Build from fundamentals\n- Concrete examples\n- Practice problems\n\n---\n',
      keywords: ['explain', 'learn', 'understand', 'teach', 'how does', 'what is', 'why']
    },
    'decision': {
      name: 'decision',
      prefix: '# DECISION PROTOCOL\n- Frame clearly\n- Evaluate trade-offs\n- Second-order effects\n\n---\n',
      keywords: ['should i', 'which', 'decide', 'choose', 'compare', 'better', 'or']
    }
  },
  modelCatalog: {
    'claude': { strengths: ['reasoning', 'creative', 'writing'], latency: 1200, cost: 0.6 },
    'gemini': { strengths: ['code', 'data', 'analysis'], latency: 400, cost: 0.35 },
    'gpt4': { strengths: ['reasoning', 'general'], latency: 1000, cost: 0.8 }
  },
  injectionTemplates: {
    'test-first': { phase: 'pre', template: '\n\n[MODIFIER: Write test cases first. Include edge cases.]' },
    'eli5': { phase: 'post', template: '\n\n[MODIFIER: Explain like I\'m 10. Use analogies.]' },
    'socratic': { phase: 'post', template: '\n\n[MODIFIER: Ask questions to help me discover the answer.]' },
    'devil-advocate': { phase: 'post', template: '\n\n[MODIFIER: Challenge assumptions. What could go wrong?]' },
    'compress': { phase: 'post', template: '\n\n[MODIFIER: Maximum density. No fluff.]' },
    'expand': { phase: 'post', template: '\n\n[MODIFIER: Deep dive with principles.]' },
    'metacognitive': { phase: 'post', template: '\n\n[MODIFIER: Explain your reasoning after.]' }
  }
};