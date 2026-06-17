'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Html } from '@react-three/drei';
import AgentAvatar from './AgentAvatar';
import ConnectionLine from './ConnectionLine';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useEffect, useState } from 'react';

export default function OfficeCanvas() {
  const { agents, connections, selectedAgent, setSelectedAgent } = useWorkspaceStore();
  const [hoveredAgent, setHoveredAgent] = useState(null);

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl overflow-hidden border border-indigo-500/20 shadow-2xl">
      <Canvas camera={{ position: [15, 15, 15], zoom: 1.2 }} shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} castShadow />
        <Grid infiniteGrid cellSize={1} cellThickness={0.5} sectionSize={3} sectionThickness={1} fadeDistance={30} />
        <Environment preset="city" />

        {/* Isometric desks */}
        {agents.map((agent) => (
          <group key={agent.id} position={[agent.position_x, 0, agent.position_z]}>
            <mesh receiveShadow position={[0, -0.2, 0]}>
              <boxGeometry args={[1.8, 0.2, 1.8]} />
              <meshStandardMaterial color="#2d2f42" metalness={0.7} roughness={0.2} />
            </mesh>
            <AgentAvatar
              agent={agent}
              onClick={() => setSelectedAgent(agent)}
              onPointerOver={() => setHoveredAgent(agent.id)}
              onPointerOut={() => setHoveredAgent(null)}
              isHovered={hoveredAgent === agent.id}
            />
            <Html position={[0, 1.2, 0]} center distanceFactor={8}>
              <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-mono whitespace-nowrap border border-indigo-500/40">
                {agent.name}
              </div>
            </Html>
          </group>
        ))}

        {connections.map((conn) => (
          <ConnectionLine key={conn.id} from={conn.from} to={conn.to} />
        ))}
        <OrbitControls enableZoom enablePan minDistance={5} maxDistance={30} />
      </Canvas>
    </div>
  );
}