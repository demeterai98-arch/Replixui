import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text3D } from '@react-three/drei';
import * as THREE from 'three';

export default function AgentAvatar({ agent, onClick, onPointerOver, onPointerOut, isHovered }) {
  const groupRef = useRef();
  const [floatSpeed, setFloatSpeed] = useState(1);

  useFrame(({ clock }) => {
    if (groupRef.current && isHovered) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 3) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group
        ref={groupRef}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        position={[0, 0.4, 0]}
      >
        {/* Body - stylized cylinder */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.8, 8]} />
          <meshStandardMaterial color="#818cf8" metalness={0.2} roughness={0.3} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        {/* Emoji face */}
        <Html position={[0, 0.7, 0.46]} center distanceFactor={10}>
          <div className="text-3xl filter drop-shadow-lg">{agent.avatar_emoji}</div>
        </Html>
        {/* Glow effect when hovered */}
        {isHovered && (
          <pointLight intensity={1.5} distance={2} color="#6366f1" />
        )}
      </group>
    </Float>
  );
}