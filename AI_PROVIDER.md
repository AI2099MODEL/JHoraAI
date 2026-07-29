# JHoraAI Professional: Multi-Provider AI Architecture

JHoraAI Professional supports a fully modular, multi-provider AI backend. This enables astrologers to switch between Google Gemini, OpenAI ChatGPT, and Anthropic Claude depending on their reasoning requirements.

---

## 1. Zero-UI Change Design

Future models and providers can be introduced without requiring any modifications to the front-end components. This is achieved via two architectural layers:

### A. Dynamic Model Metadata Discovery
The front-end queries `/api/ai/models` to retrieve the current support matrix. This endpoint responds with:
- The list of active providers.
- The supported models per provider.
- Context windows and specialized properties (e.g., support for reasoning, structured tables, or speed).

### B. Standardized Chat Payloads
All chat, system, and historical prompts are serialized into a standard, unified message structure:
```typescript
export interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
```

---

## 2. Server-Side Abstract Interfaces

Every AI integration implements a single, unified abstract interface:

### Backend Interface (`/backend/server/ai/AIProvider.ts`)
```typescript
import { Message } from "../../../src/features/ask/models/Conversation";

export interface AIProvider {
  /**
   * Streams chat completions back to the client
   */
  chatStream(
    messages: Message[],
    model: string,
    onChunk: (text: string) => void,
    apiKey?: string
  ): Promise<void>;

  /**
   * Returns metadata about supported models
   */
  getSupportedModels(): string[];
}
```

---

## 3. Dynamic Factory Pattern

The backend utilizes `ProviderFactory.ts` to instantiate the appropriate concrete provider on-the-fly:

```typescript
import { GeminiProvider } from "./GeminiProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { ClaudeProvider } from "./ClaudeProvider";
import { AIProvider } from "./AIProvider";

export class ProviderFactory {
  static getProvider(providerName: string): AIProvider {
    switch (providerName.toLowerCase()) {
      case "gemini":
        return new GeminiProvider();
      case "openai":
        return new OpenAIProvider();
      case "claude":
        return new ClaudeProvider();
      default:
        throw new Error(`Unsupported AI Provider: ${providerName}`);
    }
  }
}
```

---

## 4. BYOK (Bring Your Own Key) Security

Astrologers can choose between using the application's global API keys or providing their own custom tokens (BYOK):

1. **Local Encryption**: Custom API keys entered in `ProviderSettings.tsx` are stored inside the client's local storage block (`localStorage`).
2. **Secure Transmission**: Custom keys are passed inside the HTTPS headers (`x-custom-api-key`) during requests.
3. **No Storage on Server**: The server proxies the request directly to the model's official SDK using the client's custom header key if present, and never writes it to server logs or disks.
