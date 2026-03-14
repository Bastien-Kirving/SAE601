/**
 * dimensionalRift.config.js — THEMES, math helpers, entity initializer
 */

/* ============================================
   COLOR THEMES
   ============================================ */
export const THEMES = {
    miles: {
        primary: [255, 23, 68],
        secondary: [224, 64, 251],
        accent: [255, 152, 0],
        glow: [255, 23, 68],
        bg: [8, 8, 16],
    },
    gwen: {
        primary: [224, 64, 251],
        secondary: [0, 229, 255],
        accent: [255, 255, 255],
        glow: [224, 64, 251],
        bg: [250, 250, 255],
    },
    glitch: {
        primary: [0, 255, 0],
        secondary: [255, 0, 255],
        accent: [255, 255, 0],
        glow: [0, 255, 0],
        bg: [5, 5, 16],
    },
};

/* ============================================
   MATH HELPERS
   ============================================ */
export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(v, min = 0, max = 1) { return Math.min(max, Math.max(min, v)); }
export function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
export function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

/* ============================================
   ENTITY INITIALIZER
   ============================================ */
export function initEntities(state, W, H) {
    const cx = W / 2, cy = H / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);

    // Portal rings (18 concentric)
    state.rings = [];
    for (let i = 0; i < 18; i++) {
        state.rings.push({
            baseRadius: (i / 18) * maxR * 1.2,
            thickness: 1 + Math.random() * 2,
            speed: 0.5 + Math.random() * 1.5,
            phase: Math.random() * Math.PI * 2,
            colorIdx: i % 3,
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
}
