// /engine/state.js
import fs from 'fs';
import path from 'path';
const STATE_FILE = process.env.NUN_STATE_FILE || path.resolve(process.cwd(), 'data', 'state.json');

export function readState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return {};
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}

export function writeState(obj = {}) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.error('writeState error', e);
  }
}
