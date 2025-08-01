"use client";

import React, { useState } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() === "") return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-4 flex space-x-2">
      <textarea
        className="flex-1 resize-none rounded-md bg-gray-700 text-white p-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
      />
      <button
        onClick={handleSend}
        className="bg-lime-600 hover:bg-lime-700 text-white px-4 rounded-md"
      >
        Send
      </button>
    </div>
  );
}
