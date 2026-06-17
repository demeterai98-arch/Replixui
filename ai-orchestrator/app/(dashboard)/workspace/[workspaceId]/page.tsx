'use client';

import { useState } from 'react';
import OfficeCanvas from '@/components/three/OfficeCanvas';
import AgentSettingsDrawer from '@/components/drawers/AgentSettingsDrawer';
import { Button } from '@/components/ui/button';
import { Plus, Key, Coins, Clock } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { createAgent, generateTeamToken } from '@/lib/api';

export default function WorkspacePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { agents, fetchAgents, addConnection, selectedAgent } = useWorkspaceStore();

  const handleHireAgent = async () => {
    const newAgent = await createAgent({
      name: 'New Recruit',
      avatar_emoji: '🧑‍💻',
      provider: 'openai',
      model: 'gpt-4o',
      system_prompt: 'You are a helpful assistant',
      position_x: Math.random() * 6 - 3,
      position_z: Math.random() * 6 - 3,
    });
    fetchAgents();
  };

  const handleGetTeamKey = async () => {
    const token = await generateTeamToken();
    navigator.clipboard.writeText(token);
    alert('API key copied: ' + token);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
            AI Office
          </h1>
          <span className="text-xs bg-indigo-500/20 px-2 py-1 rounded-full">Isometric Workspace</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGetTeamKey}>
            <Key className="w-4 h-4 mr-2" /> Get Team API Key
          </Button>
          <Button variant="default" onClick={handleHireAgent}>
            <Plus className="w-4 h-4 mr-2" /> Hire Agent
          </Button>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="flex-1 relative">
        <OfficeCanvas />
      </div>

      {/* Drawer for editing agent */}
      <AgentSettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} agent={selectedAgent} />
    </div>
  );
}