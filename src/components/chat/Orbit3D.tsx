'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, MeshWobbleMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField({ count = 500 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        p[i * 3] = (Math.random() - 0.5) * 50;
        p[i * 3 + 1] = (Math.random() - 0.5) * 50;
        p[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return p;
  }, [count]);

  return (
    <Points positions={points}>
      <PointMaterial transparent color="#fff" size={0.05} sizeAttenuation={true} depthWrite={false} />
    </Points>
  );
}

function CentralPlanet({ lowPower = false }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.2;
    meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        {lowPower ? (
          <meshStandardMaterial color="#4ade80" wireframe />
        ) : (
          <MeshDistortMaterial
            color="#4ade80"
            speed={2}
            distort={0.4}
            radius={1}
          />
        )}
      </Sphere>
    </Float>
  );
}

interface OrbitingSatelliteProps {
  color: string;
  distance: number;
  speed: number;
  offset: number;
  size?: number;
}

function OrbitingSatellite({ color, distance, speed, offset, size = 0.2 }: OrbitingSatelliteProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * speed + offset;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[distance, 0, 0]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5} 
        />
      </mesh>
    </group>
  );
}

interface Orbit3DProps {
  lowPower?: boolean;
  className?: string;
}

export default function Orbit3D({ lowPower = false, className = '' }: Orbit3DProps) {
  return (
    <div className={`w-full h-full min-h-[400px] relative ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4ade80" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} />
        
        <CentralPlanet lowPower={lowPower} />
        
        {!lowPower && <StarField count={800} />}
        
        <OrbitingSatellite color="#3b82f6" distance={2.5} speed={0.5} offset={0} />
        <OrbitingSatellite color="#f0abfc" distance={3.8} speed={0.3} offset={Math.PI} />
        <OrbitingSatellite color="#fbbf24" distance={5} speed={0.2} offset={Math.PI / 2} size={0.15} />

        <fog attach="fog" args={['#0f172a', 5, 15]} />
      </Canvas>
    </div>
  );
}
