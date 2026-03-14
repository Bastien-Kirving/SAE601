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

import { useRef, useEffect, useState, useCallback } from 'react';
import SkillGrid from './SkillGrid';
import './HeroSkill.cursor.css';
import './HeroSkill.css';

/* ============================================
   Custom Spider-Man Cursor
   ============================================ */
function SpiderCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const posRef  = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const rafRef  = useRef(null);
  const [hovering, setHovering] = useState(false);

  const onMove        = useCallback((e) => { posRef.current = { x: e.clientX, y: e.clientY }; }, []);
  const onEnterCard   = useCallback(() => setHovering(true),  []);
  const onLeaveCard   = useCallback(() => setHovering(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove);

    const attached = new WeakSet();
    const watch = () => {
      document.querySelectorAll('.orbit-ring-label, .orbital-filter-btn').forEach(el => {
        if (attached.has(el)) return;
        el.addEventListener('mouseenter', onEnterCard);
        el.addEventListener('mouseleave', onLeaveCard);
        attached.add(el);
      });
    };
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });

    const animate = () => {
      const lerpFactor = 0.13;
      ringPos.current.x += (posRef.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (posRef.current.y - ringPos.current.y) * lerpFactor;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%,-50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%,-50%)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
      mo.disconnect();
    };
  }, [onMove, onEnterCard, onLeaveCard]);

  return (
    <>
      <div ref={dotRef}  className={`spider-cursor-dot  ${hovering ? 'spider-cursor--hover' : ''}`} aria-hidden="true" />
      <div ref={ringRef} className={`spider-cursor-ring ${hovering ? 'spider-cursor--hover' : ''}`} aria-hidden="true">
        <svg viewBox="0 0 40 40" className="spider-cursor-web">
          <line x1="20" y1="2"  x2="20" y2="38" stroke="currentColor" strokeWidth="0.6"/>
          <line x1="2"  y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="0.6"/>
          <line x1="7"  y1="7"  x2="33" y2="33" stroke="currentColor" strokeWidth="0.6"/>
          <line x1="33" y1="7"  x2="7"  y2="33" stroke="currentColor" strokeWidth="0.6"/>
          <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="0.6"/>
        </svg>
      </div>
    </>
  );
}

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
      <SpiderCursor />

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
