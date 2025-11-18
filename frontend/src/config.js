// nun_os/frontend/src/config.js
// Centralized configuration and state management for the frontend UI

export const state = {
    activeContext: null,
    activeModifiers: new Set(),
    activeLLM: 'claude',
    activeChain: 'none',
    // --- ROUTING PREFERENCES ---
    preferLowLatency: false,
    preferLowCost: true,
    // ---------------------------
    commandHistory: JSON.parse(localStorage.getItem('nun_history') || '[]'),
    analytics: JSON.parse(localStorage.getItem('nun_analytics') || '{}'),
    chainMode: false, 
    lastOutput: '',
    isExecuting: false,
};

export const availableModifiers = [
    'test-first', 
    'eli5', 
    'socratic', 
    'devil-advocate', 
    'compress', 
    'expand', 
    'metacognitive'
];

export const contextProfiles = {
    'deep-work': {
        prefix: `# DEEP WORK PROTOCOL\n- Technical precision\n- Step-by-step reasoning\n- Include edge cases\n\n---\n`,
        keywords: ['debug', 'refactor', 'optimize', 'design', 'architecture', 'implement', 'code', 'function']
    },
    'shallow-work': {
        prefix: `# SHALLOW WORK PROTOCOL\n- Fast answers\n- 2-3 options max\n- Clear next steps\n\n---\n`,
        keywords: ['quick', 'fast', 'simple', 'summarize', 'list']
    },
    'creative': {
        prefix: `# CREATIVE PROTOCOL\n- Multiple perspectives\n- Unconventional approaches\n- Possibilities not prescriptions\n\n---\n`,
        keywords: ['write', 'create', 'compose', 'design', 'brainstorm', 'imagine', 'story']
    },
    'learning': {
        prefix: `# LEARNING PROTOCOL\n- Build from fundamentals\n- Concrete examples\n- Practice problems\n\n---\n`,
        keywords: ['explain', 'learn', 'understand', 'teach', 'how does', 'what is', 'why']
    },
    'decision': {
        prefix: `# DECISION PROTOCOL\n- Frame clearly\n- Evaluate trade-offs\n- Second-order effects\n\n---\n`,
        keywords: ['should i', 'which', 'decide', 'choose', 'compare', 'better', 'or']
    }
};

export const sessionTemplates = {
    'morning': { context: 'shallow-work', modifiers: ['compress'], prompt: 'What are my priorities today?', llm: 'claude' },
    'deep-work': { context: 'deep-work', modifiers: ['test-first', 'metacognitive'], prompt: '', llm: 'auto' },
    'learning': { context: 'learning', modifiers: ['eli5', 'socratic'], prompt: '', llm: 'claude' },
    'debug': { context: 'deep-work', modifiers: ['test-first'], prompt: '', llm: 'gemini' }
};

export const llmRouting = {
    'claude': { keywords: ['explain', 'why', 'analyze', 'write', 'essay', 'discuss', 'philosophy', 'ethics'] },
    'gemini': { keywords: ['code', 'debug', 'function', 'api', 'data', 'parse', 'json', 'sql'] },
    'gpt4': { keywords: ['strategy', 'general', 'complex', 'research', 'multi-step'] }
};

// Functions to manage state persistence
export function updateLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}