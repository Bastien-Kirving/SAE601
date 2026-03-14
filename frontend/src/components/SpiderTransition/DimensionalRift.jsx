/**
 * DimensionalRift.jsx — Scroll-driven Multiverse Portal Transition
 *
 * Logic split into:
 *   - dimensionalRift.config.js  (THEMES, helpers, initEntities)
 *   - dimensionalRift.draw.js    (draw function)
 */

import { useRef, useEffect, useCallback } from 'react';
import './DimensionalRift.css';
import { THEMES, initEntities as initEntitiesFn } from './dimensionalRift.config.js';
import { draw as drawFn } from './dimensionalRift.draw.js';

function clampProgress(v, min = 0, max = 1) { return Math.min(max, Math.max(min, v)); }

export default function DimensionalRift({ theme = 'miles' }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const scrollProgress = useRef(0);
    const animRef = useRef(null);
    const isVisibleRef = useRef(false);
    const stateRef = useRef({
        time: 0,
        rings: [],
        speedLines: [],
        particles: [],
        initialized: false,
    });

    const initEntities = useCallback((W, H) => {
        initEntitiesFn(stateRef.current, W, H);
    }, []);

    const draw = useCallback((ctx, W, H, colors) => {
        drawFn(stateRef.current, scrollProgress.current, ctx, W, H, colors);
    }, []);

    /* ---- Visibility tracking ---- */
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
            { threshold: 0 }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    /* ---- Animation loop ---- */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let W, H;
        function resize() {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W;
            canvas.height = H;
            if (!stateRef.current.initialized) {
                initEntities(W, H);
            }
        }
        resize();
        window.addEventListener('resize', resize);

        function animate() {
            if (isVisibleRef.current) {
                stateRef.current.time += 0.016;
                const colors = THEMES[theme] || THEMES.miles;
                draw(ctx, W, H, colors);
            }
            animRef.current = requestAnimationFrame(animate);
        }
        animRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [theme, draw, initEntities]);

    /* ---- Scroll tracking ---- */
    useEffect(() => {
        function onScroll() {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const windowH = window.innerHeight;
            const sectionH = rect.height;
            const progress = clampProgress((windowH - rect.top) / (windowH + sectionH));
            scrollProgress.current = progress;
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="dimensional-rift" ref={containerRef}>
            <canvas ref={canvasRef} className="dimensional-rift__canvas" />
        </div>
    );
}
