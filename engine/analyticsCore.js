// /engine/analyticsCore.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default to a path relative to this file if env var not set
const DEFAULT_DB_PATH = path.resolve(__dirname, '..', 'data', 'analytics.json');
const DB_FILE = process.env.NUN_ANALYTICS_FILE || DEFAULT_DB_PATH;

function ensureFile() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Initialize with default structure if missing
    if (!fs.existsSync(DB_FILE)) {
      const initialData = { sessions: 0, contexts: {}, llms: {}, totalTokens: 0, chainExecutions: 0 };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
  } catch (e) {
    console.warn('analyticsCore: ensureFile failed', e);
  }
}

export function recordSession({ context = 'none', llm = 'unknown', tokens = 0 } = {}) {
  ensureFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const json = JSON.parse(raw || '{}');
    
    json.sessions = (json.sessions || 0) + 1;
    json.totalTokens = (json.totalTokens || 0) + (tokens || 0);
    
    json.contexts = json.contexts || {};
    json.llms = json.llms || {};
    
    // Increment specific counters
    json.contexts[context] = (json.contexts[context] || 0) + 1;
    json.llms[llm] = (json.llms[llm] || 0) + 1;
    
    fs.writeFileSync(DB_FILE, JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('analyticsCore.recordSession error', e);
  }
}

// Crucial function used by the Router for historical biasing
export function readAnalytics() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '{}');
  } catch (e) {
    console.error('analyticsCore.readAnalytics error', e);
    return {};
  }
}