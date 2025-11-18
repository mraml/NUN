import express from 'express';
import cors from 'cors';
import { config } from './utils/config.js';
import llmRoutes from './routes/llm.js';
import chainRoutes from './routes/chain.js';
import capsuleRoutes from './routes/capsules.js';
import memoryRoutes from './routes/memory.js';
import automationRoutes from './routes/automation.js';
import healthRoutes from './routes/health.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api/llm', llmRoutes);
app.use('/api/chain', chainRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/health', healthRoutes);

app.listen(config.PORT, () => {
  console.log(`N.U.N Backend running at http://localhost:${config.PORT}`);
});
