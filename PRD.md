NUN

Below is the full PRD, architecture diagram, and a phase-by-phase implementation tracker for transforming N.U.N. into a real Node.js-powered LLM Multipool OS.

This PRD includes:

✔ Product Vision
✔ User Stories
✔ System Architecture (with diagram)
✔ Module-Level Architecture
✔ Execution Flow
✔ API Design
✔ Data & State Models
✔ Implementation Phases (with checklists)
✔ Future Extensions
✔ Engineering Constraints

Everything referenced in earlier recommendations is included here.

🚀 PRODUCT REQUIREMENTS DOCUMENT (PRD)

N.U.N. — Neural Utility Nexus (Node.js Edition)

Version 1.0 – Multipool Foundation


---

1. PRODUCT VISION

N.U.N. (Neural Utility Nexus) becomes:

> A personal LLM operating system that intelligently routes work across multiple AI models, automates workflows, supports modular capsules, and provides a universal interface for reasoning, creativity, coding, and daily automation.



The Node.js backend provides:

A unified API for calling any LLM

Model routing logic

Session memory

Chain/workflow execution

Capsule (plug-in) architecture

Persistent storage

Local automation scheduling


This turns N.U.N. from a UI-only prompt builder into an actual computational platform.


---

2. TARGET USERS & USER STORIES

Primary Users

Power users of AI

Developers

Creatives & writers

Analysts

Knowledge workers

Productivity-focused users

People performing complex tasks across coding, text, and decision-making



---

User Stories

🎯 Prompting & Execution

As a user, I want to send a task and have N.U.N. choose the best model automatically.

As a user, I want fast or deep modes depending on context.


🧠 Context & Modifiers

As a user, I want context-aware responses without manual configuration.

As a user, I want to stack modifiers like ELI5, SOCratic, Test-First.


🔗 Chains / Workflows

As a user, I want multi-step chains that run without handholding.

As a user, I want to re-run or customize steps.


🤖 Automation

As a user, I want N.U.N. to automate daily routines and repetitive tasks.


📦 Capsules (Plug-ins)

As a developer, I want to add capsules such as Coding Assistant, Creative Studio, or Compliance Helper.


🧬 Memory

As a user, I want N.U.N. to remember preferences and adapt over time.


🌐 Persistence

As a user, I want to save sessions to Obsidian, GitHub, or local files.


🧩 Extensibility

As a developer, I want a clear plugin API to add new functionality without modifying core code.



---

3. FEATURE REQUIREMENTS

Core Features

Prompt compilation engine

Context detection

Modifier engine

Multi-LLM routing (scoring-based)

Command → model execution pipeline

Chain workflows (multi-step pipelines)

History + analytics

File export


Advanced Features

Capsule architecture

Multi-model debate

Agent frameworks (branching & control flow)

Memory persistence

Automation scripting layer

API for external tools



---

4. SYSTEM ARCHITECTURE

Includes:

Node.js backend (Express or Fastify)

Frontend UI (your existing HTML/JS)

Shared engine modules (imported by both front + back for consistency)

Storage layer

Capsule loader



---

ARCHITECTURE DIAGRAM

┌────────────────────────────┐
                          │        FRONTEND UI         │
                          │ (NUN HTML / JS Interface)  │
                          └──────────────┬─────────────┘
                                         │
                                         ▼
                    ┌───────────────────────────────┐
                    │    FRONTEND ENGINE LAYER      │
                    │  (context, modifiers, UI state│
                    │   prompt compiler client-side)│
                    └──────────────┬────────────────┘
                                   │ REST
                                   ▼
               ┌─────────────────────────────────────────┐
               │             NODE.JS BACKEND             │
               ├──────────────────────────┬──────────────┤
               │ Model Executor           │ Engine Core   │
               │ - OpenAI                 │ - Routing     │
               │ - Anthropic              │ - Chains      │
               │ - Google                 │ - Workflows   │
               │ - Local/WebGPU           │ - Memory      │
               └──────────┬───────────────┴───────────────┘
                          │
                          ▼
           ┌────────────────────────────────────────────┐
           │         STORAGE + RUNTIME STATE             │
           │  - SQLite (sessions, analytics, memory)     │
           │  - File system capsules                     │
           │  - Embeddings (optional)                    │
           └────────────────────────────────────────────┘


---

5. MODULE-LEVEL ARCHITECTURE

/engine/ (Shared between FE and BE)

promptCompiler.js

contextDetector.js

modifierCompiler.js

router.js

chainEngine.js

memory.js

analytics.js


/backend/

server.js

routes/llm.js

routes/sessions.js

routes/capsules.js

routes/automation.js


/capsules/

coding/

creative/

compliance/

productivity/


/data/

sessions.db (SQLite)

history.json

memory.json



---

6. EXECUTION FLOW

User sends input in UI → Node.js backend executes → returns final output

UI INPUT
  ► detect context
  ► apply modifiers
  ► compile prompt

SEND TO BACKEND
  ► router chooses model
  ► executor runs model
  ► memory updates
  ► chain engine (if enabled)
  ► analytics saved

RETURN TO UI


---

7. API DESIGN

POST /api/run

{
  "input": "Explain Kubernetes networking",
  "context": "learning",
  "modifiers": ["eli5", "expand"],
  "llm": "auto"
}

Response:

{
  "modelUsed": "claude-3-7-sonnet",
  "output": "...",
  "tokens": 532,
  "latency_ms": 1480
}


---

POST /api/chain/run

Runs multi-step workflows.


---

POST /api/capsule/execute

Execute a specific capsule workflow.


---

8. DATA MODELS

Session Object

{
  id,
  timestamp,
  input,
  output,
  llm,
  context,
  modifiers,
  tokens,
  chainUsed: boolean
}

Chain Definition

{
  name,
  steps: [
    { action, llm, context, modifiers }
  ]
}

Capsule Metadata

{
  name,
  version,
  triggers,
  workflow,
  uiExtensions: {}
}


---

9. IMPLEMENTATION PHASE TRACKER

Here is your project plan, matching the phases I proposed earlier.


---

✔️ PHASE 1 — Modularization (UI Engine Extraction)

Goal: Move logic out of the HTML file.

Tasks

[ ] Create /engine/ folder

[ ] Extract context detector

[ ] Extract modifier engine

[ ] Extract prompt compiler

[ ] Extract analytics module

[ ] Extract state management

[ ] Replace inline JS calls with imports

[ ] Clean UI to use engine API


Deliverable

✔ Clean separation of UI & logic, ready for backend.


---

✔️ PHASE 2 — Node.js Backend + LLM Execution Layer

Tasks

[ ] Create Node.js project

[ ] Add Express/Fastify

[ ] Implement /api/run

[ ] Connect to model APIs (OpenAI, Claude, Gemini)

[ ] Add retry + error handling

[ ] Add logging

[ ] Connect backend with frontend


Deliverable

✔ Full stack execution.


---

✔️ PHASE 3 — Chain Engine

Tasks

[ ] Create chain definition schema

[ ] Implement sequential executor

[ ] Add branching support

[ ] Add memory passing between steps

[ ] Add UI support for chain configuration


Deliverable

✔ True multi-step workflows.


---

✔️ PHASE 4 — Smart Model Router (AUTO Mode v2)

Tasks

[ ] Build scoring-based model selection

[ ] Add complexity analyzer

[ ] Benchmark models for tasks

[ ] Add caching for route results

[ ] Integrate router into chain steps


Deliverable

✔ Adaptive model selection surpassing human choices.


---

✔️ PHASE 5 — Capsule System (Plug-ins)

Tasks

[ ] Capsule loader

[ ] Capsule API

[ ] First-party capsules: coding, creative, compliance

[ ] Dynamic UI injection

[ ] Capsule-specific workflows

[ ] Capsule manifest files


Deliverable

✔ N.U.N. becomes extensible.


---

✔️ PHASE 6 — Automation Layer

Tasks

[ ] Build basic DSL

[ ] Implement event listeners

[ ] Add scheduler

[ ] Add custom automation rules

[ ] Add automation UI page


Deliverable

✔ Automated routines & triggers.


---

✔️ PHASE 7 — Memory System

Tasks

[ ] Implement short-term memory

[ ] Implement long-term memory

[ ] Embedding-based recall

[ ] Capsule-specific memory

[ ] History → memory consolidation

[ ] UI for memory management


Deliverable

✔ Adaptive N.U.N. that learns over time.


---

✔️ PHASE 8 — Full Multipool Orchestration

Tasks

[ ] Parallel model calls

[ ] Debate mode

[ ] Load balancing

[ ] Cost/latency optimization

[ ] Failover mechanisms

[ ] Model benchmarking dashboard


Deliverable

✔ Intelligent multi-LLM engine.


---

10. RISK ANALYSIS & MITIGATION

Risk	Impact	Mitigation

Model APIs change	medium	abstraction layer
Chain complexity explosion	medium	validators + UI constraint
Capsule bloat	high	manifest schema + sandbox
Memory hallucinations	high	embedding recall + scoring
Local storage limits	low	SQLite backend



---

11. NEXT STEPS (RECOMMENDED)

To start implementing the Node.js version:

Step 1: Initialize the repo

/frontend/ → your current UI

/backend/ → Node.js server

/engine/ → shared logic

/capsules/ → empty to start


Step 2: We begin Phase 1 implementation

I'll generate the bootstrap folder structure + first code modules.


---

❓ WHICH DO YOU WANT NEXT?

Choose one:

1. Generate the directory structure + starter files for Node.js version


2. Start Phase 1: Extract promptCompiler.js into a standalone module


3. Start Phase 2: Build /api/run with Claude/GPT/Gemini support


4. Generate capsule architecture starter


5. Generate chain engine starter implementation



Which one should I produce next?
