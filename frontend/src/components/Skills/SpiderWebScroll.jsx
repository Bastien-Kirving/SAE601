/**
 * SpiderWebScroll.jsx — Toile d'araignée scroll-driven
 *
 * Section sticky (même pattern que DimensionalRift / LeapOfFaith) :
 * - Scroll → chaque compétence apparaît sur un nœud de la toile
 * - La toile se dessine à l'entrée dans le viewport
 * - Fiche détail flottante pour la compétence active
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import './SpiderWebScroll.css';

/* ============================================
   Config
   ============================================ */
// 10 anneaux visuels, les impairs portent les skills
const ALL_RINGS       = [0.10, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63, 0.72, 0.81, 0.90];
const SKILL_RING_IDX  = [1, 3, 5, 7, 9]; // indices dans ALL_RINGS
const NUM_SPOKES      = 16;

const THEME_HEX = { miles: '#FF1744', gwen: '#E040FB', glitch: '#00FF88' };
const THEME_RGB = { miles: '255,23,68', gwen: '224,64,251', glitch: '0,255,136' };

/* ============================================
   Composant
   ============================================ */
export default function SpiderWebScroll({ categories, theme }) {
  const scrollRef = useRef(null);   // tall scroll space
  const stickyRef = useRef(null);   // sticky 100vh container

  const [size,        setSize]        = useState({ w: 800, h: 600, cx: 400, cy: 320, maxR: 260 });
  const [webDrawn,    setWebDrawn]    = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const hex = THEME_HEX[theme] ?? '#FF1744';
  const rgb = THEME_RGB[theme] ?? '255,23,68';

  /* ---- skills à plat ---- */
  const allSkills = useMemo(() =>
    categories.flatMap(([cat, skills], catIdx) =>
      skills.map((skill, skillIdx) => ({ ...skill, category: cat, catIdx, skillIdx }))
    ), [categories]
  );

  /* ---- hauteur section ---- */
  const sectionVh = 100 + allSkills.length * 60;

  /* ---- mesure du conteneur ---- */
  const measure = useCallback(() => {
    const el = stickyRef.current;
    if (!el) return;
    const { width: w, height: h } = el.getBoundingClientRect();
    const cx   = w / 2;
    const cy   = h * 0.52;  // légèrement sous le centre pour laisser place au titre
    const maxR = Math.min(cx * 0.86, cy * 0.84);
    setSize({ w, h, cx, cy, maxR });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  /* ---- dessiner la toile à l'entrée dans le viewport ---- */
  useEffect(() => {
    const ob = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setWebDrawn(true); },
      { threshold: 0.05 }
    );
    if (scrollRef.current) ob.observe(scrollRef.current);
    return () => ob.disconnect();
  }, []);

  /* ---- scroll → skill actif ---- */
  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const el = scrollRef.current;
        if (!el) return;
        const scrolled = -el.getBoundingClientRect().top;
        if (scrolled < 0) { setActiveIndex(-1); return; }
        const total = el.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const progress = Math.min(1, scrolled / total);
        const idx = Math.min(
          Math.floor(progress * (allSkills.length + 2)) - 1,
          allSkills.length - 1
        );
        setActiveIndex(idx);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [allSkills.length]);

  /* ---- rayons des anneaux skills ---- */
  const skillRingRadii = useMemo(() =>
    categories.map((_, i) => (ALL_RINGS[SKILL_RING_IDX[i]] ?? ALL_RINGS.at(-1)) * size.maxR),
    [categories, size.maxR]
  );

  /* ---- positions des nœuds ---- */
  const nodePositions = useMemo(() =>
    allSkills.map(skill => {
      const r     = skillRingRadii[skill.catIdx] ?? size.maxR * 0.5;
      const count = categories[skill.catIdx]?.[1].length ?? 1;
      const angle = (skill.skillIdx / count) * Math.PI * 2 - Math.PI / 2;
      return {
        x: size.cx + Math.cos(angle) * r,
        y: size.cy + Math.sin(angle) * r,
      };
    }),
    [allSkills, skillRingRadii, size, categories]
  );

  /* ---- angles des rayons ---- */
  const spokeAngles = useMemo(() =>
    Array.from({ length: NUM_SPOKES }, (_, i) => (i / NUM_SPOKES) * Math.PI * 2 - Math.PI / 2),
    []
  );

  const outerR      = size.maxR;
  const activeSkill = activeIndex >= 0 ? allSkills[activeIndex] : null;

  /* ============================================
     Rendu
     ============================================ */
  return (
    <div ref={scrollRef} className="sws-scroll" style={{ height: `${sectionVh}vh` }}>
      <div ref={stickyRef} className={`sws-sticky ${webDrawn ? 'sws-sticky--drawn' : ''}`}>

        {/* ---- En-tête ---- */}
        <header className="sws-header">
          <span className="sws-eyebrow" style={{ color: hex }}>Mon arsenal technique</span>
          <h2 className="sws-title">
            <span className="sws-title-glitch" data-text="Compétences" style={{ '--th': hex }}>
              Compétences
            </span>
          </h2>
          <div className="sws-title-line" style={{ background: hex }} />
        </header>

        {/* ---- SVG toile ---- */}
        <svg className="sws-svg" width="100%" height="100%">
          <defs>
            <filter id="sws-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="sws-glow-sm" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id="sws-center-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={hex} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={hex} stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Halo central */}
          <ellipse
            cx={size.cx} cy={size.cy}
            rx={skillRingRadii[0] * 0.65 || 60}
            ry={skillRingRadii[0] * 0.65 || 60}
            fill="url(#sws-center-glow)"
          />

          {/* Rayons */}
          {spokeAngles.map((a, i) => {
            const len = outerR;
            return (
              <line key={i}
                x1={size.cx} y1={size.cy}
                x2={size.cx + Math.cos(a) * outerR}
                y2={size.cy + Math.sin(a) * outerR}
                stroke={`rgba(${rgb},0.16)`}
                strokeWidth="0.7"
                className="sws-spoke"
                style={{ '--dash': len, transitionDelay: `${0.04 + i * 0.035}s` }}
              />
            );
          })}

          {/* Anneaux */}
          {ALL_RINGS.map((ratio, i) => {
            const r           = ratio * size.maxR;
            const isSkillRing = SKILL_RING_IDX.includes(i);
            const catIdx      = SKILL_RING_IDX.indexOf(i);
            const hasCategory = catIdx >= 0 && catIdx < categories.length;
            const circ        = 2 * Math.PI * r;
            return (
              <circle key={i}
                cx={size.cx} cy={size.cy} r={r}
                fill="none"
                stroke={`rgba(${rgb}, ${isSkillRing && hasCategory ? 0.32 : 0.09})`}
                strokeWidth={isSkillRing && hasCategory ? 1.0 : 0.5}
                className="sws-ring"
                transform={`rotate(-90, ${size.cx}, ${size.cy})`}
                style={{ '--dash': circ, transitionDelay: `${i * 0.09}s` }}
              />
            );
          })}

          {/* Labels catégories */}
          {categories.map(([cat], i) => {
            const r = skillRingRadii[i];
            if (!r) return null;
            return (
              <text key={cat}
                x={size.cx}
                y={size.cy - r - 10}
                textAnchor="middle"
                className="sws-cat-label"
                fill={`rgba(${rgb},0.5)`}
              >
                {cat.toUpperCase()}
              </text>
            );
          })}

          {/* Nœuds skills */}
          {allSkills.map((skill, idx) => {
            const pos      = nodePositions[idx];
            if (!pos) return null;
            const isActive  = idx === activeIndex;
            const isVisible = idx <= activeIndex;
            const nodeR     = 12 + (skill.level / 100) * 7;
            const arcCirc   = 2 * Math.PI * (nodeR + 3.5);
            const arcDash   = (skill.level / 100) * arcCirc;

            return (
              <g key={skill.id ?? `${skill.name}-${idx}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={[
                  'sws-node',
                  isVisible ? 'sws-node--visible' : '',
                  isActive  ? 'sws-node--active'  : '',
                ].join(' ')}
              >
                {/* Halo actif */}
                <circle r={nodeR + 10}
                  fill={`rgba(${rgb},0.12)`}
                  className="sws-node-halo"
                />
                {/* Arc de niveau */}
                <circle r={nodeR + 3.5}
                  fill="none"
                  stroke={hex}
                  strokeWidth="1.5"
                  strokeDasharray={`${arcDash} ${arcCirc - arcDash}`}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                  className="sws-level-arc"
                  opacity="0.7"
                />
                {/* Cercle principal */}
                <circle r={nodeR}
                  fill={`rgba(${rgb},0.18)`}
                  stroke={hex}
                  strokeWidth={isActive ? 2 : 1}
                  className="sws-node-circle"
                  filter={isActive ? 'url(#sws-glow)' : 'url(#sws-glow-sm)'}
                />
                {/* Icône */}
                <text
                  textAnchor="middle" dy="0.32em"
                  fontSize={Math.max(nodeR, 13)}
                  className="sws-node-icon"
                >
                  {skill.icon}
                </text>
              </g>
            );
          })}

          {/* Dot central */}
          <circle cx={size.cx} cy={size.cy} r={5}
            fill={hex}
            filter="url(#sws-glow)"
          />
        </svg>

        {/* ---- Fiche détail ---- */}
        <div
          key={activeSkill ? (activeSkill.id ?? activeSkill.name) : 'none'}
          className={`sws-detail ${activeSkill ? 'sws-detail--visible' : ''}`}
          style={{ '--th': hex, '--th-rgb': rgb }}
        >
          {activeSkill && (
            <>
              <div className="sws-detail-icon">{activeSkill.icon}</div>
              <div className="sws-detail-name">{activeSkill.name}</div>
              <div className="sws-detail-cat">{activeSkill.category}</div>
              <div className="sws-detail-bar-track">
                <div className="sws-detail-bar-fill" style={{ width: `${activeSkill.level}%` }} />
              </div>
              <div className="sws-detail-pct">{activeSkill.level}%</div>
            </>
          )}
        </div>

        {/* ---- Compteur ---- */}
        <div className="sws-counter" style={{ '--th': hex }}>
          <span className="sws-counter-n">{Math.max(0, activeIndex + 1)}</span>
          <span className="sws-counter-sep"> / </span>
          <span className="sws-counter-total">{allSkills.length}</span>
        </div>

        {/* ---- Hint scroll ---- */}
        <div className={`sws-hint ${activeIndex < 0 ? 'sws-hint--visible' : ''}`}>
          <span>Scroll</span>
          <div className="sws-hint-arrow" />
        </div>

      </div>
    </div>
  );
}
