import { useRef, useEffect, useState } from 'react';
import ProjectsBackground from './ProjectsBackground';
import SpiderWebCard from './SpiderWebCard';
import './HeroProject.css';



export default function HeroProject({ theme = 'miles' }) {
    const [isVisible, setIsVisible] = useState(false);
    const [projects, setProjects] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        // Observers
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => { if (containerRef.current) observer.disconnect(); };
    }, []);

    useEffect(() => {
        // Fetch projects
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                // Filter only active projects and generic sorting
                const active = data.filter(p => p.is_active === 1 || p.is_active === true);
                setProjects(active);
            })
            .catch(err => console.error("Erreur de chargement des projets:", err));
    }, []);

    return (
        <div className={`hero-project ${isVisible ? 'hero-project--visible' : ''}`} ref={containerRef}>
            {/* Spider-Verse glitch art background */}
            <ProjectsBackground theme={theme} />

            {/* SECTION TITLE */}
            <h1 className="hero-title reveal-title">
                <span className="hero-title-line hero-glitch" data-text="Projets">Projets</span>
            </h1>

            {/* Projects Grid */}
            <div className="projects-grid">
                {projects.map((project, i) => (
                    <SpiderWebCard
                        key={project.id}
                        project={project}
                        theme={theme}
                        delay={i * 150}
                    />
                ))}
            </div>
        </div>
    );
}
