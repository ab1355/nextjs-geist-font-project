"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import useLearning from "../hooks/useLearning";

interface LearningPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAgent?: string;
}

export default function LearningPanel({ 
  open, 
  onOpenChange,
  selectedAgent 
}: LearningPanelProps) {
  const [topic, setTopic] = useState("");
  const {
    loading,
    error,
    profile,
    stats,
    insights,
    fetchInsights,
    clearInsights,
    refreshAgentData
  } = useLearning(selectedAgent);

  useEffect(() => {
    if (open && selectedAgent) {
      refreshAgentData();
    }
  }, [open, selectedAgent, refreshAgentData]);

  const handleClose = () => {
    setTopic("");
    clearInsights();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 text-white max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-lime-400">
            Learning Insights {selectedAgent ? `- ${selectedAgent}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {/* Agent Profile Card */}
          {profile && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lime-400 font-semibold mb-2">Behavior Profile</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-white">{(profile.successRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Tolerance</span>
                  <span className="text-white">{(profile.riskTolerance * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Collaboration Score</span>
                  <span className="text-white">{(profile.collaborationScore * 100).toFixed(1)}%</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Last Updated: {new Date(profile.lastUpdated).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Experience Stats Card */}
          {stats && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lime-400 font-semibold mb-2">Experience Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Tasks</span>
                  <span className="text-white">{stats.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-white">{(stats.successRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Risk Level</span>
                  <span className={`capitalize ${
                    stats.averageRiskLevel === "high" ? "text-red-400" :
                    stats.averageRiskLevel === "medium" ? "text-yellow-400" :
                    "text-green-400"
                  }`}>
                    {stats.averageRiskLevel}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Knowledge Search Section */}
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Search for specific learning insights..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-lime-400"
          />
          <Button 
            onClick={() => fetchInsights(topic)}
            className="bg-lime-600 text-white hover:bg-lime-500"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Insights Display */}
        <div className="overflow-y-auto flex-1">
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className="bg-gray-800 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lime-400 font-semibold">
                      {insight.type === "experience" ? "Learning Experience" : "Knowledge Entry"}
                    </h4>
                    <p className="text-gray-300 mt-1">
                      {typeof insight.content === "string" 
                        ? insight.content 
                        : JSON.stringify(insight.content, null, 2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      Confidence: {(insight.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(insight.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!loading && insights.length === 0 && topic && (
              <div className="text-center text-gray-400 py-8">
                No insights found for "{topic}"
              </div>
            )}

            {loading && (
              <div className="text-center text-gray-400 py-8">
                Searching for insights...
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
