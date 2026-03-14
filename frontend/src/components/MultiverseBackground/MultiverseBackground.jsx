/**
 * MultiverseBackground.jsx — Space-Time Tunnel / Multiverse Warp
 *
 * Effect: Flying through a dimensional vortex
 * Adapts to 3 themes: Miles, Gwen, Glitch
 */

import { useRef, useEffect, useMemo, memo } from 'react';
import './MultiverseBackground.css';

// ============================================
// COLOR PALETTES
// ============================================
const PALETTES = {
    miles: {
        bg: ['#0a0510', '#060308', '#020102'], // Dark Red/Black
        rings: [
            { r: 255, g: 23, b: 68 },   // Deep Red
            { r: 255, g: 152, b: 0 },   // Orange
            { r: 224, g: 64, b: 251 },  // Purple
            { r: 255, g: 50, b: 120 },  // Hot Pink
            { r: 0, g: 229, b: 255 }    // Cyan
        ],
        lines: [
            { r: 255, g: 23, b: 68 },
            { r: 255, g: 152, b: 0 },
            { r: 224, g: 64, b: 251 },
            { r: 0, g: 229, b: 255 },
            { r: 255, g: 255, b: 255 }
        ],
        nebula: [
            { color: { r: 255, g: 23, b: 68 }, x: -0.2, y: -0.1 },
            { color: { r: 224, g: 64, b: 251 }, x: 0.2, y: 0.15 },
            { color: { r: 255, g: 152, b: 0 }, x: 0.0, y: -0.2 },
            { color: { r: 0, g: 229, b: 255 }, x: -0.1, y: 0.2 }
        ],
        core: [
            { r: 255, g: 255, b: 255 }, // Inner
            { r: 255, g: 152, b: 0 },   // Mid
            { r: 255, g: 23, b: 68 },   // Outer
            { r: 224, g: 64, b: 251 }   // OuterOuter
        ]
    },
    gwen: {
        bg: ['#fdf5ff', '#f5fbff', '#ffffff'], // Very soft Pink/Cyan/White
        rings: [
            { r: 224, g: 64, b: 251 },  // Pink
            { r: 0, g: 229, b: 255 },   // Cyan
            { r: 255, g: 255, b: 255 }, // White
            { r: 128, g: 216, b: 255 }, // Light Cyan
            { r: 245, g: 0, b: 87 }     // Deep Pink
        ],
        lines: [
            { r: 0, g: 229, b: 255 },
            { r: 224, g: 64, b: 251 },
            { r: 255, g: 255, b: 255 }
        ],
        nebula: [
            { color: { r: 224, g: 64, b: 251 }, x: -0.2, y: -0.1 }, // Pink
            { color: { r: 0, g: 229, b: 255 }, x: 0.2, y: 0.15 },   // Cyan
            { color: { r: 255, g: 255, b: 255 }, x: 0.0, y: -0.2 }, // White
            { color: { r: 245, g: 0, b: 87 }, x: -0.1, y: 0.2 }     // Deep Pink
        ],
        core: [
            { r: 255, g: 255, b: 255 },
            { r: 0, g: 229, b: 255 },
            { r: 224, g: 64, b: 251 },
            { r: 255, g: 255, b: 255 } // Contrast ring (white for light mode)
        ]
    },
    glitch: {
        bg: ['#050510', '#0a0a18', '#0f0f20'],
        rings: [
            { r: 0, g: 255, b: 0 },     // Green
            { r: 255, g: 0, b: 255 },   // Magenta
            { r: 255, g: 255, b: 0 },   // Yellow
            { r: 0, g: 255, b: 255 },   // Cyan
            { r: 255, g: 255, b: 255 }  // White
        ],
        lines: [
            { r: 0, g: 255, b: 0 },
            { r: 255, g: 0, b: 255 },
            { r: 255, g: 255, b: 0 }
        ],
        nebula: [
            { color: { r: 0, g: 255, b: 0 }, x: -0.2, y: -0.1 },
            { color: { r: 255, g: 0, b: 255 }, x: 0.2, y: 0.15 },
            { color: { r: 50, g: 50, b: 50 }, x: 0.0, y: -0.2 }
        ],
        core: [
            { r: 255, g: 255, b: 255 },
            { r: 0, g: 255, b: 0 },
            { r: 255, g: 0, b: 255 },
            { r: 0, g: 0, b: 0 }
        ]
    }
};

function rgba(c, a) {
    return `rgba(${c.r},${c.g},${c.b},${a})`;
}

function hexToRgbObj(hex) {
    if (!hex) return { r: 255, g: 255, b: 255 };
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const bigint = parseInt(hex, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

// ============================================
// ENTITY CLASSES
// ============================================

class TunnelRing {
    constructor(cx, cy, maxR, colors) {
        this.cx = cx; this.cy = cy; this.maxR = maxR;
        this.colors = colors;
        this.reset(true);
    }
    reset(initial = false) {
        this.z = initial ? Math.random() : 0;
        this.speed = 0.003 + Math.random() * 0.004;
        this.sides = Math.random() < 0.5 ? 6 : 8;
        this.rotationOffset = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.005;
        this.colorIdx = Math.floor(Math.random() * this.colors.length);
        this.thickness = 1 + Math.random() * 2;
        this.glowSize = 5 + Math.random() * 15;
    }
    resize(cx, cy, maxR) { this.cx = cx; this.cy = cy; this.maxR = maxR; }
    update() {
        this.z += this.speed;
        this.rotationOffset += this.rotSpeed;
        if (this.z > 1.1) this.reset();
    }
    draw(ctx) {
        const scale = this.z * this.z;
        const radius = 5 + scale * this.maxR;
        const alpha = Math.sin(this.z * Math.PI) * 0.8;
        if (alpha < 0.01) return;
        const col = this.colors[this.colorIdx];
        ctx.save();
        ctx.translate(this.cx, this.cy);
        ctx.rotate(this.rotationOffset);
        ctx.strokeStyle = rgba(col, alpha);
        ctx.lineWidth = this.thickness * (0.5 + scale * 1.5);
        ctx.beginPath();
        for (let i = 0; i <= this.sides; i++) {
            const angle = (i / this.sides) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
}

class SpeedLine {
    constructor(cx, cy, maxR, colors) {
        this.cx = cx; this.cy = cy; this.maxR = maxR;
        this.colors = colors;
        this.reset(true);
    }
    reset(initial = false) {
        this.angle = Math.random() * Math.PI * 2;
        this.z = initial ? Math.random() : 0;
        this.speed = 0.005 + Math.random() * 0.01;
        this.length = 0.03 + Math.random() * 0.08;
        this.width = 0.5 + Math.random() * 1.5;
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    resize(cx, cy, maxR) { this.cx = cx; this.cy = cy; this.maxR = maxR; }
    update() {
        this.z += this.speed * (0.5 + this.z * 2);
        if (this.z > 1.2) this.reset();
    }
    draw(ctx) {
        const z1 = this.z;
        const z2 = Math.max(0, this.z - this.length);
        const r1 = z1 * z1 * this.maxR;
        const r2 = z2 * z2 * this.maxR;
        const alpha = Math.sin(z1 * Math.PI) * 0.7;
        if (alpha < 0.01) return;
        const x1 = this.cx + Math.cos(this.angle) * r1;
        const y1 = this.cy + Math.sin(this.angle) * r1;
        const x2 = this.cx + Math.cos(this.angle) * r2;
        const y2 = this.cy + Math.sin(this.angle) * r2;
        // Wider transparent stroke for glow effect without shadowBlur
        ctx.beginPath();
        ctx.strokeStyle = rgba(this.color, alpha * 0.25);
        ctx.lineWidth = this.width * (0.5 + z1 * 2) * 3;
        ctx.moveTo(x2, y2);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = rgba(this.color, alpha);
        ctx.lineWidth = this.width * (0.5 + z1 * 2);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    }
}

class WarpParticle {
    constructor(cx, cy, maxR, colors) {
        this.cx = cx; this.cy = cy; this.maxR = maxR;
        this.colors = colors;
        this.reset(true);
    }
    reset(initial = false) {
        this.angle = Math.random() * Math.PI * 2;
        this.z = initial ? Math.random() * 0.8 : 0;
        this.speed = 0.002 + Math.random() * 0.006;
        this.size = 1 + Math.random() * 2;
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.drift = (Math.random() - 0.5) * 0.3;
    }
    resize(cx, cy, maxR) { this.cx = cx; this.cy = cy; this.maxR = maxR; }
    update() {
        this.z += this.speed * (0.3 + this.z * 2);
        this.angle += this.drift * 0.01;
        if (this.z > 1.3) this.reset();
    }
    draw(ctx) {
        const scale = this.z * this.z;
        const r = scale * this.maxR;
        const x = this.cx + Math.cos(this.angle) * r;
        const y = this.cy + Math.sin(this.angle) * r;
        const alpha = Math.sin(this.z * Math.PI) * 0.9;
        const s = this.size * (0.3 + scale * 3);
        if (alpha < 0.01 || s < 0.1) return;
        // Simple concentric circles instead of radial gradient (avoids gradient creation per particle)
        ctx.beginPath(); ctx.fillStyle = rgba(this.color, alpha * 0.12); ctx.arc(x, y, s * 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = rgba(this.color, alpha * 0.25); ctx.arc(x, y, s * 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = rgba(this.color, alpha); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    }
}

class EnergyBeam {
    constructor(cx, cy, maxR, colors) {
        this.cx = cx; this.cy = cy; this.maxR = maxR;
        this.colors = colors;
        this.reset(true);
    }
    reset(initial = false) {
        this.angle = Math.random() * Math.PI * 2;
        this.life = 1;
        this.decay = 0.008 + Math.random() * 0.015;
        this.width = 1 + Math.random() * 3;
        this.length = this.maxR * (0.5 + Math.random() * 0.5);
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.active = !initial && Math.random() < 0.15;
    }
    resize(cx, cy, maxR) { this.cx = cx; this.cy = cy; this.maxR = maxR; }
    update() {
        if (!this.active) {
            if (Math.random() < 0.003) this.active = true;
            return;
        }
        this.life -= this.decay;
        if (this.life <= 0) { this.active = false; this.reset(); }
    }
    draw(ctx) {
        if (!this.active) return;
        const alpha = this.life * 0.6;
        const startR = 20;
        const endR = startR + this.length * this.life;
        const x1 = this.cx + Math.cos(this.angle) * startR;
        const y1 = this.cy + Math.sin(this.angle) * startR;
        const x2 = this.cx + Math.cos(this.angle) * endR;
        const y2 = this.cy + Math.sin(this.angle) * endR;
        ctx.save();
        ctx.strokeStyle = rgba(this.color, alpha * 0.3);
        ctx.lineWidth = this.width * this.life * 4;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = rgba(this.color, alpha);
        ctx.lineWidth = this.width * this.life;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`;
        ctx.lineWidth = this.width * this.life * 0.3;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();
    }
}

// ============================================
// REACT COMPONENT
// ============================================

const RING_COUNT = 14;
const SPEED_LINE_COUNT = 35;
const PARTICLE_COUNT = 40;
const BEAM_COUNT = 8;

// Camera settings
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
        const particles = Array.from({ length: PARTICLE_COUNT }, () => new WarpParticle(cx, cy, maxR, themeConfig.rings)); // reuse rings palette for particles
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
                const size = 0.4 * maxR; // fixed size for simplicity
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
            // Outer
            const g3 = ctx.createRadialGradient(scx, scy, 0, scx, scy, 150 + corePulse * 60);
            g3.addColorStop(0, rgba(cCols[3] || cCols[2], 0.15 * corePulse));
            g3.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.fillStyle = g3; ctx.arc(scx, scy, 250, 0, Math.PI * 2); ctx.fill();
            // Mid
            const g2 = ctx.createRadialGradient(scx, scy, 0, scx, scy, 80 + corePulse * 40);
            g2.addColorStop(0, rgba(cCols[1], 0.3 * corePulse));
            g2.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.fillStyle = g2; ctx.arc(scx, scy, 150, 0, Math.PI * 2); ctx.fill();
            // Inner
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
    }, [theme, themeConfig]); // Re-run when theme changes or theme configuration loads

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
