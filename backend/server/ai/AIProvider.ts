export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  apiKey?: string;
  model?: string;
  systemInstruction?: string;
}

export interface AIProvider {
  chat(options: ChatOptions): Promise<{ text: string }>;
  stream(options: ChatOptions, onChunk: (text: string) => void): Promise<void>;
  health(apiKey?: string): Promise<{ status: 'available' | 'unavailable'; message: string }>;
  models(apiKey?: string): Promise<string[]>;
}
