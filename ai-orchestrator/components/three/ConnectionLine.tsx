import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export default function ConnectionLine({ from, to }) {
  const points = useMemo(() => {
    return [new THREE.Vector3(from.x, 0.4, from.z), new THREE.Vector3(to.x, 0.4, to.z)];
  }, [from, to]);

  return (
    <Line
      points={points}
      color="#22d3ee"
      lineWidth={2}
      dashed={false}
      transparent
      opacity={0.8}
      toneMapped={false}
    />
  );
}