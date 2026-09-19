"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * The hero's galaxy scene.
 *
 * Three cooperating layers:
 *   1. Starfield — three parallax shells of GPU-twinkled points.
 *   2. Nebula   — soft fbm-noise planes in the brand's blue/cyan/violet triad.
 *   3. Dust     — a sparse, slow layer of larger particles for depth.
 *
 * Everything is additive-blended and depth-write-free, so the layers stack as
 * light rather than occluding each other. All motion is driven from a single
 * `useFrame` in `SceneRoot` pushing a shared clock uniform — one timer for the
 * whole scene rather than one per layer.
 */

/* --------------------------------------------------------------------------
   Deterministic RNG — keeps the field identical across reloads, so the hero
   doesn't reshuffle itself on every navigation.
   -------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* --------------------------------------------------------------------------
   Starfield
   -------------------------------------------------------------------------- */

const STAR_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uDrift;

  attribute float aScale;
  attribute float aPhase;

  varying float vTwinkle;

  void main() {
    vec3 pos = position;

    // Slow independent drift so the field feels alive without a visible loop.
    pos.x += cos(uTime * 0.08 + aPhase * 6.283) * uDrift;
    pos.y += sin(uTime * 0.11 + aPhase * 6.283) * uDrift;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Per-star twinkle, desynchronised by phase.
    vTwinkle = 0.45 + 0.55 * (0.5 + 0.5 * sin(uTime * 1.6 + aPhase * 12.566));

    // Perspective size attenuation; clamped so near stars don't blow out.
    gl_PointSize = clamp(uSize * aScale * uPixelRatio * (12.0 / -mvPosition.z), 0.5, 56.0);
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying float vTwinkle;

  void main() {
    // Round, soft-edged point with a hot core.
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);

    float core = smoothstep(0.5, 0.0, dist);
    core = pow(core, 2.4);

    vec3 color = mix(uColorA, uColorB, vTwinkle);
    gl_FragColor = vec4(color, core * vTwinkle);
  }
`;

type StarfieldProps = {
  count: number;
  /** Radius of the spherical shell the stars are scattered through. */
  radius: number;
  size: number;
  colorA: string;
  colorB: string;
  /** Parallax drift amplitude. */
  drift?: number;
  /** Scales the whole shell, which reads as distance. */
  scale?: number;
  seed: number;
};

function Starfield({
  count,
  radius,
  size,
  colorA,
  colorB,
  drift = 0.35,
  scale = 1,
  seed,
}: StarfieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const random = mulberry32(seed);
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Uniform distribution on a sphere shell, then pushed out to a random
      // depth so the field has volume rather than reading as a hollow ball.
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const r = radius * (0.55 + 0.45 * random());

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // A few large stars carry the composition; most stay small.
      scales[i] = Math.pow(random(), 3) * 2.4 + 0.35;
      phases[i] = random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    return geo;
  }, [count, radius, seed]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: {
        value: typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio, 1.8),
      },
      uDrift: { value: drift },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
    }),
    [size, drift, colorA, colorB],
  );

  // Expose the shared clock to the shader without re-creating the material.
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <points geometry={geometry} scale={scale} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={STAR_VERTEX}
        fragmentShader={STAR_FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* --------------------------------------------------------------------------
   Nebula
   -------------------------------------------------------------------------- */

const NEBULA_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NEBULA_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Fractal noise — four octaves is the point where more stops being visible.
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 centred = vUv - 0.5;
    float dist = length(centred);

    // Radial falloff keeps the plane edge invisible.
    float mask = smoothstep(0.5, 0.02, dist);

    // Two drifting noise fields multiplied — gives cloud structure that
    // changes shape over time rather than just sliding.
    float cloud = fbm(vUv * 3.0 + vec2(uTime * 0.02, uTime * 0.014));
    float detail = fbm(vUv * 6.5 - vec2(uTime * 0.017, 0.0));

    float alpha = mask * cloud * detail * uOpacity * 2.2;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

type NebulaProps = {
  color: string;
  opacity: number;
  position: [number, number, number];
  scale: number;
  rotationSpeed?: number;
};

function Nebula({ color, opacity, position, scale, rotationSpeed = 0.01 }: NebulaProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    [color, opacity],
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (materialRef.current) materialRef.current.uniforms.uTime.value = time;
    if (meshRef.current) meshRef.current.rotation.z = time * rotationSpeed;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={NEBULA_VERTEX}
        fragmentShader={NEBULA_FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* --------------------------------------------------------------------------
   Scene root — parallax + camera drift
   -------------------------------------------------------------------------- */

function SceneRoot({
  quality,
  animate,
}: {
  quality: "high" | "low";
  animate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, pointer } = useThree();

  const counts = quality === "high"
    ? { near: 2600, mid: 3400, dust: 320 }
    : { near: 1100, mid: 1500, dust: 140 };

  useFrame(({ clock }, delta) => {
    if (!animate) return;

    const time = clock.elapsedTime;

    // Pointer parallax — damped so it trails the cursor rather than snapping.
    // `delta` normalisation keeps the feel identical at 60 and 144 Hz.
    const damp = 1 - Math.pow(0.001, delta);

    if (groupRef.current) {
      groupRef.current.rotation.y += (pointer.x * 0.22 - groupRef.current.rotation.y) * damp;
      groupRef.current.rotation.x += (-pointer.y * 0.16 - groupRef.current.rotation.x) * damp;
    }

    // Idle camera drift — the scene is never completely static.
    camera.position.x = Math.sin(time * 0.13) * 0.32;
    camera.position.y = Math.cos(time * 0.1) * 0.2;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      {/* Back shell — small, dim, distant */}
      <Starfield
        count={counts.mid}
        radius={26}
        size={1.5}
        colorA="#94a3b8"
        colorB="#60a5fa"
        drift={0.2}
        seed={1337}
      />

      {/* Mid shell — the main body of the field */}
      <Starfield
        count={counts.near}
        radius={14}
        size={2.4}
        colorA="#e2e8f0"
        colorB="#22d3ee"
        drift={0.4}
        seed={4242}
      />

      {/* Dust — sparse, large, slow. Reads as depth. */}
      <Starfield
        count={counts.dust}
        radius={9}
        size={5.5}
        colorA="#8b5cf6"
        colorB="#cbd5e1"
        drift={0.7}
        seed={9001}
      />

      {/* Nebula triad, positioned around the edges so the centre stays clear
          for the headline. */}
      <Nebula color="#60a5fa" opacity={0.16} position={[-5.5, 2.2, -8]} scale={22} />
      <Nebula color="#8b5cf6" opacity={0.14} position={[6, -2.4, -10]} scale={26} rotationSpeed={-0.008} />
      <Nebula color="#22d3ee" opacity={0.1} position={[1.5, 4.2, -13]} scale={30} rotationSpeed={0.006} />
    </group>
  );
}

/* --------------------------------------------------------------------------
   Public component
   -------------------------------------------------------------------------- */

export type GalaxyCanvasProps = {
  /** "low" on small screens — roughly a third of the particle budget. */
  quality?: "high" | "low";
  /** Whether the scene animates. False renders a single static frame. */
  animate?: boolean;
  /**
   * R3F render loop mode. The hero drives this:
   *   "always" — on screen and motion is welcome
   *   "demand" — render one frame only (prefers-reduced-motion)
   *   "never"  — off screen; costs nothing
   */
  frameloop?: "always" | "demand" | "never";
  className?: string;
};

export function GalaxyCanvas({
  quality = "high",
  animate = true,
  frameloop = "always",
  className,
}: GalaxyCanvasProps) {
  return (
    <Canvas
      className={className}
      // Capped DPR: beyond ~1.8 the extra pixels cost far more than they show.
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 7], fov: 62, near: 0.1, far: 120 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        // The scene is additive light over a CSS gradient — no need to clear.
        stencil: false,
        depth: true,
      }}
      frameloop={frameloop}
      style={{ pointerEvents: "none" }}
    >
      <SceneRoot quality={quality} animate={animate} />
    </Canvas>
  );
}
