// app/components/jetEngineScene.tsx
"use client";

import React, { useRef, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  ContactShadows,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SceneProps {
  pitch: number;
  roll: number;
  yaw: number;
  vibration: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

function lerpAngle(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── OBJ Engine ───────────────────────────────────────────────────────────────
function ObjEngine({ pitch, roll, yaw, vibration }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const obj = useLoader(OBJLoader, "/engine.obj");
  const normVib = Math.min(1, vibration / 5);

  // Apply neutral material to all meshes
  useEffect(() => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: "#8892aa",
          metalness: 0.85,
          roughness: 0.2,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [obj]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = 1 - Math.pow(1 - 0.12, delta * 60);
    groupRef.current.rotation.x = lerpAngle(groupRef.current.rotation.x, deg2rad(pitch), t);
    groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, deg2rad(yaw), t);
    groupRef.current.rotation.z = lerpAngle(groupRef.current.rotation.z, deg2rad(roll), t);

    const time = performance.now() * 0.001;
    const jitter = normVib * 0.04;
    groupRef.current.position.x = Math.sin(time * 17.3) * jitter;
    groupRef.current.position.y = Math.sin(time * 21.7) * jitter;
    groupRef.current.position.z = Math.sin(time * 13.1) * jitter * 0.5;
    groupRef.current.rotation.x += Math.sin(time * 19.1) * normVib * 0.02;
    groupRef.current.rotation.y += Math.sin(time * 23.3) * normVib * 0.02;
    groupRef.current.rotation.z += Math.sin(time * 15.7) * normVib * 0.015;
  });

  return (
    <group ref={groupRef}>
      <primitive object={obj} scale={1} />
    </group>
  );
}

// ─── Procedural Fallback Engine ───────────────────────────────────────────────
function FanBlade({ index, total, spinSpeed }: { index: number; total: number; spinSpeed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = (index / total) * Math.PI * 2;
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * spinSpeed;
  });
  return (
    <mesh
      ref={ref}
      position={[Math.cos(angle) * 0.55, Math.sin(angle) * 0.55, 0]}
      rotation={[0, 0, angle]}
    >
      <boxGeometry args={[0.08, 0.38, 0.04]} />
      <meshStandardMaterial color="#b0b8d0" metalness={0.9} roughness={0.2} />
    </mesh>
  );
}

function ProceduralEngine({ pitch, roll, yaw, vibration }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const normVib = Math.min(1, vibration / 5);
  const spinSpeed = 2 + normVib * 18;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = 1 - Math.pow(1 - 0.12, delta * 60);
    groupRef.current.rotation.x = lerpAngle(groupRef.current.rotation.x, deg2rad(pitch), t);
    groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, deg2rad(yaw), t);
    groupRef.current.rotation.z = lerpAngle(groupRef.current.rotation.z, deg2rad(roll), t);

    const time = performance.now() * 0.001;
    const jitter = normVib * 0.04;
    groupRef.current.position.x = Math.sin(time * 17.3) * jitter;
    groupRef.current.position.y = Math.sin(time * 21.7) * jitter;
    groupRef.current.position.z = Math.sin(time * 13.1) * jitter * 0.5;
    groupRef.current.rotation.x += Math.sin(time * 19.1) * normVib * 0.02;
    groupRef.current.rotation.y += Math.sin(time * 23.3) * normVib * 0.02;
    groupRef.current.rotation.z += Math.sin(time * 15.7) * normVib * 0.015;
  });

  const NUM_BLADES = 12;
  const NUM_STRUTS = 4;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.65, 0.72, 2.8, 32]} />
        <meshStandardMaterial color="#8892aa" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 2.82, 32]} />
        <meshStandardMaterial color="#1a2030" metalness={0.5} roughness={0.5} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 0, -1.4]}>
        <torusGeometry args={[0.7, 0.08, 16, 40]} />
        <meshStandardMaterial color="#c0c8e0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.35, 0.7, 24]} />
        <meshStandardMaterial color="#9ba4bc" metalness={0.7} roughness={0.3} />
      </mesh>
      <group position={[0, 0, -1.1]}>
        {Array.from({ length: NUM_BLADES }, (_, i) => (
          <FanBlade key={i} index={i} total={NUM_BLADES} spinSpeed={spinSpeed} />
        ))}
      </group>
      {Array.from({ length: NUM_STRUTS }, (_, i) => {
        const a = (i / NUM_STRUTS) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0.8]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.04, 0.28, 0.4]} />
            <meshStandardMaterial color="#7a8299" metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Wrapper: tries OBJ, falls back to procedural ─────────────────────────────
function EngineWithFallback(props: SceneProps) {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    fetch("/engine.obj", { method: "HEAD" })
      .then((r) => { if (!r.ok) setUseFallback(true); })
      .catch(() => setUseFallback(true));
  }, []);

  if (useFallback) return <ProceduralEngine {...props} />;

  return (
    <Suspense fallback={<ProceduralEngine {...props} />}>
      <ObjEngineErrorBoundary {...props} onError={() => setUseFallback(true)} />
    </Suspense>
  );
}

function ObjEngineErrorBoundary(props: SceneProps & { onError: () => void }) {
  try {
    return <ObjEngine {...props} />;
  } catch {
    props.onError();
    return <ProceduralEngine {...props} />;
  }
}

// ─── Lights ───────────────────────────────────────────────────────────────────
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
      <directionalLight position={[-4, -3, -3]} intensity={0.4} color="#b0c0ff" />
      <pointLight position={[0, 3, -3]} intensity={0.8} color="#4169E1" />
      <pointLight position={[0, -2, 3]} intensity={0.4} color="#ff8040" />
    </>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
interface JetEngineSceneProps {
  pitch: number;
  roll: number;
  yaw: number;
  vibration: number;
}

export default function JetEngineScene({ pitch, roll, yaw, vibration }: JetEngineSceneProps) {
  const normVib = Math.min(1, vibration / 5);

  const glowR = Math.round(65 + normVib * (239 - 65));
  const glowG = Math.round(105 - normVib * 105);
  const glowB = Math.round(225 - normVib * 157);
  const glowColor = `rgb(${glowR},${glowG},${glowB})`;
  const glowIntensity = 8 + normVib * 28;

  return (
    <div
      className="relative rounded-xl overflow-hidden border"
      style={{
        width: "420px",
        height: "340px",
        borderColor: "#4169E1",
        boxShadow: `0 0 ${glowIntensity}px ${glowIntensity / 2}px ${glowColor}44`,
      }}
    >
      {/* Axis legend */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-0.5 pointer-events-none">
        {[
          { axis: "X", label: "PITCH", color: "#EF4444" },
          { axis: "Y", label: "YAW",   color: "#22C55E" },
          { axis: "Z", label: "ROLL",  color: "#4169E1" },
        ].map(({ axis, label, color }) => (
          <div key={axis} className="flex items-center gap-1">
            <span
              className="text-[9px] font-bold px-1 rounded"
              style={{ backgroundColor: color, color: "#fff", minWidth: 14, textAlign: "center" }}
            >
              {axis}
            </span>
            <span className="text-[9px] font-semibold text-white opacity-80 drop-shadow">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Vibration readout */}
      <div
        className="absolute top-2 right-2 z-10 text-[10px] font-bold tabular-nums px-2 py-1 rounded-md"
        style={{
          backgroundColor: "rgba(255,255,255,0.85)",
          color: glowColor,
          border: `1px solid ${glowColor}`,
        }}
      >
        VIB {vibration.toFixed(2)}g
      </div>

      <Canvas
        camera={{ position: [0, 0.5, 4.5], fov: 40 }}
        shadows
        dpr={[1, 2]}
        style={{ background: "#0d1117" }}
      >
        <SceneLights />
        <Environment preset="city" />
        <ContactShadows position={[0, -1.6, 0]} opacity={0.4} scale={6} blur={2.5} far={3} />
        <EngineWithFallback pitch={pitch} roll={roll} yaw={yaw} vibration={vibration} />
        <OrbitControls
          autoRotate={vibration < 0.05}
          autoRotateSpeed={0.6}
          enablePan={false}
          minDistance={2.5}
          maxDistance={9}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
