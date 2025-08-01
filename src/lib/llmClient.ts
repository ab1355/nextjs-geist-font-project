import { LLMConfig, LLMResponse } from "../models/LLMConfig";

const applyPromptInjection = (prompt: string, injection: string): string => {
  if (!injection) return prompt;
  return `${injection}\n\n${prompt}`;
};

const validateConfig = (config: LLMConfig) => {
  if (config.mode === "local" && !config.localEndpoint) {
    throw new Error("Local LLM endpoint is required when using local mode");
  }
  if (config.mode === "commercial" && (!config.commercialEndpoint || !config.apiKey)) {
    throw new Error("Commercial endpoint and API key are required when using commercial mode");
  }
};

export async function queryLocalLLM(prompt: string, config: LLMConfig): Promise<LLMResponse> {
  try {
    const finalPrompt = applyPromptInjection(prompt, config.promptInjection);
    const response = await fetch(config.localEndpoint as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: finalPrompt,
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`Local LLM request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.response || data.text,
      metadata: {
        model: "local",
        timestamp: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error("Error querying local LLM:", error);
    throw new Error(`Local LLM query failed: ${error.message}`);
  }
}

export async function queryCommercialLLM(prompt: string, config: LLMConfig): Promise<LLMResponse> {
  try {
    const finalPrompt = applyPromptInjection(prompt, config.promptInjection);
    const response = await fetch(config.commercialEndpoint as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        model: "text-davinci-003" // Default model, could be made configurable
      })
    });

    if (!response.ok) {
      throw new Error(`Commercial LLM request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.choices?.[0]?.text || "",
      usage: data.usage,
      metadata: {
        model: data.model,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error: any) {
    console.error("Error querying commercial LLM:", error);
    throw new Error(`Commercial LLM query failed: ${error.message}`);
  }
}

export async function queryLLM(prompt: string, config: LLMConfig): Promise<LLMResponse> {
  validateConfig(config);
  
  if (config.mode === "local") {
    return queryLocalLLM(prompt, config);
  } else if (config.mode === "commercial") {
    return queryCommercialLLM(prompt, config);
  } else {
    throw new Error(`Unsupported LLM mode: ${config.mode}`);
  }
}

// Utility function to check if an LLM endpoint is available
export async function checkLLMAvailability(config: LLMConfig): Promise<boolean> {
  try {
    const testPrompt = "Test connection.";
    await queryLLM(testPrompt, config);
    return true;
  } catch (error) {
    console.error("LLM availability check failed:", error);
    return false;
  }
}

// Helper function to sanitize prompts
export function sanitizePrompt(prompt: string): string {
  // Remove any potentially harmful characters or patterns
  return prompt
    .replace(/[^\w\s.,?!-]/g, "") // Remove special characters
    .trim();
}
