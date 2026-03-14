/**
 * multiverseBackground.palettes.js — Color palettes and color utilities
 */

export const PALETTES = {
    miles: {
        bg: ['#0a0510', '#060308', '#020102'],
        rings: [
            { r: 255, g: 23, b: 68 },
            { r: 255, g: 152, b: 0 },
            { r: 224, g: 64, b: 251 },
            { r: 255, g: 50, b: 120 },
            { r: 0, g: 229, b: 255 }
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
            { r: 255, g: 255, b: 255 },
            { r: 255, g: 152, b: 0 },
            { r: 255, g: 23, b: 68 },
            { r: 224, g: 64, b: 251 }
        ]
    },
    gwen: {
        bg: ['#fdf5ff', '#f5fbff', '#ffffff'],
        rings: [
            { r: 224, g: 64, b: 251 },
            { r: 0, g: 229, b: 255 },
            { r: 255, g: 255, b: 255 },
            { r: 128, g: 216, b: 255 },
            { r: 245, g: 0, b: 87 }
        ],
        lines: [
            { r: 0, g: 229, b: 255 },
            { r: 224, g: 64, b: 251 },
            { r: 255, g: 255, b: 255 }
        ],
        nebula: [
            { color: { r: 224, g: 64, b: 251 }, x: -0.2, y: -0.1 },
            { color: { r: 0, g: 229, b: 255 }, x: 0.2, y: 0.15 },
            { color: { r: 255, g: 255, b: 255 }, x: 0.0, y: -0.2 },
            { color: { r: 245, g: 0, b: 87 }, x: -0.1, y: 0.2 }
        ],
        core: [
            { r: 255, g: 255, b: 255 },
            { r: 0, g: 229, b: 255 },
            { r: 224, g: 64, b: 251 },
            { r: 255, g: 255, b: 255 }
        ]
    },
    glitch: {
        bg: ['#050510', '#0a0a18', '#0f0f20'],
        rings: [
            { r: 0, g: 255, b: 0 },
            { r: 255, g: 0, b: 255 },
            { r: 255, g: 255, b: 0 },
            { r: 0, g: 255, b: 255 },
            { r: 255, g: 255, b: 255 }
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

export function rgba(c, a) {
    return `rgba(${c.r},${c.g},${c.b},${a})`;
}

export function hexToRgbObj(hex) {
    if (!hex) return { r: 255, g: 255, b: 255 };
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const bigint = parseInt(hex, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
