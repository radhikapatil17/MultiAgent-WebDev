# Webntra — AI-Powered Website Builder

> **Generate complete, production-ready websites from a single prompt using a 7-agent SDLC pipeline.**

Webntra is a full-stack AI website builder with a premium Studio UI. Describe what you want, and seven specialized AI agents plan, design, code, test, debug, secure, and package your website — all in real time.

---

## ✨ Features

### 🏠 Landing Page & Auth
- Beautiful animated landing page with hero, blueprints, how-it-works, and pipeline workflow sections
- **Blueprint templates** — pick from Enterprise SaaS, FinTech, Portfolio, Telehealth, and more to pre-fill prompts
- Email/password authentication with sign-up & login modals
- Persistent user session via `localStorage`

### 🤖 7-Agent SDLC Pipeline
Each generation request runs through a sequential chain of specialized agents:

| # | Agent | Role | Provider |
|---|---|---|---|
| 1 | **Requirements** | Parses and structures user intent | Gemini |
| 2 | **Design** | Creates layout & color system | Gemini |
| 3 | **Code** | Generates HTML, CSS, JS | OpenRouter |
| 4 | **Testing** | Validates functionality & coverage | Groq |
| 5 | **Debug** | Fixes errors and edge cases | OpenRouter |
| 6 | **Security** | Checks for vulnerabilities | Groq |
| 7 | **Deployment** | Packages and finalizes output | Gemini |

> **Never-stuck architecture** — every agent has a timeout + local fallback. The pipeline always completes even if a provider is down or keys are missing. Set `DEMO_MODE=true` to force local mode.

### 🎨 Studio (AI Builder)
- **Draggable/resizable divider** between the AI chat panel and the live preview canvas
- Multi-turn AI chat for iterative refinements (e.g. *"add a pricing section"*, *"use purple accents"*)
- Live iframe preview with **Desktop / Tablet / Mobile** viewport switching
- Iframe sandboxing with navigation guard — prevents the preview from hijacking the host app
- **Code & Files** tab with syntax-highlighted source viewer and live editing
- **7-Agent Inspector** tab showing per-agent status, metadata, test coverage, and security report
- Download as ZIP — exports all files plus a standalone README
- Open in new tab — launches the generated site in a clean browser window
- Auto-save to `localStorage` on every generation
- Brand Kit injection — user-defined brand name, color, and tone are automatically appended to generation prompts

### 📁 Projects Dashboard
- Grid of saved projects with last-edited timestamps
- One-click to re-open any project back into the Studio
- Delete projects with confirmation
- "New Project" shortcut

### ⚙️ Settings
**User settings:**
- Profile — update display name and avatar initial
- Notifications — email digest, product updates, weekly reports
- Privacy — data sharing and analytics toggles

**Creator/Developer settings:**
- Brand Kit — set default brand name, primary color, and brand tone
- SEO — meta description and target keywords auto-injected into generated sites
- API Keys — configure Gemini, OpenRouter, and Groq keys (stored in backend `.env`)
- Billing — plan overview (UI placeholder)

### 👤 Profile Menu
Accessible from the avatar icon in the Studio header:
- My Projects → back to dashboard
- Workspace Settings → opens Settings view
- Sign Out

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **AI Providers** | Google Gemini, OpenRouter, Groq |
| **State** | React `useState` / `useRef`, localStorage persistence |
| **Icons** | Lucide React |
| **Bundling** | JSZip (client-side ZIP export) |

---

## 🛠️ Setup & Run

### 1. Clone the repo
```bash
git clone https://github.com/radhikapatil17/MultiAgent-WebDev.git
cd MultiAgent-WebDev
```

### 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash-lite

OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openrouter/auto

GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.3-70b-versatile

DEMO_MODE=auto          # auto | true | false
AGENT_TIMEOUT_MS=15000
PORT=5000
APP_URL=http://localhost:5173
```

> ⚠️ Never commit `.env`. All keys stay server-side only.

### 3. Start the backend
```bash
cd backend
npm install
npm run dev
```

### 4. Start the frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🔄 Iterative Refinement

After your site is generated, use the AI chat to refine it:

```
"Add a pricing section with 3 tiers"
"Change the hero headline to 'Ship faster with AI'"
"Make the navbar sticky"
"Use a dark color scheme"
"Add a contact form with validation"
"Make the layout more compact on mobile"
```

Each message re-runs the full SDLC pipeline against the existing code.

---

## 📦 Export & Deploy

- **Download ZIP** — exports `index.html`, `style.css`, `script.js`, and a README. Drop into any static host (Vercel, Netlify, GitHub Pages).
- **Open in New Tab** — previews the live site outside the Studio frame.

---

## 📂 Project Structure

```
webforge-ai/
├── backend/
│   ├── src/
│   │   └── server.ts          # Express API + 7-agent pipeline
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── LandingPage.tsx        # Hero, blueprints, CTA
    │   │   ├── Studio.tsx             # Main AI builder + resizable layout
    │   │   ├── ProjectsDashboard.tsx  # Saved projects grid
    │   │   ├── SettingsView.tsx       # User & developer settings
    │   │   ├── AuthModal.tsx          # Sign in / Sign up
    │   │   ├── AgentInspector.tsx     # 7-agent details panel
    │   │   ├── DeployModal.tsx        # Deploy options
    │   │   ├── MediaLibraryModal.tsx  # Stock media picker
    │   │   ├── ProfileModal.tsx       # Profile editor
    │   │   └── Navbar.tsx
    │   ├── services/
    │   │   ├── api.ts                 # Backend communication + agent runners
    │   │   └── projectStorage.ts      # localStorage CRUD
    │   ├── types.ts
    │   ├── App.tsx
    │   └── index.css
    └── package.json
```

---

## 📄 License

MIT — feel free to use, fork, and build on top of Webntra.
