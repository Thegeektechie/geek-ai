# Error Handling & Fallback Strategy

## Overview

The Geek-AI API now implements intelligent fallback logic and user-friendly error messages. When one AI provider fails, the system automatically tries alternative providers before showing an error to the user.

## Fallback Chain

### Text Generation (Chat)

**Priority Order:**
1. **Groq** (Llama 3.3-70b-versatile) - Primary choice, most reliable
2. **OpenRouter** (Llama 3.3-70b-instruct:free) - Fallback for text personas
3. **Gemini 1.5 Flash** - Fallback for Job Hunter/Developer modes with context window

**Why this order:**
- Groq is preferred because it's most reliable and has no rate limiting
- OpenRouter is fallback for general personas
- Gemini provides massive 1M token context window for complex tasks

### Image Generation

**Provider:** Hugging Face Stable Diffusion
- If generation fails, user gets friendly message to retry in a few moments
- Handles 503 (model warming up) and 429 (rate limited) gracefully

## Error Messages

### User-Friendly Messages

Instead of exposing technical errors, users see:
- **High Traffic:** "Our AI service is experiencing high traffic. Please check back in a moment."
- **Config Error:** "The [API] API key is not configured yet. Add it in Project Settings to enable live responses."

### Server Logs

Server console shows detailed debugging info like:
- `[v0] Trying Groq with Llama 3.3-70b-versatile`
- `[v0] Groq failed: 503`
- `[v0] Trying OpenRouter with Llama 3.3-70b`
- `[v0] OpenRouter success - response length: 2642`

## Implementation Details

### Chat Route (`/api/chat`)

```typescript
// 1. Attempts Groq first
const content = await tryGroq(system, messages)
if (content) return content

// 2. Falls back to OpenRouter
const content2 = await tryOpenRouter(system, messages)
if (content2) return content2

// 3. All failed - returns user-friendly error
throw new Error('all-providers-failed')
```

Each `try*` function:
- Returns `null` on failure (instead of throwing)
- Handles network errors gracefully
- Logs detailed debugging info

### Image Route (`/api/image`)

```typescript
// Service busy or rate limited
if (res.status === 503 || res.status === 429) {
  return { error: 'Image service is experiencing high traffic...', isHighTraffic: true }
}

// Catch all other errors
return { error: 'Image service is experiencing high traffic...', isHighTraffic: true }
```

## Testing the Fallback

### Simulate Groq Failure
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"persona":"general","messages":[{"role":"user","content":"Hello"}]}'
```

The request will:
1. Try Groq → fails
2. Try OpenRouter → succeeds
3. Returns response to user

### Check Logs
```bash
# See fallback in action
grep "[v0]" server.log | grep -E "Trying|failed|success"
```

## Environment Variables

Required for fallback to work:
- `GROQ_API_KEY` - Primary text generation
- `OPENROUTER_API_KEY` - Secondary text generation
- `Google_Gemini_API_KEY` - Complex task fallback
- `HUGGINGFACE_ACCESS_TOKEN` - Image generation

## Future Improvements

1. Add exponential backoff retry logic
2. Implement circuit breaker pattern
3. Cache frequently asked questions
4. Add request queuing for high-traffic periods
5. Monitor provider health and status
