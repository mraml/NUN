import { Router } from 'express';
import * as controller from '../controllers/llmController.js';

const router = Router();

router.post('/run', controller.runModel);

export default router;
