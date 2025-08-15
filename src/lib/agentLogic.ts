import { storeExperience, adjustBehavior } from "./learningEngine";
import { Tool, executeTool, ToolExecutionResult } from "./agentTools";
import type { AgentContext, ToolExecutionContext } from "../models/AgentContext";

export interface AgentTask {
  title: string;
  description: string;
}

export interface ProcessResult {
  success: boolean;
  message: string;
  toolResult?: ToolExecutionResult;
  context?: ToolExecutionContext;
}

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
  // Multi-agent Consensus fields
  consensus_type: "voting" | "discussion";
  participants: string[];
  consensus_outcome: "agreement_reached" | "no_agreement";

  // Human Oversight fields
  oversight_type: "review" | "approval";
  oversight_feedback: "approved" | "needs_revision";
  oversight_duration: "quick" | "detailed";
}

export interface DecisionData {
  decision_parameter: string;
  decision_threshold: string;
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

export async function makeAutonomousDecision(
  task: AgentTask,
  decisionData: DecisionData
): Promise<AutonomousDecision> {
  try {
    // Evaluate risk level
    const riskScore = getRiskScore(decisionData.risk_assessment.risk_level);
    
    // Evaluate impact level
    const impactScore = getImpactScore(decisionData.impact_analysis.impact_level);
    
    // Calculate total risk-impact score
    const totalScore = (riskScore + impactScore) / 2;
    
    // Get adjusted threshold based on learning
    const baseThreshold = getThresholdScore(decisionData.decision_threshold);
    const { threshold: adjustedThreshold } = await adjustBehavior("autonomous", {
      threshold: baseThreshold,
      riskTolerance: 0.5
    });
    
    // Make decision based on adjusted scores
    const decisionOutcome = totalScore <= adjustedThreshold ? "approved" : "denied";

    return {
      ...decisionData,
      decision_outcome: decisionOutcome,
    };
  } catch (error) {
    console.error("Error in making autonomous decision:", error);
    throw new Error("Decision processing failed.");
  }
}

export async function makeCollaborativeDecision(
  task: AgentTask,
  decisionData: DecisionData,
  consensusOptions: { consensus_type: "voting" | "discussion"; participants: string[] },
  oversightOptions: { oversight_type: "review" | "approval" }
): Promise<CollaborativeDecision> {
  try {
    // Step 1: Make an autonomous decision
    const autonomousDecision = await makeAutonomousDecision(task, decisionData);
    
    // Step 2: Simulate Multi-agent Consensus
    // Example: If more than half of agents agree, consensus is reached
    const randomFactor = Math.random();
    const consensus_outcome = randomFactor > 0.4 ? "agreement_reached" : "no_agreement";

    // Step 3: Simulate Human Oversight
    const oversight_duration = (consensus_outcome === "agreement_reached") ? "quick" : "detailed";
    const oversight_feedback = consensus_outcome === "agreement_reached" ? "approved" : "needs_revision";

    // Merge and return the final collaborative decision details
    return {
      ...autonomousDecision,
      consensus_type: consensusOptions.consensus_type,
      participants: consensusOptions.participants,
      consensus_outcome,
      oversight_type: oversightOptions.oversight_type,
      oversight_feedback,
      oversight_duration,
    };
  } catch (error) {
    console.error("Error in making collaborative decision:", error);
    throw new Error("Collaborative decision processing failed.");
  }
}

// Helper function to handle denied or no-consensus decisions
async function handleDecisionFailure(
  agentName: string,
  task: AgentTask,
  decision: AutonomousDecision | CollaborativeDecision
): Promise<ProcessResult> {
  const result = {
    success: false,
    message: `Task "${task.title}" was denied by the ${
      'consensus_outcome' in decision ? 'collaborative' : 'autonomous'
    } decision system. ${
      'consensus_outcome' in decision
        ? `Consensus: ${decision.consensus_outcome}, Oversight: ${decision.oversight_feedback}`
        : `Risk Level: ${decision.risk_assessment.risk_level}, Impact Level: ${decision.impact_analysis.impact_level}`
    }`,
  };

  await storeExperience(agentName, task, decision, "failure");
  return result;
}

// Helper function to process a task with a tool
async function processTaskWithTool(
  agentName: string,
  task: AgentTask,
  decision: AutonomousDecision | CollaborativeDecision,
  toolContext: ToolExecutionContext
): Promise<ProcessResult> {
  const result: ProcessResult = {
    success: toolContext.result?.success ?? false,
    message: `Task "${task.title}" processed with tool ${toolContext.tool.name}. ${toolContext.result?.message || ''}`,
    toolResult: toolContext.result,
    context: toolContext,
  };

  await storeExperience(agentName, task, decision, result.success ? "success" : "failure");
  return result;
}

// Helper function to process a task without a tool
async function processTaskWithoutTool(
  agentName: string,
  task: AgentTask,
  decision: AutonomousDecision | CollaborativeDecision
): Promise<ProcessResult> {
  // Simulate a 10% chance of failing the task
  if (Math.random() < 0.1) {
    const result = {
      success: false,
      message: `Agent ${agentName} encountered an error while processing "${task.title}".`,
    };
    await storeExperience(agentName, task, decision, "failure");
    return result;
  } else {
    const result = {
      success: true,
      message: `Agent ${agentName} has successfully completed "${task.title}".`,
    };
    await storeExperience(agentName, task, decision, "success");
    return result;
  }
}


export async function processAgentTask(
  agentName: string,
  task: AgentTask,
  decision?: AutonomousDecision | CollaborativeDecision,
  toolContext?: ToolExecutionContext
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        if (decision) {
          // Check for decision failure first
          if (
            decision.decision_outcome === "denied" ||
            ('consensus_outcome' in decision && decision.consensus_outcome === "no_agreement")
          ) {
            resolve(await handleDecisionFailure(agentName, task, decision));
            return;
          }

          // Delegate to appropriate processor
          if (toolContext && toolContext.tool) {
            resolve(await processTaskWithTool(agentName, task, decision, toolContext));
          } else {
            resolve(await processTaskWithoutTool(agentName, task, decision));
          }
        } else {
          // Fallback for tasks without a formal decision (legacy or simple tasks)
          // This part retains old logic for simple, non-decision-based tasks
          if (Math.random() < 0.1) {
             resolve({
              success: false,
              message: `Agent ${agentName} encountered an error while processing "${task.title}".`,
            });
          } else {
            resolve({
              success: true,
              message: `Agent ${agentName} has successfully completed "${task.title}".`,
            });
          }
        }
      } catch (error: unknown) {
        console.error("Error processing task:", error);
        resolve({
          success: false,
          message: `An unexpected error occurred while processing the task: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        });
      }
    }, 3000);
  });
}

// Helper functions for scoring
function getRiskScore(riskLevel: string): number {
  switch (riskLevel) {
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
    default:
      return 2;
  }
}

function getImpactScore(impactLevel: string): number {
  switch (impactLevel) {
    case "minor":
      return 1;
    case "moderate":
      return 2;
    case "significant":
      return 3;
    default:
      return 2;
  }
}

function getThresholdScore(threshold: string): number {
  switch (threshold) {
    case "low":
      return 2.5;
    case "medium":
      return 2;
    case "high":
      return 1.5;
    default:
      return 2;
  }
}
