import { AIProvider, ChatOptions } from "./AIProvider";

export class GeminiProvider implements AIProvider {
  private async callGeminiLayer(prompt: string, apiKey?: string): Promise<string> {
    const activeKey = apiKey || process.env.GEMINI_API_KEY;
    if (!activeKey) throw new Error("401: No Gemini configuration key.");
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (response.status === 429) throw new Error("429: Gemini Quota exhausted.");
    
    const outputData = await response.json();
    if (!response.ok) throw new Error(`Status ${response.status}: ${outputData.error?.message || "Unknown error"}`);
    
    return outputData.candidates[0].content.parts[0].text;
  }

  private async callGroqLayer(prompt: string, apiKey?: string): Promise<string> {
    const activeKey = apiKey || process.env.GROQ_API_KEY;
    if (!activeKey) throw new Error("401: Groq API key not configured.");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${activeKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) throw new Error("Groq failed.");
    const outputData = await response.json();
    return outputData.choices[0].message.content;
  }

  private async callOpenRouterLayer(prompt: string, apiKey?: string): Promise<string> {
    const activeKey = apiKey || process.env.OPENROUTER_API_KEY;
    if (!activeKey) throw new Error("401: OpenRouter API key not configured.");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${activeKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aistudio.google.com"
      },
      body: JSON.stringify({
        model: "qwen/qwen3-next-80b-a3b-instruct:free",
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) throw new Error("OpenRouter failed.");
    const outputData = await response.json();
    return outputData.choices[0].message.content;
  }

  async chat(options: ChatOptions): Promise<{ text: string }> {
    const prompt = options.messages[options.messages.length - 1].content;
    const pipeline = [
      () => this.callGeminiLayer(prompt, options.apiKey),
      () => this.callGroqLayer(prompt, options.apiKey),
      () => this.callOpenRouterLayer(prompt, options.apiKey)
    ];

    for (const step of pipeline) {
      try {
        const text = await step();
        if (text) return { text };
      } catch (err: any) {
        console.warn(`Fallback triggered: ${err.message}`);
        if (err.message.includes("429") || err.message.includes("401") || err.message.includes("ResourceExhausted")) continue;
        throw err;
      }
    }
    throw new Error("All AI providers failed.");
  }

  async stream(options: ChatOptions, onChunk: (text: string) => void): Promise<void> {
    const result = await this.chat(options);
    onChunk(result.text);
  }

  async health(apiKey?: string): Promise<{ status: "available" | "unavailable"; message: string }> {
    try {
      await this.callGeminiLayer("ping", apiKey);
      return { status: "available", message: "Gemini connection is active." };
    } catch {
      return { status: "unavailable", message: "All AI providers unavailable or unconfigured." };
    }
  }

  async models(): Promise<string[]> {
    return ["gemini-2.0-flash", "llama-3.3-70b-versatile", "qwen/qwen3-next-80b-a3b-instruct:free"];
  }
}
