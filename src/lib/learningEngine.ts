import { storeKnowledge, fetchKnowledge, KnowledgeEntry } from "./vectorDBClient";
import { AgentTask, AutonomousDecision, CollaborativeDecision } from "./agentLogic";

export interface LearningExperience {
  taskId: string;
  agentName: string;
  taskType: string;
  outcome: "success" | "failure";
  decisionDetails: AutonomousDecision | CollaborativeDecision;
  timestamp: number;
}

export interface BehaviorProfile {
  agentName: string;
  successRate: number;
  riskTolerance: number;
  collaborationScore: number;
  lastUpdated: number;
}

// In-memory storage for experiences and behavior profiles
const experiences: LearningExperience[] = [];
const behaviorProfiles: Map<string, BehaviorProfile> = new Map();

export async function storeExperience(
  agentName: string,
  task: AgentTask,
  decision: AutonomousDecision | CollaborativeDecision,
  outcome: "success" | "failure"
): Promise<void> {
  try {
    const experience: LearningExperience = {
      taskId: Math.random().toString(36).substring(7),
      agentName,
      taskType: task.title,
      outcome,
      decisionDetails: decision,
      timestamp: Date.now(),
    };

    experiences.push(experience);

    // Store in vector database for long-term learning
    await storeKnowledge(JSON.stringify({
      type: "experience",
      data: experience,
    }));

    // Update behavior profile
    await updateBehaviorProfile(agentName, experience);
  } catch (error) {
    console.error("Error storing experience:", error);
  }
}

export async function updateBehaviorProfile(
  agentName: string,
  experience: LearningExperience
): Promise<void> {
  try {
    const currentProfile = behaviorProfiles.get(agentName) || {
      agentName,
      successRate: 0,
      riskTolerance: 0.5,
      collaborationScore: 0.5,
      lastUpdated: 0,
    };

    // Get recent experiences for this agent
    const agentExperiences = experiences.filter(exp => exp.agentName === agentName);
    const totalExperiences = agentExperiences.length;

    if (totalExperiences > 0) {
      // Update success rate
      const successCount = agentExperiences.filter(exp => exp.outcome === "success").length;
      currentProfile.successRate = successCount / totalExperiences;

      // Update risk tolerance based on successful high-risk decisions
      const highRiskSuccesses = agentExperiences.filter(
        exp => exp.outcome === "success" && 
        exp.decisionDetails.risk_assessment.risk_level === "high"
      ).length;
      currentProfile.riskTolerance = Math.max(0.1, Math.min(0.9, highRiskSuccesses / totalExperiences));

      // Update collaboration score for agents that participate in collaborative decisions
      const collaborativeExperiences = agentExperiences.filter(
        exp => 'consensus_outcome' in exp.decisionDetails
      ).length;
      currentProfile.collaborationScore = collaborativeExperiences / totalExperiences;
    }

    currentProfile.lastUpdated = Date.now();
    behaviorProfiles.set(agentName, currentProfile);
  } catch (error) {
    console.error("Error updating behavior profile:", error);
  }
}

export async function adjustBehavior(
  agentName: string,
  currentParams: { threshold: number; riskTolerance: number }
): Promise<{ threshold: number; riskTolerance: number }> {
  try {
    const profile = behaviorProfiles.get(agentName);
    if (!profile) return currentParams;

    // Adjust threshold based on success rate and risk tolerance
    const newThreshold = Math.max(
      0.1,
      Math.min(
        0.9,
        currentParams.threshold * (1 + (profile.successRate - 0.5) * 0.2)
      )
    );

    // Adjust risk tolerance based on profile
    const newRiskTolerance = Math.max(
      0.1,
      Math.min(0.9, profile.riskTolerance)
    );

    return {
      threshold: newThreshold,
      riskTolerance: newRiskTolerance,
    };
  } catch (error) {
    console.error("Error adjusting behavior:", error);
    return currentParams;
  }
}

export async function getLearningInsights(query: string): Promise<any[]> {
  try {
    // Query vector database for relevant experiences and knowledge
    const knowledgeEntries = await fetchKnowledge(query);
    
    // Process and format insights
    return knowledgeEntries.map(entry => {
      try {
        const data = JSON.parse(entry.content);
        return {
          type: data.type,
          content: data.data,
          confidence: entry.metadata.confidence,
          timestamp: entry.metadata.timestamp,
        };
      } catch {
        return {
          type: "unknown",
          content: entry.content,
          confidence: entry.metadata.confidence,
          timestamp: entry.metadata.timestamp,
        };
      }
    });
  } catch (error) {
    console.error("Error getting learning insights:", error);
    return [];
  }
}

export function getBehaviorProfile(agentName: string): BehaviorProfile | null {
  return behaviorProfiles.get(agentName) || null;
}

export function getExperienceStats(agentName: string): {
  totalTasks: number;
  successRate: number;
  averageRiskLevel: string;
} {
  const agentExperiences = experiences.filter(exp => exp.agentName === agentName);
  const totalTasks = agentExperiences.length;
  
  if (totalTasks === 0) {
    return {
      totalTasks: 0,
      successRate: 0,
      averageRiskLevel: "low",
    };
  }

  const successCount = agentExperiences.filter(exp => exp.outcome === "success").length;
  const riskLevels = agentExperiences.map(exp => exp.decisionDetails.risk_assessment.risk_level);
  const riskScore = riskLevels.reduce((sum, level) => {
    return sum + (level === "high" ? 2 : level === "medium" ? 1 : 0);
  }, 0);

  return {
    totalTasks,
    successRate: successCount / totalTasks,
    averageRiskLevel: riskScore / totalTasks > 1.5 ? "high" : riskScore / totalTasks > 0.5 ? "medium" : "low",
  };
}
