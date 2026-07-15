# TODO

- [ ] Verify Vercel environment variables names match code (OPENROUTER_API_KEY, GROQ_API_KEY, HUGGINGFACE_ACCESS_TOKEN, Google_Gemini_API_KEY).
- [ ] Add a small server-side debug endpoint or console log to confirm env vars exist at runtime (without leaking secrets).
- [ ] If needed, update code to fail fast with clear missing-key errors (already partially present).
- [ ] Re-deploy to Vercel and confirm API routes return live responses.
