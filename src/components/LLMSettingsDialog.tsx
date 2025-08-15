"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { LLMConfig } from "@/models/LLMConfig";
import { checkLLMAvailability } from "@/lib/llmClient";

interface LLMSettingsDialogProps {
  open: boolean;
  initialConfig: LLMConfig;
  onSave: (config: LLMConfig) => void;
  onClose: () => void;
}

const commercialProviders = {
  openai: "https://api.openai.com/v1/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  requesty: "https://api.requesty.ai/v1/models/completions",
  litellm: "https://api.litellm.ai/v1/completions",
  aiml: "https://api.aimlapi.com/v1/chat/completions",
};

export default function LLMSettingsDialog({
  open,
  initialConfig,
  onSave,
  onClose,
}: LLMSettingsDialogProps) {
  const [config, setConfig] = useState<LLMConfig>(initialConfig);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleSave = async () => {
    try {
      setTestStatus("testing");
      const isAvailable = await checkLLMAvailability(config);
      if (isAvailable) {
        setTestStatus("success");
        onSave(config);
      } else {
        setTestStatus("error");
        setErrorMessage("Could not connect to LLM endpoint. Please check your settings.");
      }
    } catch (error: any) {
      setTestStatus("error");
      setErrorMessage(error.message);
    }
  };

  const handleProviderChange = (provider: keyof typeof commercialProviders) => {
    setConfig({ ...config, commercialEndpoint: commercialProviders[provider] });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">LLM Integration Settings</DialogTitle>
          <DialogDescription>
            Configure the Language Model settings for this agent.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="llm-mode">LLM Mode</Label>
            <Select
              value={config.mode}
              onValueChange={(value: "local" | "commercial") =>
                setConfig({ ...config, mode: value })
              }
            >
              <SelectTrigger id="llm-mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.mode === "local" && (
            <div className="grid gap-2">
              <Label htmlFor="local-endpoint">Local Endpoint URL</Label>
              <Input
                id="local-endpoint"
                value={config.localEndpoint}
                onChange={(e) =>
                  setConfig({ ...config, localEndpoint: e.target.value })
                }
                placeholder="http://localhost:5000/api/llm"
              />
            </div>
          )}

          {config.mode === "commercial" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="commercial-provider">Commercial Provider</Label>
                <Select onValueChange={handleProviderChange}>
                  <SelectTrigger id="commercial-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(commercialProviders).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="commercial-endpoint">Commercial Endpoint URL</Label>
                <Input
                  id="commercial-endpoint"
                  value={config.commercialEndpoint}
                  onChange={(e) =>
                    setConfig({ ...config, commercialEndpoint: e.target.value })
                  }
                  placeholder="Select a provider or enter a custom URL"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) =>
                    setConfig({ ...config, apiKey: e.target.value })
                  }
                  placeholder="Enter your API key"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={config.model}
                  onChange={(e) =>
                    setConfig({ ...config, model: e.target.value })
                  }
                  placeholder="e.g. openai/gpt-4o"
                />
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="prompt-injection">Prompt Injection</Label>
            <Textarea
              id="prompt-injection"
              value={config.promptInjection}
              onChange={(e) =>
                setConfig({ ...config, promptInjection: e.target.value })
              }
              placeholder="Enter text to be injected into each prompt"
              className="h-24"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="temperature">
              Temperature: {config.temperature?.toFixed(2)}
            </Label>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[config.temperature || 0.7]}
              onValueChange={(value) =>
                setConfig({ ...config, temperature: value[0] })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="max-tokens">
              Max Tokens: {config.maxTokens}
            </Label>
            <Slider
              id="max-tokens"
              min={100}
              max={4096}
              step={100}
              value={[config.maxTokens || 2048]}
              onValueChange={(value) =>
                setConfig({ ...config, maxTokens: value[0] })
              }
            />
          </div>

          {testStatus === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={testStatus === "testing"}
            variant="default"
          >
            {testStatus === "testing" ? "Testing Connection..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
