// nun_os/frontend/src/ui.js
// Handles all UI rendering and DOM manipulation

import { state, updateLocalStorage } from './config.js';

// --- DOM CACHE SETUP ---
export const dom = {};
export function initializeDomCache() {
    dom.notification = document.getElementById('notification');
    dom.llmOptions = document.querySelectorAll('.llm-option');
    
    // Template Buttons
    dom.templateMorning = document.getElementById('templateMorning');
    dom.templateDeepWork = document.getElementById('templateDeepWork');
    dom.templateLearning = document.getElementById('templateLearning');
    dom.templateDebug = document.getElementById('templateDebug');
    
    dom.exportObsidian = document.getElementById('exportObsidian');
    dom.exportMarkdown = document.getElementById('exportMarkdown');
    dom.chainIndicator = document.getElementById('chainIndicator');
    
    dom.commandInput = document.getElementById('commandInput');
    dom.llmIndicator = document.getElementById('llmIndicator');
    dom.modeIndicator = document.getElementById('modeIndicator');
    dom.outputMatrix = document.getElementById('outputMatrix');
    dom.executeBtn = document.getElementById('executeBtn');
    dom.copyBtn = document.getElementById('copyBtn');
    dom.chainBtn = document.getElementById('chainBtn');
    dom.githubBtn = document.getElementById('githubBtn');
    dom.clearBtn = document.getElementById('clearBtn');
    dom.saveBtn = document.getElementById('saveBtn');
    dom.tokenCount = document.getElementById('tokenCount');
    dom.contextType = document.getElementById('contextType');
    dom.modCount = document.getElementById('modCount');
    dom.workflowName = document.getElementById('workflowName');
    dom.historyContainer = document.getElementById('historyContainer');
    dom.backendStatus = document.getElementById('backendStatus');
    
    // Dropdowns
    dom.chainSelector = document.getElementById('chainSelector');
    dom.contextSelector = document.getElementById('contextSelector');
    dom.modifierSelector = document.getElementById('modifierSelector');
    
    // Router Prefs
    dom.prefLowLatency = document.getElementById('prefLowLatency');
    dom.prefLowCost = document.getElementById('prefLowCost');
    
    // Automation
    dom.automationRulesList = document.getElementById('automationRulesList');
    dom.testTriggerBtn = document.getElementById('testTriggerBtn');

    // Analytics cache
    dom.analytics = {
        totalSessions: document.getElementById('totalSessions'),
        topContext: document.getElementById('topContext'),
        topLLM: document.getElementById('topLLM'),
        avgTokens: document.getElementById('avgTokens'),
        chainCount: document.getElementById('chainCount')
    };
}

// --- RENDERING FUNCTIONS ---

export function renderPreferenceControls(toggleHandler) {
    dom.prefLowLatency.classList.toggle('active', state.preferLowLatency);
    dom.prefLowCost.classList.toggle('active', state.preferLowCost);
    
    dom.prefLowLatency.onclick = () => toggleHandler('preferLowLatency');
    dom.prefLowCost.onclick = () => toggleHandler('preferLowCost');
}

export function renderContextSelector(contextProfiles, activeContext, handler) {
    // Start with "None" option
    let html = `<option value="none" ${!activeContext ? 'selected' : ''}>NO CONTEXT</option>`;
    
    Object.entries(contextProfiles).forEach(([key, profile]) => {
        const displayName = key.replace(/-/g, ' ').toUpperCase();
        const isSelected = activeContext === key;
        html += `<option value="${key}" ${isSelected ? 'selected' : ''}>${displayName}</option>`;
    });
    
    dom.contextSelector.innerHTML = html;
    dom.contextSelector.onchange = (e) => handler(e.target.value);
}

export function renderModifierSelector(modifierList, activeModifiers, handler) {
    // Display active count in default text if any selected
    const count = activeModifiers.size;
    const defaultText = count > 0 ? `SELECT MODIFIER (${count} Active)...` : `SELECT MODIFIER...`;
    
    let html = `<option value="">${defaultText}</option>`;
    
    modifierList.forEach(mod => {
        const isActive = activeModifiers.has(mod);
        const mark = isActive ? "✓ " : "";
        html += `<option value="${mod}">${mark}${mod.toUpperCase()}</option>`;
    });
    
    dom.modifierSelector.innerHTML = html;
    dom.modifierSelector.value = ""; // Reset selection visually
    
    dom.modifierSelector.onchange = (e) => {
        if (e.target.value) {
            handler(e.target.value);
            // Re-render to update checkmarks
            renderModifierSelector(modifierList, activeModifiers, handler);
        }
    };
}

export function renderAutomationRules(rules) {
    if (!rules || rules.length === 0) {
        dom.automationRulesList.innerHTML = '<li>No active rules.</li>';
        return;
    }
    dom.automationRulesList.innerHTML = rules.map(rule => {
        const shortAction = rule.action.replace('chain:', '🔗 ').replace('llm:', '🤖 ');
        return `<li title="${rule.trigger} -> ${rule.action}">${rule.trigger} → ${shortAction}</li>`;
    }).join('');
}

export function renderChainSelector(chainDefinitions, selectChainHandler) {
    dom.chainSelector.innerHTML = Object.entries(chainDefinitions).map(([key, chain]) => {
        const isSelected = state.activeChain === key;
        const stepCount = Array.isArray(chain.steps) ? chain.steps.length : 0;
        return `<option value="${key}" ${isSelected ? 'selected' : ''}>${chain.name.toUpperCase()} (${stepCount} Steps)</option>`;
    }).join('');

    // Attach change listener
    dom.chainSelector.onchange = (e) => {
        selectChainHandler(e.target.value);
    };
}

export function renderChainOutput(chainResult) {
    let html = `
        <div class="chain-step-title" style="border-bottom: 2px solid var(--color-green-accent); padding-bottom: 5px; margin-bottom: 10px;">
            WORKFLOW: ${chainResult.success ? 'SUCCESS' : 'FAILURE'}
            <span style="float: right; font-size: 0.8em; color: var(--color-green-accent);">TOTAL STEPS: ${chainResult.results ? chainResult.results.length : 0}</span>
        </div>
    `;

    if (chainResult.results) {
        chainResult.results.forEach((stepResult, index) => {
            const model = stepResult.modelUsed.toUpperCase();
            const latency = stepResult.result.latency_ms || stepResult.result.latency || 'N/A';
            const tokens = stepResult.result.tokens || 'N/A';
            const stepName = stepResult.step.action.toUpperCase();
    
            html += `
                <div class="chain-step-output">
                    <div class="chain-step-title">STEP ${index + 1}: ${stepName} (${model})</div>
                    <div style="font-size: 0.7em; color: var(--color-amber-secondary); margin-bottom: 5px;">
                        TOKENS: ${tokens} | LATENCY: ${latency}ms
                    </div>
                    <pre style="font-size: 11px; white-space: pre-wrap; color: var(--color-amber-secondary); border-left: 3px solid rgba(0, 255, 136, 0.2); padding-left: 10px;">${stepResult.result.output}</pre>
                </div>
            `;
        });
    }

    // If it was a direct match from automation trigger without steps, handle gracefully
    if (!chainResult.results && chainResult.matches) {
         html += `<div style="padding:10px;">Triggered ${chainResult.matches} rules. See console or results object.</div>`;
    }

    html += `
        <div style="font-size: 0.9em; color: var(--color-green-accent); margin-top: 15px;">
            FINAL OUTPUT: The final result of the pipeline is the last step's output.
        </div>
    `;

    dom.outputMatrix.innerHTML = html;
}

export function renderHistory(loadFromHistoryHandler) {
    if (state.commandHistory.length === 0) {
        dom.historyContainer.innerHTML = '<div style="color: rgba(255, 170, 51, 0.5); text-align: center; padding: 15px;">NO HISTORY</div>';
        return;
    }

    dom.historyContainer.innerHTML = state.commandHistory.map((entry, idx) => {
        const date = new Date(entry.timestamp);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const type = entry.chain ? `[${entry.chain.toUpperCase().split('.')[0]}]` : entry.llm;
        return `
            <div style="padding: 6px; border: 1px solid rgba(255, 140, 0, 0.3); background: rgba(0, 0, 0, 0.6); margin-bottom: 4px; cursor: pointer;" data-history-idx="${idx}" role="button" tabindex="0" aria-label="Load history item from ${timeStr}">
                <div style="color: rgba(255, 170, 51, 0.5); font-size: 0.85em; margin-bottom: 3px; pointer-events: none;">${timeStr} | ${type}</div>
                <div style="color: #ffaa33; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; pointer-events: none;">${entry.input}</div>
            </div>
        `;
    }).join('');

    dom.historyContainer.querySelectorAll('[data-history-idx]').forEach(item => {
        item.addEventListener('click', (e) => {
            loadFromHistoryHandler(parseInt(e.currentTarget.dataset.historyIdx, 10));
        });
    });
}

// --- ANALYTICS AND STATUS UPDATES ---

export function updateAnalytics() {
    const analytics = state.analytics;
    dom.analytics.totalSessions.textContent = analytics.sessions || 0;
    dom.analytics.chainCount.textContent = analytics.chainExecutions || 0;

    const topContext = Object.entries(analytics.contexts || {}).sort((a, b) => b[1] - a[1])[0];
    dom.analytics.topContext.textContent = topContext ? topContext[0] : '-';

    const topLLM = Object.entries(analytics.llms || {}).sort((a, b) => b[1] - a[1])[0];
    dom.analytics.topLLM.textContent = topLLM ? topLLM[0] : '-';

    const avgTokens = analytics.sessions > 0 ? Math.round(analytics.totalTokens / analytics.sessions) : 0;
    dom.analytics.avgTokens.textContent = avgTokens;
}

export function recordAnalytics(context, llm, tokens) {
    const analytics = state.analytics;
    analytics.sessions = (analytics.sessions || 0) + 1;
    analytics.totalTokens = (analytics.totalTokens || 0) + tokens;
    analytics.contexts = analytics.contexts || {};
    analytics.llms = analytics.llms || {};
    analytics.contexts[context] = (analytics.contexts[context] || 0) + 1;
    analytics.llms[llm] = (analytics.llms[llm] || 0) + 1;

    if (state.activeChain !== 'none') {
        analytics.chainExecutions = (analytics.chainExecutions || 0) + 1;
        analytics.llms['CHAIN'] = (analytics.llms['CHAIN'] || 0) + 1;
    }

    updateLocalStorage('nun_analytics', analytics);
    updateAnalytics();
}

export function updateStatusIndicators(autoDetected = null) {
    // 1. LLM Indicator
    const displayLLM = autoDetected || state.activeLLM;
    dom.llmIndicator.textContent = `◈ ${displayLLM.toUpperCase().substring(0, 6)}`;

    const colorMap = {
        'claude': '--color-amber-primary',
        'gemini': '--color-green-accent',
        'gpt4': '--color-purple-accent',
        'auto': '--color-red-error',
        'CHAIN': '--color-green-accent'
    };
    const colorVar = colorMap[displayLLM] || colorMap['auto'];
    dom.llmIndicator.style.borderColor = `var(${colorVar})`;
    dom.llmIndicator.style.color = `var(${colorVar})`;

    // 2. Mode Indicator (Context)
    const contextIndicator = dom.modeIndicator;
    if (state.activeContext) {
        contextIndicator.textContent = `◈ ${state.activeContext.toUpperCase().substring(0, 5)}`;
        contextIndicator.style.borderColor = 'var(--color-amber-accent)';
        contextIndicator.style.color = 'var(--color-amber-accent)';
    } else {
        contextIndicator.textContent = '◈ READY';
        contextIndicator.style.borderColor = 'var(--color-amber-primary)';
        contextIndicator.style.color = 'var(--color-amber-primary)';
    }
}

export function updateStats(tokenCount, currentChainName) {
    dom.tokenCount.textContent = tokenCount;
    dom.contextType.textContent = state.activeContext ? state.activeContext.toUpperCase().substring(0, 5) : '-';
    dom.modCount.textContent = state.activeModifiers.size;
    dom.workflowName.textContent = currentChainName === 'none' ? '-' : currentChainName.toUpperCase();
}

export function showNotification(message, isError = false) {
    const notification = dom.notification;
    notification.textContent = message;
    notification.classList.toggle('error', isError);
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

export function setBackendStatus(isOnline) {
    if (isOnline) {
        dom.backendStatus.textContent = '🟢 BACKEND ONLINE';
        dom.backendStatus.classList.add('online');
    } else {
        dom.backendStatus.textContent = '🔴 BACKEND OFFLINE';
        dom.backendStatus.classList.remove('online');
    }
}