# AI Regression Firewall

> Turn every confirmed bad AI output into a permanent regression test, then block future prompt/model changes from shipping the same failure again.

This is not just “ask GenAI to judge my output.” The product stores the evidence trail: production traces, locked golden cases, prompt versions, deterministic assertions, eval runs, failure reasons, before/after comparison, release gate, and exportable evidence.

A shippable MVP for Track B: **The Eval Co-pilot**.

The app helps a builder:
1. define an AI feature,
2. create a golden set,
3. save a grading rubric,
4. run model outputs against known-good answers,
5. store pass/fail grades,
6. re-run after a prompt/guardrail change,
7. prove whether the feature improved.

This repo is built for the submission brief: the app is plumbing; the proof is real-user evidence.

## Env files are already included

This ZIP contains:

```txt
backend/.env
frontend/.env.local
frontend/.env.production
```

Open those files and replace `PASTE_..._HERE` values. For GitHub, keep real secrets out of commits. For Render, copy the same values into Render environment variables.

## Stack

- Frontend: React + Vite
- Backend: FastAPI
- DB/Auth/RLS: Supabase
- AI providers:
  - Groq default
  - Hugging Face Inference Providers optional
  - Ollama local fallback
  - deterministic keyword fallback if no model key is configured
- Deployment: Render

## Repository structure

```txt
.
├── backend
│   ├── app
│   │   ├── config.py
│   │   ├── grader.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── providers.py
│   │   └── security.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend
│   ├── src
│   ├── package.json
│   ├── index.html
│   └── .env.example
├── supabase
│   └── schema.sql
├── docs/submission
│   ├── SUBMISSION_TEMPLATE.md
│   ├── MOVE_3_BOUNDARY_GUIDE.md
│   ├── MOVE_4_SCHEMA_GUIDE.md
│   └── EVIDENCE_CHECKLIST.md
├── render.yaml
└── MOVE_2_HYPOTHESIS_FIRST_COMMIT.md
```

## First commit rule

Before you add code, commit only:

```txt
MOVE_2_HYPOTHESIS_FIRST_COMMIT.md
```

Then add the app code in later commits. The submission needs this timestamped bet before code.

## Supabase setup

1. Create a Supabase project.
2. Go to **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Go to **Authentication → Providers → Email**.
5. For fast testing, disable email confirmation or create users manually.

## Backend local setup

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Health check:

```bash
curl http://localhost:8000/health
```

## Frontend local setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open:

```txt
http://localhost:5173
```

## Backend environment variables

```env
APP_ENV=local
FRONTEND_ORIGIN=http://localhost:5173

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY

# Choose AI provider order. Supported: groq,huggingface,ollama,fallback
AI_PROVIDER_ORDER=groq,huggingface,ollama,fallback

GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

HF_TOKEN=
HF_MODEL=moonshotai/Kimi-K2-Instruct-0905
HF_BASE_URL=https://router.huggingface.co/v1

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

## Frontend environment variables

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
VITE_API_BASE_URL=http://localhost:8000
```

## Render deploy

Use `render.yaml` for Blueprint deployment, or deploy manually.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/shreyesmohan-ui/100x-c7-hackathon)

### Backend Web Service

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend Static Site

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`

After frontend is deployed, update backend `FRONTEND_ORIGIN` to your frontend URL.

## Local Ollama fallback

If you do not want paid APIs:

```bash
ollama pull llama3.1
ollama serve
```

Then keep:

```env
AI_PROVIDER_ORDER=ollama,fallback
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

## How to use for submission

1. Create a feature, e.g. `NCCN RAG Answerer`.
2. Add five golden cases.
3. Save a rubric.
4. Paste actual AI outputs from the builder's app.
5. Run eval.
6. Screenshot failures.
7. Builder changes prompt/guardrail/retrieval.
8. Re-run and screenshot improvement.
9. Document one surprise.

## RLS proof

Create two users:
- `user-a@example.com`
- `user-b@example.com`

User A creates a feature and cases. User B logs in and should see nothing from User A. Screenshot this for Move 4.

## Important limitation

This repo cannot itself prove your submission. The proof comes from Move 5: two builders, failing cases, concrete changes, and re-runs.
