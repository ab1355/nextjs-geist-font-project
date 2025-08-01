"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import AgentPanel from "../components/AgentPanel";
import MessageInput from "../components/MessageInput";

type Sender = "agent" | "human";

interface Message {
  id: number;
  sender: Sender;
  text: string;
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      sender: "agent", 
      text: "Welcome to the Hierarchical Agent Team! The CEO is ready to delegate tasks to our specialized team members." 
    },
  ]);

  const addMessage = (text: string, sender: Sender = "human") => {
    setMessages((prev) => [
      ...prev,
      { 
        id: prev.length + 1, 
        sender, 
        text 
      },
    ]);

    // If it's a human message, simulate a response about using the CEO delegation system
    if (sender === "human") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "agent",
            text: "Message received. You can use the CEO's delegation panel to assign tasks to our specialized team members.",
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <Sidebar />
      <main className="flex flex-col flex-1 p-4">
        <div className="flex flex-col mb-4">
          <h1 className="text-2xl font-bold text-lime-400">
            Hierarchical Agent Team
          </h1>
          <p className="text-gray-400">
            A team of specialized agents led by a CEO supervisor, working together to accomplish tasks efficiently.
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex-1 flex flex-col">
          <ChatWindow messages={messages} />
          <MessageInput onSend={addMessage} />
        </div>
      </main>
      <AgentPanel onAgentMessage={(text) => addMessage(text, "agent")} />
    </div>
  );
}
