"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowRight, Play, Terminal } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Float, Sparkles, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

// --- 3D: High-End Interactive Object ---
function InteractiveCore() {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (innerRef.current) {
      innerRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
      innerRef.current.rotation.y += 0.003;
    }
    if (outerRef.current) {
      outerRef.current.rotation.x = Math.cos(t * 0.2) * 0.2;
      outerRef.current.rotation.y -= 0.002;
    }
  });

  return (
    <>
      {/* 
        OrbitControls is bulletproof. 
        enablePan={false} and enableZoom={false} ensures the user can ONLY spin it.
      */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        enableDamping={true} 
        dampingFactor={0.05} 
        autoRotate={true}
        autoRotateSpeed={0.5}
      />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group scale={1.3}>
          {/* Main Glass/Metal Core - A more sophisticated abstract shape */}
          <mesh ref={innerRef} castShadow receiveShadow>
            <icosahedronGeometry args={[1.5, 4]} />
            <MeshTransmissionMaterial
              backside={true}
              samples={4}
              thickness={2}
              chromaticAberration={0.05}
              anisotropy={0.3}
              distortion={0.15}
              distortionScale={0.3}
              temporalDistortion={0.05}
              clearcoat={1}
              clearcoatRoughness={0.1}
              roughness={0.05}
              metalness={0.4}
              transmission={1}
              ior={1.4}
              color="#6236F4"
            />
          </mesh>

          {/* Outer technical wireframe ring */}
          <mesh ref={outerRef} scale={1.1}>
            <torusGeometry args={[1.8, 0.02, 32, 100]} />
            <meshBasicMaterial color="#E7E6D9" transparent opacity={0.2} />
          </mesh>
          <mesh scale={1.1} rotation={[Math.PI / 2, 0, 0]}>
             <torusGeometry args={[1.8, 0.01, 32, 100]} />
             <meshBasicMaterial color="#6236F4" transparent opacity={0.3} />
          </mesh>
        </group>

        {/* Floating particles around the core */}
        <Sparkles count={150} scale={7} size={1.2} speed={0.3} opacity={0.5} color="#6236F4" />
      </Float>
    </>
  );
}

// --- Main Hero Component ---
export default function Hero() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.1 });

    // Grid fade in
    tl.fromTo(".hero-grid", { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power2.inOut" })
    
    // 3D Canvas
    .fromTo(".hero-3d-canvas", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out" }, "-=1.0")
    
    // Top badge
    .fromTo(".hero-badge", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=1.0")
    
    // Central massive typography
    .fromTo(".hero-heading-line", { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power4.out",
    }, "-=0.8")
    
    // UI Elements (Bottom)
    .fromTo(".hero-ui", { opacity: 0, y: 20 }, { 
      opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out" 
    }, "-=0.5");

  }, { scope: container });

  return (
    <section ref={container} className="relative w-full h-[100svh] min-h-[600px] md:min-h-[700px] bg-background border-b border-border-strong overflow-hidden flex flex-col justify-between">
      
      {/* --- GRID BACKGROUND (Matches Features Section) --- */}
      <div className="hero-grid absolute inset-0 bg-[linear-gradient(rgba(231,230,217,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(231,230,217,0.025)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />

      {/* Subtle ambient glow in the center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/[0.08] rounded-full blur-[120px] pointer-events-none z-0" />

      {/* --- 3D CANVAS IN THE BACKGROUND --- */}
      <div className="hero-3d-canvas absolute inset-0 z-[1] cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={2} color="#6236F4" />
          <Environment preset="city" />
          
          <InteractiveCore />
        </Canvas>
      </div>

      {/* --- HTML TYPOGRAPHY (CRISP, FRONT AND CENTER) --- */}
      {/* We use pointer-events-none here so the mouse can grab the 3D object THROUGH the empty space */}
      <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center pointer-events-none">
        <h1 className="flex flex-col items-center mix-blend-difference mt-[-10vh] sm:mt-[-5vh] md:mt-0">
          <span className="hero-heading-line font-display font-black text-[13vw] sm:text-[12vw] md:text-[8vw] lg:text-[7vw] leading-[0.85] tracking-tighter uppercase text-foreground text-center">
            ARCHITECT
          </span>
          <span className="hero-heading-line font-display font-black text-[13vw] sm:text-[12vw] md:text-[8vw] lg:text-[7vw] leading-[0.85] tracking-tighter uppercase text-transparent [-webkit-text-stroke:1.5px_#E7E6D9] md:[-webkit-text-stroke:3px_#E7E6D9] text-center">
            THE SOUND
          </span>
        </h1>
      </div>


      {/* --- FOREGROUND UI PANELS --- */}
      <div className="relative z-[10] w-full h-full px-4 sm:px-10 md:px-16 lg:px-20 pt-24 sm:pt-28 pb-6 sm:pb-12 flex flex-col justify-between pointer-events-none">
        
        {/* Top: Status Badge */}
        <div className="flex justify-start">
          <div className="hero-badge pointer-events-auto inline-flex items-center gap-2 border border-border-strong bg-background/80 backdrop-blur-md px-3 py-1.5 shadow-[3px_3px_0_rgba(98,54,244,0.15)]">
            <Terminal className="w-3 h-3 text-accent" />
            <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-secondary uppercase">Neural Audio Engine V4</span>
          </div>
        </div>

        {/* Center: Empty to allow interaction with 3D object */}
        <div className="flex-1 pointer-events-none" />

        {/* Bottom: Clean Copy & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 mt-auto">
          
          {/* Left: Description + Buttons */}
          <div className="w-full md:max-w-md pointer-events-auto">
            <p className="hero-ui font-mono text-[11px] sm:text-sm text-secondary leading-relaxed mb-4 sm:mb-6 bg-background/50 backdrop-blur-sm p-3 sm:p-4 border-l-2 border-accent hidden sm:block">
              The generative AI webplayer. Grab and spin the core above to test latency. Describe any mood in natural language to compile a perfect soundtrack instantly.
            </p>
            <p className="hero-ui font-mono text-[11px] text-secondary leading-relaxed mb-4 bg-background/50 backdrop-blur-sm p-3 border-l-2 border-accent sm:hidden">
              Interact with the core to test latency. Describe any mood to compile a perfect soundtrack instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/signup"
                className="hero-ui group w-full sm:w-auto relative flex items-center justify-center gap-3 bg-foreground text-background px-6 py-3.5 sm:py-3.5 font-mono text-xs font-bold tracking-[0.1em] uppercase hover:-translate-y-0.5 hover:translate-x-0.5 transition-transform"
              >
                <div className="absolute inset-0 bg-accent translate-y-[4px] -translate-x-[4px] -z-10 group-hover:translate-y-[2px] group-hover:-translate-x-[2px] transition-transform" />
                <span>Initialize</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/webplayer"
                className="hero-ui group w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 font-mono text-xs tracking-[0.1em] uppercase border border-border-strong bg-background/80 backdrop-blur-md text-foreground hover:bg-surface transition-colors shadow-[2px_2px_0_rgba(231,230,217,0.05)]"
              >
                <Play className="w-3 h-3 fill-current text-accent" />
                <span>Open Player</span>
              </Link>
            </div>
          </div>

          {/* Right: Technical Stats - Hidden on Mobile */}
          <div className="hidden lg:flex flex-row gap-10 pointer-events-auto justify-end">
            {[
              { val: "200M+", label: "Tracks" },
              { val: "<8ms", label: "Latency" },
            ].map((s, i) => (
              <div key={i} className="hero-ui flex flex-col gap-1 text-right">
                <span className="text-3xl font-display font-black text-foreground">{s.val}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-secondary">{s.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
