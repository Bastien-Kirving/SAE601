/**
 * SpotTransition.jsx — "The Spot" Scroll-Driven Transition
 *
 * Inspired by The Spot villain from Spider-Man: Across the Spider-Verse.
 * Black dimensional portals (spots) appear, grow, merge, and consume
 * the entire screen as the user scrolls between Projects → Skills.
 *
 *   Phase 1 (0→0.20): Apparition — small spots fade in, float gently
 *   Phase 2 (0.20→0.50): Croissance — spots grow, pulse, ink particles eject
 *   Phase 3 (0.50→0.80): Fusion — spots merge into larger masses, dimensional cracks
 *   Phase 4 (0.80→1.0): Consommation — everything goes black, white flash, rebuild
 *
 * Architecture: identical to DimensionalRift.jsx (sticky canvas + scroll progress)
 */

import { useRef, useEffect, useCallback } from 'react';
import './SpotTransition.css';

/* ============================================
   COLOR THEMES
   ============================================ */
const THEMES = {
    miles: {
        glow: [255, 23, 68],        // Red
        glowAlt: [224, 64, 251],     // Purple
        accent: [255, 152, 0],       // Orange
        ink: [20, 5, 5],             // Dark red-tinted ink
        bg: [8, 8, 16],
        flash: [255, 23, 68],
    },
    gwen: {
        glow: [224, 64, 251],        // Pink
        glowAlt: [0, 229, 255],      // Cyan
        accent: [255, 255, 255],     // White
        ink: [30, 10, 35],           // Dark purple ink
        bg: [250, 250, 255],
        flash: [224, 64, 251],
    },
    glitch: {
        glow: [0, 255, 0],          // Green
        glowAlt: [255, 0, 255],      // Magenta
        accent: [255, 255, 0],       // Yellow
        ink: [0, 10, 0],            // Dark green ink
        bg: [5, 5, 16],
        flash: [0, 255, 0],
    },
};

/* ============================================
   MATH HELPERS
   ============================================ */
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min = 0, max = 1) { return Math.min(max, Math.max(min, v)); }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function easeInQuart(t) { return t * t * t * t; }

/* ============================================
   SEEDED RANDOM (deterministic spots layout)
   ============================================ */
function seededRandom(seed) {
    let s = seed;
    return function () {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function SpotTransition({ theme = 'miles' }) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const scrollProgress = useRef(0);
    const animRef = useRef(null);
    const isVisibleRef = useRef(false);
    const stateRef = useRef({
        time: 0,
        spots: [],
        inkParticles: [],
        cracks: [],
        mergeGroupAvg: [],
        initialized: false,
    });

    /* ---- Initialize entities ---- */
    const initEntities = useCallback((W, H) => {
        const state = stateRef.current;
        const rng = seededRandom(42);

        // === SPOTS (dimensional portals) ===
        state.spots = [];
        const spotCount = 10;
        for (let i = 0; i < spotCount; i++) {
            const t = i / spotCount;
            state.spots.push({
                // Position (spread across canvas)
                x: 0.1 + rng() * 0.8,        // 10%–90% of width
                y: 0.1 + rng() * 0.8,        // 10%–90% of height
                // Shape
                baseRadius: 15 + rng() * 40,  // 15–55 px base
                maxRadius: 80 + rng() * 180,  // max growth size
                ellipseRatio: 0.7 + rng() * 0.6, // elliptical distortion
                rotation: rng() * Math.PI * 2,
                // Animation
                pulseSpeed: 0.5 + rng() * 1.5,
                pulsePhase: rng() * Math.PI * 2,
                driftX: (rng() - 0.5) * 0.3,
                driftY: (rng() - 0.5) * 0.3,
                // Appearance timing (staggered entrance)
                appearAt: t * 0.15,           // spots appear between 0→0.15 scroll
                // Merge group (some spots merge together in phase 3)
                mergeGroup: Math.floor(i / 3),
            });
        }

        // === INK PARTICLES ===
        state.inkParticles = [];
        for (let i = 0; i < 30; i++) {
            // Each particle is associated with a random spot
            const parentSpot = Math.floor(rng() * spotCount);
            state.inkParticles.push({
                parentSpot,
                angle: rng() * Math.PI * 2,
                speed: 0.3 + rng() * 2,
                size: 1 + rng() * 4,
                life: 0.3 + rng() * 0.7,
                offset: rng() * Math.PI * 2,
                decay: 0.5 + rng() * 0.5,
            });
        }

        // === DIMENSIONAL CRACKS ===
        state.cracks = [];
        for (let i = 0; i < 8; i++) {
            const segments = 4 + Math.floor(rng() * 6);
            const points = [];
            let px = rng() * W;
            let py = rng() * H;
            for (let s = 0; s < segments; s++) {
                px += (rng() - 0.5) * 120;
                py += (rng() - 0.5) * 80;
                points.push({ x: px / W, y: py / H });
            }
            state.cracks.push({
                points,
                width: 0.5 + rng() * 2,
                glowWidth: 3 + rng() * 6,
                appearAt: 0.35 + rng() * 0.3,
                colorIdx: Math.floor(rng() * 2), // 0=glow, 1=glowAlt
            });
        }

        // Pre-compute merge group averages (avoids per-frame filter+reduce)
        const groupCount = Math.ceil(spotCount / 3);
        state.mergeGroupAvg = [];
        for (let g = 0; g < groupCount; g++) {
            const groupSpots = state.spots.filter(s => s.mergeGroup === g);
            state.mergeGroupAvg[g] = {
                x: groupSpots.reduce((a, s) => a + s.x, 0) / groupSpots.length,
                y: groupSpots.reduce((a, s) => a + s.y, 0) / groupSpots.length,
            };
        }

        state.initialized = true;
    }, []);

    /* ---- Draw frame ---- */
    const draw = useCallback((ctx, W, H, colors) => {
        const state = stateRef.current;
        const p = scrollProgress.current;
        const time = state.time;

        ctx.clearRect(0, 0, W, H);

        // === BACKGROUND ===
        // Fade in from transparent, fade to black at end
        const bgAlpha = p < 0.08 ? p / 0.08 : 1;
        const darken = clamp((p - 0.5) / 0.4); // progressively darken in phase 3+
        const bg = colors.bg;
        ctx.fillStyle = `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, ${bgAlpha * 0.85})`;
        ctx.fillRect(0, 0, W, H);

        // Extra darkness overlay in late phases
        if (darken > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${darken * 0.6})`;
            ctx.fillRect(0, 0, W, H);
        }

        // === PHASE 1+2+3: DIMENSIONAL SPOTS ===
        state.spots.forEach((spot, i) => {
            const localP = clamp((p - spot.appearAt) / (1 - spot.appearAt));
            if (localP <= 0) return;

            // --- Size progression ---
            // Phase 1: small, Phase 2: growing, Phase 3: merging (big), Phase 4: massive
            let sizeFactor;
            if (p < 0.2) {
                sizeFactor = easeOutCubic(clamp(p / 0.2)) * 0.3;
            } else if (p < 0.5) {
                sizeFactor = 0.3 + easeInOutQuad(clamp((p - 0.2) / 0.3)) * 0.4;
            } else if (p < 0.8) {
                sizeFactor = 0.7 + easeInOutQuad(clamp((p - 0.5) / 0.3)) * 0.3;
            } else {
                sizeFactor = 1.0 + easeInQuart(clamp((p - 0.8) / 0.2)) * 2.0;
            }

            // Pulse
            const pulse = 1 + Math.sin(time * spot.pulseSpeed + spot.pulsePhase) * 0.12 * sizeFactor;
            const radius = lerp(spot.baseRadius, spot.maxRadius, sizeFactor) * pulse;

            // Position with drift
            const drift = Math.min(1, p * 2);
            const cx = (spot.x + Math.sin(time * 0.5 + spot.driftX * 10) * spot.driftX * drift) * W;
            const cy = (spot.y + Math.cos(time * 0.4 + spot.driftY * 10) * spot.driftY * drift) * H;

            // Merge: in phase 3, spots in same group migrate toward each other
            let mergeX = cx, mergeY = cy;
            if (p > 0.5) {
                const mergeT = easeInOutQuad(clamp((p - 0.5) / 0.3));
                const avg = state.mergeGroupAvg[spot.mergeGroup];
                if (avg) {
                    mergeX = lerp(cx, avg.x * W, mergeT * 0.4);
                    mergeY = lerp(cy, avg.y * H, mergeT * 0.4);
                }
            }

            ctx.save();
            ctx.translate(mergeX, mergeY);
            ctx.rotate(spot.rotation + time * 0.1 * (i % 2 === 0 ? 1 : -1));
            ctx.scale(1, spot.ellipseRatio);

            // --- Outer glow (cercles concentriques, pas de gradient radial) ---
            const glowColor = i % 2 === 0 ? colors.glow : colors.glowAlt;
            const glowAlpha = clamp(localP * 0.6) * (1 - clamp((p - 0.85) / 0.15));
            const glowRadius = radius * 1.8;

            ctx.beginPath();
            ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, ${glowAlpha * 0.1})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, ${glowAlpha * 0.25})`;
            ctx.fill();

            // --- Spot border (bright ring) ---
            const borderAlpha = clamp(localP * 0.8) * (1 - clamp((p - 0.85) / 0.15));
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, ${borderAlpha * 0.6})`;
            ctx.lineWidth = 2 + sizeFactor * 2;
            ctx.stroke();

            // --- Inner black portal (fill simple, pas de gradient radial) ---
            const portalAlpha = clamp(localP);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${portalAlpha})`;
            ctx.fill();
            // Anneau ink près du bord
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${colors.ink[0]}, ${colors.ink[1]}, ${colors.ink[2]}, ${portalAlpha * 0.5})`;
            ctx.fill();

            // --- Inner dimension effect (swirling pattern inside portal) ---
            if (sizeFactor > 0.3) {
                const innerAlpha = (sizeFactor - 0.3) * 0.4;
                const spiralCount = 3;
                ctx.fillStyle = `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, ${innerAlpha * 0.1})`;
                for (let s = 0; s < spiralCount; s++) {
                    const sAngle = (s / spiralCount) * Math.PI * 2 + time * 0.8;
                    const sR = radius * 0.6;
                    const sx = Math.cos(sAngle) * sR * 0.4;
                    const sy = Math.sin(sAngle) * sR * 0.4;
                    ctx.beginPath();
                    ctx.arc(sx, sy, sR * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();
        });

        // === INK SPLATTER PARTICLES (Phase 2+) ===
        const inkProgress = clamp((p - 0.15) / 0.5);
        if (inkProgress > 0) {
            state.inkParticles.forEach((ink) => {
                const parentSpot = state.spots[ink.parentSpot];
                if (!parentSpot) return;

                const spotLocalP = clamp((p - parentSpot.appearAt) / (1 - parentSpot.appearAt));
                if (spotLocalP < 0.3) return;

                const drift = Math.min(1, p * 2);
                const spotX = (parentSpot.x + Math.sin(time * 0.5 + parentSpot.driftX * 10) * parentSpot.driftX * drift) * W;
                const spotY = (parentSpot.y + Math.cos(time * 0.4 + parentSpot.driftY * 10) * parentSpot.driftY * drift) * H;

                // Ink flies outward from spot edge
                const currentAngle = ink.angle + time * 0.3;
                const ejectionDist = (30 + ink.speed * 60 * inkProgress) * (0.5 + Math.sin(time * ink.speed + ink.offset) * 0.5);
                const ix = spotX + Math.cos(currentAngle) * ejectionDist;
                const iy = spotY + Math.sin(currentAngle) * ejectionDist;

                if (ix < -20 || ix > W + 20 || iy < -20 || iy > H + 20) return;

                const alpha = inkProgress * ink.life * (1 - clamp((p - 0.85) / 0.15));
                const size = ink.size * (1 + inkProgress * 2);

                // Ink blob (irregular shape)
                ctx.save();
                ctx.translate(ix, iy);
                ctx.rotate(time * ink.speed);

                // Dark splatter
                ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
                ctx.beginPath();
                ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();

                // Colored edge glow
                const glowColor = ink.parentSpot % 2 === 0 ? colors.glow : colors.glowAlt;
                ctx.fillStyle = `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, ${alpha * 0.3})`;
                ctx.beginPath();
                ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });
        }

        // === DIMENSIONAL CRACKS (Phase 3+) ===
        state.cracks.forEach((crack) => {
            const crackP = clamp((p - crack.appearAt) / 0.3);
            if (crackP <= 0) return;

            const crackAlpha = easeOutCubic(crackP) * 0.7 * (1 - clamp((p - 0.9) / 0.1));
            const colorArr = crack.colorIdx === 0 ? colors.glow : colors.glowAlt;

            // How many segments to draw (progressive reveal)
            const segsToDraw = Math.ceil(crack.points.length * crackP);

            // Glow pass
            ctx.beginPath();
            for (let i = 0; i < segsToDraw && i < crack.points.length; i++) {
                const pt = crack.points[i];
                // Add jitter in phase 3+
                const jitter = p > 0.5 ? Math.sin(time * 5 + i) * 3 * (p - 0.5) : 0;
                const x = pt.x * W + jitter;
                const y = pt.y * H;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(${colorArr[0]}, ${colorArr[1]}, ${colorArr[2]}, ${crackAlpha * 0.3})`;
            ctx.lineWidth = crack.glowWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Sharp crack line
            ctx.beginPath();
            for (let i = 0; i < segsToDraw && i < crack.points.length; i++) {
                const pt = crack.points[i];
                const jitter = p > 0.5 ? Math.sin(time * 5 + i) * 3 * (p - 0.5) : 0;
                const x = pt.x * W + jitter;
                const y = pt.y * H;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(255, 255, 255, ${crackAlpha * 0.5})`;
            ctx.lineWidth = crack.width;
            ctx.stroke();
        });

        // === GLITCH DISTORTION BARS (Phase 3+) ===
        const glitchIntensity = clamp((p - 0.4) / 0.4);
        if (glitchIntensity > 0) {
            const trigger = Math.sin(p * 35) * Math.sin(p * 19);
            if (trigger > 0.2) {
                const barCount = Math.floor(2 + glitchIntensity * 5);
                for (let i = 0; i < barCount; i++) {
                    const y = Math.random() * H;
                    const h = 1 + Math.random() * 3 * glitchIntensity;
                    const offset = (Math.random() - 0.5) * 15 * glitchIntensity;
                    const colorArr = i % 2 === 0 ? colors.glow : colors.glowAlt;
                    ctx.fillStyle = `rgba(${colorArr[0]}, ${colorArr[1]}, ${colorArr[2]}, ${0.12 * glitchIntensity})`;
                    ctx.fillRect(offset, y, W, h);
                }
            }
        }

        // === PHASE 4: FULL SCREEN CONSUMPTION ===
        if (p > 0.75) {
            const consumeT = easeInQuart(clamp((p - 0.75) / 0.2));

            // Black overtake
            ctx.fillStyle = `rgba(0, 0, 0, ${consumeT * 0.9})`;
            ctx.fillRect(0, 0, W, H);

            // Glow résiduel — un seul overlay centré au lieu de 14 gradients individuels
            if (consumeT < 0.7) {
                const ga = (1 - consumeT) * 0.35;
                const gr = W * 0.6;
                const gc = colors.glow;
                const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, gr);
                g.addColorStop(0, `rgba(${gc[0]}, ${gc[1]}, ${gc[2]}, ${ga})`);
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, W, H);
            }
        }

        // === WHITE FLASH at end ===
        if (p > 0.88) {
            const flashT = clamp((p - 0.88) / 0.12);
            const flashColor = colors.flash;
            // Quick flash peak then fade
            const flashAlpha = flashT < 0.4
                ? easeOutCubic(flashT / 0.4) * 0.5
                : (1 - easeOutCubic((flashT - 0.4) / 0.6)) * 0.5;
            ctx.fillStyle = `rgba(${flashColor[0]}, ${flashColor[1]}, ${flashColor[2]}, ${flashAlpha * 0.4})`;
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.3})`;
            ctx.fillRect(0, 0, W, H);
        }

        // === EDGE FADE (seamless blending) ===
        const topEdge = H * 0.15;
        const botEdge = H * 0.30;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';

        const topGrad = ctx.createLinearGradient(0, 0, 0, topEdge);
        topGrad.addColorStop(0, 'rgba(0,0,0,1)');
        topGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, W, topEdge);

        const botGrad = ctx.createLinearGradient(0, H - botEdge, 0, H);
        botGrad.addColorStop(0, 'rgba(0,0,0,0)');
        botGrad.addColorStop(0.7, 'rgba(0,0,0,0.6)');
        botGrad.addColorStop(1, 'rgba(0,0,0,1)');
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
            const progress = clamp((windowH - rect.top) / (windowH + sectionH));
            scrollProgress.current = progress;
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="spot-transition" ref={containerRef}>
            <canvas ref={canvasRef} className="spot-transition__canvas" />
        </div>
    );
}
