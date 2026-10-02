# WebForge AI — Multi-Agent Website Generator

WebForge AI turns a natural-language website request into a runnable static website through a seven-agent SDLC pipeline:

1. Requirement Agent — Gemini
2. Design Agent — Gemini
3. Code Agent — OpenRouter free model
4. Testing Agent — Groq
5. Debug Agent — OpenRouter free model
6. Security Agent — Groq
7. Deployment Agent — Gemini

## Never-stuck architecture
Each provider call has a timeout. Missing keys, quota/rate-limit errors, invalid responses and provider outages fall back to a deterministic local agent implementation. The pipeline therefore completes instead of leaving an agent permanently running. Set `DEMO_MODE=true` to force local mode.

## API keys
No key is bundled. Add keys later to `backend/.env`:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openrouter/free
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
DEMO_MODE=auto
AGENT_TIMEOUT_MS=15000
PORT=5000
APP_URL=http://localhost:5173
```

Keep provider keys only in the backend. Never commit `.env`.

## Run

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend in another terminal:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Live preview
The generated project is a static HTML/CSS/JS bundle. WebForge assembles CSS and JavaScript into the iframe preview so the preview does not display source code as text. Desktop/tablet/mobile preview modes are included.

## Iterative SDLC changes
After generation, use the change bar to request changes such as:

- Add a pricing section
- Add a contact form
- Change the hero copy
- Use purple accents
- Add a project section
- Make the layout more compact

The backend runs the change through Requirement → Design → Code → Testing → Debug → Security → Deployment. If providers are unavailable, local fallback logic applies the change and returns a complete project.

## Export
The **Download ZIP** button exports all generated files plus a README so the result can be opened or deployed independently.
