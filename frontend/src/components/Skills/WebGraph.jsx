/**
 * WebGraph.jsx — Toile d'araignée interactive des compétences
 *
 * Logic split into:
 *   - webGraph.build.js             (THEME, buildGraph)
 *   - useWebGraphInteraction.js     (hover + drag hook)
 *   - WebGraphDetail.jsx            (skill detail panel)
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import './WebGraph.css';
import { THEME, buildGraph } from './webGraph.build.js';
import { useWebGraphInteraction } from './useWebGraphInteraction.js';
import { WebGraphDetail } from './WebGraphDetail.jsx';

export default function WebGraph({ categories, theme }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const graphRef = useRef({ nodes: {}, edges: [] });

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [, setTick] = useState(0);

  const tc = THEME[theme] ?? THEME.miles;
  const hex = tc.hex;
  const rgb = tc.rgb;

  /* ---- Interaction hook (hover + drag) ---- */
  const { dragRef, onNodeEnter, onNodeLeave, onNodeMouseDown } = useWebGraphInteraction(graphRef, svgRef);

  /* ---- Init + resize ---- */
  const init = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width: w, height: h } = el.getBoundingClientRect();
    graphRef.current = buildGraph(categories, w, h);
    setTick(t => t + 1);
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
  }, [dragRef]);

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
              <circle
                r={nd.r}
                fill={isCat ? 'url(#wg-cat-fill)' : 'url(#wg-skill-fill)'}
                stroke={hex}
                strokeWidth={isCat ? 1.8 : 1.2}
                className="wg-node-circle"
              />
              <circle
                r={nd.r + 6}
                fill="none"
                stroke={hex}
                strokeWidth="0.8"
                className="wg-node-pulse"
              />

              {isCat ? (
                <text className="wg-cat-label" textAnchor="middle" dy="0.38em">
                  {nd.label.toUpperCase()}
                </text>
              ) : (
                <>
                  <text
                    textAnchor="middle"
                    dy="0.22em"
                    fontSize={Math.max(nd.r * 1.05, 13)}
                    className="wg-skill-icon"
                  >
                    {nd.icon}
                  </text>
                  <text textAnchor="middle" y={nd.r + 13} className="wg-skill-label">
                    {nd.label}
                  </text>
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

      <p className="webgraph-hint">
        Drag · Hover · Clic pour les détails
      </p>

      {selectedSkill && (
        <WebGraphDetail
          skill={selectedSkill}
          hex={hex}
          rgb={rgb}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  );
}
