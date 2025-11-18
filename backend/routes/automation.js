import { Router } from 'express';
import { loadRules, saveRule, deleteRule, evaluateRules } from '../../engine/automationCore.js';
import { runChain } from '../../engine/chainEngine.js';
import { runLLM } from '../services/executor.js';
import { config as engineConfig } from '../../engine/config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const CAPSULES_DIR = path.resolve(path.dirname(__filename), '../../capsules');

// --- HELPER: Workflow Loader (Reused logic for automation context) ---
async function loadCapsuleWorkflow(chainName) {
    // chainName might be "coding.fix" or "compliance.pii_check"
    // We need to find which capsule folder contains this workflow or ID.
    // For simplicity in V1: We assume the chainName maps to a folder/id strategy 
    // OR we scan all like the capsule route does.
    // Optimization: Just scan specifically if possible, or re-scan all.
    
    // Quick Scan:
    if (!fs.existsSync(CAPSULES_DIR)) return null;
    const folders = fs.readdirSync(CAPSULES_DIR);
    
    for (const folder of folders) {
        const workflowPath = path.join(CAPSULES_DIR, folder, 'workflow.js');
        if (fs.existsSync(workflowPath)) {
            try {
                const module = await import(`file://${workflowPath}`);
                const workflow = module.default;
                // Match by name (e.g. "compliance.pii_check") or folder name
                if (workflow.name === chainName || folder === chainName) {
                    return workflow;
                }
            } catch (e) { console.error(e); }
        }
    }
    return null;
}

// --- ENDPOINTS ---

// 1. GET /api/automation - List all rules
router.get('/', (req, res) => {
    res.json(loadRules());
});

// 2. POST /api/automation/rule - Add/Update a rule
router.post('/rule', (req, res) => {
    try {
        const rule = req.body;
        if (!rule.trigger || !rule.action) {
            return res.status(400).json({ error: "Rule requires 'trigger' and 'action'" });
        }
        const saved = saveRule(rule);
        res.json(saved);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. DELETE /api/automation/rule/:id - Remove a rule
router.delete('/rule/:id', (req, res) => {
    deleteRule(req.params.id);
    res.json({ success: true });
});

// 4. POST /api/automation/trigger - The EVENT BUS
// This is the magic endpoint. You trigger it, it finds rules, and runs them.
router.post('/trigger', async (req, res) => {
    try {
        const { event, data } = req.body; // e.g. { event: "system.startup", data: {} }
        
        console.log(`[AUTOMATION] Event Received: ${event}`);
        
        const matches = evaluateRules(event, data);
        const executionResults = [];

        if (matches.length === 0) {
            return res.json({ status: "no_rules_matched", event });
        }

        // Execute all matching rules
        for (const rule of matches) {
            console.log(`[AUTOMATION] Executing Rule: ${rule.id} -> ${rule.action}`);
            
            const input = rule.input || data?.input || "Automatic Trigger";
            
            if (rule.action.startsWith('chain:')) {
                // Execute a Chain
                const chainName = rule.action.replace('chain:', '');
                const chainDef = await loadCapsuleWorkflow(chainName);
                
                if (chainDef) {
                    // Executor adapter for chain engine
                    const executorAdapter = async (llm, prompt, meta) => {
                        return await runLLM(llm, prompt, { isCompiled: true });
                    };

                    const result = await runChain(chainDef, input, {
                        executorFn: executorAdapter,
                        contextProfiles: engineConfig.contextProfiles,
                        injectionTemplates: engineConfig.injectionTemplates,
                        modelCatalog: engineConfig.modelCatalog
                    });
                    executionResults.push({ ruleId: rule.id, type: 'chain', result });
                } else {
                    executionResults.push({ ruleId: rule.id, error: `Chain '${chainName}' not found` });
                }

            } else if (rule.action.startsWith('llm:')) {
                // Execute a single LLM Prompt
                // e.g. "llm:claude"
                const model = rule.action.replace('llm:', '');
                const result = await runLLM(model, input, {
                    // We can add default context/modifiers for automation here if we want
                });
                executionResults.push({ ruleId: rule.id, type: 'llm', result });
            }
        }

        res.json({ 
            status: "executed", 
            matches: matches.length, 
            results: executionResults 
        });

    } catch (e) {
        console.error("Automation Trigger Error:", e);
        res.status(500).json({ error: e.message });
    }
});

export default router;