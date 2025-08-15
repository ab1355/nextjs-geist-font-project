"use client";

import React, { useState, useEffect } from "react";
import { Tool, ToolExecutionResult } from "../lib/agentTools";
import TaskDelegationDialog from "./TaskDelegationDialog";
import DecisionAnalysisDialog from "./DecisionAnalysisDialog";
import WebSearchDialog from "./WebSearchDialog";
import LearningPanel from "./LearningPanel";
import LLMSettingsDialog from "./LLMSettingsDialog";
import { LLMConfig, defaultLLMConfig } from "../models/LLMConfig";

// Define types locally as they are no longer imported from server-side code
export interface AutonomousDecision {
  decision_parameter: string;
  decision_threshold: string;
  decision_outcome: "approved" | "denied";
  risk_assessment: {
    risk_type: string;
    risk_level: "low" | "medium" | "high";
    risk_mitigation_plan?: string;
  };
  impact_analysis: {
    impact_area: string;
    impact_level: "minor" | "moderate" | "significant";
    analysis_report?: string;
  };
}

export interface CollaborativeDecision extends AutonomousDecision {
  consensus_type: "voting" | "discussion";
  participants: string[];
  consensus_outcome: "agreement_reached" | "no_agreement";
  oversight_type: "review" | "approval";
  oversight_feedback: "approved" | "needs_revision";
  oversight_duration: "quick" | "detailed";
}

interface Agent {
  name: string;
  status: string;
  currentTask?: string;
  avatar: string;
  lastDecision?: AutonomousDecision | CollaborativeDecision;
  llmConfig?: LLMConfig;
}

interface AgentPanelProps {
  onAgentMessage: (text: string) => void;
}

interface ToolState {
  tools: Tool[];
  loading: boolean;
  activeToolResult: ToolExecutionResult | null;
  error: string;
}

export default function AgentPanel({ onAgentMessage }: AgentPanelProps) {
  // Tools state
  const [toolState, setToolState] = useState<ToolState>({
    tools: [],
    loading: false,
    activeToolResult: null,
    error: ""
  });

  // LLM Settings state
  const [showLLMSettings, setShowLLMSettings] = useState(false);
  const [selectedAgentForLLM, setSelectedAgentForLLM] = useState<string | null>(null);

  // CEO (Supervisor) state
  const [ceoAgent, setCeoAgent] = useState<Agent>({
    name: "CEO",
    status: "Idle",
    avatar: "https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg?auto=compress&cs=tinysrgb&w=60",
    llmConfig: defaultLLMConfig
  });

  // Subordinate agents state with LLM config
  const [subAgents, setSubAgents] = useState<Agent[]>([
    {
      name: "Marketing",
      status: "Idle",
      avatar: "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=60",
      llmConfig: defaultLLMConfig
    },
    {
      name: "Technology",
      status: "Idle",
      avatar: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=60",
      llmConfig: defaultLLMConfig
    },
    {
      name: "Learning",
      status: "Idle",
      avatar: "https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=60",
      llmConfig: defaultLLMConfig
    },
    {
      name: "Developer",
      status: "Idle",
      avatar: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=60",
      llmConfig: defaultLLMConfig
    },
    {
      name: "Customer Support",
      status: "Idle",
      avatar: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=60",
      llmConfig: defaultLLMConfig
    },
    {
      name: "Graphic Designer",
      status: "Idle",
      avatar: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=60",
      llmConfig: defaultLLMConfig
    },
    {
      name: "Writer",
      status: "Idle",
      avatar: "https://images.pexels.com/photos/261187/pexels-photo-261187.jpeg?auto=compress&cs=tinysrgb&w=60",
      llmConfig: defaultLLMConfig
    },
  ]);

  // Dialog states
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [showWebSearchDialog, setShowWebSearchDialog] = useState(false);
  const [showLearningPanel, setShowLearningPanel] = useState(false);
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<AutonomousDecision | CollaborativeDecision | null>(null);
  const [selectedAgentForLearning, setSelectedAgentForLearning] = useState<string | undefined>();

  // Fetch tools on component mount
  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch("/api/agentTools");
      const data = await response.json();
      if (data.tools) {
        setToolState(prev => ({ ...prev, tools: data.tools }));
      }
    } catch (err) {
      setToolState(prev => ({ ...prev, error: "Failed to load tools" }));
      console.error("Error fetching tools:", err);
    }
  };

  const handleExecuteTool = async (tool: Tool) => {
    setToolState(prev => ({ ...prev, loading: true, error: "" }));
    try {
      const response = await fetch("/api/agentTools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolName: tool.name,
          parameters: {},
        }),
      });
      const result = await response.json();
      setToolState(prev => ({ 
        ...prev, 
        activeToolResult: result,
        loading: false 
      }));
      onAgentMessage(`Tool ${tool.name} executed: ${result.message}`);
    } catch (err) {
      setToolState(prev => ({ 
        ...prev, 
        error: "Tool execution failed",
        loading: false 
      }));
      console.error("Error executing tool:", err);
    }
  };

  // Handle LLM Settings
  const handleOpenLLMSettings = (e: React.MouseEvent, agentName: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedAgentForLLM(agentName);
    setShowLLMSettings(true);
  };

  const handleCloseLLMSettings = () => {
    setShowLLMSettings(false);
    setSelectedAgentForLLM(null);
  };

  const handleSaveLLMSettings = (config: LLMConfig) => {
    if (selectedAgentForLLM === "CEO") {
      setCeoAgent(prev => ({
        ...prev,
        llmConfig: config
      }));
    } else {
      setSubAgents(prev =>
        prev.map(agent =>
          agent.name === selectedAgentForLLM
            ? { ...agent, llmConfig: config }
            : agent
        )
      );
    }
    setShowLLMSettings(false);
  };

  const handleDelegateTask = async (task: {
    agent: string;
    title: string;
    description: string;
    decisionData: any;
    collaborative?: boolean;
    consensus_type?: "voting" | "discussion";
    participants?: string[];
    oversight_type?: "review" | "approval";
  }) => {
    if (ceoAgent.status !== "Idle") {
      alert("CEO is busy delegating another task. Please wait.");
      return;
    }

    const targetIndex = subAgents.findIndex((agent) => agent.name === task.agent);
    if (targetIndex === -1) {
      console.error(`Subordinate agent ${task.agent} not found.`);
      return;
    }

    if (subAgents[targetIndex].status !== "Idle") {
      alert(`Agent ${task.agent} is currently busy.`);
      return;
    }

    const targetAgent = subAgents.find(agent => agent.name === task.agent);
    const llmConfig = targetAgent?.llmConfig || defaultLLMConfig;

    setCeoAgent((prev) => ({ ...prev, status: "Evaluating Task" }));
    setSubAgents((prev) =>
        prev.map((agent, index) =>
          index === targetIndex
            ? { ...agent, status: `Working on ${task.title}`, currentTask: task.description }
            : agent
        )
      );


    try {
      const response = await fetch('/api/agent/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delegateTask',
          payload: { ...task, llmConfig },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delegate task');
      }

      const result = await response.json();

      setSubAgents((prev) =>
        prev.map((agent, index) =>
          index === targetIndex
            ? { ...agent, status: result.success ? "Idle" : "Error", currentTask: undefined, lastDecision: result.decision }
            : agent
        )
      );

      setCeoAgent((prev) => ({ ...prev, status: "Idle" }));

      onAgentMessage(result.message);

    } catch (error) {
      console.error("Error processing task:", error);
      setSubAgents((prev) =>
        prev.map((agent, index) =>
          index === targetIndex
            ? { ...agent, status: "Error", currentTask: undefined }
            : agent
        )
      );
      setCeoAgent((prev) => ({ ...prev, status: "Idle" }));
      onAgentMessage(
        `An unexpected error occurred while ${task.agent} was processing "${task.title}".`
      );
    }
  };

  const handleViewDecision = (agent: Agent) => {
    if (agent.lastDecision) {
      setSelectedDecision(agent.lastDecision);
      setShowDecisionDialog(true);
    }
  };

  return (
    <aside className="w-80 bg-gray-800 p-4 flex flex-col space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lime-400 text-xl font-semibold">Agent Hierarchy</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowToolsPanel(true)}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition text-sm"
          >
            Tools
          </button>
          <button
            onClick={() => setShowWebSearchDialog(true)}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition text-sm"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSelectedAgentForLearning(undefined);
              setShowLearningPanel(true);
            }}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition text-sm"
          >
            Learning
          </button>
        </div>
      </div>
      
      {/* CEO Card with LLM Settings */}
      <div
        className="bg-gray-700 p-4 rounded-md flex items-center space-x-3 mb-4 border-2 border-yellow-400 relative overflow-hidden"
        style={{ cursor: 'pointer' }}
        onClick={(e) => handleOpenLLMSettings(e, "CEO")}
      >
        <div className="absolute inset-0 bg-yellow-400/5"></div>
        <div className="relative">
          <img
            src={ceoAgent.avatar}
            alt={`${ceoAgent.name} Avatar`}
            className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400"
          />
          <div 
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-700 ${
              ceoAgent.status === "Idle" ? "bg-green-500" : 
              ceoAgent.status.startsWith("Delegating") ? "bg-yellow-500" : 
              "bg-red-500"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center">
              {ceoAgent.name}
              <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full">
                Supervisor
              </span>
            </h3>
            <button
              onClick={(e) => handleOpenLLMSettings(e, "CEO")}
              className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
            >
              LLM
            </button>
          </div>
          <p className={`text-sm ${
            ceoAgent.status === "Idle" ? "text-green-400" : 
            ceoAgent.status.startsWith("Delegating") ? "text-yellow-400" : 
            "text-red-400"
          }`}>
            Status: {ceoAgent.status}
          </p>
        </div>
      </div>

      {/* Vertical line connector */}
      <div className="w-px h-6 bg-gray-600 mx-auto"></div>

      {/* Subordinate Agents with LLM Settings */}
      <div className="flex flex-col space-y-3 overflow-y-auto flex-1">
        {subAgents.map((agent) => (
          <div 
            key={agent.name} 
            className={`bg-gray-700 p-3 rounded-md flex items-center space-x-3 transition-colors duration-200 ${
              agent.status === "Error" ? "border-red-500 border" : ""
            }`}
            onClick={() => {
              if (agent.lastDecision) {
                handleViewDecision(agent);
              }
            }}
            style={{ cursor: agent.lastDecision ? 'pointer' : 'default' }}
            onContextMenu={(e) => {
              e.preventDefault();
              setSelectedAgentForLearning(agent.name);
              setShowLearningPanel(true);
            }}
          >
            <div className="relative">
              <img
                src={agent.avatar}
                alt={`${agent.name} Avatar`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div 
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-700 ${
                  agent.status === "Idle" ? "bg-green-500" : 
                  agent.status === "Error" ? "bg-red-500" : 
                  "bg-yellow-500"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white truncate">{agent.name}</h3>
                <button
                  onClick={(e) => handleOpenLLMSettings(e, agent.name)}
                  className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                >
                  LLM
                </button>
              </div>
              <p className={`text-sm ${
                agent.status === "Error" ? "text-red-400" : 
                agent.status === "Idle" ? "text-green-400" : 
                "text-yellow-400"
              }`}>
                Status: {agent.status}
              </p>
              {agent.currentTask && (
                <p className="text-gray-400 text-xs mt-1 truncate">
                  {agent.currentTask}
                </p>
              )}
              {agent.lastDecision && (
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    agent.lastDecision.decision_outcome === "approved" 
                      ? "bg-green-400/20 text-green-400" 
                      : "bg-red-400/20 text-red-400"
                  }`}>
                    Decision: {agent.lastDecision.decision_outcome}
                  </span>
                  {'consensus_outcome' in agent.lastDecision && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      (agent.lastDecision as CollaborativeDecision).consensus_outcome === "agreement_reached"
                        ? "bg-cyan-400/20 text-cyan-400"
                        : "bg-yellow-400/20 text-yellow-400"
                    }`}>
                      Collaborative
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <TaskDelegationDialog 
        agents={subAgents} 
        onDelegateTask={handleDelegateTask} 
      />
      
      <DecisionAnalysisDialog
        open={showDecisionDialog}
        onOpenChange={setShowDecisionDialog}
        decision={selectedDecision}
      />

      <WebSearchDialog 
        open={showWebSearchDialog}
        onOpenChange={setShowWebSearchDialog}
      />

      <LearningPanel
        open={showLearningPanel}
        onOpenChange={setShowLearningPanel}
        selectedAgent={selectedAgentForLearning}
      />

      <LLMSettingsDialog
        open={showLLMSettings}
        initialConfig={
          selectedAgentForLLM === "CEO"
            ? ceoAgent.llmConfig || defaultLLMConfig
            : subAgents.find(a => a.name === selectedAgentForLLM)?.llmConfig || defaultLLMConfig
        }
        onSave={handleSaveLLMSettings}
        onClose={handleCloseLLMSettings}
      />

      {/* Tools Panel Dialog */}
      {showToolsPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Agent Tools</h2>
              <button 
                onClick={() => setShowToolsPanel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {toolState.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={tool.iconURL}
                      alt={tool.name}
                      className="w-full h-32 object-cover rounded-md mb-4"
                    />
                    <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                    <button
                      onClick={() => handleExecuteTool(tool)}
                      disabled={toolState.loading}
                      className={`w-full py-2 px-4 rounded-md ${
                        toolState.loading
                          ? "bg-gray-200 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {toolState.loading ? "Executing..." : "Execute"}
                    </button>
                  </div>
                ))}
              </div>

              {toolState.activeToolResult && (
                <div className="mt-6 border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Latest Result</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm mb-2">
                      Status: {toolState.activeToolResult.success ? "Success" : "Failed"}
                    </p>
                    <p className="text-sm mb-2">Message: {toolState.activeToolResult.message}</p>
                    {toolState.activeToolResult.data && (
                      <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                        {JSON.stringify(toolState.activeToolResult.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {toolState.error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                  {toolState.error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
