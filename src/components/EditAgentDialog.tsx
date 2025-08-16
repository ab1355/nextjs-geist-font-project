import React, { useState } from "react";
import { Agent } from "./AgentPanel";

interface EditAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent;
  onSave: (agent: Agent) => void;
}

export default function EditAgentDialog({ open, onOpenChange, agent, onSave }: EditAgentDialogProps) {
  const [editedAgent, setEditedAgent] = useState<Agent>(agent);

  const handleSave = () => {
    onSave(editedAgent);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[500px] p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Agent</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={editedAgent.name}
              onChange={(e) => setEditedAgent({ ...editedAgent, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
            <input
              type="text"
              value={editedAgent.avatar}
              onChange={(e) => setEditedAgent({ ...editedAgent, avatar: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
