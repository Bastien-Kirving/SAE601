/**
 * DimensionalRift.jsx — Scroll-driven Multiverse Portal Transition
 *
 * A Canvas-based dimensional rift between Profile and Projects sections.
 * As the user scrolls through, they "enter another dimension":
 *
 *   Phase 1 (0→0.3): Portal opens — concentric rings expand from center
 *   Phase 2 (0.3→0.7): Warp speed — speed lines + radial streaks accelerate
 *   Phase 3 (0.7→1.0): Emergence — everything brightens and fades through
 *
 * All driven by scroll position (sticky canvas + tall section for scroll room).
 */

import { useRef, useEffect, useCallback } from 'react';
import './DimensionalRift.css';

/* ============================================
   COLOR THEMES
   ============================================ */
const THEMES = {
    miles: {
        primary: [255, 23, 68],      // Red
        secondary: [224, 64, 251],   // Purple
        accent: [255, 152, 0],       // Orange
        glow: [255, 23, 68],         // Red glow
        bg: [8, 8, 16],
    },
    gwen: {
        primary: [224, 64, 251],     // Pink
        secondary: [0, 229, 255],    // Cyan
        accent: [255, 255, 255],     // White
        glow: [224, 64, 251],
        bg: [250, 250, 255], // Light mode bg
    },
    glitch: {
        primary: [0, 255, 0],        // Green
        secondary: [255, 0, 255],    // Magenta
        accent: [255, 255, 0],       // Yellow
        glow: [0, 255, 0],
        bg: [5, 5, 16],
    },
};

/* ============================================
   MATH HELPERS
   ============================================ */
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min = 0, max = 1) { return Math.min(max, Math.max(min, v)); }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

/* ============================================
   MAIN COMPONENT
   ============================================ */
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

    /* ---- Initialize entities ---- */
    const initEntities = useCallback((W, H) => {
        const cx = W / 2, cy = H / 2;
        const maxR = Math.sqrt(cx * cx + cy * cy);
        const state = stateRef.current;

        // Portal rings (18 concentric)
        state.rings = [];
        for (let i = 0; i < 18; i++) {
            state.rings.push({
                baseRadius: (i / 18) * maxR * 1.2,
                thickness: 1 + Math.random() * 2,
                speed: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
                colorIdx: i % 3, // 0=primary, 1=secondary, 2=accent
            });
        }

        // Speed lines (50 radial streaks)
        state.speedLines = [];
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.1;
            state.speedLines.push({
                angle,
                minDist: 0.05 + Math.random() * 0.2,
                maxDist: 0.5 + Math.random() * 0.5,
                width: 0.5 + Math.random() * 1.5,
                colorIdx: Math.floor(Math.random() * 3),
                speed: 0.3 + Math.random() * 0.7,
                phase: Math.random() * Math.PI * 2,
            });
        }

        // Dimensional particles (floating debris)
        state.particles = [];
        for (let i = 0; i < 35; i++) {
            state.particles.push({
                angle: Math.random() * Math.PI * 2,
                dist: 0.1 + Math.random() * 0.8,
                size: 1 + Math.random() * 3,
                speed: 0.2 + Math.random() * 0.8,
                phase: Math.random() * Math.PI * 2,
                colorIdx: Math.floor(Math.random() * 3),
            });
        }

        state.initialized = true;
    }, []);

    /* ---- Draw frame ---- */
    const draw = useCallback((ctx, W, H, colors) => {
        const state = stateRef.current;
        const p = scrollProgress.current; // 0→1
        const cx = W / 2, cy = H / 2;
        const maxR = Math.sqrt(cx * cx + cy * cy);
        const time = state.time;

        // Clear
        ctx.clearRect(0, 0, W, H);

        // Background darkens/brightens based on phase
        // Entry: fade in over first 10% — Exit: fade out over last 30% for smooth blend into Projects
        const bgAlpha = p < 0.1 ? p / 0.1 : p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
        const mainBg = colors.bg || [8, 8, 16];
        ctx.fillStyle = `rgba(${mainBg[0]}, ${mainBg[1]}, ${mainBg[2]}, ${bgAlpha * 0.95})`;
        ctx.fillRect(0, 0, W, H);

        const colorKeys = ['primary', 'secondary', 'accent'];

        // ========== PORTAL RINGS ==========
        const ringProgress = easeOutCubic(clamp(p / 0.5));
        const ringPulse = clamp(p / 0.3); // How fast rings pulse

        state.rings.forEach((ring, i) => {
            const pulseMod = 1 + Math.sin(time * ring.speed + ring.phase) * 0.08 * ringPulse;
            const expandFactor = lerp(0.05, 1, ringProgress);
            const radius = ring.baseRadius * expandFactor * pulseMod;

            if (radius < 2 || radius > maxR * 1.5) return;

            const color = colors[colorKeys[ring.colorIdx]];
            const distFade = 1 - (radius / (maxR * 1.2));
            const alpha = clamp(distFade * 0.4 * ringProgress);

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
            ctx.lineWidth = ring.thickness * (1 + ringProgress * 0.5);
            ctx.stroke();
        });

        // ========== CENTRAL GLOW ==========
        const glowSize = lerp(10, maxR * 0.4, easeOutCubic(clamp(p / 0.4)));
        const glowAlpha = lerp(0, 0.5, clamp(p / 0.3));
        const glow = colors.glow;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
        gradient.addColorStop(0, `rgba(${glow[0]}, ${glow[1]}, ${glow[2]}, ${glowAlpha})`);
        gradient.addColorStop(0.5, `rgba(${glow[0]}, ${glow[1]}, ${glow[2]}, ${glowAlpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        // ========== SPEED LINES (phase 2+) ==========
        const speedProgress = easeInOutQuad(clamp((p - 0.2) / 0.6));
        if (speedProgress > 0) {
            state.speedLines.forEach((line) => {
                const elongation = lerp(0, 0.4, speedProgress);
                const drift = time * line.speed * speedProgress * 2;
                const startDist = (line.minDist + Math.sin(drift + line.phase) * 0.05) * maxR;
                const endDist = (line.minDist + line.maxDist * elongation) * maxR;

                if (endDist - startDist < 1) return;

                const x1 = cx + Math.cos(line.angle) * startDist;
                const y1 = cy + Math.sin(line.angle) * startDist;
                const x2 = cx + Math.cos(line.angle) * endDist;
                const y2 = cy + Math.sin(line.angle) * endDist;

                const color = colors[colorKeys[line.colorIdx]];
                const alpha = speedProgress * 0.35;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
                ctx.lineWidth = line.width * (1 + speedProgress);
                ctx.stroke();
            });
        }

        // ========== DIMENSIONAL PARTICLES ==========
        const particleAlpha = easeOutCubic(clamp(p / 0.4));
        if (particleAlpha > 0) {
            state.particles.forEach((pt) => {
                const drift = time * pt.speed * 0.5;
                const currentAngle = pt.angle + drift * 0.3;
                const currentDist = pt.dist * maxR * lerp(0.3, 1, particleAlpha);
                const pulse = 1 + Math.sin(time * 2 + pt.phase) * 0.3;

                const x = cx + Math.cos(currentAngle) * currentDist;
                const y = cy + Math.sin(currentAngle) * currentDist;

                if (x < -10 || x > W + 10 || y < -10 || y > H + 10) return;

                const color = colors[colorKeys[pt.colorIdx]];
                const alpha = particleAlpha * 0.6 * pulse;
                const size = pt.size * pulse;

                // Glow
                ctx.beginPath();
                ctx.arc(x, y, size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.15})`;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
                ctx.fill();
            });
        }

        // ========== GLITCH BARS (intermittent) ==========
        const glitchIntensity = clamp((p - 0.15) / 0.7);
        if (glitchIntensity > 0) {
            // Glitch fires in bursts based on scroll position
            const glitchTrigger = Math.sin(p * 40) * Math.sin(p * 17);
            if (glitchTrigger > 0.3) {
                const barCount = Math.floor(2 + glitchIntensity * 4);
                for (let i = 0; i < barCount; i++) {
                    const y = Math.random() * H;
                    const h = 1 + Math.random() * 4 * glitchIntensity;
                    const offset = (Math.random() - 0.5) * 20 * glitchIntensity;
                    const color = colors[colorKeys[Math.floor(Math.random() * 3)]];
                    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.15 * glitchIntensity})`;
                    ctx.fillRect(offset, y, W, h);
                }
            }
        }

        // ========== VORTEX SPIRAL (phase 2+) ==========
        const spiralProgress = easeInOutQuad(clamp((p - 0.3) / 0.5));
        if (spiralProgress > 0) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(time * 0.3 * spiralProgress);

            const spiralTurns = 3;
            const segments = 80;
            ctx.beginPath();
            for (let i = 0; i < segments; i++) {
                const t = i / segments;
                const angle = t * Math.PI * 2 * spiralTurns;
                const r = t * maxR * 0.6 * spiralProgress;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            const spiralColor = colors.primary;
            ctx.strokeStyle = `rgba(${spiralColor[0]}, ${spiralColor[1]}, ${spiralColor[2]}, ${0.08 * spiralProgress})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }

        // ========== BRIGHT FLASH at end ==========
        if (p > 0.8) {
            const flashT = clamp((p - 0.8) / 0.2);
            const flashAlpha = easeOutCubic(flashT) * 0.4;
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.fillRect(0, 0, W, H);
        }

        // ========== EDGE FADE — seamless blending ==========
        // Erase top & bottom edges of the canvas with a gradient
        // so borders dissolve smoothly into surrounding sections.
        const topEdge = H * 0.18;
        const botEdge = H * 0.35; // Much larger bottom fade for smooth entry into Projects
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';

        const mainBg2 = colors.bg || [0, 0, 0];

        // Top edge: opaque→transparent (erases top to reveal bg behind)
        const topGrad = ctx.createLinearGradient(0, 0, 0, topEdge);
        topGrad.addColorStop(0, `rgba(${mainBg2[0]}, ${mainBg2[1]}, ${mainBg2[2]}, 1)`);
        topGrad.addColorStop(1, `rgba(${mainBg2[0]}, ${mainBg2[1]}, ${mainBg2[2]}, 0)`);
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, W, topEdge);

        // Bottom edge: transparent→opaque (erases bottom to reveal bg behind)
        const botGrad = ctx.createLinearGradient(0, H - botEdge, 0, H);
        botGrad.addColorStop(0, `rgba(${mainBg2[0]}, ${mainBg2[1]}, ${mainBg2[2]}, 0)`);
        botGrad.addColorStop(0.7, `rgba(${mainBg2[0]}, ${mainBg2[1]}, ${mainBg2[2]}, 0.6)`);
        botGrad.addColorStop(1, `rgba(${mainBg2[0]}, ${mainBg2[1]}, ${mainBg2[2]}, 1)`);
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, H - botEdge, W, botEdge);

        ctx.restore();
    }, []);

    /* ---- Visibility tracking (pause rAF when off-screen) ---- */
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
                stateRef.current.time += 0.016; // ~60fps time step
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
            const progress = clamp((windowH - rect.top) / (windowH + sectionH));
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
