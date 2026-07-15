# Deployment Checklist for Geek-AI

## Pre-Deployment

### API Keys & Environment Variables

- [ ] **OpenRouter API Key**
  - [ ] `OPENROUTER_API_KEY` or `OPENROUTER_API_KEY_2` set in Vercel
  - [ ] Get from: https://openrouter.ai/keys
  - [ ] Test: Should route General/Support/Brutal/Naija personas

- [ ] **Groq API Key** (Fallback for OpenRouter)
  - [ ] `GROQ_API_KEY` or `GROQ_API_KEY_2` set in Vercel
  - [ ] Get from: https://console.groq.com/keys
  - [ ] Test: Used if OpenRouter key missing

- [ ] **Google Gemini API Key** (Job Hunter & Developer Mode)
  - [ ] `Google_Gemini_API_KEY` set in Vercel
  - [ ] Get from: https://makersuite.google.com/app/apikey
  - [ ] Verify free tier active
  - [ ] Test: Resume reading and code generation should work

- [ ] **Hugging Face Access Token** (Image Generation)
  - [ ] `HUGGINGFACE_ACCESS_TOKEN` or `HUGGINGFACE_ACCESS_TOKEN_2` set in Vercel
  - [ ] Get from: https://huggingface.co/settings/tokens
  - [ ] Ensure token has read access
  - [ ] Test: Image generation should produce images

### Code Verification

- [ ] **Chat Route** (`/app/api/chat/route.ts`)
  - [ ] ✓ OpenRouter/Groq fallback logic present
  - [ ] ✓ Gemini routing for `job` and `developer` personas
  - [ ] ✓ Error handling for missing keys
  - [ ] ✓ Attachment/resume support for Gemini
  - [ ] ✓ Debug logging added

- [ ] **Image Route** (`/app/api/image/route.ts`)
  - [ ] ✓ Hugging Face endpoint configured
  - [ ] ✓ Stable Diffusion model specified
  - [ ] ✓ Base64 PNG output format
  - [ ] ✓ Error handling for missing token
  - [ ] ✓ Model warmup handling (503 responses)

- [ ] **Persona Routing** (`lib/geek-ai.ts`)
  - [ ] ✓ `PERSONA_PROVIDER` maps all personas correctly:
    - [ ] `general` → `openrouter`
    - [ ] `support` → `openrouter`
    - [ ] `brutal` → `openrouter`
    - [ ] `naija` → `openrouter`
    - [ ] `job` → `gemini`
    - [ ] `developer` → `gemini`
    - [ ] `image` → `huggingface`

- [ ] **Frontend** (`components/geek-ai/app-provider.tsx`)
  - [ ] ✓ Routes to `/api/chat` for conversational
  - [ ] ✓ Routes to `/api/image` for image generation
  - [ ] ✓ Passes attachment/resume in request body
  - [ ] ✓ Error handling and user feedback

## Local Testing

### Test Each Persona

```
Test Checklist for Each Persona:

1. General Purpose
   ✓ Send: "Explain quantum computing"
   ✓ Expected: Quick response from OpenRouter
   ✓ Log: "[v0] Routing to OpenRouter"

2. Emotional Support
   ✓ Send: "I feel overwhelmed"
   ✓ Expected: Empathetic response
   ✓ Provider: OpenRouter

3. Brutal Honesty
   ✓ Send: "Am I procrastinating too much?"
   ✓ Expected: Direct, honest answer
   ✓ Provider: OpenRouter

4. Naija Vibes
   ✓ Send: "Wetin dey sup?"
   ✓ Expected: Naija English response
   ✓ Provider: OpenRouter

5. Developer Mode
   ✓ Send: "Write a React hook for debouncing"
   ✓ Expected: Production-ready code
   ✓ Log: "[v0] Routing to Gemini"
   ✓ Provider: Gemini (large context)

6. Job Hunter (with Resume)
   ✓ Action: Attach PDF resume
   ✓ Send: "What jobs match my skills?"
   ✓ Expected: Analysis of resume + job recommendations
   ✓ Log: "[v0] Using Gemini 1.5 Flash - has attachment: true"
   ✓ Provider: Gemini

7. Image Generator
   ✓ Send: "A neon circuit-board owl at night"
   ✓ Expected: Generated image within 15 seconds
   ✓ Log: "[v0] Image generation success"
   ✓ Provider: Hugging Face
```

### Test Error Handling

- [ ] **Missing OpenRouter Key**
  - [ ] Temporarily remove `OPENROUTER_API_KEY`
  - [ ] Send message to General persona
  - [ ] Expected: Falls back to Groq or returns error

- [ ] **Missing Gemini Key**
  - [ ] Temporarily remove `Google_Gemini_API_KEY`
  - [ ] Send message to Developer persona
  - [ ] Expected: Returns 503 with "API key not configured"

- [ ] **Missing HF Token**
  - [ ] Temporarily remove `HUGGINGFACE_ACCESS_TOKEN`
  - [ ] Send image prompt
  - [ ] Expected: Returns 503 with "API key not configured"

- [ ] **Model Warmup (HF)**
  - [ ] Send multiple image prompts in sequence
  - [ ] Expected: First might be slow (10-15s), subsequent faster

## Build & Deployment

### Before `npm run build`

- [ ] All env vars configured locally in `.env.development.local`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linting errors: `npm run lint`

### Build Process

```bash
# Build locally
npm run build

# Check for errors
npm run type-check
npm run lint

# Test build artifacts
npm run dev
```

### Deployment to Vercel

1. [ ] Push code to Git branch
2. [ ] Vercel automatically creates preview deployment
3. [ ] Check preview environment has all env vars:
   - [ ] Settings → Vars
   - [ ] All 4 API keys present
4. [ ] Test all personas in preview
5. [ ] Check server logs for routing messages:
   - [ ] `[v0] Chat request:`
   - [ ] `[v0] Routing to OpenRouter...`
   - [ ] `[v0] Response generated successfully`
6. [ ] Merge to main branch
7. [ ] Production deployment auto-triggered

## Post-Deployment Checks

### Production Verification

- [ ] [ ] App loads at production URL
- [ ] [ ] Sign-up/Sign-in works
- [ ] [ ] All 7 personas accessible
- [ ] [ ] Each persona returns responses
- [ ] [ ] Image generation produces images
- [ ] [ ] Resume upload works (Job Hunter)
- [ ] [ ] No console errors in browser DevTools

### Monitoring

- [ ] [ ] Check Vercel Logs for errors
- [ ] [ ] Monitor API rate limits (OpenRouter, Groq, Gemini, HF)
- [ ] [ ] Track response times per persona
- [ ] [ ] Watch for any 503 errors

### Performance

- [ ] [ ] General persona responses: <3 seconds
- [ ] [ ] Developer mode responses: <5 seconds
- [ ] [ ] Image generation: <15 seconds first request
- [ ] [ ] No timeout errors (60s limit set)

## Troubleshooting Guide

### Issue: "The API key is not configured yet"

**Check:**
1. Vercel Project Settings → Vars
2. Correct variable name?
3. Value not empty?
4. Env file reloaded?

**Solution:**
```bash
# Redeploy to pick up new env vars
vercel deploy --prod
```

### Issue: Wrong persona routing to wrong API

**Check:**
1. `PERSONA_PROVIDER` mapping in `lib/geek-ai.ts`
2. Persona name matches exactly
3. Provider string is correct

**Debug:**
```bash
# Check server logs
tail -f .next/dev/logs/next-development.log | grep routing
```

### Issue: Image generation very slow

**Normal:** First request to HF ~10-15s (model warm-up)
**Solution:** Subsequent requests should be faster

### Issue: Resume not being read in Job Hunter

**Check:**
1. Resume uploaded as attachment (paperclip icon)
2. File is PDF or DOCX
3. Gemini key is set
4. Request body includes `attachment` field

**Debug:** Check logs for:
```
[v0] Using Gemini 1.5 Flash - has attachment: true
```

### Issue: 503 Error from Groq/OpenRouter

**Cause:** Rate limiting or service unavailable
**Solution:** Retry after 30 seconds, user sees appropriate message

## Rollback Procedure

If deployment has critical issues:

1. [ ] Go to Vercel dashboard
2. [ ] Select project
3. [ ] Deployments tab
4. [ ] Find last known good deployment
5. [ ] Click "..." → "Redeploy"
6. [ ] Confirm rollback

## Success Criteria

✅ All criteria met = safe to release

- [ ] All 7 personas working
- [ ] Each routes to correct API
- [ ] Attachments working
- [ ] Error messages user-friendly
- [ ] No console errors
- [ ] Response times acceptable
- [ ] Server logs show proper routing
- [ ] Build completes without warnings

## Documentation

- [ ] `API_ROUTING_GUIDE.md` reviewed
- [ ] Team understands persona routing
- [ ] Troubleshooting guide accessible
- [ ] API keys documented (securely)
- [ ] Monitoring setup complete

---

**Last Updated:** 2026-07-15
**Verified By:** [Your Name]
**Deployment Date:** [Date]
