"use client";

import React from "react";
import { Home, Users, FileText, Calendar } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-20 bg-gray-800 flex flex-col items-center py-6 space-y-6">
      <div className="text-3xl font-bold text-lime-400">AI</div>
      <nav className="flex flex-col space-y-8">
        <button className="text-gray-300 hover:text-lime-400 p-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Home size={24} />
        </button>
        <button className="text-gray-300 hover:text-lime-400 p-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Users size={24} />
        </button>
        <button className="text-gray-300 hover:text-lime-400 p-2 rounded-lg hover:bg-gray-700 transition-colors">
          <FileText size={24} />
        </button>
        <button className="text-gray-300 hover:text-lime-400 p-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Calendar size={24} />
        </button>
      </nav>
      <div className="mt-auto text-gray-400 text-xs">© 2024</div>
    </aside>
  );
}
