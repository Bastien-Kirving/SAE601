/**
 * spotTransition.config.js — THEMES, math helpers, seeded random, entity initializer
 */

/* ============================================
   COLOR THEMES
   ============================================ */
export const THEMES = {
    miles: {
        glow: [255, 23, 68],
        glowAlt: [224, 64, 251],
        accent: [255, 152, 0],
        ink: [20, 5, 5],
        bg: [8, 8, 16],
        flash: [255, 23, 68],
    },
    gwen: {
        glow: [224, 64, 251],
        glowAlt: [0, 229, 255],
        accent: [255, 255, 255],
        ink: [30, 10, 35],
        bg: [250, 250, 255],
        flash: [224, 64, 251],
    },
    glitch: {
        glow: [0, 255, 0],
        glowAlt: [255, 0, 255],
        accent: [255, 255, 0],
        ink: [0, 10, 0],
        bg: [5, 5, 16],
        flash: [0, 255, 0],
    },
};

/* ============================================
   MATH HELPERS
   ============================================ */
export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(v, min = 0, max = 1) { return Math.min(max, Math.max(min, v)); }
export function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
export function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
export function easeInQuart(t) { return t * t * t * t; }

/* ============================================
   SEEDED RANDOM (deterministic spots layout)
   ============================================ */
export function seededRandom(seed) {
    let s = seed;
    return function () {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

/* ============================================
   ENTITY INITIALIZER
   ============================================ */
export function initEntities(state, W, H) {
    const rng = seededRandom(42);

    // === SPOTS (dimensional portals) ===
    state.spots = [];
    const spotCount = 10;
    for (let i = 0; i < spotCount; i++) {
        const t = i / spotCount;
        state.spots.push({
            x: 0.1 + rng() * 0.8,
            y: 0.1 + rng() * 0.8,
            baseRadius: 15 + rng() * 40,
            maxRadius: 80 + rng() * 180,
            ellipseRatio: 0.7 + rng() * 0.6,
            rotation: rng() * Math.PI * 2,
            pulseSpeed: 0.5 + rng() * 1.5,
            pulsePhase: rng() * Math.PI * 2,
            driftX: (rng() - 0.5) * 0.3,
            driftY: (rng() - 0.5) * 0.3,
            appearAt: t * 0.15,
            mergeGroup: Math.floor(i / 3),
        });
    }

    // === INK PARTICLES ===
    state.inkParticles = [];
    for (let i = 0; i < 30; i++) {
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
            colorIdx: Math.floor(rng() * 2),
        });
    }

    // Pre-compute merge group averages
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
}
