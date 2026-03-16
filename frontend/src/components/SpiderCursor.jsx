/**
 * SpiderCursor — Curseur custom global (dot + ring animé)
 * Actif sur toute l'application.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import './Skills/HeroSkill.cursor.css';

export default function SpiderCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const posRef  = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const rafRef  = useRef(null);
  const [hovering, setHovering] = useState(false);

  const onMove      = useCallback((e) => { posRef.current = { x: e.clientX, y: e.clientY }; }, []);
  const onEnterCard = useCallback(() => setHovering(true),  []);
  const onLeaveCard = useCallback(() => setHovering(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove);

    // Écoute les éléments interactifs pour l'effet hover
    const attached = new WeakSet();
    const watch = () => {
      document.querySelectorAll('a, button, [role="button"], .orbit-ring-label, .orbital-filter-btn').forEach(el => {
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
        dotRef.current.style.opacity = '1';
        dotRef.current.style.transform =
          `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%,-50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.opacity = '1';
        ringRef.current.style.transform =
          `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%,-50%)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
