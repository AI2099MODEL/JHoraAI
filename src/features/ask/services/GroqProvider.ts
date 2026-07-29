import { AIProvider, ChatOptions } from "./AIProvider";

export class GroqProvider implements AIProvider {
  async chat(options: ChatOptions): Promise<string> {
    const key = options.apiKey || (typeof window !== "undefined" ? localStorage.getItem("user_groq_api_key") : undefined);
    const res = await fetch("/api/astrology/master-ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: options.messages[options.messages.length - 1]?.content || "",
        mode: "fast",
        groqApiKey: key
      })
    });
    if (!res.ok) {
      throw new Error("Groq provider request failed.");
    }
    const data = await res.json();
    return data.reply || "";
  }

  async stream(options: ChatOptions, onChunk: (text: string) => void): Promise<void> {
    const reply = await this.chat(options);
    onChunk(reply);
  }

  async health(apiKey?: string): Promise<{ status: "available" | "unavailable"; message: string }> {
    try {
      const keyToUse = apiKey || (typeof window !== "undefined" ? localStorage.getItem("user_groq_api_key") : undefined);
      const res = await fetch("/api/astrology/master-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "Health ping",
          mode: "fast",
          groqApiKey: keyToUse
        })
      });
      if (res.ok) {
        return { status: "available", message: "Groq LLaMA 3.3 70B connection active." };
      }
      return { status: "unavailable", message: "Groq connection unavailable." };
    } catch (e: any) {
      return { status: "unavailable", message: e.message || "Groq health check failed." };
    }
  }

  async models(): Promise<string[]> {
    return ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
  }
}
