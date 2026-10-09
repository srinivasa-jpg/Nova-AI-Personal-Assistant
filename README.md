# SRINIVAS — AI Personal Assistant Dashboard

A polished, responsive productivity dashboard built with **React 18, TypeScript, Vite, CSS, and Lucide icons**.

**Live without an API key:** task management, task categories and priorities, a seven-day planner, editable notes, 15/25/45-minute focus timer, progress statistics, customizable name, and local demo chat commands. Data lives in your browser's `localStorage`.

**Optional real AI:** a Vercel serverless endpoint (`api/chat.js`) connects to the OpenAI API using a **server-side** environment variable. The UI falls back to clearly labeled local demo suggestions without an API key. The project does not include automatic third-party integrations, account sync, or push notifications when the page is closed.

## Preview before publishing (no installation required)

1. Download the ZIP and **extract all files**.
2. Double-click **`PREVIEW.html`** to open a self-contained, interactive offline demo. It uses the same dark purple design language as the React application and includes working sample tasks, local chat, notes, planner and focus controls. Data is kept in the browser.
3. Optional: review `screenshots/dashboard-desktop.png` and `screenshots/dashboard-mobile.png`.

**Preview note:** `PREVIEW.html` is a standalone demonstration for quick inspection. The actual Vite/React project is launched using `npm run dev` or through Vercel deployment. No OpenAI API key is necessary to preview either mode. The full React app has more polished/complete functionality than this standalone demo.

## Upload to GitHub — important

Your repository: <https://github.com/srinivasa-jpg/Nova-AI-Personal-Assistant>

**Brand:** SRINIVAS. The existing GitHub repository URL still contains `Nova-AI-Personal-Assistant`; the repository name is independent of the branding visible to visitors. You can rename the repository separately in GitHub Settings if desired.

1. On GitHub, open the repository and choose **Add file → Upload files** (or `https://github.com/srinivasa-jpg/Nova-AI-Personal-Assistant/upload/main`).
2. **Extract** the ZIP first. Drag the **contents of the extracted folder** to GitHub. Do **not** upload only the `.zip` file or a containing parent folder.
3. Confirm you can see these at the **repository root**: `package.json`, `index.html`, `src/`, `api/`, `vite.config.ts`, and `vercel.json`.
4. Click **Commit changes**.
5. In Vercel (`https://vercel.com/new`), import the GitHub repository; use **Vite**, **npm run build**, `dist`, and root `./`.

Avoid enabling a public `OPENAI_API_KEY` until abuse limits or authentication are in place. For a safe public demo, use local AI mode.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually <http://localhost:5173>). To check the production build:

```bash
npm run build
npm run preview
```

## Deploy with Vercel

1. Create a new GitHub repository and upload the **contents** of this folder, not the ZIP file. The root should contain `package.json`, `src/`, `api/`, `index.html`, `vite.config.ts`, and `vercel.json`.
2. Open <https://vercel.com/new> and import the repo.
3. Use Vite / build command `npm run build` / output directory `dist` / root `./`.
4. Deploy. The dashboard works in **local demo mode** immediately.
5. Optional real AI: Vercel **Project Settings → Environment Variables** → add `OPENAI_API_KEY` and optionally `OPENAI_MODEL` (default: `gpt-4o-mini`). Redeploy so the function can read the key. Never expose the key as a `VITE_*` variable.

### Security and operating costs

- The `/api/chat` endpoint, when enabled, makes **billable** OpenAI API requests. Before enabling the real AI function on a public site, configure appropriate spend limits, abuse protection, and rate limiting. An unauthenticated public endpoint can incur unexpected charges.
- Never commit API keys, tokens, or `.env` files. Check `.gitignore` before adding new credentials.
- Chat messages sent to the live AI API are processed by the configured AI provider. Offline/demo commands run locally. Tasks, notes and preferences do **not** leave the browser through this project.
- Browser notifications are optional, require permission, and only check overdue tasks while the app is open. They are not reliable background reminders.
- This is a portfolio/demo project, not a production-grade multi-user SaaS. If you need account sync or secure server-side storage, add authentication and a database.

## Features

| Section | Functionality |
| --- | --- |
| Overview | Cinematic hero, daily summary, interactive stats and quick actions |
| AI Assistant | Conversational interface, local task-creation commands and daily-plan suggestions, optional real AI |
| My Tasks | Add, complete, delete, filter and search tasks; due dates, categories and priorities |
| Planner | Upcoming seven-day schedule; click a date to view its tasks |
| My Notes | Create, edit, delete and automatically save notes locally |
| Focus Room | 15, 25 or 45-minute session timer with completion count |
| Settings | Edit name, request optional notifications, reset sample workspace |

## Personalize

Change the display name in **Settings**. Update colors and layout in `src/styles.css`. Change demo data and default tasks in `src/data.ts`. Edit the AI assistant system prompt in `api/chat.js`.

## Suggested GitHub repository name

`Nova-AI-Personal-Assistant`

## Notes

This project includes its own original React/CSS dashboard code and **does not copy** the previously discussed Netflix-style portfolio template. The design is intentionally a separate futuristic productivity app.
