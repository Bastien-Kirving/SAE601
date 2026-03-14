/**
 * dimensionalRift.draw.js — Draw function for DimensionalRift canvas
 */

import { lerp, clamp, easeOutCubic, easeInOutQuad } from './dimensionalRift.config.js';

/* ============================================
   DRAW FRAME
   ============================================ */
export function draw(state, scrollProgress, ctx, W, H, colors) {
    const p = scrollProgress;
    const cx = W / 2, cy = H / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    const time = state.time;

    ctx.clearRect(0, 0, W, H);

    // Background
    const bgAlpha = p < 0.1 ? p / 0.1 : p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
    const mainBg = colors.bg || [8, 8, 16];
    ctx.fillStyle = `rgba(${mainBg[0]}, ${mainBg[1]}, ${mainBg[2]}, ${bgAlpha * 0.95})`;
    ctx.fillRect(0, 0, W, H);

    const colorKeys = ['primary', 'secondary', 'accent'];

    // ========== PORTAL RINGS ==========
    const ringProgress = easeOutCubic(clamp(p / 0.5));
    const ringPulse = clamp(p / 0.3);

    state.rings.forEach((ring) => {
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

            ctx.beginPath();
            ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.15})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
            ctx.fill();
        });
    }

    // ========== GLITCH BARS (intermittent) ==========
    const glitchIntensity = clamp((p - 0.15) / 0.7);
    if (glitchIntensity > 0) {
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
    const topEdge = H * 0.18;
    const botEdge = H * 0.35;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    const mainBg2 = colors.bg || [0, 0, 0];

    const topGrad = ctx.createLinearGradient(0, 0, 0, topEdge);
    topGrad.addColorStop(0, `rgba(${mainBg2[0]}, ${mainBg2[1]}, ${mainBg2[2]}, 1)`);
    topGrad.addColorStop(1, `rgba(${mainBg2[0]}, ${mainBg2[1]}, ${mainBg2[2]}, 0)`);
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, topEdge);

    const botGrad = ctx.createLinearGradient(0, H - botEdge, 0, H);
    botGrad.addColorStop(0, `rgba(${mainBg2[0]}, ${mainBg2[1]}, ${mainBg2[2]}, 0)`);
    botGrad.addColorStop(0.7, `rgba(${mainBg2[0]}, ${mainBg2[1]}, ${mainBg2[2]}, 0.6)`);
    botGrad.addColorStop(1, `rgba(${mainBg2[0]}, ${mainBg2[1]}, ${mainBg2[2]}, 1)`);
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H - botEdge, W, botEdge);

    ctx.restore();
}
