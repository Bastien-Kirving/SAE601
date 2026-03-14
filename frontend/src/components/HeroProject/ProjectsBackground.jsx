/**
 * ProjectsBackground.jsx — Spider-Verse Glitch Art Background
 *
 * Entity classes and palettes split into:
 *   - projectsBackground.entities.js  (PALETTES, Fragment, HalftoneCluster, PixelSpray)
 */

import { useRef, useEffect } from 'react';
import { PALETTES, Fragment, HalftoneCluster, PixelSpray } from './projectsBackground.entities.js';

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
            const topEdge = Math.min(H * 0.20, 300);
            const botEdge = Math.min(H * 0.20, 300);

            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';

            const topGrad = ctx.createLinearGradient(0, 0, 0, topEdge);
            topGrad.addColorStop(0, 'rgba(0,0,0,1)');
            topGrad.addColorStop(0.5, 'rgba(0,0,0,0.7)');
            topGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, W, topEdge);

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
