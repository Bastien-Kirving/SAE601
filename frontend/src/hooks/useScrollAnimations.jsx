import { useState, useEffect, useRef, useCallback } from 'react';

export function useScrollAnimations() {
    // Visibility flags — pause invisible canvas
    const [multiverseVisible, setMultiverseVisible] = useState(true);
    const [glitchVisible, setGlitchVisible] = useState(false);

    // Refs for direct DOM manipulation (no re-render on scroll)
    const refs = {
        multiverse: useRef(null),
        glitch: useRef(null),
        heroContent: useRef(null),
        glitchBurst: useRef(null), // direct DOM ref — avoids React state update
        scrollContainer: useRef(null), // conteneur de scroll interne (évite le scroll window)
    };

    // Internal state refs
    const lastSection = useRef(0);
    const rafId = useRef(null);
    const progressRef = useRef(0);

    const updateOpacities = useCallback(() => {
        const container = refs.scrollContainer.current;
        if (!container) return;

        const scrollY = container.scrollTop;
        const windowH = container.clientHeight;

        const raw = Math.min(1, Math.max(0, scrollY / windowH));
        progressRef.current = raw;

        const multiverseOpacity = 1 - raw;
        const glitchOpacity = raw;

        // Direct DOM updates (no React state → no re-render)
        if (refs.multiverse.current) {
            refs.multiverse.current.style.opacity = multiverseOpacity;
        }
        if (refs.glitch.current) {
            refs.glitch.current.style.opacity = glitchOpacity;
        }
        if (refs.heroContent.current) {
            refs.heroContent.current.style.opacity = multiverseOpacity;
        }

        // Toggle visibility (pause canvas when mostly hidden)
        setMultiverseVisible(raw < 0.60);
        setGlitchVisible(raw > 0.40);

        // Detect section change — trigger glitch burst via direct DOM (no React state)
        const currentSection = raw > 0.5 ? 1 : 0;
        if (currentSection !== lastSection.current) {
            lastSection.current = currentSection;
            const el = refs.glitchBurst.current;
            if (el) {
                el.classList.add('active');
                setTimeout(() => el.classList.remove('active'), 400);
            }
        }
    }, []); // Empty dependency array intentional, relies on refs

    const handleScroll = useCallback(() => {
        // Throttle to one update per frame
        if (rafId.current) return;
        rafId.current = requestAnimationFrame(() => {
            updateOpacities();
            rafId.current = null;
        });
    }, [updateOpacities]);

    useEffect(() => {
        const container = refs.scrollContainer.current;
        if (!container) return;

        // Initial opacity
        updateOpacities();

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [handleScroll, updateOpacities]);

    return {
        refs,
        multiverseVisible,
        glitchVisible,
    };
}
