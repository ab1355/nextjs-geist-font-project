"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { AutonomousDecision, CollaborativeDecision } from "../lib/agentLogic";

interface DecisionAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: AutonomousDecision | CollaborativeDecision | null;
}

export default function DecisionAnalysisDialog({
  open,
  onOpenChange,
  decision,
}: DecisionAnalysisDialogProps) {
  if (!decision) return null;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getImpactLevelColor = (level: string) => {
    switch (level) {
      case "minor":
        return "text-green-400";
      case "moderate":
        return "text-yellow-400";
      case "significant":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const isCollaborativeDecision = (
    decision: AutonomousDecision | CollaborativeDecision
  ): decision is CollaborativeDecision => {
    return 'consensus_type' in decision;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isCollaborativeDecision(decision) ? "Collaborative" : "Autonomous"} Decision Analysis Report
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Detailed analysis of the {isCollaborativeDecision(decision) ? "collaborative" : "autonomous"} decision-making process
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Decision Outcome */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-lime-400">Decision Outcome</h3>
            <div className={`text-xl font-bold ${
              decision.decision_outcome === "approved" ? "text-green-400" : "text-red-400"
            }`}>
              {decision.decision_outcome.toUpperCase()}
            </div>
            <div className="mt-2 text-gray-300">
              <span className="text-gray-400">Parameter:</span> {decision.decision_parameter}
              <br />
              <span className="text-gray-400">Threshold:</span> {decision.decision_threshold}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-lime-400">Risk Assessment</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Risk Type:</span>{" "}
                {decision.risk_assessment.risk_type}
              </div>
              <div>
                <span className="text-gray-400">Risk Level:</span>{" "}
                <span className={getRiskLevelColor(decision.risk_assessment.risk_level)}>
                  {decision.risk_assessment.risk_level.toUpperCase()}
                </span>
              </div>
              {decision.risk_assessment.risk_mitigation_plan && (
                <div>
                  <span className="text-gray-400">Mitigation Plan:</span>
                  <p className="mt-1 text-sm text-gray-300">
                    {decision.risk_assessment.risk_mitigation_plan}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Impact Analysis */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-lime-400">Impact Analysis</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Impact Area:</span>{" "}
                {decision.impact_analysis.impact_area}
              </div>
              <div>
                <span className="text-gray-400">Impact Level:</span>{" "}
                <span className={getImpactLevelColor(decision.impact_analysis.impact_level)}>
                  {decision.impact_analysis.impact_level.toUpperCase()}
                </span>
              </div>
              {decision.impact_analysis.analysis_report && (
                <div>
                  <span className="text-gray-400">Analysis Report:</span>
                  <p className="mt-1 text-sm text-gray-300">
                    {decision.impact_analysis.analysis_report}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Collaborative Decision Details */}
          {isCollaborativeDecision(decision) && (
            <>
              {/* Multi-agent Consensus */}
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-cyan-400">Multi-agent Consensus</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400">Consensus Type:</span>{" "}
                    <span className="capitalize">{decision.consensus_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Participants:</span>{" "}
                    <span>{decision.participants.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Consensus Outcome:</span>{" "}
                    <span className={
                      decision.consensus_outcome === "agreement_reached" 
                        ? "text-green-400" 
                        : "text-red-400"
                    }>
                      {decision.consensus_outcome.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Human Oversight */}
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-cyan-400">Human Oversight</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400">Oversight Type:</span>{" "}
                    <span className="capitalize">{decision.oversight_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Feedback:</span>{" "}
                    <span className={
                      decision.oversight_feedback === "approved" 
                        ? "text-green-400" 
                        : "text-yellow-400"
                    }>
                      {decision.oversight_feedback.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Duration:</span>{" "}
                    <span className="capitalize">{decision.oversight_duration}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
