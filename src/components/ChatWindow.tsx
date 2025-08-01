"use client";

import React from "react";

interface Message {
  id: number;
  sender: "agent" | "human";
  text: string;
}

interface ChatWindowProps {
  messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900 rounded-lg shadow-inner flex flex-col">
      {messages.map((msg: Message) => (
        <div
          key={msg.id}
          className={`max-w-xs px-4 py-2 rounded-lg ${
            msg.sender === "agent"
              ? "bg-lime-600 text-white self-start"
              : "bg-gray-700 text-gray-200 self-end"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
