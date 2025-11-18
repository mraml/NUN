import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './utils/config.js';
import llmRoutes from './routes/llm.js';
import chainRoutes from './routes/chain.js';
import capsuleRoutes from './routes/capsules.js';
import memoryRoutes from './routes/memory.js';
import automationRoutes from './routes/automation.js';
import healthRoutes from './routes/health.js';

const app = express();

// Path setup for static files (for serving the frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend'); // Locate the frontend folder

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Express will now serve index.html and all frontend files from /frontend
app.use(express.static(FRONTEND_PATH));

// Routes
app.use('/api/llm', llmRoutes);
app.use('/api/chain', chainRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/health', healthRoutes);

// Serve index.html for all root requests explicitly
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});


app.listen(config.PORT, () => {
  console.log(`N.U.N Backend running at http://localhost:${config.PORT}`);
  console.log(`Frontend accessible at http://localhost:${config.PORT}`);
});