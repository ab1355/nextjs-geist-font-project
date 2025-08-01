import { useState } from "react";

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  imageUrl?: string;
  source: string;
  timestamp: number;
}

export default function useWebSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate a web search API call
      // In production, this would be replaced with a real API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulated search results
      const simulatedResults: SearchResult[] = [
        {
          id: "1",
          title: "Understanding Continuous Learning in AI Systems",
          snippet: "Explore how modern AI systems implement continuous learning through experience and adaptation. Learn about the latest techniques in behavioral adjustment and knowledge acquisition.",
          url: "https://example.com/continuous-learning",
          imageUrl: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=300",
          source: "AI Research Journal",
          timestamp: Date.now() - 86400000, // 1 day ago
        },
        {
          id: "2",
          title: "Vector Databases in Modern AI Applications",
          snippet: "Deep dive into how vector databases are revolutionizing knowledge storage and retrieval in AI systems. Learn about similarity search and efficient knowledge representation.",
          url: "https://example.com/vector-databases",
          imageUrl: "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=300",
          source: "Tech Insights",
          timestamp: Date.now() - 172800000, // 2 days ago
        },
        {
          id: "3",
          title: "Implementing Behavioral Adjustment in AI Agents",
          snippet: "A comprehensive guide to implementing dynamic behavior adjustment in AI agents. Learn about feedback loops, learning rates, and adaptation strategies.",
          url: "https://example.com/behavior-adjustment",
          imageUrl: "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=300",
          source: "AI Engineering Blog",
          timestamp: Date.now() - 259200000, // 3 days ago
        },
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.snippet.toLowerCase().includes(query.toLowerCase())
      );

      setResults(simulatedResults);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to perform search. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    performSearch,
    clearResults,
  };
}
