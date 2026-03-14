/**
 * orbitalScene.components.jsx — Three.js sub-components for OrbitalScene
 * Contains: config constants, CentralSphere, GlowRing, SkillPlanet, OrbitalRing, Scene
 */

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ============================================
   Config
   ============================================ */
export const THEME_HEX = {
  miles:  '#FF1744',
  gwen:   '#E040FB',
  glitch: '#00FF88',
};

export const RADII  = [2.4, 3.9, 5.4, 6.9, 8.4];
export const SPEEDS = [0.0042, -0.003, 0.0026, -0.002, 0.0016];
export const TILTS  = [
  [ 0.28, 0,  0.10],
  [-0.38, 0, -0.18],
  [ 0.45, 0,  0.28],
  [-0.22, 0, -0.10],
  [ 0.18, 0,  0.38],
];

export const hex = (theme) => THEME_HEX[theme] ?? '#FF1744';

/* ============================================
   Central Sphere
   ============================================ */
export function CentralSphere({ theme }) {
  const ref  = useRef();
  const col  = useMemo(() => new THREE.Color(hex(theme)), [theme]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y  += 0.006;
    ref.current.rotation.x   = Math.sin(t * 0.3) * 0.12;
    ref.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.04);
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshStandardMaterial
          color={col} emissive={col} emissiveIntensity={0.55}
          roughness={0.15} metalness={0.9}
        />
      </mesh>
      <GlowRing theme={theme} radius={0.96} />
    </group>
  );
}

export function GlowRing({ theme, radius }) {
  const ref = useRef();
  const col = useMemo(() => new THREE.Color(hex(theme)), [theme]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z += 0.009;
    ref.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2) * 0.04);
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.018, 8, 64]} />
      <meshStandardMaterial
        color={col} emissive={col} emissiveIntensity={1.2}
        transparent opacity={0.65}
      />
    </mesh>
  );
}

/* ============================================
   Skill Planet
   ============================================ */
export function SkillPlanet({ skill, angle, radius, theme, onHover, onLeave, isHovered }) {
  const ref = useRef();
  const col = useMemo(() => new THREE.Color(hex(theme)), [theme]);
  const bx  = Math.cos(angle) * radius;
  const bz  = Math.sin(angle) * radius;
  const sz  = 0.1 + (skill.level / 100) * 0.11;

  useFrame(() => {
    if (!ref.current) return;
    const { x, y, z } = ref.current.position;
    const s = ref.current.scale.x;
    if (isHovered) {
      ref.current.position.set(
        x + (bx * 1.4 - x) * 0.12,
        y + (0.2  - y) * 0.12,
        z + (bz * 1.4 - z) * 0.12,
      );
      ref.current.scale.setScalar(s + (2.2 - s) * 0.1);
    } else {
      ref.current.position.set(
        x + (bx - x) * 0.12,
        y + (0   - y) * 0.12,
        z + (bz  - z) * 0.12,
      );
      ref.current.scale.setScalar(s + (1.0 - s) * 0.1);
    }
  });

  return (
    <mesh
      ref={ref}
      position={[bx, 0, bz]}
      onPointerOver={(e) => { e.stopPropagation(); onHover(skill); }}
      onPointerOut={(e)  => { e.stopPropagation(); onLeave();      }}
    >
      <sphereGeometry args={[sz, 20, 20]} />
      <meshStandardMaterial
        color={col} emissive={col}
        emissiveIntensity={isHovered ? 1.1 : 0.35}
        roughness={0.25} metalness={0.75}
      />
      {isHovered && (
        <Html center distanceFactor={12} zIndexRange={[200, 100]} style={{ pointerEvents: 'none' }}>
          <div className="orbit-tooltip" style={{ '--th': hex(theme) }}>
            <div className="orbit-tooltip-top">
              <span className="orbit-tooltip-icon">{skill.icon}</span>
              <span className="orbit-tooltip-name">{skill.name}</span>
            </div>
            <div className="orbit-tooltip-track">
              <div className="orbit-tooltip-fill" style={{ width: `${skill.level}%` }} />
            </div>
            <span className="orbit-tooltip-pct">{skill.level}%</span>
          </div>
        </Html>
      )}
    </mesh>
  );
}

/* ============================================
   Orbital Ring
   ============================================ */
export function OrbitalRing({
  category, skills, radius, speed, tilt,
  theme, isVisible, isHighlighted,
  onPlanetHover, onPlanetLeave, hoveredSkill, onCategoryClick,
}) {
  const rotRef  = useRef();
  const col     = useMemo(() => new THREE.Color(hex(theme)), [theme]);
  const anyHov  = hoveredSkill !== null;

  useFrame(() => {
    if (!rotRef.current || !isVisible) return;
    rotRef.current.rotation.y += speed * (anyHov ? 0.15 : 1);
  });

  const angles = useMemo(
    () => skills.map((_, i) => (i / skills.length) * Math.PI * 2),
    [skills],
  );

  return (
    <group rotation={tilt} visible={isVisible}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.008, 8, 128]} />
        <meshStandardMaterial
          color={col} emissive={col}
          emissiveIntensity={isHighlighted ? 0.9 : 0.18}
          transparent opacity={isHighlighted ? 1.0 : 0.38}
        />
      </mesh>

      <Html
        position={[radius + 0.55, 0, 0]}
        center distanceFactor={14}
        zIndexRange={[60, 0]}
      >
        <button
          className={`orbit-ring-label ${isHighlighted ? 'orbit-ring-label--on' : ''}`}
          style={{ '--th': hex(theme) }}
          onClick={() => onCategoryClick(category)}
        >
          {category}
        </button>
      </Html>

      <group ref={rotRef}>
        {skills.map((skill, i) => (
          <SkillPlanet
            key={skill.id ?? `${skill.name}-${i}`}
            skill={skill}
            angle={angles[i]}
            radius={radius}
            theme={theme}
            onHover={onPlanetHover}
            onLeave={onPlanetLeave}
            isHovered={
              hoveredSkill !== null &&
              hoveredSkill.id === skill.id &&
              hoveredSkill.name === skill.name
            }
          />
        ))}
      </group>
    </group>
  );
}

/* ============================================
   Scene (inside Canvas)
   ============================================ */
export function Scene({ categories, theme, selectedCategory, setSelectedCategory, hoveredSkill, setHoveredSkill }) {
  const groupRef = useRef();
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotRef   = useRef({ x: 0, y: 0 });
  const { camera, gl } = useThree();
  const lightCol = useMemo(() => new THREE.Color(hex(theme)), [theme]);

  useEffect(() => {
    const onMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(8, Math.min(24, camera.position.z + e.deltaY * 0.012));
    };
    gl.domElement.addEventListener('wheel', onWheel, { passive: false });
    return () => gl.domElement.removeEventListener('wheel', onWheel);
  }, [camera, gl]);

  useFrame(() => {
    if (!groupRef.current) return;
    rotRef.current.x += (mouseRef.current.y *  0.22 - rotRef.current.x) * 0.04;
    rotRef.current.y += (mouseRef.current.x *  0.28 - rotRef.current.y) * 0.04;
    groupRef.current.rotation.x = rotRef.current.x;
    groupRef.current.rotation.y = rotRef.current.y;
  });

  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight position={[0, 0, 0]}    intensity={2.5}  color={lightCol} distance={22} decay={2} />
      <pointLight position={[12, 8, 6]}   intensity={0.45} color="#ffffff" />
      <pointLight position={[-8, -6, -4]} intensity={0.18} color="#5500ff" />

      <Stars radius={55} depth={35} count={1200} factor={2.2} saturation={0.05} fade speed={0.4} />

      <group ref={groupRef}>
        <CentralSphere theme={theme} />

        {categories.map(([cat, catSkills], i) => {
          const r = RADII[i]  ?? (RADII.at(-1)  + (i - RADII.length  + 1) * 1.5);
          const s = SPEEDS[i] ?? SPEEDS.at(-1);
          const t = TILTS[i]  ?? [0, 0, 0];

          return (
            <OrbitalRing
              key={cat}
              category={cat}
              skills={catSkills}
              radius={r}
              speed={s}
              tilt={t}
              theme={theme}
              isVisible={selectedCategory === null || selectedCategory === cat}
              isHighlighted={selectedCategory === cat}
              onPlanetHover={setHoveredSkill}
              onPlanetLeave={() => setHoveredSkill(null)}
              hoveredSkill={hoveredSkill}
              onCategoryClick={(c) => setSelectedCategory(prev => prev === c ? null : c)}
            />
          );
        })}
      </group>
    </>
  );
}
