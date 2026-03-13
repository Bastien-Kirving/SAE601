import { useRef, useEffect } from 'react';
import './LeapOfFaith.css';

export default function LeapOfFaith({ theme = 'miles' }) {
    const containerRef = useRef(null);
    const stickyRef = useRef(null);
    const speedLinesRef = useRef(null);
    const buildingsRef = useRef(null);
    const rafId = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (rafId.current) return;
            rafId.current = requestAnimationFrame(() => {
                updateParallax();
                rafId.current = null;
            });
        };

        const updateParallax = () => {
            if (!containerRef.current || !stickyRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Total scroll distance: container height minus viewport height
            const totalScroll = rect.height - windowHeight;
            // Current scroll position relative to this section
            const currentScroll = -rect.top;

            // Calculate progress (0 to 1) within the section
            let progress = currentScroll / totalScroll;
            const clampedProgress = Math.min(1, Math.max(0, progress));

            // Apply high-performance DOM updates
            if (speedLinesRef.current) {
                // Fade in speed lines quickly, fade out at the very end to blend into contact
                if (clampedProgress < 0.05) {
                    speedLinesRef.current.style.opacity = clampedProgress * 20;
                } else if (clampedProgress > 0.95) {
                    speedLinesRef.current.style.opacity = (1 - clampedProgress) * 20;
                } else {
                    speedLinesRef.current.style.opacity = 1;
                }

                // Move lines extremely fast
                const speedY = (currentScroll * 4) % windowHeight;
                speedLinesRef.current.style.transform = `translateY(${speedY}px)`;
            }

            if (buildingsRef.current) {
                // Buildings rush past downwards, giving the illusion of falling UPWARDS
                const buildY = clampedProgress * 150;
                buildingsRef.current.style.transform = `translateY(${buildY}%)`;

                if (clampedProgress < 0.1) {
                    buildingsRef.current.style.opacity = clampedProgress * 10;
                } else if (clampedProgress > 0.95) {
                    buildingsRef.current.style.opacity = (1 - clampedProgress) * 20;
                } else {
                    buildingsRef.current.style.opacity = 1;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial setup
        updateParallax();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <section className={`leap-container theme-${theme}`} ref={containerRef}>
            <div className="leap-sticky" ref={stickyRef}>

                {/* Background Sky Transition */}
                <div className="leap-sky" />

                {/* Speed Lines */}
                <div className="leap-speed-lines" ref={speedLinesRef} />

                {/* Rushing Buildings (Inverted POV) */}
                <div className="leap-buildings" ref={buildingsRef}>
                    {/* These buildings are drawn from the top down, simulating inverted skyscrapers rushing past */}
                    <div className="leap-building lb-1" />
                    <div className="leap-building lb-2" />
                    <div className="leap-building lb-3" />
                    <div className="leap-building lb-4" />
                    <div className="leap-building lb-5" />
                </div>

                {/* Cinematic Title Overlay */}
                <div className="leap-title">
                    <span className="hero-glitch" data-text="WHAT'S UP DANGER">WHAT'S UP DANGER</span>
                </div>

            </div>
        </section>
    );
}
