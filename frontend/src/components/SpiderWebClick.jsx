/**
 * SpiderWebClick — Global click effect
 *
 * On every click, draws a small radial spider web
 * at the cursor position that fades out after 2 seconds.
 * Adapts colors to the current theme.
 */

import { useEffect, useRef, useCallback } from 'react';

const RADIALS = 8;       // number of radial strands
const RINGS = 3;         // number of concentric rings
const WEB_SIZE = 40;     // max radius in px
const DURATION = 2000;   // fade duration in ms

function drawMiniWeb(container, x, y, theme) {
    const colors = {
        stroke: 'var(--primary-color, #FF1744)',
        glow: 'rgba(var(--primary-color-rgb, 255, 23, 68), 0.4)'
    };

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const size = WEB_SIZE * 2 + 10;
    const cx = size / 2;
    const cy = size / 2;

    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.style.cssText = `
        position: fixed;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.8s ease-out;
        filter: drop-shadow(0 0 6px ${colors.glow});
    `;

    let paths = '';

    // Radial strands
    for (let i = 0; i < RADIALS; i++) {
        const angle = (i / RADIALS) * Math.PI * 2;
        const ex = cx + Math.cos(angle) * WEB_SIZE;
        const ey = cy + Math.sin(angle) * WEB_SIZE;
        paths += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" 
                   stroke="${colors.stroke}" stroke-width="0.8" stroke-opacity="0.7"/>`;
    }

    // Concentric rings (polygon connecting points at each radius)
    for (let r = 1; r <= RINGS; r++) {
        const radius = (r / RINGS) * WEB_SIZE;
        let d = '';
        for (let i = 0; i <= RADIALS; i++) {
            const angle = (i / RADIALS) * Math.PI * 2;
            // Slight irregularity for natural look
            const wobble = 1 + (Math.sin(i * 3 + r * 7) * 0.1);
            const px = cx + Math.cos(angle) * radius * wobble;
            const py = cy + Math.sin(angle) * radius * wobble;
            d += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
        }
        d += ' Z';
        paths += `<path d="${d}" fill="none" stroke="${colors.stroke}" 
                   stroke-width="0.6" stroke-opacity="${0.5 - r * 0.1}"/>`;
    }

    // Center dot
    paths += `<circle cx="${cx}" cy="${cy}" r="2" fill="${colors.stroke}" fill-opacity="0.8"/>`;

    svg.innerHTML = paths;

    // Scale-in animation
    svg.style.transform = 'scale(0.3)';
    svg.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease-out';

    container.appendChild(svg);

    // Pop in
    requestAnimationFrame(() => {
        svg.style.transform = 'scale(1)';
    });

    // Fade out after delay, then remove
    setTimeout(() => {
        svg.style.opacity = '0';
    }, DURATION - 800);

    setTimeout(() => {
        svg.remove();
    }, DURATION);
}

export default function SpiderWebClick({ theme = 'miles' }) {
    const themeRef = useRef(theme);
    const containerRef = useRef(null);

    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    const handleClick = useCallback((e) => {
        if (containerRef.current) {
            drawMiniWeb(containerRef.current, e.clientX, e.clientY, themeRef.current);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [handleClick]);

    return (
        <div
            ref={containerRef}
            data-testid="spider-container"
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
}
