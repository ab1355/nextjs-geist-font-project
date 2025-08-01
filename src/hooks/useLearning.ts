import { useState, useCallback } from 'react';
import { getLearningInsights, getBehaviorProfile, getExperienceStats } from '../lib/learningEngine';
import type { BehaviorProfile } from '../lib/learningEngine';

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
      const behaviorProfile = getBehaviorProfile(name);
      const experienceStats = getExperienceStats(name);
      
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
      const data = await getLearningInsights(topic);
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

  // Fetch agent data when agentName changes
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
