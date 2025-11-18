import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 1. Load .env just in case (for server environments)
dotenv.config();

// 2. Helper to resolve paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Try to load secrets.json from the project root
// Path: backend/utils/ -> backend/ -> nun_os/secrets.json
const secretsPath = path.resolve(__dirname, '../../secrets.json');
let secrets = {};

if (fs.existsSync(secretsPath)) {
  try {
    const rawData = fs.readFileSync(secretsPath, 'utf8');
    secrets = JSON.parse(rawData);
    console.log("Loaded configuration from secrets.json");
  } catch (e) {
    console.error("Error parsing secrets.json:", e.message);
  }
}

// 4. Export combined config (Environment variables take precedence over secrets.json)
export const config = {
  PORT: process.env.PORT || secrets.PORT || 4000,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || secrets.ANTHROPIC_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || secrets.OPENAI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || secrets.GOOGLE_API_KEY
};