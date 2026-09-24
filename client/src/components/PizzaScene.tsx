import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import type { Group, Mesh } from 'three';

export const scenePointer = { x: 0, y: 0 };

type PizzaSceneProps = {
  toppings?: string[];
  variant?: 'hero' | 'builder';
};

export function PizzaScene({ toppings = ['pepperoni', 'basil', 'mushroom'], variant = 'hero' }: PizzaSceneProps) {
  return (
    <Canvas
      className="pizza-canvas"
      dpr={[1, 1.6]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      camera={{ position: variant === 'hero' ? [0.2, 1.35, 5.5] : [0, 1.7, 4.6], fov: variant === 'hero' ? 30 : 34 }}
    >
      <ambientLight intensity={0.45} />
      <spotLight position={[4, 6, 3]} intensity={28} angle={0.45} penumbra={0.85} color="#fff1dc" />
      <pointLight position={[-3, 2, 2]} intensity={8} color="#e38b45" />
      <Pizza toppings={toppings} hero={variant === 'hero'} />
      {variant === 'hero' && <Floaters />}
      <ContactShadows position={[variant === 'hero' ? 1.15 : 0, -1.05, 0]} opacity={0.45} scale={8} blur={2.4} far={3} />
    </Canvas>
  );
}

function Pizza({ toppings, hero }: { toppings: string[]; hero: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    const group = ref.current;
    if (!group) return;
    const narrow = window.innerWidth < 720;
    const scroll = hero ? Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.4) : 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spin = reduce ? 0.15 : state.clock.elapsedTime * (hero ? 0.22 : 0.35);
    group.rotation.y = spin + scenePointer.x * 0.35 + scroll * 0.9;
    group.rotation.x = 0.42 + scenePointer.y * 0.08;
    group.position.x = hero && !narrow ? 0.95 : 0;
    group.position.y = (reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.7) * 0.04) - scroll * 0.25;
  });

  const show = new Set(toppings);
  const pepperoni = useMemo(() => scatter(10, 1.15, 0.4), []);
  const mushrooms = useMemo(() => scatter(6, 0.95, 1.3), []);
  const jalapenos = useMemo(() => scatter(7, 1.05, 2.1), []);
  const olives = useMemo(() => scatter(7, 0.85, 0.8), []);
  const chicken = useMemo(() => scatter(6, 1, 1.7), []);
  const beef = useMemo(() => scatter(6, 0.9, 2.4), []);
  const onions = useMemo(() => scatter(6, 1.1, 0.2), []);
  const peppers = useMemo(() => scatter(6, 1.2, 1.1), []);

  return (
    <group ref={ref}>
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.2, 18, 72]} />
        <meshStandardMaterial color="#c9843a" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[1.52, 1.52, 0.08, 64]} />
        <meshStandardMaterial color="#e7b56a" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[1.38, 1.38, 0.045, 64]} />
        <meshStandardMaterial color="#c4452d" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[1.34, 1.32, 0.07, 64]} />
        <meshStandardMaterial color="#f6d36b" roughness={0.38} metalness={0.05} />
      </mesh>
      {(show.has('cheese') || show.has('extra')) && (
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[1.46, 1.42, 0.06, 48]} />
          <meshStandardMaterial color="#ffe08a" roughness={0.28} metalness={0.08} />
        </mesh>
      )}
      {(show.has('pepperoni') || hero) && pepperoni.map((position, index) => (
        <mesh key={`pep-${index}`} position={[position[0], 0.175, position[2]]} rotation={[0, index, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.045, 20]} />
          <meshStandardMaterial color={index % 2 ? '#b42318' : '#d64535'} roughness={0.46} />
        </mesh>
      ))}
      {show.has('mushroom') || (hero && show.has('basil')) ? mushrooms.slice(0, hero ? 4 : 6).map((position, index) => (
        <group key={`mush-${index}`} position={[position[0], 0.19, position[2]]}>
          <mesh>
            <sphereGeometry args={[0.11, 16, 12]} />
            <meshStandardMaterial color="#efe6d4" roughness={0.6} />
          </mesh>
        </group>
      )) : null}
      {show.has('jalapenos') && jalapenos.map((position, index) => (
        <mesh key={`jal-${index}`} position={[position[0], 0.175, position[2]]} rotation={[1.2, index, 0.4]}>
          <torusGeometry args={[0.07, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#3e7a3a" roughness={0.45} />
        </mesh>
      ))}
      {show.has('olives') && olives.map((position, index) => (
        <mesh key={`ol-${index}`} position={[position[0], 0.175, position[2]]}>
          <torusGeometry args={[0.06, 0.028, 8, 16]} />
          <meshStandardMaterial color="#2c261f" roughness={0.4} />
        </mesh>
      ))}
      {show.has('chicken') && chicken.map((position, index) => (
        <mesh key={`ch-${index}`} position={[position[0], 0.19, position[2]]} rotation={[0.2, index, 0.4]}>
          <boxGeometry args={[0.22, 0.05, 0.12]} />
          <meshStandardMaterial color="#e2b48a" roughness={0.55} />
        </mesh>
      ))}
      {show.has('beef') && beef.map((position, index) => (
        <mesh key={`bf-${index}`} position={[position[0], 0.19, position[2]]} rotation={[0.1, index, 0]}>
          <boxGeometry args={[0.2, 0.045, 0.11]} />
          <meshStandardMaterial color="#8d4b32" roughness={0.5} />
        </mesh>
      ))}
      {show.has('onions') && onions.map((position, index) => (
        <mesh key={`on-${index}`} position={[position[0], 0.175, position[2]]}>
          <ringGeometry args={[0.05, 0.09, 16]} />
          <meshStandardMaterial color="#e7d7ea" roughness={0.4} side={2} />
        </mesh>
      ))}
      {show.has('peppers') && peppers.map((position, index) => (
        <mesh key={`pe-${index}`} position={[position[0], 0.18, position[2]]} rotation={[0, index, 0.6]}>
          <boxGeometry args={[0.16, 0.04, 0.1]} />
          <meshStandardMaterial color={index % 2 ? '#c4452d' : '#d7a423'} roughness={0.48} />
        </mesh>
      ))}
      {(hero || show.has('basil')) && scatter(5, 1.25, 2.8).map((position, index) => (
        <mesh key={`basil-${index}`} position={[position[0], 0.19, position[2]]} rotation={[0.4, index, 0.8]}>
          <sphereGeometry args={[0.07, 12, 8]} />
          <meshStandardMaterial color="#2f6a38" roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function Floaters() {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.12 + scenePointer.x * 0.2;
  });
  return (
    <group ref={ref}>
      <Float speed={1.6} floatIntensity={0.6} rotationIntensity={0.2}>
        <Disc position={[2.7, 0.7, 0.4]} color="#c4452d" args={[0.18, 0.18, 0.04]} />
      </Float>
      <Float speed={2} floatIntensity={0.8}>
        <Orb position={[2.2, 1.15, -0.4]} color="#f4efe6" scale={[0.16, 0.1, 0.12]} />
      </Float>
      <Float speed={1.4} floatIntensity={0.5}>
        <Orb position={[0.2, 1.3, 0.8]} color="#3e7a3a" scale={[0.16, 0.08, 0.1]} />
      </Float>
      <Float speed={1.8} floatIntensity={0.7}>
        <Orb position={[3.1, -0.15, 0.6]} color="#a3203a" scale={[0.14, 0.14, 0.14]} />
      </Float>
      <Float speed={1.5} floatIntensity={0.55}>
        <mesh position={[-0.4, 0.9, 1.1]} rotation={[0.6, 0.2, 0.4]}>
          <boxGeometry args={[0.34, 0.06, 0.16]} />
          <meshStandardMaterial color="#8a4b2f" roughness={0.48} />
        </mesh>
      </Float>
      <Float speed={2.1} floatIntensity={0.4}>
        <mesh position={[1.8, -0.55, 1]} rotation={[0.2, 0.5, 1]}>
          <boxGeometry args={[0.22, 0.05, 0.08]} />
          <meshStandardMaterial color="#d4542e" roughness={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

function Disc({ position, color, args }: { position: [number, number, number]; color: string; args: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  );
}

function Orb({ position, color, scale }: { position: [number, number, number]; color: string; scale: [number, number, number] }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 18, 14]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
}

function scatter(count: number, radius: number, seed: number) {
  return Array.from({ length: count }, (_, index) => {
    const angle = seed + index * 2.399;
    const dist = radius * (0.28 + ((index * 17) % 10) / 14);
    return [Math.cos(angle) * dist, 0, Math.sin(angle) * dist] as [number, number, number];
  });
}
