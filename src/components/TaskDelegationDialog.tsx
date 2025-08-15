"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";

import { Tool } from "../lib/agentTools";

interface TaskDelegationDialogProps {
  agents: Array<{ name: string; status: string }>;
  tools: Tool[];
  onDelegateTask: (task: {
    agent: string;
    title: string;
    description: string;
    decisionData: any;
    collaborative?: boolean;
    consensus_type?: "voting" | "discussion";
    participants?: string[];
    oversight_type?: "review" | "approval";
    tool?: Tool;
  }) => void;
}

export default function TaskDelegationDialog({
  agents,
  tools,
  onDelegateTask,
}: TaskDelegationDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    agent: "",
    title: "",
    description: "",
    decisionParameter: "",
    decisionThreshold: "medium",
    riskType: "",
    riskLevel: "medium",
    riskMitigation: "",
    impactArea: "",
    impactLevel: "moderate",
    impactAnalysis: "",
    toolName: "",
    // New collaborative decision fields
    collaborative: false,
    consensus_type: "voting",
    participants: [] as string[],
    oversight_type: "review",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedTool = tools.find(t => t.name === formData.toolName);
    const task = {
      agent: formData.agent,
      title: formData.title,
      description: formData.description,
      decisionData: {
        decision_parameter: formData.decisionParameter,
        decision_threshold: formData.decisionThreshold,
        risk_assessment: {
          risk_type: formData.riskType,
          risk_level: formData.riskLevel,
          risk_mitigation_plan: formData.riskMitigation,
        },
        impact_analysis: {
          impact_area: formData.impactArea,
          impact_level: formData.impactLevel,
          analysis_report: formData.impactAnalysis,
        },
      },
      collaborative: formData.collaborative,
      consensus_type: formData.consensus_type as "voting" | "discussion",
      participants: formData.participants,
      oversight_type: formData.oversight_type as "review" | "approval",
      tool: selectedTool,
    };

    onDelegateTask(task);
    setOpen(false);
    // Reset form
    setFormData({
      agent: "",
      title: "",
      description: "",
      decisionParameter: "",
      decisionThreshold: "medium",
      riskType: "",
      riskLevel: "medium",
      riskMitigation: "",
      impactArea: "",
      impactLevel: "moderate",
      impactAnalysis: "",
      toolName: "",
      collaborative: false,
      consensus_type: "voting",
      participants: [],
      oversight_type: "review",
    });
  };

  const handleParticipantChange = (agentName: string) => {
    setFormData(prev => {
      const participants = prev.participants.includes(agentName)
        ? prev.participants.filter(p => p !== agentName)
        : [...prev.participants, agentName];
      return { ...prev, participants };
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-lime-600 hover:bg-lime-700">
          Delegate New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Task Delegation</DialogTitle>
          <DialogDescription className="text-gray-400">
            Delegate a task to an agent with specific parameters and risk assessment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Task Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="agent">Assign To Agent</Label>
              <Select
                value={formData.agent}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, agent: value }))
                }
              >
                <SelectTrigger className="bg-gray-700">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700">
                  {agents.map((agent) => (
                    <SelectItem key={agent.name} value={agent.name}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tool">Tool (Optional)</Label>
              <Select
                value={formData.toolName}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, toolName: value }))
                }
              >
                <SelectTrigger className="bg-gray-700">
                  <SelectValue placeholder="Select a tool" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700">
                  <SelectItem value="">None</SelectItem>
                  {tools.map((tool) => (
                    <SelectItem key={tool.name} value={tool.name}>
                      {tool.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                className="bg-gray-700"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Task Description</Label>
              <Textarea
                id="description"
                className="bg-gray-700"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Decision Parameters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-lime-400">Decision Parameters</h3>
            
            <div>
              <Label htmlFor="decisionParameter">Decision Parameter</Label>
              <Input
                id="decisionParameter"
                className="bg-gray-700"
                value={formData.decisionParameter}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    decisionParameter: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="decisionThreshold">Decision Threshold</Label>
              <Select
                value={formData.decisionThreshold}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, decisionThreshold: value }))
                }
              >
                <SelectTrigger className="bg-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-lime-400">Risk Assessment</h3>
            
            <div>
              <Label htmlFor="riskType">Risk Type</Label>
              <Input
                id="riskType"
                className="bg-gray-700"
                value={formData.riskType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, riskType: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, riskLevel: value }))
                }
              >
                <SelectTrigger className="bg-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="riskMitigation">Risk Mitigation Plan</Label>
              <Textarea
                id="riskMitigation"
                className="bg-gray-700"
                value={formData.riskMitigation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    riskMitigation: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Impact Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-lime-400">Impact Analysis</h3>
            
            <div>
              <Label htmlFor="impactArea">Impact Area</Label>
              <Input
                id="impactArea"
                className="bg-gray-700"
                value={formData.impactArea}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, impactArea: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="impactLevel">Impact Level</Label>
              <Select
                value={formData.impactLevel}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, impactLevel: value }))
                }
              >
                <SelectTrigger className="bg-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700">
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="significant">Significant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="impactAnalysis">Impact Analysis Report</Label>
              <Textarea
                id="impactAnalysis"
                className="bg-gray-700"
                value={formData.impactAnalysis}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    impactAnalysis: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Collaborative Decision Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyan-400">Collaborative Decision</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="collaborative"
                checked={formData.collaborative}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, collaborative: checked }))
                }
              />
              <Label htmlFor="collaborative">Enable Collaborative Decision</Label>
            </div>

            {formData.collaborative && (
              <div className="space-y-4 pl-4 border-l-2 border-cyan-400/30">
                <div>
                  <Label htmlFor="consensus_type">Consensus Type</Label>
                  <Select
                    value={formData.consensus_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, consensus_type: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700">
                      <SelectItem value="voting">Voting</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Select Participants</Label>
                  <div className="space-y-2 mt-2">
                    {agents.map((agent) => (
                      <div key={agent.name} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`participant-${agent.name}`}
                          checked={formData.participants.includes(agent.name)}
                          onChange={() => handleParticipantChange(agent.name)}
                          className="rounded bg-gray-700 border-gray-600"
                        />
                        <Label htmlFor={`participant-${agent.name}`}>{agent.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="oversight_type">Oversight Type</Label>
                  <Select
                    value={formData.oversight_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, oversight_type: value }))
                    }
                  >
                    <SelectTrigger className="bg-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700">
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="approval">Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700">
            Delegate Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
