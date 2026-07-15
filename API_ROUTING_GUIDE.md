# Geek-AI API Routing Guide

## Overview

Geek-AI uses a **persona-based routing system** that intelligently routes user requests to the most suitable AI model provider. Each persona is optimized for specific use cases and performance characteristics.

## Routing Architecture

### Provider Mapping

The routing is defined in `lib/geek-ai.ts` in the `PERSONA_PROVIDER` constant:

```typescript
export const PERSONA_PROVIDER: Record<PersonaId, Provider> = {
  general: 'openrouter',      // General Purpose
  support: 'openrouter',      // Emotional Support
  brutal: 'openrouter',       // Brutal Honesty
  naija: 'openrouter',        // Naija Vibes
  job: 'gemini',              // Job Hunter (Resume Reading)
  developer: 'gemini',        // Developer Mode (Code Generation)
  image: 'huggingface',       // Image Generation
}
```

## Detailed Routing Strategy

### 1. **OpenRouter / Groq** (Conversational Personas)
**Personas:** General, Emotional Support, Brutal Honesty, Naija Vibes

**Why:** Fast, free models perfect for conversational AI tasks
- **Primary Model:** `meta-llama/llama-3.3-70b-instruct:free` (OpenRouter)
- **Fallback Model:** `llama-3.3-70b-versatile` (Groq)
- **Use Case:** Natural conversation, advice, brainstorming
- **Endpoint:** `/api/chat`

**Environment Variables Required:**
- `OPENROUTER_API_KEY` or `OPENROUTER_API_KEY_2` (primary)
- `GROQ_API_KEY` or `GROQ_API_KEY_2` (fallback)

**API Request Flow:**
```
User Input → app-provider.tsx → fetch('/api/chat') 
→ route.ts checks provider → callOpenRouter() 
→ OpenRouter API → Response streamed back
```

### 2. **Gemini 1.5 Flash** (Complex Tasks)
**Personas:** Job Hunter (Resume Reading), Developer Mode (Code Generation)

**Why:** Massive 1M token context window perfect for:
- Reading entire resumes/documents
- Understanding complex codebases
- Writing production-ready code with full context

- **Model:** `gemini-1.5-flash` (Free tier available)
- **Use Case:** Resume analysis, job matching, code generation, debugging
- **Endpoint:** `/api/chat`
- **Special Feature:** File/resume attachment support

**Environment Variables Required:**
- `Google_Gemini_API_KEY` (required)

**API Request Flow:**
```
User Input + Resume Attachment → app-provider.tsx → fetch('/api/chat')
→ route.ts checks provider → callGemini()
→ Converts resume to base64 → Gemini API
→ Response with analysis sent back
```

### 3. **Hugging Face Inference** (Image Generation)
**Personas:** Image Generator

**Why:** Free Stable Diffusion model for quick image generation

- **Model:** `stabilityai/stable-diffusion-xl-base-1.0`
- **Use Case:** Text-to-image generation from descriptions
- **Endpoint:** `/api/image`
- **Output:** Base64-encoded PNG image

**Environment Variables Required:**
- `HUGGINGFACE_ACCESS_TOKEN` or `HUGGINGFACE_ACCESS_TOKEN_2`

**API Request Flow:**
```
Image Prompt → app-provider.tsx → fetch('/api/image')
→ Sends prompt to Hugging Face → Stable Diffusion generates image
→ Base64 PNG returned → Displayed in chat
```

## API Implementation Details

### Chat Route (`/app/api/chat/route.ts`)

The chat route handles persona-based routing with comprehensive error handling:

```typescript
export async function POST(req: Request) {
  const { persona, messages, attachment } = body
  
  // Determine which provider to use
  const provider = PERSONA_PROVIDER[persona] ?? 'openrouter'
  
  if (provider === 'gemini') {
    content = await callGemini(system, messages, attachment)
  } else {
    content = await callOpenRouter(system, messages)
  }
  
  return NextResponse.json({ content })
}
```

### Image Route (`/app/api/image/route.ts`)

Dedicated image generation endpoint:

```typescript
export async function POST(req: Request) {
  const { prompt } = body
  
  // Always uses Hugging Face Stable Diffusion
  const res = await fetch(
    `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0`,
    {
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ inputs: prompt })
    }
  )
}
```

## Frontend Integration (`app-provider.tsx`)

The `sendMessage` function in `app-provider.tsx` orchestrates the entire flow:

```typescript
const sendMessage = async (text: string, attachment?: AttachmentPayload) => {
  // Route to correct endpoint based on persona
  const endpoint = persona === 'image' ? '/api/image' : '/api/chat'
  
  // Prepare payload
  const payload = persona === 'image'
    ? { prompt: text }
    : { persona, messages, attachment }
  
  // Send request
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}
```

## Environment Variable Setup

### Required Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key for free Llama 3 | `sk-or-v1-...` |
| `GROQ_API_KEY` | Groq fallback API key | `gsk_...` |
| `Google_Gemini_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `HUGGINGFACE_ACCESS_TOKEN` | Hugging Face API token | `hf_...` |

### Optional Headers (OpenRouter)

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_HTTP_REFERER` | HTTP Referer header (optional) |
| `OPENROUTER_X_TITLE` | X-Title header (optional) |

## Request/Response Flow

### Conversational (OpenRouter/Groq)

**Request:**
```json
{
  "persona": "general",
  "messages": [
    { "role": "user", "content": "Explain quantum computing" }
  ]
}
```

**Response:**
```json
{
  "content": "Quantum computing uses quantum mechanics principles..."
}
```

### Image Generation

**Request:**
```json
{
  "prompt": "A neon circuit-board owl at night"
}
```

**Response:**
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

### Job Hunter with Attachment

**Request:**
```json
{
  "persona": "job",
  "messages": [...],
  "attachment": {
    "name": "resume.pdf",
    "dataUrl": "data:application/pdf;base64,...",
    "mimeType": "application/pdf"
  }
}
```

## Error Handling

Each endpoint includes comprehensive error handling:

- **Missing API Key:** Returns 503 with `missingKey: true`
- **API Rate Limit:** Passes through API error response
- **Model Warming Up:** HF returns 503 with "model is warming up" message
- **Invalid Input:** Returns 400 with descriptive error

## Logging & Debugging

All API calls include debug logging:

```javascript
// In chat route
console.log('[v0] Chat request:', { persona, provider })
console.log('[v0] Routing to Gemini...')
console.log('[v0] Response generated successfully, length:', content?.length)

// In image route
console.log('[v0] Image generation request - model:', model)
console.log('[v0] Image generation success - buffer size:', buffer.length)
```

Check server logs during development to verify routing:
```bash
tail -f .next/dev/logs/next-development.log | grep "\[v0\]"
```

## Performance Notes

- **OpenRouter/Groq:** Fast inference, <2s typical response time
- **Gemini:** Slightly slower due to context processing, better for complex tasks
- **Hugging Face:** Model warmup may cause first request to be slow (~10-15s)

## Testing the Routing

### Test General Persona (OpenRouter)
1. Sign up/Sign in
2. Select "General" persona
3. Send a message like "Explain AI"
4. Check console logs for "Routing to OpenRouter"

### Test Developer Mode (Gemini)
1. Select "Dev" persona
2. Ask: "Write a React hook for debouncing"
3. Logs should show "Routing to Gemini"

### Test Image Generation
1. Select "Image" persona
2. Describe: "A sunset over mountains"
3. Image should appear after ~10-15s

### Test Resume Reading (Gemini)
1. Select "Job Hunter" persona
2. Attach a resume PDF
3. Ask: "What jobs match my experience?"
4. Gemini processes the full resume content

## Troubleshooting

### Issue: "API key is not configured"
**Solution:** Check that environment variables are set in project settings (top right → Vars)

### Issue: Image takes too long
**Solution:** Hugging Face model may be warming up. First request can take 10-15s

### Issue: Resume not being read
**Solution:** Ensure attachment is properly formatted as base64 data URL in request

### Issue: Wrong API being called
**Solution:** Check `PERSONA_PROVIDER` mapping in `lib/geek-ai.ts` matches your persona ID

## Future Enhancements

- [ ] Add Claude 3 as alternative for Developer Mode
- [ ] Implement token counting for Gemini requests
- [ ] Add prompt caching for repeated code patterns
- [ ] Support multiple file types in Job Hunter (DOCX, ODT)
- [ ] Add usage tracking per persona
