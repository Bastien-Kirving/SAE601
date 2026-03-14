/**
 * useWebGraphInteraction.js — Hover and drag interaction hook for WebGraph
 */

import { useRef, useEffect, useCallback } from 'react';

/**
 * Manages hover highlighting and drag-and-drop on graph nodes.
 * @param {React.RefObject} graphRef - Ref to { nodes, edges }
 * @param {React.RefObject} svgRef   - Ref to the SVG element
 * @returns {{ dragRef, onNodeEnter, onNodeLeave, onNodeMouseDown }}
 */
export function useWebGraphInteraction(graphRef, svgRef) {
  const dragRef = useRef(null);

  /* ---- Hover: direct DOM manipulation (0 re-render) ---- */
  const onNodeEnter = useCallback((nodeId) => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.querySelector(`[data-nid="${nodeId}"]`)?.classList.add('wg-node--hov');
    graphRef.current.edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .forEach(e => svg.querySelector(`[data-eid="${e.id}"]`)?.classList.add('wg-edge--lit'));
  }, [graphRef, svgRef]);

  const onNodeLeave = useCallback((nodeId) => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.querySelector(`[data-nid="${nodeId}"]`)?.classList.remove('wg-node--hov');
    graphRef.current.edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .forEach(e => svg.querySelector(`[data-eid="${e.id}"]`)?.classList.remove('wg-edge--lit'));
  }, [graphRef, svgRef]);

  /* ---- Drag: start on mousedown ---- */
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
  }, [graphRef, svgRef]);

  /* ---- Drag: move and release ---- */
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
  }, [graphRef, svgRef]);

  return { dragRef, onNodeEnter, onNodeLeave, onNodeMouseDown };
}
