# JHoraAI Professional: OpenAI Integration Guide

This guide details the integration of OpenAI's models (e.g., `gpt-4o-mini`, `gpt-4o`) into the JHoraAI Professional Ask Workspace.

---

## 1. Lazy Initialization (Crash-Proof Pattern)

To avoid crashing the application on startup when environmental variables (like `OPENAI_API_KEY`) are missing or empty, the OpenAI SDK client is initialized lazily at runtime.

### Implementation Pattern (`/backend/server/ai/OpenAIProvider.ts`)
```typescript
import { OpenAI } from "openai";

let openaiInstance: OpenAI | null = null;

function getOpenAIClient(customKey?: string): OpenAI {
  const apiKey = customKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API Key is required. Please set OPENAI_API_KEY in server environment, or provide your custom key under Workspace settings.");
  }
  return new OpenAI({ apiKey });
}
```

---

## 2. Supported Models

The OpenAI integration supports three primary models optimized for professional astrology:

| Model ID | Optimal Use Case | Reasoning Speed |
| :--- | :--- | :--- |
| `gpt-4o-mini` | Rapid chart lookups, aspect explanations, simple planetary transit queries. | **Fast** |
| `gpt-4o` | Complex Ashtakavarga charts synthesis, multi-planetary aspects analysis, Sade Sati timing summaries. | **Medium** |
| `o1-mini` | Multi-tiered Vimshottari Mahadasha/Antardasha alignment analysis. | **Structured Reasoning** |

---

## 3. Grounded System Prompt Structure

To ensure that ChatGPT does not fabricate positions or perform incorrect calculations, a specialized system prompt is injected into the conversation stream prior to dispatching:

```json
[
  {
    "role": "system",
    "content": "You are JHoraAI, an authoritative Jyotish reasoning assistant. Your primary task is to interpret birth charts and planetary transits. CRITICAL: Existing calculations computed by JHora are 100% accurate. Rely STRICTLY on those positions. If data is absent, politely request the user cast their horoscope."
  }
]
```

---

## 4. Robust Error Handling & Fallbacks

- **Token Expiry / Key Revocation**: If OpenAI returns a `401 Unauthorized` response, the backend routes the error cleanly to the frontend:
  ```json
  {
    "error": "The OpenAI API key provided is invalid. Please verify your billing settings or update your custom credentials."
  }
  ```
- **Stream Interruptions**: If the stream fails mid-generation, `useConversation.ts` captures the buffer gracefully, allowing the user to click **Retry** to dispatch the identical prompt history again.
- **Client Cancellation (Abort Signals)**: Clicking **Stop Generation** triggers the client-side `AbortController.abort()` method, immediately closing the connection to minimize token consumption and server load.
