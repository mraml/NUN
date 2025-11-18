---

🧠 N.U.N. — Neural Utility Nexus

A Personal LLM Operating System for Reasoning, Coding, Creativity, and Automation

(Node.js Edition — Multipool Architected)


---

🌐 Overview

N.U.N. (Neural Utility Nexus) is a personal LLM OS that intelligently orchestrates multiple AI models, automates complex workflows, manages memory, and provides a modular interface for everyday cognitive tasks — all from a unified, extensible interface.

It blends:

Multi-model routing

Context-aware reasoning

Chain-based workflow execution

A flexible plug-in architecture (“Capsules”)

Automation scripting

Memory + analytics

Local persistence


N.U.N. transforms large language models into a reliable, composable, task-oriented system instead of a simple chat frontend.


---

🚀 Features

📊 Multi-Model Routing (LLM Multipool)

AUTO mode intelligently selects the best model based on:

Task type (coding, reasoning, creative, etc.)

Latency / cost preferences

Per-model strengths

Complexity of user input

Chain stage requirements

Past performance analytics


Supports:

Claude

GPT

Gemini

Local models (WebGPU/MLC)

and custom providers via adapters.



---

🧩 Capsule System (Plug-in Architecture)

Capsules are modular “micro-apps” that extend N.U.N.’s capabilities.

Included default capsules:

Coding Capsule → debugging, refactoring, test-first workflows

Creative Capsule → story/poem engines, worldbuilders

Compliance Capsule → configuration mapping, security validation

Productivity Capsule → morning routines, planning, summarization


Capsules can define:

Triggers

Custom workflows

UI extensions

Context rules

Custom memory spaces



---

🔗 Chain Engine (Multi-Step Workflows)

Define workflows that run automatically:

{
  "name": "coding.fix",
  "steps": [
    { "action": "analyze", "llm": "claude", "modifiers": ["metacognitive"] },
    { "action": "propose-fix", "llm": "gemini", "modifiers": ["test-first"] },
    { "action": "review", "llm": "claude" }
  ]
}

Supports:

Sequential execution

Context propagation

Modifier stacking

Per-step routing

Conditional branching

Early termination

Per-step metadata



---

🔧 Automation Layer (optional)

A tiny DSL that lets you automate daily cognitive tasks:

when "morning" run "morning.briefing"
when file.upload run "coding.fix"
when result.contains("error") reroute "gemini"

This turns N.U.N. into your own personal AI automation server.


---

🧠 Context & Modifier Engine

Auto-detects task context (creative, coding, research, deep-work, etc.)

Supports custom contexts and profiles

Modifier system injects structured instructions:

ELI5

Socratic

Metacognitive

Test-first

Step-by-step



Modifier injection respects:

Order

Phase (pre/post)

Context-aware weighting



---

🧠 Persistent Memory + Analytics

N.U.N. tracks:

Sessions

Per-model usage

Token consumption

Per-context frequency

Capsule activations


Memory supports:

Short-term chain memory

Long-term preference memory

Capsule-specific memory


Uses JSON or SQLite depending on configuration.


---

🌐 Clean, Extendable Architecture

Full separation of UI, backend, and shared engine modules

Easy to contribute or integrate new LLM providers

JSON-based chain & capsule definitions

Fully modular engine functions



---

📁 Project Structure

nun/
├── frontend/                 # UI + browser app
│   ├── public/
│   └── src/
│
├── backend/                  # Node.js server + APIs
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── utils/
│
├── engine/                   # Shared logic (FE + BE)
│   ├── promptCompiler.js
│   ├── contextDetector.js
│   ├── modifierCompiler.js
│   ├── router.js
│   ├── chainEngine.js
│   ├── analyticsCore.js
│   └── state.js
│
├── capsules/                 # Modular plug-ins
│   ├── coding/
│   ├── creative/
│   ├── compliance/
│   └── productivity/
│
└── data/                     # Storage
    ├── sessions.db
    ├── memory.json
    └── analytics.json


---

📥 Installation

1. Clone the repository

git clone https://github.com/yourusername/nun.git
cd nun

2. Install backend dependencies

cd backend
npm install

3. Install frontend dependencies

cd ../frontend
npm install

4. Configure environment variables

Create /backend/.env:

PORT=4000

# Example provider keys
ANTHROPIC_API_KEY=<your key>
OPENAI_API_KEY=<your key>
GOOGLE_API_KEY=<your key>

# Storage paths
NUN_ANALYTICS_FILE=../data/analytics.json
NUN_STATE_FILE=../data/state.json


---

▶️ Running the App

Backend

cd backend
npm run dev

Frontend (Vite or similar)

cd frontend
npm run dev

Your app should be available at:

http://localhost:5173

Backend API runs at:

http://localhost:4000


---

⚙️ Configuration

See /engine/config.js (if you create it) for:

Default model catalog

Context profiles

Modifier templates

Chain defaults

Capsule loader rules

Router preferences



---

🧪 Testing

Basic engine test:

node scripts/test_engine.js

Backend API test:

curl http://localhost:4000/api/health

Run chain example:

curl -X POST http://localhost:4000/api/chain/run -d '{...}'


---

🧩 Creating a Capsule

Capsules live under /capsules/<name>/.

Required files:

capsules/<name>/manifest.json
capsules/<name>/workflow.js

Example manifest.json:

{
  "name": "Coding Capsule",
  "version": "1.0",
  "triggers": ["debug", "fix", "refactor"],
  "workflow": "./workflow.js"
}

Example workflow.js:

export default {
  name: "coding.fix",
  steps: [
    { action: "analyze", llm: "claude" },
    { action: "propose-fix", llm: "gemini" },
    { action: "review", llm: "claude" }
  ]
};

Capsules can:

Extend UI

Add context profiles

Add chain definitions

Register triggers

Store their own memory



---

🔗 API Endpoints

POST /api/llm/run

Execute a single LLM call.

POST /api/chain/run

Execute a multi-step workflow.

POST /api/capsules/execute

Run a capsule-defined action.

GET /api/memory

Retrieve memory contents.

POST /api/automation/trigger

Execute automation rule.

GET /api/health

Basic server status.


---

🎛 Model Providers

Plug-ins exist for:

OpenAI

Anthropic

Google AI Studio

WebGPU/MLC (local models)


Add new ones by creating adapters in /backend/services/providers/.


---

🧠 Roadmap

💬 Real-time streaming output

🖼️ Multimodal ingestion (images, PDFs)

🗂️ Project workspaces

🔄 Multi-agent collaboration

📝 Prompt templates marketplace

🧩 Web UI for chain builder

🔒 Role-based access / multi-user mode



---

🤝 Contributing

PRs are welcome!

If you want to build:

new capsules

new model adapters

routing improvements

UI enhancements

chain templates


…feel free to open issues or discussions.


---

📝 License

MIT License.


---

✨ Closing

N.U.N. is more than a prompt tool — it's a personal cognitive OS.
With a robust engine, modular architecture, multi-model routing, and workflow automation, it becomes a force multiplier for any developer, creator, or knowledge worker.

If you want, I can also generate:

A logo & branding pack

A demo GIF

A docs website

A Capsule Store concept

A marketing landing page


Would you like any of those?
