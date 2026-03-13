/**
 * HeroProfile.jsx — Présentation "Spider-Web" interactive
 *
 * Photo au centre avec effet glitch.
 * Toiles d'araignée (SVG) reliant la photo à des fiches d'info.
 * Tout apparaît avec une transition au scroll (IntersectionObserver).
 */

import { useRef, useEffect, useState } from 'react';
import './HeroProfile.css';

/* ============================================
   INFO NODES — Données personnelles
   Positions en % relatif au conteneur (top, left)
   ============================================ */
const INFO_NODES = [
    {
        id: 'age',
        label: '21 ans',
        detail: 'Né en 2004',
        icon: '',
        pos: { top: '25%', left: '85%' },
    },
    {
        id: 'formation',
        label: 'BUT MMI',
        detail: 'Métiers du Multimédia',
        icon: '',
        pos: { top: '60%', left: '90%' },
    },
    {
        id: 'passion',
        label: 'Spider-Verse',
        detail: 'Programmation • Sport • Musique • Cinéma',
        icon: '',
        pos: { top: '85%', left: '70%' },
    },
    {
        id: 'stack',
        label: 'Full-Stack',
        detail: 'React • PHP • MySQL',
        icon: '',
        pos: { top: '85%', left: '30%' },
    },
    {
        id: 'location',
        label: 'France',
        detail: 'Disponible en alternance',
        icon: '',
        pos: { top: '60%', left: '10%' },
    },
    {
        id: 'skills',
        label: 'Créatif',
        detail: 'Three.js • CSS • Canvas',
        icon: '',
        pos: { top: '25%', left: '15%' },
    },
];

/* ============================================
   WEB STRAND — SVG line + animation
   ============================================ */
function WebStrands({ centerRef, nodeRefs, containerRef, visible, theme, nodes }) {
    const [lines, setLines] = useState([]);

    useEffect(() => {
        function updateLines() {
            if (!centerRef.current || !containerRef.current || !nodes) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const centerRect = centerRef.current.getBoundingClientRect();
            const cx = centerRect.left + centerRect.width / 2 - containerRect.left;
            const cy = centerRect.top + centerRect.height / 2 - containerRect.top;

            const newLines = [];
            // We use the nodes array to ensure we only render lines for active nodes
            nodes.forEach((node, idx) => {
                const nodeEl = nodeRefs.current[idx];
                if (!nodeEl) return;

                const nodeRect = nodeEl.getBoundingClientRect();
                const nx = nodeRect.left + nodeRect.width / 2 - containerRect.left;
                const ny = nodeRect.top + nodeRect.height / 2 - containerRect.top;

                const midX = (cx + nx) / 2;
                const midY = (cy + ny) / 2;

                // Pour un effet "patte d'araignée", on crée un "coude" (articulation)
                // L'articulation est poussée vers le haut (ou le côté) par rapport à la ligne droite
                const distance = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);

                // Le coude (knee) est décalé perpendiculairement à la ligne
                // Plus la patte est longue, plus le coude est prononcé
                const perpX = -(ny - cy) * 0.4; // 0.4 détermine à quel point le genou ressort
                const perpY = (nx - cx) * 0.4;

                // Calcul du point de l'articulation (genou)
                // On pousse l'articulation "vers l'extérieur" du cercle
                const dirX = nx - cx;
                const dirY = ny - cy;

                // Le genou est à peu près à 40% de la distance
                let kneeX = cx + dirX * 0.4;
                let kneeY = cy + dirY * 0.4;

                // On ajoute le décalage perpendiculaire pour "casser" la ligne
                // Si la bulle est "plus haute" que le centre, le genou plie vers le haut
                const bendFactor = nx < cx ? -1 : 1;
                kneeX += perpX * bendFactor * 0.5;
                kneeY += perpY * bendFactor * 0.5;

                // On utilise 'L' (LineTo) pour faire un angle net (genou mécanique)
                const pathStr = `M ${cx} ${cy} L ${kneeX} ${kneeY} L ${nx} ${ny}`;

                const segment1 = Math.sqrt((kneeX - cx) ** 2 + (kneeY - cy) ** 2);
                const segment2 = Math.sqrt((nx - kneeX) ** 2 + (ny - kneeY) ** 2);

                newLines.push({
                    id: node.id || `line-${idx}`,
                    d: pathStr,
                    length: segment1 + segment2,
                });
            });
            setLines(newLines);
        }

        updateLines();
        window.addEventListener('resize', updateLines);
        const timeout = setTimeout(updateLines, 300);
        return () => {
            window.removeEventListener('resize', updateLines);
            clearTimeout(timeout);
        };
    }, [centerRef, nodeRefs, containerRef, nodes, visible]);

    const isLightMode = theme === 'gwen';
    const glowColor = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)';
    const mainColor = isLightMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.25)';
    const accentColor = isLightMode ? 'rgba(224, 64, 251, 0.35)' : 'rgba(255, 23, 68, 0.3)';

    return (
        <svg className={`web-strands-svg ${visible ? 'revealed' : ''}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="webGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {lines.map((line, i) => (
                <g key={line.id}>
                    {/* Glow layer (colored, behind) */}
                    <path
                        className="web-strand-glow"
                        d={line.d}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="6"
                        strokeLinejoin="miter"
                        strokeDasharray={line.length}
                        strokeDashoffset={visible ? 0 : line.length}
                        style={{
                            transitionDelay: `${0.4 + i * 0.12}s`,
                            filter: 'blur(4px)',
                        }}
                    />
                    {/* Main leg segment */}
                    <path
                        className="web-strand"
                        d={line.d}
                        fill="none"
                        stroke={mainColor}
                        strokeWidth="2.5"
                        strokeLinejoin="miter"
                        strokeDasharray={line.length}
                        strokeDashoffset={visible ? 0 : line.length}
                        style={{
                            transitionDelay: `${0.4 + i * 0.12}s`,
                            '--strand-length': line.length,
                        }}
                    />
                </g>
            ))}
        </svg>
    );
}

/* ============================================
   MAIN COMPONENT with scroll reveal
   ============================================ */
export default function HeroProfile({ theme = 'miles' }) {
    const containerRef = useRef(null);
    const centerRef = useRef(null);
    const nodeRefs = useRef([]);
    const [isVisible, setIsVisible] = useState(false);

    // Dynamic settings state
    const [settings, setSettings] = useState({
        hero_title: 'Profile',
        hero_bio: 'À propos de moi',
        hero_image: '/images/cv-removebg-preview.png', // Default image
        hero_nodes: INFO_NODES // Fallback to hardcoded
    });

    // IntersectionObserver — trigger when section enters viewport
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.15 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Fetch dynamic profile settings
    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                let dynamicNodes = INFO_NODES;
                if (data.hero_nodes) {
                    try {
                        dynamicNodes = JSON.parse(data.hero_nodes);
                    } catch (e) {
                        console.error("Erreur parse hero_nodes", e);
                    }
                }

                setSettings(prev => ({
                    hero_title: data.hero_title || prev.hero_title,
                    hero_bio: data.hero_bio || prev.hero_bio,
                    hero_image: data.hero_image || prev.hero_image,
                    hero_nodes: dynamicNodes
                }));
            })
            .catch(err => console.error("Erreur de chargement du profil:", err));
    }, []);

    return (
        <div className={`hero-profile ${isVisible ? 'hero-profile--visible' : ''}`} ref={containerRef}>
            {/* SVG Web Strands */}
            <WebStrands
                centerRef={centerRef}
                nodeRefs={nodeRefs}
                containerRef={containerRef}
                visible={isVisible}
                theme={theme}
                nodes={settings.hero_nodes} // Pass nodes to WebStrands
            />

            {/* SECTION TITLE (Absolute) */}
            <h1 className="hero-title reveal-title" style={{ position: 'absolute', top: '2%', left: '50%', zIndex: 20, width: '100%', pointerEvents: 'none' }}>
                <span className="hero-title-line hero-glitch" data-text={settings.hero_title}>{settings.hero_title}</span>
                <span className="hero-subtitle">{settings.hero_bio}</span>
            </h1>

            {/* Center Photo with Glitch */}
            <div className="profile-photo-wrapper reveal-element" ref={centerRef}>
                <div className="profile-photo-glitch" data-img={settings.hero_image}>
                    <img
                        src={settings.hero_image}
                        alt="Profil — Développeur Web"
                        className="profile-photo"
                    />
                    <img
                        src={settings.hero_image}
                        alt=""
                        className="profile-photo profile-photo--glitch-r"
                        aria-hidden="true"
                    />
                    <img
                        src={settings.hero_image}
                        alt=""
                        className="profile-photo profile-photo--glitch-b"
                        aria-hidden="true"
                    />
                </div>

                <div className="profile-ring profile-ring--1" />
                <div className="profile-ring profile-ring--2" />
                <div className="profile-ring profile-ring--3" />
            </div>

            {/* Info Nodes */}
            {settings.hero_nodes.map((node, idx) => (
                <div
                    key={node.id || idx}
                    className="info-node reveal-element"
                    ref={(el) => (nodeRefs.current[idx] = el)}
                    style={{
                        top: node.pos?.top || '50%',
                        left: node.pos?.left || '50%',
                        transitionDelay: `${0.6 + idx * 0.15}s`,
                    }}
                >
                    <span className="info-node-icon">{node.icon}</span>
                    <div className="info-node-text">
                        <strong>{node.label}</strong>
                        <span>{node.detail}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
