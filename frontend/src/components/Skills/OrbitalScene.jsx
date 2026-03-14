/**
 * OrbitalScene.jsx — Skills orbital visualization (360° camera rotation)
 *
 * Sub-components split into:
 *   - orbitalScene.components.jsx  (CentralSphere, GlowRing, SkillPlanet, OrbitalRing, Scene)
 */

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import './OrbitalScene.css';
import { hex, Scene } from './orbitalScene.components.jsx';

export default function OrbitalScene({ categories, theme }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredSkill,     setHoveredSkill]     = useState(null);
  const themeHex = hex(theme);

  return (
    <div className="orbital-wrapper">
      <Canvas
        camera={{ position: [0, 3.5, 15], fov: 55 }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene
            categories={categories}
            theme={theme}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            hoveredSkill={hoveredSkill}
            setHoveredSkill={setHoveredSkill}
          />
        </Suspense>
      </Canvas>

      {/* Filtre catégories */}
      <nav className="orbital-filter" aria-label="Filtrer par catégorie">
        <button
          className={`orbital-filter-btn ${!selectedCategory ? 'orbital-filter-btn--on' : ''}`}
          style={{ '--th': themeHex }}
          onClick={() => setSelectedCategory(null)}
        >
          Tout
        </button>
        {categories.map(([cat]) => (
          <button
            key={cat}
            className={`orbital-filter-btn ${selectedCategory === cat ? 'orbital-filter-btn--on' : ''}`}
            style={{ '--th': themeHex }}
            onClick={() => setSelectedCategory(prev => prev === cat ? null : cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      <p className="orbital-hint-text">
        Scroll pour zoomer · Survoler les planètes · Cliquer les anneaux
      </p>
    </div>
  );
}
