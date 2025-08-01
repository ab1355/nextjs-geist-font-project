import { useState, useCallback } from 'react';

// Types are now defined here as they are not imported from server-side code
export interface BehaviorProfile {
    agentName: string;
    successRate: number;
    riskTolerance: number;
    collaborationScore: number;
    lastUpdated: number;
}

interface ExperienceStats {
  totalTasks: number;
  successRate: number;
  averageRiskLevel: string;
}

interface LearningInsight {
  type: string;
  content: any;
  confidence: number;
  timestamp: number;
}

export default function useLearning(agentName?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<BehaviorProfile | null>(null);
  const [stats, setStats] = useState<ExperienceStats | null>(null);
  const [insights, setInsights] = useState<LearningInsight[]>([]);

  const fetchAgentData = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const profileResponse = await fetch(`/api/learning?action=profile&agentName=${name}`);
      const statsResponse = await fetch(`/api/learning?action=stats&agentName=${name}`);

      if (!profileResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to fetch agent data');
      }

      const behaviorProfile = await profileResponse.json();
      const experienceStats = await statsResponse.json();
      
      setProfile(behaviorProfile);
      setStats(experienceStats);
    } catch (error) {
      console.error("Error fetching agent data:", error);
      setError("Failed to fetch agent data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInsights = useCallback(async (topic: string) => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/learning?action=insights&topic=${encodeURIComponent(topic)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch learning insights');
      }
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error("Error fetching insights:", error);
      setError("Failed to fetch learning insights");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearInsights = useCallback(() => {
    setInsights([]);
    setError(null);
  }, []);

  const refreshAgentData = useCallback(() => {
    if (agentName) {
      fetchAgentData(agentName);
    } else {
      setProfile(null);
      setStats(null);
    }
  }, [agentName, fetchAgentData]);

  return {
    loading,
    error,
    profile,
    stats,
    insights,
    fetchInsights,
    clearInsights,
    refreshAgentData,
  };
}
