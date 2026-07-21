import { AIProvider, ChatOptions } from "./AIProvider";

export class GeminiProvider implements AIProvider {
  private providerName = "gemini";

  async chat(options: ChatOptions): Promise<string> {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: this.providerName,
        messages: options.messages,
        model: options.model,
        apiKey: options.apiKey,
        systemInstruction: options.systemInstruction,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Failed to fetch response." }));
      throw new Error(err.error || "Failed to fetch response from Gemini.");
    }

    const data = await response.json();
    return data.text || "";
  }

  async stream(options: ChatOptions, onChunk: (text: string) => void, abortSignal?: AbortSignal): Promise<void> {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: this.providerName,
        messages: options.messages,
        model: options.model,
        apiKey: options.apiKey,
        systemInstruction: options.systemInstruction,
        stream: true,
      }),
      signal: abortSignal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Failed to establish stream." }));
      throw new Error(err.error || "Failed to stream from Gemini.");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No readable stream in response.");
    }

    const decoder = new TextDecoder();
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
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                onChunk(parsed.text);
              }
            } catch (e) {
              // Ignore partial JSON chunks
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
      const queryParams = new URLSearchParams();
      queryParams.append("provider", this.providerName);
      if (apiKey) queryParams.append("apiKey", apiKey);

      const response = await fetch(`/api/ai/health?${queryParams.toString()}`);
      if (!response.ok) {
        return { status: "unavailable", message: "Failed to connect to backend health check." };
      }
      return await response.json();
    } catch (e: any) {
      return { status: "unavailable", message: e.message || "Failed health check connection." };
    }
  }

  async models(apiKey?: string): Promise<string[]> {
    try {
      const response = await fetch("/api/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: this.providerName, apiKey }),
      });
      if (!response.ok) return ["gemini-3-flash", "gemini-2.5-flash-lite"];
      const data = await response.json();
      return data.models || [];
    } catch {
      return ["gemini-3-flash", "gemini-2.5-flash-lite"];
    }
  }
}
