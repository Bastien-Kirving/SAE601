/**
 * spotTransition.draw.js — Draw function (scroll-driven canvas rendering)
 */

import { lerp, clamp, easeOutCubic, easeInOutQuad, easeInQuart } from './spotTransition.config.js';

/* ============================================
   DRAW FRAME
   ============================================ */
export function draw(state, scrollProgress, ctx, W, H, colors) {
    const p = scrollProgress;
    const time = state.time;

    ctx.clearRect(0, 0, W, H);

    // === BACKGROUND ===
    const bgAlpha = p < 0.08 ? p / 0.08 : 1;
    const darken = clamp((p - 0.5) / 0.4);
    const bg = colors.bg;
    ctx.fillStyle = `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, ${bgAlpha * 0.85})`;
    ctx.fillRect(0, 0, W, H);

    if (darken > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${darken * 0.6})`;
        ctx.fillRect(0, 0, W, H);
    }

    // === PHASE 1+2+3: DIMENSIONAL SPOTS ===
    state.spots.forEach((spot, i) => {
        const localP = clamp((p - spot.appearAt) / (1 - spot.appearAt));
        if (localP <= 0) return;

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

        const pulse = 1 + Math.sin(time * spot.pulseSpeed + spot.pulsePhase) * 0.12 * sizeFactor;
        const radius = lerp(spot.baseRadius, spot.maxRadius, sizeFactor) * pulse;

        const drift = Math.min(1, p * 2);
        const cx = (spot.x + Math.sin(time * 0.5 + spot.driftX * 10) * spot.driftX * drift) * W;
        const cy = (spot.y + Math.cos(time * 0.4 + spot.driftY * 10) * spot.driftY * drift) * H;

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

        const borderAlpha = clamp(localP * 0.8) * (1 - clamp((p - 0.85) / 0.15));
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, ${borderAlpha * 0.6})`;
        ctx.lineWidth = 2 + sizeFactor * 2;
        ctx.stroke();

        const portalAlpha = clamp(localP);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${portalAlpha})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.ink[0]}, ${colors.ink[1]}, ${colors.ink[2]}, ${portalAlpha * 0.5})`;
        ctx.fill();

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

            const currentAngle = ink.angle + time * 0.3;
            const ejectionDist = (30 + ink.speed * 60 * inkProgress) * (0.5 + Math.sin(time * ink.speed + ink.offset) * 0.5);
            const ix = spotX + Math.cos(currentAngle) * ejectionDist;
            const iy = spotY + Math.sin(currentAngle) * ejectionDist;

            if (ix < -20 || ix > W + 20 || iy < -20 || iy > H + 20) return;

            const alpha = inkProgress * ink.life * (1 - clamp((p - 0.85) / 0.15));
            const size = ink.size * (1 + inkProgress * 2);

            ctx.save();
            ctx.translate(ix, iy);
            ctx.rotate(time * ink.speed);

            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

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
        const segsToDraw = Math.ceil(crack.points.length * crackP);

        ctx.beginPath();
        for (let i = 0; i < segsToDraw && i < crack.points.length; i++) {
            const pt = crack.points[i];
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

        ctx.fillStyle = `rgba(0, 0, 0, ${consumeT * 0.9})`;
        ctx.fillRect(0, 0, W, H);

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
}
