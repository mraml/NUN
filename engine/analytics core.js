// /engine/analyticsCore.js
import fs from 'fs';
import path from 'path';

const DB_FILE = process.env.NUN_ANALYTICS_FILE || path.resolve(process.cwd(), 'data', 'analytics.json');

function ensureFile() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ sessions: 0, contexts: {}, llms: {}, totalTokens: 0 }, null, 2));
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
    json.contexts[context] = (json.contexts[context] || 0) + 1;
    json.llms[llm] = (json.llms[llm] || 0) + 1;
    fs.writeFileSync(DB_FILE, JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('analyticsCore.recordSession error', e);
  }
}

export function readAnalytics() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}
