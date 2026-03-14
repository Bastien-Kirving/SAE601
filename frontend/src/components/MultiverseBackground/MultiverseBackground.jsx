/**
 * MultiverseBackground.jsx — Space-Time Tunnel / Multiverse Warp
 *
 * Logic split into:
 *   - multiverseBackground.palettes.js  (PALETTES, rgba, hexToRgbObj)
 *   - multiverseBackground.entities.js  (TunnelRing, SpeedLine, WarpParticle, EnergyBeam)
 */

import { useRef, useEffect, useMemo, memo } from 'react';
import './MultiverseBackground.css';
import { PALETTES, rgba, hexToRgbObj } from './multiverseBackground.palettes.js';
import { TunnelRing, SpeedLine, WarpParticle, EnergyBeam } from './multiverseBackground.entities.js';

const RING_COUNT = 14;
const SPEED_LINE_COUNT = 35;
const PARTICLE_COUNT = 40;
const BEAM_COUNT = 8;

const CAMERA_STRENGTH = 60;
const CAMERA_SMOOTHING = 0.05;

const MultiverseBackground = memo(function MultiverseBackground({ theme = 'miles', themeData }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const entitiesRef = useRef(null);
    const animRef = useRef(null);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const cameraRef = useRef({ x: 0, y: 0 });
    const isVisibleRef = useRef(true);

    // useMemo ensures themeConfig is a stable reference between renders,
    // preventing the useEffect from restarting the canvas animation loop
    // on every parent re-render (e.g. scroll events updating App state).
    const themeConfig = useMemo(() => {
        const defaultPalette = PALETTES[theme] || PALETTES.miles;
        if (!themeData) return defaultPalette;

        const DEFAULTS = {
            miles:  { primary: '#FF1744', secondary: '#E040FB', bg: '#0a0510' },
            gwen:   { primary: '#E040FB', secondary: '#00E5FF', bg: '#FFFFFF'  },
            glitch: { primary: '#00FF88', secondary: '#FF00FF', bg: '#000000'  },
        };
        const def = DEFAULTS[theme];
        const isDefault = def
            && themeData.primary_color?.toLowerCase() === def.primary.toLowerCase()
            && themeData.secondary_color?.toLowerCase() === def.secondary.toLowerCase()
            && themeData.bg_color?.toLowerCase() === def.bg.toLowerCase();

        if (isDefault) return defaultPalette;

        const pRgb = hexToRgbObj(themeData.primary_color);
        const sRgb = hexToRgbObj(themeData.secondary_color);
        const bcol = themeData.bg_color || '#000000';
        return {
            bg: [bcol, bcol, '#000000'],
            rings: [pRgb, sRgb, { r: 255, g: 255, b: 255 }, pRgb, sRgb],
            lines: [pRgb, sRgb, { r: 255, g: 255, b: 255 }],
            nebula: [
                { color: pRgb, x: -0.2, y: -0.1 },
                { color: sRgb, x: 0.2, y: 0.15 },
                { color: { r: 255, g: 255, b: 255 }, x: 0.0, y: -0.2 },
                { color: pRgb, x: -0.1, y: 0.2 }
            ],
            core: [{ r: 255, g: 255, b: 255 }, sRgb, pRgb, { r: 255, g: 255, b: 255 }]
        };
    }, [theme, themeData?.primary_color, themeData?.secondary_color, themeData?.bg_color]);

    // Update CSS variables for overlays
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--flash-color-1', `rgba(var(--primary-color-rgb), 0.4)`);
        root.style.setProperty('--flash-color-2', `rgba(var(--secondary-color-rgb), 0.3)`);
    }, [theme, themeData]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let W, H, cx, cy, maxR;

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            cx = W / 2;
            cy = H / 2;
            maxR = Math.sqrt(cx * cx + cy * cy);
            if (entitiesRef.current) {
                const { rings, lines, particles, beams } = entitiesRef.current;
                rings.forEach(r => r.resize(cx, cy, maxR));
                lines.forEach(l => l.resize(cx, cy, maxR));
                particles.forEach(p => p.resize(cx, cy, maxR));
                beams.forEach(b => b.resize(cx, cy, maxR));
            }
        }
        resize();

        // Init entities with CURRENT THEME COLORS
        const rings = Array.from({ length: RING_COUNT }, () => new TunnelRing(cx, cy, maxR, themeConfig.rings));
        const lines = Array.from({ length: SPEED_LINE_COUNT }, () => new SpeedLine(cx, cy, maxR, themeConfig.lines));
        const particles = Array.from({ length: PARTICLE_COUNT }, () => new WarpParticle(cx, cy, maxR, themeConfig.rings));
        const beams = Array.from({ length: BEAM_COUNT }, () => new EnergyBeam(cx, cy, maxR, themeConfig.lines));
        entitiesRef.current = { rings, lines, particles, beams };

        const handleMouse = (e) => {
            mouseRef.current.x = e.clientX / W;
            mouseRef.current.y = e.clientY / H;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouse);

        function animate(timestamp) {
            if (!isVisibleRef.current) {
                animRef.current = requestAnimationFrame(animate);
                return;
            }
            const time = timestamp || 0;
            ctx.clearRect(0, 0, W, H);

            // Camera
            const targetX = (mouseRef.current.x - 0.5) * CAMERA_STRENGTH * 2;
            const targetY = (mouseRef.current.y - 0.5) * CAMERA_STRENGTH * 2;
            cameraRef.current.x += (targetX - cameraRef.current.x) * CAMERA_SMOOTHING;
            cameraRef.current.y += (targetY - cameraRef.current.y) * CAMERA_SMOOTHING;
            const scx = cx + cameraRef.current.x;
            const scy = cy + cameraRef.current.y;

            // Update entities center
            rings.forEach(r => { r.cx = scx; r.cy = scy; });
            lines.forEach(l => { l.cx = scx; l.cy = scy; });
            particles.forEach(p => { p.cx = scx; p.cy = scy; });
            beams.forEach(b => { b.cx = scx; b.cy = scy; });

            // Background Gradient
            const bg = ctx.createRadialGradient(scx, scy, 0, scx, scy, maxR);
            bg.addColorStop(0, themeConfig.bg[0]);
            bg.addColorStop(0.5, themeConfig.bg[1]);
            bg.addColorStop(1, themeConfig.bg[2]);
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            // Nebula
            themeConfig.nebula.forEach(n => {
                const breathing = Math.sin(time * 0.001) * 0.03 + 0.07;
                const nx = scx + n.x * scx + Math.sin(time * 0.0007) * 30;
                const ny = scy + n.y * scy + Math.cos(time * 0.0005) * 20;
                const size = 0.4 * maxR;
                const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, size);
                grad.addColorStop(0, rgba(n.color, breathing));
                grad.addColorStop(0.6, rgba(n.color, breathing * 0.3));
                grad.addColorStop(1, rgba(n.color, 0));
                ctx.beginPath(); ctx.fillStyle = grad; ctx.arc(nx, ny, size, 0, Math.PI * 2); ctx.fill();
            });

            // Entities
            lines.forEach(l => { l.update(); l.draw(ctx); });
            particles.forEach(p => { p.update(); p.draw(ctx); });
            rings.forEach(r => { r.update(); r.draw(ctx); });
            beams.forEach(b => { b.update(); b.draw(ctx); });

            // Core
            const corePulse = Math.sin(time * 0.003) * 0.3 + 0.7;
            const cCols = themeConfig.core;
            const g3 = ctx.createRadialGradient(scx, scy, 0, scx, scy, 150 + corePulse * 60);
            g3.addColorStop(0, rgba(cCols[3] || cCols[2], 0.15 * corePulse));
            g3.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.fillStyle = g3; ctx.arc(scx, scy, 250, 0, Math.PI * 2); ctx.fill();
            const g2 = ctx.createRadialGradient(scx, scy, 0, scx, scy, 80 + corePulse * 40);
            g2.addColorStop(0, rgba(cCols[1], 0.3 * corePulse));
            g2.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.fillStyle = g2; ctx.arc(scx, scy, 150, 0, Math.PI * 2); ctx.fill();
            const g1 = ctx.createRadialGradient(scx, scy, 0, scx, scy, 40 + corePulse * 20);
            g1.addColorStop(0, rgba(cCols[0], 0.9 * corePulse));
            g1.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.fillStyle = g1; ctx.arc(scx, scy, 80, 0, Math.PI * 2); ctx.fill();

            animRef.current = requestAnimationFrame(animate);
        }

        animRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouse);
        };
    }, [theme, themeConfig]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
            { threshold: 0 }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className={`multiverse-container theme-${theme}`}>
            <canvas ref={canvasRef} className="multiverse-canvas" />
            <div className="scanline-overlay" />
            <div className="aberration-flash" />
            <div className="vignette-overlay" />
        </div>
    );
});

export default MultiverseBackground;
