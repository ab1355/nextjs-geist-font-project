"use client";

import React from "react";
import { Home, Users, FileText, Calendar } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { name: "home", icon: Home },
    { name: "agents", icon: Users },
    { name: "tasks", icon: FileText },
    { name: "schedule", icon: Calendar },
  ];

  return (
    <aside className="w-20 bg-gray-800 flex flex-col items-center py-6 space-y-6">
      <div className="text-3xl font-bold text-lime-400">AI</div>
      <nav className="flex flex-col space-y-8">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => onTabChange(tab.name)}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === tab.name
                ? "text-lime-400 bg-gray-700"
                : "text-gray-300 hover:text-lime-400 hover:bg-gray-700"
            }`}
          >
            <tab.icon size={24} />
          </button>
        ))}
      </nav>
      <div className="mt-auto text-gray-400 text-xs">© 2024</div>
    </aside>
  );
}
