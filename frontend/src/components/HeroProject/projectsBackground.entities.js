/**
 * projectsBackground.entities.js — Color palettes and canvas entity classes
 */

/* ============================================
   COLOR THEMES
   ============================================ */
export const PALETTES = {
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
        bg: [250, 250, 255],
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
export class Fragment {
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
        this.shape = Math.floor(Math.random() * 4);
        const colors = [palette.primary, palette.secondary, palette.accent, palette.highlight];
        this.color = colors[Math.floor(Math.random() * colors.length)];
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
            ctx.moveTo(0, -s / 2);
            ctx.lineTo(s / 2, s / 2);
            ctx.lineTo(-s / 2, s / 2);
            ctx.closePath();
        } else if (this.shape === 1) {
            const w = s * (0.5 + Math.random() * 0.3);
            const h = s * (0.3 + Math.random() * 0.2);
            ctx.rect(-w / 2, -h / 2, w, h);
        } else if (this.shape === 2) {
            ctx.moveTo(0, -s / 2);
            ctx.lineTo(s / 3, -s / 6);
            ctx.lineTo(s / 4, s / 3);
            ctx.lineTo(-s / 5, s / 2);
            ctx.lineTo(-s / 3, 0);
            ctx.closePath();
        } else {
            ctx.moveTo(-s / 2, 0);
            ctx.lineTo(s / 2, 0);
        }
        ctx.restore();
    }

    draw(ctx) {
        const [r, g, b] = this.color;
        const alpha = Math.max(0, this.currentAlpha);

        if (this.hasChromaticSplit && alpha > 0.03) {
            const off = this.chromaticOffset;
            this.drawShape(ctx, -off, -off * 0.5);
            ctx.fillStyle = `rgba(${r}, 0, 0, ${alpha * 0.5})`;
            ctx.fill();
            this.drawShape(ctx, off, off * 0.5);
            ctx.fillStyle = `rgba(0, 0, ${b || 200}, ${alpha * 0.4})`;
            ctx.fill();
        }

        this.drawShape(ctx);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

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
export class HalftoneCluster {
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

                const rx = gx * cos - gy * sin + this.x;
                const ry = gx * sin + gy * cos + this.y;

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
export class PixelSpray {
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
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
    }
}
