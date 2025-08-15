"use client";

import React from "react";
import { Home, Users, FileText, Calendar, Server, Briefcase } from "lucide-react";
import { agents, mcpServers } from "../components";

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
    <aside className="w-64 bg-gray-800 flex flex-col p-4">
      <div className="text-3xl font-bold text-lime-400 mb-8">AI</div>
      <nav className="flex flex-col space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => onTabChange(tab.name)}
            className={`flex items-center p-2 rounded-lg transition-colors ${
              activeTab === tab.name
                ? "text-lime-400 bg-gray-700"
                : "text-gray-300 hover:text-lime-400 hover:bg-gray-700"
            }`}
          >
            <tab.icon size={20} />
            <span className="ml-4 capitalize">{tab.name}</span>
          </button>
        ))}
      </nav>

      <div className="mt-8">
        <h3 className="text-gray-400 text-sm font-semibold mb-4 flex items-center">
          <Briefcase size={16} className="mr-2" />
          Team
        </h3>
        <div className="flex flex-col space-y-3">
          {agents.map((agent) => (
            <div key={agent.name} className="flex items-center">
              <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full object-cover" />
              <div className="ml-3">
                <p className="text-white font-semibold">{agent.name}</p>
                <p className={`text-sm ${agent.status === "Idle" ? "text-green-400" : "text-yellow-400"}`}>
                  {agent.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-gray-400 text-sm font-semibold mb-4 flex items-center">
          <Server size={16} className="mr-2" />
          MCP Servers
        </h3>
        <div className="flex flex-col space-y-3">
          {mcpServers.map((server) => (
            <div key={server.name} className="flex items-center justify-between">
              <p className="text-white">{server.name}</p>
              <div className={`w-3 h-3 rounded-full ${server.status === "Online" ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto text-gray-400 text-xs">© 2024</div>
    </aside>
  );
}
