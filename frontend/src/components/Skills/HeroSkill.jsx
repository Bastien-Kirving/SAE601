/**
 * HeroSkill.jsx — Section compétences
 *
 * Design: Système orbital 3D (React Three Fiber)
 * - Anneaux orbitaux par catégorie
 * - Planètes-compétences animées
 * - Parallaxe souris, zoom molette
 * - Curseur Spider-Man custom
 * - Titre avec effet glitch
 */

import { useRef, useEffect, useState } from 'react';
import SkillGrid from './SkillGrid';
import './HeroSkill.css';

/* ============================================
   Main Component
   ============================================ */
export default function HeroSkill({ theme = 'miles' }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [skills,    setSkills]    = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch('/api/skills')
      .then(res => res.json())
      .then(data => setSkills(Array.isArray(data) ? data : []))
      .catch(err => console.error('Erreur chargement skills:', err));
  }, []);

  const categories = Object.entries(
    skills.reduce((acc, skill) => {
      const cat = skill.category || 'Autre';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {})
  );

  return (
    <div
      ref={containerRef}
      className={`hero-skill theme-${theme} ${isVisible ? 'hero-skill--visible' : ''}`}
    >
      {/* Ambient orbs */}
      <div className="skill-orbs" aria-hidden="true">
        <span className="skill-orb skill-orb-1" />
        <span className="skill-orb skill-orb-2" />
      </div>

      <div className="skills-split-layout">
        
        {/* ─── Titre Centré sur TOUTE la page ─── */}
        <header className="skills-header">
          <span className="skills-eyebrow"></span>
          <h1 className="skills-title">
            <span className="hero-glitch" data-text="Compétences">Compétences</span>
          </h1>
          <div className="skills-title-line" />
        </header>

        {/* ─── Gauche : Contenu (Grille) ─── */}
        <div className="skills-content-panel">
          {/* Grille animée ─── */}
          <div className="skills-grid-wrapper">
            {skills.length === 0 ? (
              <p className="skills-loading">Chargement…</p>
            ) : (
              <SkillGrid skills={skills} theme={theme} />
            )}
          </div>
        </div>

        {/* ─── Droite : image ─── */}
        <div className="skills-image-panel right-panel">
          <img src="/images/newyork.jpeg" alt="New York" className="skills-city-img" />
          <div className="skills-image-overlay" aria-hidden="true" />
        </div>

      </div>
    </div>
  );
}
