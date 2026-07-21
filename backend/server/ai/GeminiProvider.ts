import { GoogleGenAI } from "@google/genai";
import { AIProvider, ChatOptions, ChatMessage } from "./AIProvider";

export class GeminiProvider implements AIProvider {
  private getClient(apiKey?: string): GoogleGenAI {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("Gemini API key is not configured.");
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }

  private async executeGroqCall(prompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Groq API key not configured.");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3-8b-8192", messages: [{ role: "user", content: prompt }] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Groq failure");
    return data.choices[0].message.content;
  }

  private async executeOpenRouterCall(prompt: string): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OpenRouter API key not configured.");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek/deepseek-r1:free", messages: [{ role: "user", content: prompt }] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "OpenRouter failure");
    return data.choices[0].message.content;
  }

  async chat(options: ChatOptions): Promise<{ text: string }> {
    const contents = options.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    const prompt = options.messages[options.messages.length - 1].content;
    const models = ["gemini-3-flash", "gemini-2.5-flash-lite"];

    for (const model of models) {
      try {
        const ai = this.getClient(options.apiKey);
        const response = await ai.models.generateContent({ model, contents: contents as any, config: { systemInstruction: options.systemInstruction } });
        return { text: response.text || "" };
      } catch (e: any) {
        console.warn(`Gemini ${model} failed:`, e.message);
      }
    }

    // Fallbacks
    try { return { text: await this.executeGroqCall(prompt) }; } catch (e) { console.warn("Groq failed:", e); }
    try { return { text: await this.executeOpenRouterCall(prompt) }; } catch (e) { console.warn("OpenRouter failed:", e); }

    throw new Error("All AI providers failed.");
  }

  async stream(options: ChatOptions, onChunk: (text: string) => void): Promise<void> {
    // Simplified stream implementation for the sake of example - might not be able to stream all fallbacks easily
    const result = await this.chat(options);
    onChunk(result.text);
  }

  async health(apiKey?: string): Promise<{ status: "available" | "unavailable"; message: string }> {
    try {
      const ai = this.getClient(apiKey);
      await ai.models.generateContent({ model: "gemini-3-flash", contents: "ping", config: { maxOutputTokens: 5 } });
      return { status: "available", message: "Gemini connection is active." };
    } catch {
      return { status: "unavailable", message: "All AI providers unavailable or unconfigured." };
    }
  }

  async models(apiKey?: string): Promise<string[]> {
    return ["gemini-3-flash", "gemini-2.5-flash-lite", "groq-llama3", "openrouter-deepseek"];
  }
}
