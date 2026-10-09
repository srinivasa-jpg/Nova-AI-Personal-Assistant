# Codex task — SRINIVAS AI Personal Assistant

You are working in the `Nova-AI-Personal-Assistant` GitHub repository. Inspect the existing React + TypeScript + Vite code rather than replacing it. The starter app provides:

- A responsive dark-futuristic dashboard (`src/App.tsx`, `src/styles.css`)
- CRUD for browser-local tasks, notes, daily planner and focus timer
- Local demo assistant commands; optional `/api/chat.js` OpenAI-backed serverless endpoint

## First task

1. Run `npm install && npm run build`. Fix any TypeScript or bundling errors without weakening TypeScript strictness.
2. Verify navigation and interactions: add/complete/delete task, filter and search, localStorage persistence after refresh, note editing, timer start/pause/reset, responsiveness at 375px and 1440px.
3. Confirm the Vercel function reads the API key **server-side** and never exposes it in client bundles. Test the no-key demo fallback.
4. Add unit/integration tests for tasks, notes, and assistant command behavior, and a basic smoke test for deployment.
5. Before deploying an OpenAI-powered public endpoint, recommend or implement real rate limiting, abuse controls, and budget guardrails.
6. Keep existing visual styling and usable free/demo mode. Do not invent features or claim that a deployment succeeded without verifying it.

## Deploy

Create a pull request with your fixes. After the repo owner approves it, merge to `main`; Vercel should deploy automatically if linked. Report the live URL and any remaining issues.
