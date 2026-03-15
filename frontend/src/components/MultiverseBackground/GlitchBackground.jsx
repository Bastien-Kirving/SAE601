/**
 * GlitchBackground.jsx — Animated Spider Web Background
 *
 * Continuously animated spider web:
 *  - Slow rotation of the entire web
 *  - Breathing/pulsing (expand & contract)
 *  - Wave ripples along rings
 *  - Strands shimmer with traveling light
 *  - Energy dots race along strands
 *  - Periodic glitch distortion
 */

import { useRef, useEffect, memo } from 'react';
import './GlitchBackground.css';

const PALETTES = {
    miles: {
        bg: '#0a0a14',
        web: [255, 255, 255],
        glow: [255, 23, 68],
        secondary: [0, 229, 255],
        particles: ['rgba(255,23,68,0.35)', 'rgba(0,229,255,0.25)', 'rgba(224,64,251,0.2)'],
    },
    gwen: {
        bg: '#f5f5fc', // Very light background
        web: [100, 100, 100], // Darker grey for web to be visible on light bg
        glow: [224, 64, 251],
        secondary: [0, 229, 255],
        particles: ['rgba(224,64,251,0.35)', 'rgba(0,229,255,0.25)', 'rgba(100,100,100,0.15)'],
    },
    glitch: {
        bg: '#050510',
        web: [255, 255, 255],
        glow: [0, 255, 0],
        secondary: [255, 0, 255],
        particles: ['rgba(0,255,0,0.35)', 'rgba(255,0,255,0.25)', 'rgba(255,255,0,0.2)'],
    },
};

const RADIAL_COUNT = 20;
const RING_COUNT = 10;
const ENERGY_DOT_COUNT = 8;
const PARTICLE_COUNT = 30;

function hexToRgbObj(hex) {
    if (!hex) return { r: 255, g: 255, b: 255 };
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const bigint = parseInt(hex, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

// ---- Floating particle ----
class FloatingDot {
    constructor(W, H, colors) {
        this.W = W; this.H = H;
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = 0.5 + Math.random() * 2;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.baseAlpha = 0.15 + Math.random() * 0.35;
        this.pulseSpeed = 0.5 + Math.random() * 1.5;
        this.offset = Math.random() * Math.PI * 2;
    }
    update(time) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -10) this.x = this.W + 10;
        if (this.x > this.W + 10) this.x = -10;
        if (this.y < -10) this.y = this.H + 10;
        if (this.y > this.H + 10) this.y = -10;
        this.alpha = this.baseAlpha + Math.sin(time * this.pulseSpeed + this.offset) * 0.12;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ---- Energy dot traveling on web ----
class EnergyDot {
    constructor() {
        this.reset();
    }
    reset() {
        this.strandIndex = Math.floor(Math.random() * RADIAL_COUNT);
        this.t = 0; // 0 = center, 1 = edge
        this.speed = 0.15 + Math.random() * 0.3; // progress per second
        this.size = 2 + Math.random() * 3;
        this.direction = 1; // 1 = outward, -1 = inward
    }
    update(dt) {
        this.t += this.speed * dt * this.direction;
        if (this.t > 1) {
            this.direction = -1; // bounce back
        }
        if (this.t < 0) {
            this.reset(); // restart on new strand
        }
    }
    draw(ctx, cx, cy, maxRadius, rotation, color) {
        const angle = (this.strandIndex / RADIAL_COUNT) * Math.PI * 2 + rotation;
        const r = this.t * maxRadius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        // Glow halo (simple circles — no gradient creation per frame)
        ctx.beginPath();
        ctx.arc(x, y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},0.12)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},0.3)`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

const GlitchBackground = memo(function GlitchBackground({ opacity = 1, theme = 'miles', themeData }) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let isVisible = true;
        let config = PALETTES[theme] || PALETTES.miles;
        if (themeData) {
            const p = hexToRgbObj(themeData.primary_color);
            const s = hexToRgbObj(themeData.secondary_color);
            const pb = [p.r, p.g, p.b];
            const sb = [s.r, s.g, s.b];
            config = {
                bg: themeData.bg_color || '#000000',
                web: theme === 'gwen' ? [100, 100, 100] : [255, 255, 255],
                glow: pb,
                secondary: sb,
                particles: [
                    `rgba(${pb[0]},${pb[1]},${pb[2]},0.35)`,
                    `rgba(${sb[0]},${sb[1]},${sb[2]},0.25)`,
                    `rgba(${pb[0]},${pb[1]},${pb[2]},0.2)`
                ]
            };
        }

        let W, H, cx, cy, maxRadius;

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            cx = W / 2;
            cy = H / 2;
            maxRadius = Math.sqrt(cx * cx + cy * cy) * 1.05;
        }
        resize();

        const container = canvas.parentElement;
        if (container) container.style.backgroundColor = config.bg;

        // Réduire les entités sur mobile
        const isMobile = window.innerWidth <= 768;
        const particleCount  = isMobile ? 12 : PARTICLE_COUNT;
        const energyDotCount = isMobile ? 3  : ENERGY_DOT_COUNT;

        // Entities
        const dots = Array.from({ length: particleCount }, () => new FloatingDot(W, H, config.particles));
        const energyDots = Array.from({ length: energyDotCount }, () => {
            const e = new EnergyDot();
            e.t = Math.random(); // stagger
            return e;
        });

        // Glitch state
        let glitchActive = false;
        let glitchEnd = 0;
        let nextGlitch = 2 + Math.random() * 3;
        let glitchOffsets = [];

        let startTime = null;
        let lastTime = 0;

        // Pause le rendu quand le composant est hors écran
        const visibilityObserver = new IntersectionObserver(
            ([entry]) => { isVisible = entry.isIntersecting; },
            { threshold: 0 }
        );
        visibilityObserver.observe(canvas);

        function animate(timestamp) {
            if (!isVisible) {
                animRef.current = requestAnimationFrame(animate);
                return;
            }
            if (!startTime) startTime = timestamp;
            const time = (timestamp - startTime) / 1000;
            const dt = Math.min(0.05, time - lastTime);
            lastTime = time;

            ctx.clearRect(0, 0, W, H);

            // ---- Animations ----
            const rotation = time * 0.02;                           // Slow rotation
            const breathe = 1 + Math.sin(time * 0.4) * 0.03;      // Breathing scale
            const waveTime = time * 1.5;                            // Wave speed

            // ---- Glitch trigger ----
            if (time > nextGlitch && !glitchActive) {
                glitchActive = true;
                glitchEnd = time + 0.06 + Math.random() * 0.12;
                glitchOffsets = Array.from({ length: RADIAL_COUNT }, () => (Math.random() - 0.5) * 25);
                nextGlitch = time + 2 + Math.random() * 4;
            }
            if (time > glitchEnd) glitchActive = false;

            // ═══════════════════════════════════════
            // DRAW SPIDER WEB
            // ═══════════════════════════════════════

            ctx.save();

            // ---- Radial strands ----
            for (let i = 0; i < RADIAL_COUNT; i++) {
                const angle = (i / RADIAL_COUNT) * Math.PI * 2 + rotation;
                const glitchOff = glitchActive ? glitchOffsets[i] : 0;

                // Shimmer: a traveling light pulse along each strand
                const shimmer = 0.5 + Math.sin(time * 2 + i * 0.8) * 0.3;

                const endX = cx + Math.cos(angle) * maxRadius * breathe + glitchOff;
                const endY = cy + Math.sin(angle) * maxRadius * breathe;

                // Main strand
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = `rgba(${config.web[0]},${config.web[1]},${config.web[2]},${0.06 * shimmer})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Glow strand
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = `rgba(${config.glow[0]},${config.glow[1]},${config.glow[2]},${0.02 * shimmer})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // ---- Concentric rings with wave ripple ----
            for (let r = 1; r <= RING_COUNT; r++) {
                const baseRadius = (r / RING_COUNT) * maxRadius * 0.85 * breathe;
                const ringWave = Math.sin(waveTime - r * 0.5) * 4; // ripple outward
                const ringRadius = baseRadius + ringWave;

                // Ring pulse (closer rings brighter)
                const ringAlpha = 0.04 + (1 - r / RING_COUNT) * 0.04 + Math.sin(time * 0.5 + r) * 0.015;
                const glitchWobble = glitchActive ? (Math.random() - 0.5) * 10 : 0;

                ctx.beginPath();
                for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
                    // Organic irregularity at spoke intersections
                    const spokeInfluence = Math.cos(a * RADIAL_COUNT / 2 + rotation * RADIAL_COUNT) * 0.015;
                    const px = cx + Math.cos(a + rotation) * ringRadius * (1 + spokeInfluence) + glitchWobble;
                    const py = cy + Math.sin(a + rotation) * ringRadius * (1 + spokeInfluence);
                    if (a === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = `rgba(${config.web[0]},${config.web[1]},${config.web[2]},${ringAlpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();

                // Ring glow
                ctx.strokeStyle = `rgba(${config.glow[0]},${config.glow[1]},${config.glow[2]},${ringAlpha * 0.3})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.restore();

            // ---- Glitch color flash ----
            if (glitchActive) {
                ctx.save();
                ctx.globalAlpha = 0.05;
                ctx.fillStyle = `rgba(${config.glow[0]},${config.glow[1]},${config.glow[2]},1)`;
                ctx.fillRect(-3, 0, W, H);
                ctx.fillStyle = `rgba(${config.secondary[0]},${config.secondary[1]},${config.secondary[2]},1)`;
                ctx.fillRect(3, 0, W, H);
                ctx.restore();
            }

            // ---- Energy dots ----
            energyDots.forEach(e => {
                e.update(dt);
                e.draw(ctx, cx, cy, maxRadius * breathe, rotation, config.glow);
            });

            // ---- Floating particles ----
            dots.forEach(d => { d.update(time); d.draw(ctx); });

            animRef.current = requestAnimationFrame(animate);
        }

        animRef.current = requestAnimationFrame(animate);
        window.addEventListener('resize', resize);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', resize);
            visibilityObserver.disconnect();
        };
    }, [theme, themeData]);

    return (
        <div className="glitch-bg-container" style={{ opacity }}>
            <canvas ref={canvasRef} className="glitch-bg-canvas" />
            <div className="glitch-bg-vignette" />
        </div>
    );
});

export default GlitchBackground;
