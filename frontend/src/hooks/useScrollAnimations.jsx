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
        glitchBurst: useRef(null),
        scrollContainer: useRef(null), // conteneur de scroll interne
    };

    // Internal state refs
    const lastSection = useRef(0);
    const rafId = useRef(null);
    const progressRef = useRef(0);
    const multiverseVisibleRef = useRef(true);
    const glitchVisibleRef = useRef(false);
    const lastDispatchRef = useRef(0);

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

        // Toggle visibility — only setState when value actually changes (avoids re-render on every scroll)
        const newMultiverseVisible = raw < 0.60;
        const newGlitchVisible = raw > 0.40;
        if (newMultiverseVisible !== multiverseVisibleRef.current) {
            multiverseVisibleRef.current = newMultiverseVisible;
            setMultiverseVisible(newMultiverseVisible);
        }
        if (newGlitchVisible !== glitchVisibleRef.current) {
            glitchVisibleRef.current = newGlitchVisible;
            setGlitchVisible(newGlitchVisible);
        }

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

        // Polyfill window.scrollY → container.scrollTop
        // Les autres composants (DimensionalRift, SpotTransition, LeapOfFaith…)
        // continuent d'utiliser window.scrollY sans modification
        Object.defineProperty(window, 'scrollY', {
            get: () => refs.scrollContainer.current?.scrollTop ?? 0,
            configurable: true,
        });
        Object.defineProperty(window, 'pageYOffset', {
            get: () => refs.scrollContainer.current?.scrollTop ?? 0,
            configurable: true,
        });

        // Initial opacity
        updateOpacities();

        const onScroll = () => {
            handleScroll();
            // Re-dispatch sur window, throttlé à 60fps pour éviter la cascade de handlers
            const now = Date.now();
            if (now - lastDispatchRef.current > 16) {
                lastDispatchRef.current = now;
                window.dispatchEvent(new Event('scroll'));
            }
        };

        container.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', onScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [handleScroll, updateOpacities]);

    return {
        refs,
        multiverseVisible,
        glitchVisible,
    };
}
