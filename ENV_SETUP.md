# ENV SETUP

I have included real placeholder env files so you can run the app by editing values directly.

## Files already present

```txt
backend/.env
frontend/.env.local
frontend/.env.production
backend/.env.example
frontend/.env.example
```

## Minimum keys to paste for local run

### backend/.env

```env
SUPABASE_URL=your Supabase project URL
SUPABASE_ANON_KEY=your Supabase anon/publishable key
GROQ_API_KEY=your Groq API key
```

### frontend/.env.local

```env
VITE_SUPABASE_URL=your Supabase project URL
VITE_SUPABASE_ANON_KEY=your Supabase anon/publishable key
VITE_API_BASE_URL=http://localhost:8000
```

## Optional keys

Use Hugging Face instead of / after Groq:

```env
HF_TOKEN=your Hugging Face token
```

Use local Ollama:

```env
AI_PROVIDER_ORDER=ollama,fallback
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

## Important

Do not push real secrets to GitHub.

The ZIP includes `backend/.env` and `frontend/.env.local` for your convenience.
The `.gitignore` keeps real `.env` files out of Git by default.
For Render deployment, add the same values in Render's Environment Variables page.
