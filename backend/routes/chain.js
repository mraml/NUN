// /backend/routes/chain.js
import { Router } from 'express';
import { runChain } from '../../engine/chainEngine.js';
import { runLLM } from '../services/executor.js';
import { config as engineConfig } from '../../engine/config.js';

const router = Router();

router.post('/run', async (req, res) => {
    try {
        const { chain, input } = req.body;
        // Executor adapter for the engine
        const executorAdapter = async (llm, prompt, meta) => {
            return await runLLM(llm, prompt, meta);
        };

        const result = await runChain(chain, input, {
            executorFn: executorAdapter,
            contextProfiles: engineConfig.contextProfiles,
            injectionTemplates: engineConfig.injectionTemplates
        });

        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

export default router;