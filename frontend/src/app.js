// nun_os/frontend/src/app.js
// Core application logic, event handling, and execution pipeline

// REMOVED: setupSpeechRecognition, stopVoiceInput from imports
import { state, contextProfiles, sessionTemplates, llmRouting, updateLocalStorage, availableModifiers } from './config.js';
import { initializeDomCache, dom, renderChainSelector, renderChainOutput, renderHistory, updateAnalytics, updateStatusIndicators, updateStats, showNotification, setBackendStatus, recordAnalytics, renderPreferenceControls, renderContextSelector, renderModifierSelector, renderAutomationRules } from './ui.js';
import { runSingleTurn, runChainWorkflow, getHealth, getCapsuleWorkflows, getAutomationRules, triggerAutomationEvent } from './api.js';

// --- UTILITY FUNCTIONS ---

function countTokens(text) {
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
}

function detectBestLLM(text) {
    const lowerText = text.toLowerCase();
    let scores = {};
    for (const llm of Object.keys(llmRouting)) {
        scores[llm] = 0;
        llmRouting[llm].keywords.forEach(kw => {
            if (lowerText.includes(kw)) scores[llm]++;
        });
    }
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best && best[1] > 0 ? best[0] : 'claude';
}

// --- EXPORT UTILITY FUNCTIONS ---

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportToObsidian() {
    const input = dom.commandInput.value.trim();
    const output = dom.outputMatrix.textContent;
    
    if (!input || output.includes('AWAITING')) {
        showNotification('⚠ NOTHING TO EXPORT', true);
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `NUN-${timestamp}-${Date.now()}.md`;
    const type = state.activeChain === 'none' ? state.activeLLM : 'CHAIN';

    const content = `# N.U.N. Session
**Date:** ${new Date().toLocaleString()}
**Context:** ${state.activeContext || 'NONE'}
**LLM:** ${type}
**Modifiers:** ${Array.from(state.activeModifiers).join(', ') || 'NONE'}
**Workflow:** ${state.activeChain}

## Input
${input}

## Generated Output
\`\`\`
${output}
\`\`\`

---
Tags: #nun #ai #prompts
`;
    
    downloadFile(filename, content, 'text/markdown');
    showNotification('📝 EXPORTED TO OBSIDIAN FORMAT');
}

function exportToMarkdown() {
    const output = dom.outputMatrix.textContent;
    if (output.includes('AWAITING')) {
        showNotification('⚠ NOTHING TO EXPORT', true);
        return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `nun-export-${timestamp}.md`;
    const content = `# N.U.N. Export\n\n${output}`;
    downloadFile(filename, content, 'text/markdown');
    showNotification('⬇ MARKDOWN EXPORTED');
}

function exportHistory() {
    if (state.commandHistory.length === 0) {
        showNotification('⚠ NO HISTORY TO EXPORT', true);
        return;
    }
    const content = state.commandHistory.map((entry, idx) => {
        const type = entry.chain ? `[WORKFLOW: ${entry.chain.toUpperCase()}]` : `[LLM: ${entry.llm.toUpperCase()}]`;
        return `## Session ${idx + 1}\n**Time:** ${new Date(entry.timestamp).toLocaleString()}\n${type}\n**Context:** ${entry.context || 'NONE'}\n\n${entry.output}\n\n---\n\n`;
    }).join('');
    const filename = `nun-history-${new Date().toISOString().split('T')[0]}.md`;
    downloadFile(filename, `# N.U.N. Session History\n\n${content}`, 'text/markdown');
    showNotification('⬇ HISTORY EXPORTED');
}

// --- STATE MUTATORS / EVENT HANDLERS ---

function toggleRoutingPreference(key) {
    state[key] = !state[key];
    renderPreferenceControls(toggleRoutingPreference);
    showNotification(`⬢ ${key.toUpperCase()}: ${state[key] ? 'ENABLED' : 'DISABLED'}`);
    if (state.activeLLM === 'auto') handleTextInput(); 
}

function handleChainSelection(chainName) {
    state.activeChain = chainName;
    updateStats(countTokens(dom.commandInput.value), state.activeChain);
    showNotification(`⬢ WORKFLOW: ${chainName.toUpperCase()}`);
}

function handleContextSelection(contextKey) {
    state.activeContext = contextKey === 'none' ? null : contextKey;
    updateStatusIndicators();
    updateStats(countTokens(dom.commandInput.value), state.activeChain);
}

function handleModifierToggle(modifier) {
    if (state.activeModifiers.has(modifier)) {
        state.activeModifiers.delete(modifier);
    } else {
        state.activeModifiers.add(modifier);
    }
    updateStats(countTokens(dom.commandInput.value), state.activeChain);
}

function handleLLMSelection(e) {
    const llm = e.currentTarget.dataset.llm;
    dom.llmOptions.forEach(o => o.classList.remove('active'));
    e.currentTarget.classList.add('active');
    state.activeLLM = llm;
    updateStatusIndicators();
    showNotification(`⬢ ${state.activeLLM.toUpperCase()}`);
}

function handleTextInput() {
    const text = dom.commandInput.value;
    const lowerText = text.toLowerCase();

    // Auto-detect context
    if (!state.activeContext && text.length > 15) {
        let detected = null;
        let maxMatches = 0;
        for (const [context, profile] of Object.entries(contextProfiles)) {
            const matches = profile.keywords.filter(keyword => lowerText.includes(keyword)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                detected = context;
            }
        }
        if (detected && maxMatches >= 1) {
            state.activeContext = detected;
            // Update dropdown value
            if (dom.contextSelector) dom.contextSelector.value = detected;
            updateStatusIndicators();
        }
    }

    // Auto-route LLM indicator
    if (state.activeLLM === 'auto' && text.length > 10) {
        const bestLLM = detectBestLLM(text);
        updateStatusIndicators(bestLLM);
    } else {
        updateStatusIndicators();
    }
    updateStats(countTokens(text), state.activeChain);
}

function loadTemplate(templateName) {
    const template = sessionTemplates[templateName];
    if (!template) {
        console.error(`Template '${templateName}' not found in config.`);
        return;
    }

    // Reset UI based on template
    state.activeContext = template.context;
    state.activeModifiers.clear();
    template.modifiers.forEach(mod => state.activeModifiers.add(mod));
    state.activeLLM = template.llm;
    state.activeChain = 'none';
    state.preferLowCost = true;
    state.preferLowLatency = false;

    // Update LLM Buttons
    dom.llmOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.llm === template.llm));
    
    // Rerender Selects to match new state
    renderContextSelector(contextProfiles, state.activeContext, handleContextSelection);
    renderModifierSelector(availableModifiers, state.activeModifiers, handleModifierToggle);
    
    // Reset chain selector dropdown
    dom.chainSelector.value = 'none';
    
    // Rerender Preference Controls
    renderPreferenceControls(toggleRoutingPreference);

    dom.commandInput.value = template.prompt || '';
    updateStatusIndicators();
    updateStats(countTokens(dom.commandInput.value), state.activeChain);
    showNotification(`⬢ TEMPLATE LOADED: ${templateName.toUpperCase()}`);
}

function toggleChainMode() {
    state.chainMode = !state.chainMode;
    dom.chainBtn.classList.toggle('active', state.chainMode);
    dom.chainIndicator.classList.toggle('active', state.chainMode);
    showNotification(state.chainMode ? '◇ INPUT CHAIN ENABLED' : '◇ INPUT CHAIN DISABLED');
}

function copyOutput() {
    const text = dom.outputMatrix.textContent;
    if (text.includes('⚠') || text.includes('AWAITING')) return;
    navigator.clipboard.writeText(text)
        .then(() => showNotification('⬡ COPIED'))
        .catch(() => showNotification('⚠ COPY FAILED', true));
}

function clearSystem() {
    dom.commandInput.value = '';
    dom.outputMatrix.textContent = '▸ AWAITING INPUT...';
    state.activeContext = null;
    state.activeModifiers.clear();
    state.activeChain = 'none';
    state.activeLLM = 'claude';
    state.preferLowCost = true;
    state.preferLowLatency = false;
    
    // Reset UI
    renderContextSelector(contextProfiles, null, handleContextSelection);
    renderModifierSelector(availableModifiers, state.activeModifiers, handleModifierToggle);
    
    dom.llmOptions.forEach(o => o.classList.toggle('active', o.dataset.llm === 'claude'));
    dom.chainSelector.value = 'none';

    renderPreferenceControls(toggleRoutingPreference);

    updateStatusIndicators();
    updateStats(0, state.activeChain);
}

function saveToHistory() {
    const input = dom.commandInput.value.trim();
    const output = dom.outputMatrix.textContent;
    if (!input || output.includes('⚠') || output.includes('AWAITING')) {
        showNotification('⚠ NOTHING TO SAVE', true);
        return;
    }
    const entry = {
        timestamp: new Date().toISOString(),
        input: input.substring(0, 80),
        output: output,
        context: state.activeContext,
        modifiers: Array.from(state.activeModifiers),
        llm: state.activeChain === 'none' ? state.activeLLM : 'CHAIN',
        chain: state.activeChain !== 'none' ? state.activeChain : null
    };
    state.commandHistory.unshift(entry);
    state.commandHistory = state.commandHistory.slice(0, 20);
    updateLocalStorage('nun_history', state.commandHistory);
    renderHistory(loadFromHistory);
    showNotification('▸ SAVED');
}

function loadFromHistory(idx) {
    const entry = state.commandHistory[idx];
    dom.outputMatrix.textContent = entry.output;
    showNotification('⬡ LOADED');
}

// --- AUTOMATION HANDLERS ---
async function handleManualTrigger() {
    showNotification('⚡ TRIGGERING EVENT...');
    dom.outputMatrix.textContent = "▸ Triggering 'system.startup' event on backend bus...";
    
    const result = await triggerAutomationEvent('system.startup', { input: "Manual System Check" });
    
    if (result.status === 'executed' && result.results.length > 0) {
        // Assuming the first result is the one we want to show
        const execution = result.results[0];
        if (execution.type === 'chain') {
            renderChainOutput(execution.result);
            showNotification('▣ AUTOMATION COMPLETED');
        } else {
            dom.outputMatrix.textContent = execution.result.output;
        }
    } else {
        dom.outputMatrix.textContent = "▸ Event Triggered, but no rules matched or executed.";
    }
}


// --- EXECUTION PIPELINE ---

async function executeCommand() {
    if (state.isExecuting) return;
    const input = dom.commandInput.value.trim();
    if (!input) { dom.outputMatrix.textContent = '⚠ ERROR: NO INPUT'; return; }
    
    state.isExecuting = true;
    dom.executeBtn.disabled = true;
    dom.executeBtn.textContent = '⬢ EXECUTING...';
    dom.outputMatrix.textContent = '▸ COMPILING AND ROUTING VIA BACKEND...';

    const chainActive = state.activeChain !== 'none';
    let result;

    try {
        if (chainActive) {
            const workflows = await getCapsuleWorkflows();
            const chain = workflows[state.activeChain];
            
            if (!chain) throw new Error(`Workflow chain "${state.activeChain}" not found.`);
            
            const payload = { 
                input: input,
                chain: chain,
                context: state.activeContext, 
                modifiers: Array.from(state.activeModifiers) 
            };
            dom.outputMatrix.textContent = `▸ Running Workflow: ${chain.name} (${chain.steps.length} steps)...`;
            result = await runChainWorkflow(payload);
        } else {
            const payload = {
                input: input,
                llm: state.activeLLM,
                context: state.activeContext,
                modifiers: Array.from(state.activeModifiers),
                routingConfig: {
                    preferLowLatency: state.preferLowLatency,
                    preferLowCost: state.preferLowCost
                }
            };
            result = await runSingleTurn(payload);
        }
    } catch (error) {
        result = { error: true, message: `Fatal Execution Error: ${error.message}` };
    }
    
    if (result.error) {
        dom.outputMatrix.textContent = result.message || 'Unknown execution error.';
    } else if (chainActive) {
        renderChainOutput(result);
        const totalTokens = result.results.reduce((sum, step) => sum + (step.result.tokens || 0), 0);
        recordAnalytics(state.activeContext || 'none', 'CHAIN', totalTokens); 
        showNotification('▣ WORKFLOW COMPLETED');
        state.lastOutput = result.finalOutput || result.results[result.results.length - 1].result.output;
    } else {
        dom.outputMatrix.textContent = `[MODEL USED: ${result.modelUsed.toUpperCase()} | TOKENS: ${result.tokens} | LATENCY: ${result.latency_ms}ms]\n\n${result.output}`;
        recordAnalytics(state.activeContext || 'none', result.modelUsed, result.tokens);
        showNotification('▣ EXECUTED');
        state.lastOutput = result.output;
    }
    
    state.isExecuting = false;
    dom.executeBtn.disabled = false;
    dom.executeBtn.textContent = '⬢ EXECUTE';
    updateStats(countTokens(dom.commandInput.value), state.activeChain);
    
    if (state.chainMode && !chainActive) {
        setTimeout(() => {
            dom.commandInput.value = state.lastOutput;
            showNotification('◇ CHAINED TO INPUT');
        }, 1000);
    }
}

// --- BOOTSTRAP ---

export function initApp() {
    initializeDomCache();
    
    window.loadFromHistory = loadFromHistory;
    window.recordAnalytics = recordAnalytics;
    
    // --- FIX: Handle Async Capsule Loading ---
    getCapsuleWorkflows().then(chains => {
        renderChainSelector(chains, handleChainSelection);
    }).catch(err => {
        console.error("Failed to load initial capsules", err);
        renderChainSelector({'none': { name: 'SINGLE-TURN (Error)', steps: [] }}, handleChainSelection);
    });
    
    // --- NEW: Load Automation Rules ---
    getAutomationRules().then(rules => {
        renderAutomationRules(rules);
    });

    renderHistory(loadFromHistory);
    updateAnalytics();
    updateStatusIndicators();
    updateStats(countTokens(dom.commandInput.value), state.activeChain);
    renderPreferenceControls(toggleRoutingPreference);
    
    // NEW: Initial Render for Context and Modifiers
    renderContextSelector(contextProfiles, state.activeContext, handleContextSelection);
    renderModifierSelector(availableModifiers, state.activeModifiers, handleModifierToggle);
    
    const runHealthCheck = async () => setBackendStatus(await getHealth());
    runHealthCheck();
    setInterval(runHealthCheck, 5000); 

    // Listeners
    dom.llmOptions.forEach(option => option.addEventListener('click', handleLLMSelection));
    // Removed old context/modifier click listeners as they are now select change events handled in renderers
    dom.commandInput.addEventListener('input', handleTextInput);
    
    // Template Buttons
    if (dom.templateMorning) dom.templateMorning.addEventListener('click', () => loadTemplate('morning'));
    if (dom.templateDeepWork) dom.templateDeepWork.addEventListener('click', () => loadTemplate('deep-work'));
    if (dom.templateLearning) dom.templateLearning.addEventListener('click', () => loadTemplate('learning'));
    if (dom.templateDebug) dom.templateDebug.addEventListener('click', () => loadTemplate('debug'));

    // Control Buttons
    dom.executeBtn.addEventListener('click', executeCommand);
    dom.copyBtn.addEventListener('click', copyOutput);
    dom.chainBtn.addEventListener('click', toggleChainMode);
    dom.clearBtn.addEventListener('click', clearSystem);
    dom.saveBtn.addEventListener('click', saveToHistory);
    
    // Automation Trigger
    if (dom.testTriggerBtn) dom.testTriggerBtn.addEventListener('click', handleManualTrigger);
    
    // Export Buttons
    if(dom.exportObsidian) dom.exportObsidian.addEventListener('click', exportToObsidian);
    if(dom.exportMarkdown) dom.exportMarkdown.addEventListener('click', exportToMarkdown);
    if(dom.exportHistoryBtn) dom.exportHistoryBtn.addEventListener('click', exportHistory);
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            executeCommand();
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);