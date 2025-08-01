"use client";

import React, { useState } from "react";
import useWebSearch from "../hooks/useWebSearch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface WebSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WebSearchDialog({ open, onOpenChange }: WebSearchDialogProps) {
  const [query, setQuery] = useState("");
  const { results, loading, error, performSearch, clearResults } = useWebSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  const handleClose = () => {
    setQuery("");
    clearResults();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-lime-400">Web Search</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2 my-4">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for knowledge..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-lime-400"
          />
          <Button 
            type="submit"
            className="bg-lime-600 text-white hover:bg-lime-500"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {error && (
          <div className="text-red-400 mb-4 p-2 bg-red-400/10 rounded">
            {error}
          </div>
        )}

        <div className="overflow-y-auto flex-1 space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
            >
              <div className="flex gap-4">
                {result.imageUrl && (
                  <img
                    src={result.imageUrl}
                    alt=""
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lime-400 font-semibold hover:underline block"
                  >
                    {result.title}
                  </a>
                  <p className="text-gray-300 text-sm mt-1">{result.snippet}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>{result.source}</span>
                    <span>•</span>
                    <span>{new Date(result.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loading && results.length === 0 && query && (
            <div className="text-center text-gray-400 py-8">
              No results found for "{query}"
            </div>
          )}

          {loading && (
            <div className="text-center text-gray-400 py-8">
              Searching...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
