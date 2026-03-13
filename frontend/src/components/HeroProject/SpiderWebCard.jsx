/**
 * SpiderWebCard.jsx — Project Card on Spider-Web Background
 *
 * Each project sits on top of an SVG spider-web with theme-colored glow.
 * Features:
 *   - SVG web with radial strands + concentric rings
 *   - Glassmorphism card overlay with project info
 *   - Technology badges with DB colors
 *   - Hover: web brightens, card lifts, glitch flicker
 *   - Theme-adaptive glow colors
 */

import { useState } from 'react';
import './SpiderWebCard.css';

/* ============================================
   THEME COLORS 
   ============================================ */
// Colors are dynamically inherited from CSS variables set in App.jsx

/* ============================================
   SVG SPIDER WEB GENERATOR
   ============================================ */
function generateWebPaths(cx, cy, radius, radialCount = 12, ringCount = 5) {
    const paths = [];

    // Radial strands (center → edge)
    for (let i = 0; i < radialCount; i++) {
        const angle = (i / radialCount) * Math.PI * 2;
        const ex = cx + Math.cos(angle) * radius;
        const ey = cy + Math.sin(angle) * radius;
        paths.push(`M ${cx} ${cy} L ${ex} ${ey}`);
    }

    // Concentric rings
    for (let r = 1; r <= ringCount; r++) {
        const ringR = (r / ringCount) * radius;
        let ringPath = '';
        for (let i = 0; i <= radialCount; i++) {
            const angle = (i / radialCount) * Math.PI * 2;
            const px = cx + Math.cos(angle) * ringR;
            const py = cy + Math.sin(angle) * ringR;
            ringPath += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
        }
        ringPath += ' Z';
        paths.push(ringPath);
    }

    return paths.join(' ');
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function SpiderWebCard({ project, theme = 'miles', delay = 0 }) {
    const [hovered, setHovered] = useState(false);
    const colors = {
        primary: 'var(--primary-color, #FF1744)',
        secondary: 'var(--secondary-color, #E040FB)',
        glow: 'rgba(var(--primary-color-rgb, 255, 23, 68), 0.4)'
    };

    const webSize = 300;
    const cx = webSize / 2;
    const cy = webSize / 2;
    const webPath = generateWebPaths(cx, cy, webSize * 0.45, 14, 6);

    return (
        <div
            className={`spider-card spider-card--${theme} ${hovered ? 'spider-card--hovered' : ''}`}
            style={{ animationDelay: `${delay}ms` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* SVG Spider Web Background */}
            <svg
                className="spider-card__web"
                viewBox={`0 0 ${webSize} ${webSize}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Glow filter */}
                <defs>
                    <filter id={`glow-${project.id}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Web strands */}
                <path
                    d={webPath}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth="0.5"
                    opacity={hovered ? 0.5 : 0.2}
                    filter={`url(#glow-${project.id})`}
                    className="spider-card__web-path"
                />

                {/* Glow overlay on hover */}
                <path
                    d={webPath}
                    fill="none"
                    stroke={colors.secondary}
                    strokeWidth="1"
                    opacity={hovered ? 0.3 : 0}
                    className="spider-card__web-glow"
                />
            </svg>

            {/* Card Content */}
            <div className="spider-card__content">
                {/* Project Image */}
                {project.image_url && (
                    <div className="spider-card__image">
                        <img
                            src={project.image_url}
                            alt={project.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                        />
                    </div>
                )}

                {/* Title */}
                <h3 className="spider-card__title">{project.title}</h3>

                {/* Description */}
                <p className="spider-card__desc">
                    {project.description?.length > 100
                        ? project.description.slice(0, 100) + '...'
                        : project.description}
                </p>

                {/* Tech badges */}
                {project.technologies?.length > 0 && (
                    <div className="spider-card__techs">
                        {project.technologies.map((tech) => (
                            <span
                                key={tech.id || tech.name}
                                className="spider-card__tech-badge"
                                style={{
                                    borderColor: tech.color,
                                    color: tech.color,
                                    boxShadow: hovered ? `0 0 8px ${tech.color}44` : 'none',
                                }}
                            >
                                {tech.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action links */}
                <div className="spider-card__links">
                    {project.project_url && project.project_url !== '#' && (
                        <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="spider-card__link"
                            style={{ color: colors.primary }}
                        >
                            🔗 Voir
                        </a>
                    )}
                    {project.github_url && (
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="spider-card__link"
                            style={{ color: colors.secondary }}
                        >
                            ⚡ GitHub
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
