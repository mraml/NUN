// nun_os/frontend/src/api.js
// Handles all communication with the Node.js Backend

const BASE_URL = 'http://localhost:4000/api';

export async function runSingleTurn(payload) {
    return runApiCall(`${BASE_URL}/llm/run`, payload);
}

export async function runChainWorkflow(payload) {
    return runApiCall(`${BASE_URL}/chain/run`, payload);
}

// --- NEW AUTOMATION ENDPOINTS ---

export async function getAutomationRules() {
    try {
        const response = await fetch(`${BASE_URL}/automation`);
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error("Failed to fetch automation rules", e);
        return [];
    }
}

export async function triggerAutomationEvent(event, data = {}) {
    return runApiCall(`${BASE_URL}/automation/trigger`, { event, data });
}

// -------------------------------

async function runApiCall(url, payload) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
            throw new Error(`Backend Status ${response.status}: ${errorData.error || 'Unknown API Error'}`);
        }

        return response.json();
    } catch (error) {
        console.error("API Call Failed:", error);
        return {
            error: true,
            message: `⚠ N.U.N. CONNECTION ERROR: ${error.message}.\n\nEnsure your Node.js backend is running on http://localhost:4000 (npm run dev).`
        };
    }
}

export async function getHealth() {
    try {
        const response = await fetch(`${BASE_URL}/health`);
        return response.ok;
    } catch (e) {
        return false;
    }
}

export async function getCapsuleWorkflows() {
    try {
        const response = await fetch(`${BASE_URL}/capsules`);
        if (!response.ok) throw new Error("Failed to fetch capsules");
        return await response.json();
    } catch (e) {
        console.error("Capsule Fetch Error:", e);
        return { 'none': { name: 'SINGLE-TURN (Offline)', steps: [] } };
    }
}