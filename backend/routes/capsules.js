import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
// Navigate up from /backend/routes/ to /capsules
const CAPSULES_DIR = path.resolve(path.dirname(__filename), '../../capsules');

/**
 * Helper: Dynamically load a capsule's workflow.js
 */
async function loadCapsuleData(folderName) {
    const dirPath = path.join(CAPSULES_DIR, folderName);
    const manifestPath = path.join(dirPath, 'manifest.json');
    const workflowPath = path.join(dirPath, 'workflow.js');

    // 1. Check for Manifest
    if (!fs.existsSync(manifestPath)) return null;
    
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // 2. Load Workflow if it exists
        let workflow = null;
        if (fs.existsSync(workflowPath)) {
            // Dynamic import requires a file URL on Windows/ESM environments
            const module = await import(`file://${workflowPath}`);
            workflow = module.default;
        }

        return {
            id: manifest.id || folderName,
            meta: manifest,
            workflow: workflow
        };

    } catch (e) {
        console.error(`Failed to load capsule ${folderName}:`, e);
        return null;
    }
}

/**
 * GET /api/capsules
 * Returns all valid capsules found in the filesystem.
 */
router.get('/', async (req, res) => {
    try {
        if (!fs.existsSync(CAPSULES_DIR)) {
            // If folder doesn't exist, return empty list (or create it)
            fs.mkdirSync(CAPSULES_DIR, { recursive: true });
            return res.json({});
        }

        const folders = fs.readdirSync(CAPSULES_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const capsules = {};
        
        // Parallel loading
        const loaded = await Promise.all(folders.map(loadCapsuleData));
        
        loaded.forEach(cap => {
            if (cap && cap.workflow) {
                // Map by the workflow name used in UI (e.g. 'compliance.pii_check')
                // Fallback to folder name if workflow is unnamed
                const key = cap.workflow.name || cap.id; 
                capsules[key] = cap.workflow;
            }
        });

        // Add fallback single-turn "none" chain
        capsules['none'] = { name: 'SINGLE-TURN', steps: [] };

        res.json(capsules);
    } catch (e) {
        console.error("Capsule Route Error:", e);
        res.status(500).json({ error: "Failed to load capsules" });
    }
});

export default router;