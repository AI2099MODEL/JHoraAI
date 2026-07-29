# JHoraAI Professional: Ask Workspace Architecture

This document describes the high-fidelity architecture of the **JHoraAI Professional** AI Workspace.

---

## 1. Architectural Core Principles

The Ask Workspace is designed as a premium, secure intelligence layer for professional astrologers. It is strictly built around the following three directives:

1. **No Dark Theme**: The visual identity is strictly light-themed, prioritizing legibility and professional aesthetic alignment with tools like Apple, Notion, Linear, and Microsoft Copilot.
2. **Strict Separation of Duties**: The AI **never** performs mathematical or astronomical calculations (e.g., longitude degrees, house calculations, planetary strengths). The existing calculations are computed with 100% precision by the server-side JHora engines and native libraries. The AI's role is strictly **reasoning, synthesis, and guidance** over structured data.
3. **Strict Secret Isolation**: All AI provider integrations are proxied server-side (`/api/ai/*`). API keys are never exposed to browser client requests.

---

## 2. System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                            │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     AskWorkspace View Layer                      │  │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌──────────────┐  │  │
│  │  │ ConversationPanel  │ │   CurrentSkyPanel  │ │TimelinePanel │  │  │
│  │  └────────────────────┘ └────────────────────┘ └──────────────┘  │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │ (custom hook queries)             │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      State & Hook Layer                          │  │
│  │  ┌─────────────────────────────────┐ ┌────────────────────────┐  │  │
│  │  │        useConversation()        │ │   useBirthProfiles()   │  │  │
│  │  └─────────────────┬───────────────┘ └────────────┬───────────┘  │  │
│  └────────────────────┼──────────────────────────────┼─────────────────┘  │
│                       │ (persists localState)        │                    │
│                       ▼                              ▼                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    IndexedDB & LocalStorage                      │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │ (secure backend proxies)           │
│                                    ▼                                   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                           EXPRESS BACKEND SERVER                       │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                         API Proxy Layer                        │   │
│   │                      `/api/ai/chat/stream`                     │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    │ (Factory resolution)              │
│                                    ▼                                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      Provider Factory Pool                     │   │
│   │    ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐   │   │
│   │    │ ClaudeProvider  │ │ OpenAIProvider  │ │GeminiProvider │   │   │
│   │    └────────┬────────┘ └────────┬────────┘ └───────┬───────┘   │   │
│   └─────────────┼───────────────────┼──────────────────┼───────────┘   │
└─────────────────┼───────────────────┼──────────────────┼───────────────┘
                  ▼                   ▼                  ▼
             [Anthropic]           [OpenAI]           [Google]
```

---

## 3. Data Integration & Reasoning Patterns

Whenever a user is viewing a birth chart or inputs new birth details, the AI context is automatically compiled. The prompt payloads are assembled dynamically using **System Prompts** that instruct the AI model of its parameters:

- **Mathematical Safety**: "You are a professional Jyotish reasoning assistant. Do not attempt to calculate planet positions or house boundaries yourself. Rely strictly on the structured data provided."
- **Context Injection**:
  ```json
  {
    "birthProfile": {
      "name": "Arjun",
      "date": "1995-10-15",
      "time": "08:30:00",
      "location": "New Delhi, India"
    },
    "placements": [
      { "planet": "Sun", "sign": "Libra", "house": 12, "degree": 27.5 },
      { "planet": "Moon", "sign": "Gemini", "house": 9, "degree": 14.2 }
    ],
    "dashas": { "activeMahadasha": "Jupiter", "activeAntardasha": "Saturn" }
  }
  ```
- **Real-Time Sky Alignment**: When chatting, the `CurrentSkyPanel` exposes live planetary coordinates computed via the backend REST proxy. This enables the AI to instantly reason over transits relative to the native's natal points.

---

## 4. Automatic Profile Extraction

When users write natural language instructions such as:
- *"I was born on July 23rd, 1988 at 4:15 PM in London"*
- *"My DOB is 1992-04-12 05:40 AM in Mumbai"*

The frontend and backend intercept these tokens using structural regex matches and secondary NLP passes. 
1. **Detection**: Triggers a state-change marking a `pendingProfile` payload.
2. **Confirmation**: Renders the `BirthProfileCard` inside the conversation thread.
3. **Execution**: Upon clicking **Confirm & Save**, the details are cast into the database, cached in IndexedDB, and active coordinate panels align immediately.
