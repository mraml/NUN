// /backend/routes/memory.js
import { Router } from 'express';
const router = Router();

// Placeholder for memory system (Phase 7)
router.get('/', (req, res) => {
    res.json({ message: "Memory system active", items: [] });
});

export default router;