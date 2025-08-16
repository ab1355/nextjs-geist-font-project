import { AutonomousDecision, CollaborativeDecision, AgentTask } from "../lib/agentLogic";
import { Tool, ToolExecutionResult } from "../lib/agentTools";
import { LLMConfig, defaultLLMConfig } from "./LLMConfig";

export interface AgentContext {
  agentName: string;
  currentTaskId?: string;
  currentTask?: AgentTask;
  currentDecision?: AutonomousDecision | CollaborativeDecision;
  availableTools: Tool[];
  currentTool?: Tool;
  toolStatus: "idle" | "executing" | "completed" | "error";
  lastToolResult?: ToolExecutionResult;
  lastUpdated: number;
  llmConfig: LLMConfig;
  llmStatus?: {
    isProcessing: boolean;
    lastResponse?: string;
    error?: string;
  };
}

export interface AgentToolContext {
  toolName: string;
  parameters?: any;
  taskContext?: {
    taskId: string;
    taskType: string;
    priority: "low" | "medium" | "high";
  };
  executionContext?: {
    startTime: number;
    timeout?: number;
    retryCount?: number;
  };
}

export interface ToolExecutionContext {
  tool: Tool;
  input: any; // Adding input property
  parameters: any;
  result?: ToolExecutionResult;
  error?: Error;
  executionTime?: number;
  retries?: number;
}

export const createInitialContext = (agentName: string): AgentContext => ({
  agentName,
  availableTools: [],
  toolStatus: "idle",
  lastUpdated: Date.now(),
  llmConfig: defaultLLMConfig,
  llmStatus: {
    isProcessing: false
  }
});
