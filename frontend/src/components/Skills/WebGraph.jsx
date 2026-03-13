/**
 * WebGraph.jsx — Toile d'araignée interactive des compétences
 *
 * Architecture performance :
 * - SVG pour le rendu (edges + nodes)
 * - RAF loop pour physique + positions (direct DOM, 0 re-render)
 * - CSS transitions pour l'animation de tissage et les hovers
 * - React state uniquement pour le panneau détail (selectedSkill)
 *
 * Interactions :
 * - Hover nœud   → fils connectés s'illuminent, nœud pulse
 * - Drag nœud    → physique de ressort (rappel vers position home)
 * - Clic skill   → panneau détail avec niveau
 * - Scroll trigger → fils se "tissent" un à un (stroke-dashoffset)
 * - Ondulation sinusoïdale permanente sur tous les nœuds
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import './WebGraph.css';

/* ============================================
   Thèmes
   ============================================ */
const THEME = {
  miles: { hex: '#FF1744', rgb: '255,23,68' },
  gwen: { hex: '#E040FB', rgb: '224,64,251' },
  glitch: { hex: '#00FF88', rgb: '0,255,136' },
};

/* ============================================
   Construction du graphe
   ============================================ */
function buildGraph(categories, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const n = categories.length;
  const nodes = {};
  const edges = [];

  // Rayon adaptatif selon la taille du conteneur
  const catRing = Math.min(w * 0.33, h * 0.36, 210);

  categories.forEach(([cat, skills], i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const catId = `C:${cat}`;

    nodes[catId] = {
      id: catId,
      type: 'category',
      label: cat,
      x: cx + Math.cos(angle) * catRing,
      y: cy + Math.sin(angle) * catRing,
      homeX: cx + Math.cos(angle) * catRing,
      homeY: cy + Math.sin(angle) * catRing,
      vx: 0, vy: 0,
      r: 24,
      phase: Math.random() * Math.PI * 2,
    };

    // Rayon des skills autour de leur catégorie
    const skillRing = Math.min(65 + skills.length * 4, 115);

    skills.forEach((skill, j) => {
      // Décalage angulaire alterné pour éviter les superpositions
      const sa = angle + (j / skills.length) * Math.PI * 2 + (i % 2 === 0 ? 0.4 : -0.4);
      const sid = `S:${skill.id ?? skill.name}`;

      nodes[sid] = {
        id: sid,
        type: 'skill',
        label: skill.name,
        icon: skill.icon,
        level: skill.level,
        catId,
        skill: { ...skill, category: cat },
        x: nodes[catId].x + Math.cos(sa) * skillRing,
        y: nodes[catId].y + Math.sin(sa) * skillRing,
        vx: 0, vy: 0,
        r: 11 + (skill.level / 100) * 7,
        phase: Math.random() * Math.PI * 2,
      };

      edges.push({
        id: `${catId}>${sid}`,
        source: catId,
        target: sid,
      });
    });
  });

  return { nodes, edges };
}

/* ============================================
   Composant principal
   ============================================ */
export default function WebGraph({ categories, theme }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const graphRef = useRef({ nodes: {}, edges: [] });
  const dragRef = useRef(null);

  const [selectedSkill, setSelectedSkill] = useState(null);
  // Forcer un re-render après init pour avoir les nœuds dans le JSX
  const [tick, setTick] = useState(0);

  const tc = THEME[theme] ?? THEME.miles;
  const hex = tc.hex;
  const rgb = tc.rgb;

  /* ---- Init + resize ---- */
  const init = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width: w, height: h } = el.getBoundingClientRect();
    graphRef.current = buildGraph(categories, w, h);
    setTick(t => t + 1); // déclenche le re-render initial
  }, [categories]);

  useEffect(() => {
    init();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, [init]);

  /* ---- Scroll trigger : tissage des fils ---- */
  useEffect(() => {
    let drawn = false;
    const ob = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || drawn) return;
      drawn = true;
      graphRef.current.edges.forEach((edge, i) => {
        setTimeout(() => {
          svgRef.current
            ?.querySelector(`[data-eid="${edge.id}"]`)
            ?.classList.add('wg-edge--drawn');
        }, i * 55 + 200);
      });
    }, { threshold: 0.15 });

    if (containerRef.current) ob.observe(containerRef.current);
    return () => ob.disconnect();
  }, []);

  /* ---- Physique + rendu RAF ---- */
  useEffect(() => {
    const loop = (time) => {
      const { nodes, edges } = graphRef.current;
      const t = time / 1000;
      const el = containerRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(loop); return; }

      const w = el.clientWidth;
      const h = el.clientHeight;
      const list = Object.values(nodes);

      // Ressort skill → catégorie
      list.forEach(nd => {
        if (nd.type !== 'skill' || dragRef.current?.id === nd.id) return;
        const cat = nodes[nd.catId];
        if (!cat) return;
        const dx = cat.x - nd.x, dy = cat.y - nd.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - 80) * 0.022;
        nd.vx += (dx / d) * f;
        nd.vy += (dy / d) * f;
      });

      // Répulsion skill ↔ skill
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        if (a.type !== 'skill') continue;
        for (let j = i + 1; j < list.length; j++) {
          const b = list[j];
          if (b.type !== 'skill') continue;
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy) || 1;
          const min = (a.r + b.r) * 2.8;
          if (d < min) {
            const f = (min - d) / min * 0.06;
            if (dragRef.current?.id !== a.id) { a.vx += (dx / d) * f; a.vy += (dy / d) * f; }
            if (dragRef.current?.id !== b.id) { b.vx -= (dx / d) * f; b.vy -= (dy / d) * f; }
          }
        }
      }

      // Rappel catégorie vers home
      list.forEach(nd => {
        if (nd.type !== 'category' || dragRef.current?.id === nd.id) return;
        nd.vx += (nd.homeX - nd.x) * 0.04;
        nd.vy += (nd.homeY - nd.y) * 0.04;
      });

      // Murs souples
      const m = 48;
      list.forEach(nd => {
        if (dragRef.current?.id === nd.id) return;
        if (nd.x < m) nd.vx += (m - nd.x) * 0.05;
        if (nd.x > w - m) nd.vx -= (nd.x - (w - m)) * 0.05;
        if (nd.y < m) nd.vy += (m - nd.y) * 0.05;
        if (nd.y > h - m) nd.vy -= (nd.y - (h - m)) * 0.05;
      });

      // Amortissement + intégration
      list.forEach(nd => {
        if (dragRef.current?.id === nd.id) return;
        nd.vx *= 0.87; nd.vy *= 0.87;
        nd.x += nd.vx; nd.y += nd.vy;
      });

      // Mise à jour DOM directe
      const svg = svgRef.current;
      if (svg) {
        // Edges : mise à jour positions
        edges.forEach(e => {
          const src = nodes[e.source], tgt = nodes[e.target];
          if (!src || !tgt) return;
          const line = svg.querySelector(`[data-eid="${e.id}"]`);
          if (!line) return;
          const wx = Math.sin(t * 1.05 + src.phase) * 1.4;
          const wy = Math.cos(t * 0.82 + tgt.phase) * 1.4;
          line.setAttribute('x1', src.x + wx);
          line.setAttribute('y1', src.y + wy);
          line.setAttribute('x2', tgt.x + wx);
          line.setAttribute('y2', tgt.y + wy);
        });

        // Nodes : mise à jour transform (ondulation incluse)
        list.forEach(nd => {
          const g = svg.querySelector(`[data-nid="${nd.id}"]`);
          if (!g) return;
          const wx = Math.sin(t * 1.1 + nd.phase) * 1.4;
          const wy = Math.cos(t * 0.78 + nd.phase) * 1.4;
          g.setAttribute('transform', `translate(${nd.x + wx},${nd.y + wy})`);
        });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ---- Hover : manipulation DOM directe (0 re-render) ---- */
  const onNodeEnter = useCallback((nodeId) => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.querySelector(`[data-nid="${nodeId}"]`)?.classList.add('wg-node--hov');
    graphRef.current.edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .forEach(e => svg.querySelector(`[data-eid="${e.id}"]`)?.classList.add('wg-edge--lit'));
  }, []);

  const onNodeLeave = useCallback((nodeId) => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.querySelector(`[data-nid="${nodeId}"]`)?.classList.remove('wg-node--hov');
    graphRef.current.edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .forEach(e => svg.querySelector(`[data-eid="${e.id}"]`)?.classList.remove('wg-edge--lit'));
  }, []);

  /* ---- Drag ---- */
  const onNodeMouseDown = useCallback((e, nodeId) => {
    e.stopPropagation();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nd = graphRef.current.nodes[nodeId];
    if (!nd) return;
    nd.vx = 0; nd.vy = 0;
    dragRef.current = {
      id: nodeId,
      ox: e.clientX - rect.left - nd.x,
      oy: e.clientY - rect.top - nd.y,
    };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nd = graphRef.current.nodes[dragRef.current.id];
      if (!nd) return;
      nd.x = e.clientX - rect.left - dragRef.current.ox;
      nd.y = e.clientY - rect.top - dragRef.current.oy;
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  /* ---- Rendu ---- */
  const { nodes, edges } = graphRef.current;
  const nodeList = Object.values(nodes);

  return (
    <div ref={containerRef} className="webgraph-wrap">
      <svg
        ref={svgRef}
        className="webgraph-svg"
        width="100%" height="100%"
        style={{ '--hex': hex, '--rgb': rgb }}
      >
        <defs>
          <filter id="wg-glow-node" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="wg-glow-edge" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Halo pour les nœuds catégorie */}
          <radialGradient id="wg-cat-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={hex} stopOpacity="0.22" />
            <stop offset="100%" stopColor={hex} stopOpacity="0.04" />
          </radialGradient>
          <radialGradient id="wg-skill-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={hex} stopOpacity="0.30" />
            <stop offset="100%" stopColor={hex} stopOpacity="0.06" />
          </radialGradient>
        </defs>

        {/* ---- Edges ---- */}
        {edges.map(e => {
          const src = nodes[e.source], tgt = nodes[e.target];
          if (!src || !tgt) return null;
          const len = Math.hypot(tgt.x - src.x, tgt.y - src.y);
          return (
            <line
              key={e.id}
              data-eid={e.id}
              className="wg-edge"
              x1={src.x} y1={src.y}
              x2={tgt.x} y2={tgt.y}
              pathLength="1"
              stroke={`rgba(${rgb},0.3)`}
              strokeWidth="0.8"
            />
          );
        })}

        {/* ---- Nodes ---- */}
        {nodeList.map(nd => {
          const isCat = nd.type === 'category';
          return (
            <g
              key={nd.id}
              data-nid={nd.id}
              transform={`translate(${nd.x},${nd.y})`}
              className={`wg-node ${isCat ? 'wg-node--cat' : 'wg-node--skill'}`}
              onMouseEnter={() => onNodeEnter(nd.id)}
              onMouseLeave={() => onNodeLeave(nd.id)}
              onMouseDown={(e) => onNodeMouseDown(e, nd.id)}
              onClick={() => { if (!isCat) setSelectedSkill(nd.skill); }}
              style={{ cursor: 'grab' }}
            >
              {/* Cercle de fond */}
              <circle
                r={nd.r}
                fill={isCat ? 'url(#wg-cat-fill)' : 'url(#wg-skill-fill)'}
                stroke={hex}
                strokeWidth={isCat ? 1.8 : 1.2}
                className="wg-node-circle"
              />
              {/* Anneau pulse (hover) */}
              <circle
                r={nd.r + 6}
                fill="none"
                stroke={hex}
                strokeWidth="0.8"
                className="wg-node-pulse"
              />

              {isCat ? (
                /* Label catégorie */
                <text
                  className="wg-cat-label"
                  textAnchor="middle"
                  dy="0.38em"
                >
                  {nd.label.toUpperCase()}
                </text>
              ) : (
                <>
                  {/* Icône skill */}
                  <text
                    textAnchor="middle"
                    dy="0.22em"
                    fontSize={Math.max(nd.r * 1.05, 13)}
                    className="wg-skill-icon"
                  >
                    {nd.icon}
                  </text>
                  {/* Nom skill (visible au hover via CSS) */}
                  <text
                    textAnchor="middle"
                    y={nd.r + 13}
                    className="wg-skill-label"
                  >
                    {nd.label}
                  </text>
                  {/* Arc de niveau */}
                  <circle
                    r={nd.r + 3}
                    fill="none"
                    stroke={hex}
                    strokeWidth="1.5"
                    strokeDasharray={`${(nd.level / 100) * (2 * Math.PI * (nd.r + 3))} 9999`}
                    strokeLinecap="round"
                    transform="rotate(-90)"
                    className="wg-level-arc"
                    opacity="0.55"
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* ---- Hint ---- */}
      <p className="webgraph-hint">
        Drag · Hover · Clic pour les détails
      </p>

      {/* ---- Panneau détail ---- */}
      {selectedSkill && (
        <div
          className="wg-detail-overlay"
          onClick={() => setSelectedSkill(null)}
        >
          <div
            className="wg-detail-card"
            style={{ '--th': hex, '--th-rgb': rgb }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="wg-detail-close"
              onClick={() => setSelectedSkill(null)}
              aria-label="Fermer"
            >
              ✕
            </button>
            <div className="wg-detail-icon">{selectedSkill.icon}</div>
            <div className="wg-detail-name">{selectedSkill.name}</div>
            <div className="wg-detail-cat">{selectedSkill.category}</div>
            <div className="wg-detail-bar-track">
              <div
                className="wg-detail-bar-fill"
                style={{ width: `${selectedSkill.level}%` }}
              />
            </div>
            <div className="wg-detail-pct">{selectedSkill.level}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
