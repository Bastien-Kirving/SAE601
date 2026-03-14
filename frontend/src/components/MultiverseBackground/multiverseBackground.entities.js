/**
 * multiverseBackground.entities.js — Canvas entity classes for the warp tunnel
 */

import { rgba } from './multiverseBackground.palettes.js';

export class TunnelRing {
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

export class SpeedLine {
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

export class WarpParticle {
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
        ctx.beginPath(); ctx.fillStyle = rgba(this.color, alpha * 0.12); ctx.arc(x, y, s * 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = rgba(this.color, alpha * 0.25); ctx.arc(x, y, s * 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = rgba(this.color, alpha); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    }
}

export class EnergyBeam {
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
