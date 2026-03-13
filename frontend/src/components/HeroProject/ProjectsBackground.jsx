/**
 * ProjectsBackground.jsx — Spider-Verse Glitch Art Background
 *
 * Inspired by the Across the Spider-Verse visual style:
 *   - Scattered geometric fragments (triangles, rectangles, shards)
 *   - Halftone dot clusters drifting across the screen
 *   - Chromatic aberration / RGB split on shapes
 *   - Digital glitch bars and pixel spray
 *   - Neon glow on dark background
 *   - Theme-adaptive: Miles, Gwen, Glitch
 *
 * @prop {string} theme - 'miles' | 'gwen' | 'glitch'
 */

import { useRef, useEffect } from 'react';

/* ============================================
   COLOR THEMES — Matching BDD
   ============================================ */
const PALETTES = {
    miles: {
        primary: [255, 23, 68],
        secondary: [224, 64, 251],
        accent: [0, 229, 255],
        highlight: [255, 152, 0],
        bg: [5, 5, 12],
    },
    gwen: {
        primary: [224, 64, 251],
        secondary: [0, 229, 255],
        accent: [255, 255, 255],
        highlight: [255, 105, 180],
        bg: [250, 250, 255], // Off-white light mode background
    },
    glitch: {
        primary: [0, 255, 0],
        secondary: [255, 0, 255],
        accent: [255, 255, 0],
        highlight: [0, 255, 255],
        bg: [5, 5, 16],
    },
};

/* ============================================
   GEOMETRIC FRAGMENT
   ============================================ */
class Fragment {
    constructor(W, H, palette) {
        this.W = W;
        this.H = H;
        this.reset(palette);
    }

    reset(palette) {
        this.x = Math.random() * this.W;
        this.y = Math.random() * this.H;
        this.size = 8 + Math.random() * 40;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.01;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.alpha = 0.05 + Math.random() * 0.15;
        this.pulseSpeed = 0.3 + Math.random() * 1;
        this.pulseOffset = Math.random() * Math.PI * 2;
        // Shape: 0=triangle, 1=rectangle, 2=shard, 3=line
        this.shape = Math.floor(Math.random() * 4);
        // Color
        const colors = [palette.primary, palette.secondary, palette.accent, palette.highlight];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        // Chromatic offset for RGB split
        this.chromaticOffset = 1 + Math.random() * 3;
        this.hasChromaticSplit = Math.random() > 0.6;
    }

    update(time) {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;
        if (this.x < -60) this.x = this.W + 60;
        if (this.x > this.W + 60) this.x = -60;
        if (this.y < -60) this.y = this.H + 60;
        if (this.y > this.H + 60) this.y = -60;
        this.currentAlpha = this.alpha * (0.6 + 0.4 * Math.sin(time * this.pulseSpeed + this.pulseOffset));
    }

    drawShape(ctx, offsetX = 0, offsetY = 0) {
        const s = this.size;
        ctx.save();
        ctx.translate(this.x + offsetX, this.y + offsetY);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        if (this.shape === 0) {
            // Triangle
            ctx.moveTo(0, -s / 2);
            ctx.lineTo(s / 2, s / 2);
            ctx.lineTo(-s / 2, s / 2);
            ctx.closePath();
        } else if (this.shape === 1) {
            // Rectangle
            const w = s * (0.5 + Math.random() * 0.3);
            const h = s * (0.3 + Math.random() * 0.2);
            ctx.rect(-w / 2, -h / 2, w, h);
        } else if (this.shape === 2) {
            // Shard / irregular polygon
            ctx.moveTo(0, -s / 2);
            ctx.lineTo(s / 3, -s / 6);
            ctx.lineTo(s / 4, s / 3);
            ctx.lineTo(-s / 5, s / 2);
            ctx.lineTo(-s / 3, 0);
            ctx.closePath();
        } else {
            // Line segment
            ctx.moveTo(-s / 2, 0);
            ctx.lineTo(s / 2, 0);
        }
        ctx.restore();
    }

    draw(ctx) {
        const [r, g, b] = this.color;
        const alpha = Math.max(0, this.currentAlpha);

        // Chromatic aberration (RGB split)
        if (this.hasChromaticSplit && alpha > 0.03) {
            const off = this.chromaticOffset;
            // Red channel offset
            this.drawShape(ctx, -off, -off * 0.5);
            ctx.fillStyle = `rgba(${r}, 0, 0, ${alpha * 0.5})`;
            ctx.fill();
            // Blue channel offset
            this.drawShape(ctx, off, off * 0.5);
            ctx.fillStyle = `rgba(0, 0, ${b || 200}, ${alpha * 0.4})`;
            ctx.fill();
        }

        // Main shape with glow
        this.drawShape(ctx);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Glow stroke
        if (this.shape !== 3) {
            this.drawShape(ctx);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`;
            ctx.lineWidth = 1;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            this.drawShape(ctx);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
}

/* ============================================
   HALFTONE DOT CLUSTER
   ============================================ */
class HalftoneCluster {
    constructor(W, H, palette) {
        this.W = W;
        this.H = H;
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.radius = 40 + Math.random() * 80;
        this.dotSize = 1.5 + Math.random() * 2;
        this.dotSpacing = 6 + Math.random() * 4;
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.rotation = Math.random() * Math.PI;
        this.rotSpeed = (Math.random() - 0.5) * 0.003;
        const colors = [palette.primary, palette.secondary, palette.accent];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 0.04 + Math.random() * 0.08;
        this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(time) {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;
        if (this.x < -100) this.x = this.W + 100;
        if (this.x > this.W + 100) this.x = -100;
        if (this.y < -100) this.y = this.H + 100;
        if (this.y > this.H + 100) this.y = -100;
        this.currentAlpha = this.alpha * (0.5 + 0.5 * Math.sin(time * 0.5 + this.pulseOffset));
    }

    draw(ctx) {
        const [r, g, b] = this.color;
        const alpha = Math.max(0, this.currentAlpha);
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        for (let gx = -this.radius; gx <= this.radius; gx += this.dotSpacing) {
            for (let gy = -this.radius; gy <= this.radius; gy += this.dotSpacing) {
                const dist = Math.sqrt(gx * gx + gy * gy);
                if (dist > this.radius) continue;

                // Rotate the dot grid
                const rx = gx * cos - gy * sin + this.x;
                const ry = gx * sin + gy * cos + this.y;

                // Size falloff from center
                const falloff = 1 - (dist / this.radius);
                const size = this.dotSize * falloff;
                if (size < 0.3) continue;

                ctx.beginPath();
                ctx.arc(rx, ry, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * falloff})`;
                ctx.fill();
            }
        }
    }
}

/* ============================================
   PIXEL SPRAY PARTICLE
   ============================================ */
class PixelSpray {
    constructor(W, H, palette) {
        this.W = W;
        this.H = H;
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.size = 1 + Math.random() * 2;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.alpha = 0.1 + Math.random() * 0.4;
        this.lifetime = 3 + Math.random() * 8;
        this.age = Math.random() * this.lifetime;
        const colors = [palette.primary, palette.secondary, palette.accent, palette.highlight];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.age += dt;
        if (this.age > this.lifetime || this.x < -10 || this.x > this.W + 10 || this.y < -10 || this.y > this.H + 10) {
            this.x = Math.random() * this.W;
            this.y = Math.random() * this.H;
            this.age = 0;
        }
    }

    draw(ctx) {
        const [r, g, b] = this.color;
        // Square pixel
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
    }
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function ProjectsBackground({ theme = 'miles' }) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const palette = PALETTES[theme] || PALETTES.miles;

        let W, H;
        let fragments = [];
        let halftoneClusters = [];
        let pixels = [];
        let startTime = null;
        let lastTime = 0;

        function init() {
            W = canvas.parentElement.clientWidth;
            H = canvas.parentElement.clientHeight;
            canvas.width = W;
            canvas.height = H;

            fragments = [];
            for (let i = 0; i < 25; i++) {
                fragments.push(new Fragment(W, H, palette));
            }

            halftoneClusters = [];
            for (let i = 0; i < 8; i++) {
                halftoneClusters.push(new HalftoneCluster(W, H, palette));
            }

            pixels = [];
            for (let i = 0; i < 80; i++) {
                pixels.push(new PixelSpray(W, H, palette));
            }
        }

        init();
        window.addEventListener('resize', init);

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const time = (timestamp - startTime) / 1000;
            const dt = Math.min(0.05, time - lastTime);
            lastTime = time;

            const [bgR, bgG, bgB] = palette.bg;
            ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
            ctx.fillRect(0, 0, W, H);

            // ========== AMBIENT GLOW ==========
            const [pr, pg, pb] = palette.primary;
            const [sr, sg, sb] = palette.secondary;

            // Center glow
            const glow = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.5);
            glow.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, 0.04)`);
            glow.addColorStop(0.4, `rgba(${sr}, ${sg}, ${sb}, 0.02)`);
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, W, H);

            // ========== HALFTONE CLUSTERS ==========
            halftoneClusters.forEach(h => {
                h.update(time);
                h.draw(ctx);
            });

            // ========== GEOMETRIC FRAGMENTS ==========
            fragments.forEach(f => {
                f.update(time);
                f.draw(ctx);
            });

            // ========== PIXEL SPRAY ==========
            pixels.forEach(p => {
                p.update(dt);
                p.draw(ctx);
            });

            // ========== GLITCH BARS (intermittent) ==========
            const glitchTrigger = Math.sin(time * 0.6) * Math.sin(time * 1.1);
            if (glitchTrigger > 0.5) {
                const intensity = (glitchTrigger - 0.5) / 0.5;
                const barCount = 2 + Math.floor(intensity * 4);

                for (let i = 0; i < barCount; i++) {
                    const y = (Math.sin(time * 4 + i * 5.3) * 0.5 + 0.5) * H;
                    const h = 1 + Math.random() * 3;
                    const colors = [palette.primary, palette.secondary, palette.accent];
                    const c = colors[Math.floor(Math.random() * colors.length)];
                    const offset = (Math.random() - 0.5) * 10 * intensity;

                    ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.06 * intensity})`;
                    ctx.fillRect(offset, y, W, h);
                }
            }

            // ========== CHROMATIC NOISE BORDER ==========
            // Scattered single-pixel noise around edges
            const noiseCount = 30;
            for (let i = 0; i < noiseCount; i++) {
                const edge = Math.floor(Math.random() * 4);
                let nx, ny;
                if (edge === 0) { nx = Math.random() * W; ny = Math.random() * 60; }
                else if (edge === 1) { nx = Math.random() * W; ny = H - Math.random() * 60; }
                else if (edge === 2) { nx = Math.random() * 60; ny = Math.random() * H; }
                else { nx = W - Math.random() * 60; ny = Math.random() * H; }

                const colors = [palette.primary, palette.secondary, palette.accent, palette.highlight];
                const c = colors[Math.floor(Math.random() * colors.length)];
                ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.1 + Math.random() * 0.2})`;
                ctx.fillRect(Math.floor(nx), Math.floor(ny), 1 + Math.random() * 2, 1 + Math.random() * 2);
            }

            // ========== EDGE FADE (seamless blending) ==========
            // Fade out the top and bottom of the canvas so it blends into adjacent sections
            const topEdge = Math.min(H * 0.20, 300); // Up to 20% or 300px
            const botEdge = Math.min(H * 0.20, 300);

            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';

            // Top edge fade
            const topGrad = ctx.createLinearGradient(0, 0, 0, topEdge);
            topGrad.addColorStop(0, 'rgba(0,0,0,1)');
            topGrad.addColorStop(0.5, 'rgba(0,0,0,0.7)');
            topGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, W, topEdge);

            // Bottom edge fade
            const botGrad = ctx.createLinearGradient(0, H - botEdge, 0, H);
            botGrad.addColorStop(0, 'rgba(0,0,0,0)');
            botGrad.addColorStop(0.5, 'rgba(0,0,0,0.7)');
            botGrad.addColorStop(1, 'rgba(0,0,0,1)');
            ctx.fillStyle = botGrad;
            ctx.fillRect(0, H - botEdge, W, botEdge);

            ctx.restore();

            animRef.current = requestAnimationFrame(animate);
        }

        animRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', init);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
}
