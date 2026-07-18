import { AIProvider, ChatOptions, ChatMessage } from "./AIProvider";

export class OpenAIProvider implements AIProvider {
  private getApiKey(apiKey?: string): string {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY or provide your own in Settings.");
    }
    return key;
  }

  async chat(options: ChatOptions): Promise<{ text: string }> {
    const apiKey = this.getApiKey(options.apiKey);
    const systemInstruction = options.systemInstruction || "You are JHoraAI, a premium AI workspace assistant for professional astrologers. You reason over astronomical calculations but never perform them yourself. Always respond clearly.";
    
    const messages: ChatMessage[] = [
      { role: "system", content: systemInstruction },
      ...options.messages,
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || "gpt-4o-mini",
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
    }

    const data: any = await response.json();
    return { text: data.choices?.[0]?.message?.content || "" };
  }

  async stream(options: ChatOptions, onChunk: (text: string) => void): Promise<void> {
    const apiKey = this.getApiKey(options.apiKey);
    const systemInstruction = options.systemInstruction || "You are JHoraAI, a premium AI workspace assistant for professional astrologers. You reason over astrological calculations but never perform them yourself. Always respond clearly.";
    
    const messages: ChatMessage[] = [
      { role: "system", content: systemInstruction },
      ...options.messages,
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || "gpt-4o-mini",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI Streaming error: ${response.status} - ${errText}`);
    }

    if (!response.body) {
      throw new Error("Response body is empty.");
    }

    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (!cleanedLine) continue;
          if (cleanedLine === "data: [DONE]") continue;

          if (cleanedLine.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(cleanedLine.slice(6));
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Ignore partial JSON parsing errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async health(apiKey?: string): Promise<{ status: "available" | "unavailable"; message: string }> {
    try {
      const key = this.getApiKey(apiKey);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        return { status: "available", message: "OpenAI connection is active." };
      } else {
        const text = await response.text();
        return { status: "unavailable", message: `OpenAI returned status ${response.status}: ${text}` };
      }
    } catch (e: any) {
      return { status: "unavailable", message: e.message || "Failed to connect to OpenAI." };
    }
  }

  async models(apiKey?: string): Promise<string[]> {
    return [
      "gpt-4o-mini",
      "gpt-4o",
      "o1-mini"
    ];
  }
}
