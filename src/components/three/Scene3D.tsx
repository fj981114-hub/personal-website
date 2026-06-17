'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ─── Color palette ──────────────────────────────────────────────
const COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#06b6d4', // cyan
];

// ─── Single Character ───────────────────────────────────────────
interface CharacterProps {
  color: string;
  position: [number, number, number];
  rotationSpeed: number;
  floatSpeed: number;
  bodyScale: number;
}

function Character({ color, position, rotationSpeed, floatSpeed, bodyScale }: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const bounceTime = useRef(0);
  const clock = useRef({ time: 0 });

  // Distinct head color (lighter version of body)
  const headColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.offsetHSL(0, -0.1, 0.15);
    return c.getStyle();
  }, [color]);

  // Hover scale
  const targetScale = hovered ? 1.25 : 1;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const { current: mesh } = groupRef;

    clock.current.time += delta;

    // Auto-rotation
    mesh.rotation.y += delta * rotationSpeed;

    // Breathing / floating
    const breathe = Math.sin(clock.current.time * floatSpeed + position[1]) * 0.06;
    mesh.position.y = position[1] + breathe;

    // Hover scale with smooth interpolation
    const scale = THREE.MathUtils.lerp(mesh.scale.x, targetScale, delta * 5);
    mesh.scale.setScalar(scale);

    // Bounce animation on click
    if (clicked) {
      bounceTime.current += delta;
      const t = bounceTime.current;
      // Damped sine: bounce up then settle
      const bounceOffset = Math.sin(t * 15) * Math.exp(-t * 4) * 0.4;
      mesh.position.y += bounceOffset * bodyScale;
      if (t > 1.5) {
        setClicked(false);
        bounceTime.current = 0;
      }
    }

    // Slight tilt toward pointer when hovered
    if (hovered) {
      mesh.rotation.x = Math.sin(clock.current.time * 0.5) * 0.08;
      mesh.rotation.z = Math.cos(clock.current.time * 0.3) * 0.05;
    } else {
      mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, delta * 3);
      mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, 0, delta * 3);
    }
  });

  const handleClick = useCallback(() => {
    setClicked(true);
    bounceTime.current = 0;
  }, []);

  const handlePointerOver = useCallback(() => setHovered(true), []);
  const handlePointerOut = useCallback(() => setHovered(false), []);

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Body — sphere */}
      <mesh position={[0, bodyScale * 0.3, 0]} castShadow>
        <sphereGeometry args={[bodyScale * 0.6, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.3}
          metalness={0.2}
          distort={hovered ? 0.3 : 0.1}
          speed={2}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Head — cone */}
      <mesh position={[0, bodyScale * 1.1, 0]} castShadow>
        <coneGeometry args={[bodyScale * 0.4, bodyScale * 0.5, 24]} />
        <MeshDistortMaterial
          color={headColor}
          roughness={0.25}
          metalness={0.15}
          distort={hovered ? 0.2 : 0.05}
          speed={1.5}
          emissive={hovered ? headColor : '#000000'}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
      </mesh>

      {/* Eyes — tiny spheres on the cone */}
      <mesh position={[-0.15 * bodyScale, bodyScale * 1.18, bodyScale * 0.35]}>
        <sphereGeometry args={[bodyScale * 0.07, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.15 * bodyScale, bodyScale * 1.18, bodyScale * 0.35]}>
        <sphereGeometry args={[bodyScale * 0.07, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.15 * bodyScale, bodyScale * 1.16, bodyScale * 0.42]}>
        <sphereGeometry args={[bodyScale * 0.035, 8, 8]} />
        <meshBasicMaterial color={hovered ? '#facc15' : '#111111'} />
      </mesh>
      <mesh position={[0.15 * bodyScale, bodyScale * 1.16, bodyScale * 0.42]}>
        <sphereGeometry args={[bodyScale * 0.035, 8, 8]} />
        <meshBasicMaterial color={hovered ? '#facc15' : '#111111'} />
      </mesh>
    </group>
  );
}

// ─── Background gradient ────────────────────────────────────────
function GradientBackground() {
  const { scene } = useThree();
  useMemo(() => {
    // Create a gradient background using a canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(256, 200, 0, 256, 256, 400);
    gradient.addColorStop(0, '#1e1b4b');   // deep indigo center
    gradient.addColorStop(0.4, '#0f0f23');
    gradient.addColorStop(0.7, '#0a0a1a');
    gradient.addColorStop(1, '#050510');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    scene.background = texture;
  }, [scene]);

  // Subtle floating particles
  const particles = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return positions;
  }, []);

  // Build geometry with attribute in useMemo for R3F compatibility
  const pointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    return geo;
  }, [particles]);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef} geometry={pointsGeo}>
      <pointsMaterial
        size={0.04}
        color="#6366f1"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Scene lights ────────────────────────────────────────────────
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#818cf8" />
      <pointLight position={[0, 3, 5]} intensity={0.2} color="#a78bfa" />
    </>
  );
}

// ─── Main Scene ──────────────────────────────────────────────────
export default function Scene3D() {
  const characters = useMemo(
    () => [
      { color: COLORS[0], position: [-2.2, -0.3, 0] as [number, number, number], rotationSpeed: 0.4, floatSpeed: 2.1, bodyScale: 0.8 },
      { color: COLORS[1], position: [0, 0.2, 0.5] as [number, number, number], rotationSpeed: 0.6, floatSpeed: 2.5, bodyScale: 0.9 },
      { color: COLORS[2], position: [2.2, -0.1, -0.3] as [number, number, number], rotationSpeed: 0.35, floatSpeed: 1.8, bodyScale: 0.75 },
    ],
    []
  );

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5.5], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%' }}
    >
      <GradientBackground />
      <SceneLights />
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.15}>
        {characters.map((c, i) => (
          <Character key={i} {...c} />
        ))}
      </Float>
    </Canvas>
  );
}
