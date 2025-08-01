export interface LLMConfig {
  mode: "local" | "commercial";
  localEndpoint?: string;
  commercialEndpoint?: string;
  apiKey?: string;
  promptInjection: string;
  temperature?: number;
  maxTokens?: number;
}

export const defaultLLMConfig: LLMConfig = {
  mode: "local",
  localEndpoint: "http://localhost:5000/api/llm",
  commercialEndpoint: "https://api.openai.com/v1/completions",
  apiKey: "",
  promptInjection: "",
  temperature: 0.7,
  maxTokens: 2048
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
