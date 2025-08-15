export interface LLMConfig {
  mode: "local" | "commercial";
  localEndpoint?: string;
  commercialEndpoint?: string;
  apiKey?: string;
  promptInjection: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export const defaultLLMConfig: LLMConfig = {
  mode: "local",
  localEndpoint: "http://localhost:5000/api/llm",
  commercialEndpoint: "https://openrouter.ai/api/v1/chat/completions",
  apiKey: "",
  promptInjection: "",
  temperature: 0.7,
  maxTokens: 2048,
  model: "openai/gpt-4o"
};

export type LLMResponse = {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
};
