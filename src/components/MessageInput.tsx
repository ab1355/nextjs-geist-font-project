"use client";

import React, { useState, useRef } from "react";
import { Paperclip, X } from "lucide-react";

interface MessageInputProps {
  onSend: (text: string, file?: File) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim() === "" && !file) return;
    onSend(text.trim(), file || undefined);
    setText("");
    setFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mt-4">
      <div className="flex space-x-2">
        <textarea
          className="flex-1 resize-none rounded-md bg-gray-700 text-white p-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.txt,.md,.js,.ts,.py,.html,.css,.json"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 rounded-md flex items-center justify-center"
        >
          <Paperclip size={20} />
        </button>
        <button
          onClick={handleSend}
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 rounded-md"
        >
          Send
        </button>
      </div>
      {file && (
        <div className="mt-2 flex items-center justify-between bg-gray-700 p-2 rounded-md">
          <span className="text-sm text-gray-300">{file.name}</span>
          <button onClick={handleRemoveFile} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
