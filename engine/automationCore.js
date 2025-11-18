import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RULES_FILE = process.env.NUN_RULES_FILE || path.resolve(__dirname, '..', 'data', 'automation.json');

// Ensure data directory exists
function ensureFile() {
    try {
        const dir = path.dirname(RULES_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(RULES_FILE)) {
            // Default starter rules
            const defaults = [
                { id: 'rule_1', trigger: 'system.startup', action: 'chain:compliance.pii_check', input: 'System Startup Check' }
            ];
            fs.writeFileSync(RULES_FILE, JSON.stringify(defaults, null, 2));
        }
    } catch (e) {
        console.error('automationCore: ensureFile failed', e);
    }
}

/**
 * Loads all automation rules from storage.
 */
export function loadRules() {
    ensureFile();
    try {
        return JSON.parse(fs.readFileSync(RULES_FILE, 'utf8') || '[]');
    } catch (e) {
        return [];
    }
}

/**
 * Saves a new rule or updates existing ones.
 */
export function saveRule(rule) {
    const rules = loadRules();
    const existingIndex = rules.findIndex(r => r.id === rule.id);
    
    if (existingIndex >= 0) {
        rules[existingIndex] = rule;
    } else {
        // Generate simple ID if missing
        if (!rule.id) rule.id = `rule_${Date.now()}`;
        rules.push(rule);
    }
    
    fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2));
    return rule;
}

/**
 * Deletes a rule by ID.
 */
export function deleteRule(ruleId) {
    let rules = loadRules();
    rules = rules.filter(r => r.id !== ruleId);
    fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2));
}

/**
 * Evaluates an incoming event against the rules.
 * Returns an array of matching rules that should be executed.
 * * @param {string} eventType - e.g., 'system.startup', 'file.upload'
 * @param {object} eventData - Context data for the event
 */
export function evaluateRules(eventType, eventData = {}) {
    const rules = loadRules();
    const matches = [];

    for (const rule of rules) {
        // 1. Check Trigger Match (Exact match for now, could be regex later)
        if (rule.trigger === eventType) {
            // 2. (Optional) Check Condition Logic
            // e.g., if rule has "condition": "data.size > 100"
            // For Phase 6 V1, we skip complex eval and trust the trigger.
            matches.push(rule);
        }
    }
    
    return matches;
}