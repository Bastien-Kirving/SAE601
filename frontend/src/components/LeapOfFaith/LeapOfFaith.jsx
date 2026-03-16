import { useRef, useEffect } from 'react';
import './LeapOfFaith.css';

export default function LeapOfFaith({ theme = 'miles' }) {
    const containerRef   = useRef(null);
    const speedLinesRef  = useRef(null);
    const imageInnerRef  = useRef(null);
    const titleRef       = useRef(null);
    const rafId          = useRef(null);
    const smoothProgress = useRef(0);   // valeur lerpée (fluide)
    const targetProgress = useRef(0);   // valeur brute du scroll

    useEffect(() => {
        const lerp      = (a, b, t) => a + (b - a) * t;
        const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        const getScrollProgress = () => {
            if (!containerRef.current) return 0;
            const rect       = containerRef.current.getBoundingClientRect();
            const totalScroll  = rect.height - window.innerHeight;
            const currentScroll = -rect.top;
            return Math.min(1, Math.max(0, currentScroll / totalScroll));
        };

        const animate = (time) => {
            rafId.current = requestAnimationFrame(animate);

            // Mise à jour de la cible chaque frame
            targetProgress.current = getScrollProgress();

            // Lerp vers la cible — lag cinématique (~0.06 = très fluide)
            smoothProgress.current = lerp(smoothProgress.current, targetProgress.current, 0.06);
            const p = smoothProgress.current;

            // ── Speed Lines : uniquement l'opacité (mouvement = CSS animation)
            if (speedLinesRef.current) {
                let opacity;
                if      (p < 0.05) opacity = p * 20;
                else if (p > 0.95) opacity = (1 - p) * 20;
                else               opacity = 1;
                speedLinesRef.current.style.opacity = opacity;
            }

            // ── Image Spider-Man
            if (imageInnerRef.current) {
                let imgOpacity, imgY, imgScale, imgRotate, imgX;

                // Facteur de float : rampe 0→1 à l'entrée, 1→0 à la sortie
                let floatBlend = 0;
                if      (p < 0.18) floatBlend = p / 0.18;
                else if (p > 0.82) floatBlend = 1 - (p - 0.82) / 0.18;
                else               floatBlend = 1;
                floatBlend = Math.max(0, Math.min(1, floatBlend));

                // Animation organique (temps réel)
                const floatY      = Math.sin(time * 0.00065) * 9  * floatBlend;
                const floatX      = Math.sin(time * 0.00028) * 4  * floatBlend;
                const floatRotate = Math.sin(time * 0.00038) * 0.7 * floatBlend;
                const floatScale  = 1 + Math.sin(time * 0.00050) * 0.012 * floatBlend;

                if (p < 0.18) {
                    // Entrée : monte depuis le bas
                    const eased = easeInOut(p / 0.18);
                    imgOpacity = eased;
                    imgY       = (1 - eased) * 85 + floatY;
                    imgX       = floatX;
                    imgScale   = (0.80 + eased * 0.20) * floatScale;
                    imgRotate  = floatRotate;
                } else if (p > 0.82) {
                    // Sortie : s'envole vers le haut
                    const eased = easeInOut((p - 0.82) / 0.18);
                    imgOpacity = 1 - eased;
                    imgY       = -eased * 72 + floatY;
                    imgX       = floatX;
                    imgScale   = (1 + eased * 0.14) * floatScale;
                    imgRotate  = floatRotate;
                } else {
                    // Milieu : dérive lente + float dynamique
                    const t = (p - 0.18) / 0.64;
                    imgOpacity = 1;
                    imgY       = -t * 26 + floatY;
                    imgX       = floatX;
                    imgScale   = floatScale;
                    imgRotate  = floatRotate;
                }

                imageInnerRef.current.style.opacity   = imgOpacity;
                imageInnerRef.current.style.transform =
                    `translate3d(${imgX}px, ${imgY}px, 0) scale(${imgScale}) rotate(${imgRotate}deg)`;
            }

            // ── Titre
            if (titleRef.current) {
                let titleOpacity;
                if      (p < 0.12) titleOpacity = 0;
                else if (p < 0.28) titleOpacity = easeInOut((p - 0.12) / 0.16);
                else if (p > 0.82) titleOpacity = 1 - easeInOut((p - 0.82) / 0.18);
                else               titleOpacity = 1;
                titleRef.current.style.opacity = Math.min(1, Math.max(0, titleOpacity));
            }
        };

        rafId.current = requestAnimationFrame(animate);

        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <section className={`leap-container theme-${theme}`} ref={containerRef}>
            <div className="leap-sticky">

                <div className="leap-sky" />

                {/* Speed Lines — l'animation de mouvement est 100% CSS (GPU) */}
                <div className="leap-speed-lines" ref={speedLinesRef}>
                    <div className="leap-speed-lines-inner" />
                </div>

                {/* Spider-Man */}
                <div className="leap-image-container">
                    <div className="leap-image-inner" ref={imageInnerRef}>
                        <div className="leap-image-glow" />
                        <img
                            src="/images/spider-man-new-generation-image.jpg"
                            alt="Spider-Man"
                            className="leap-spiderman-img"
                        />
                    </div>
                </div>

                {/* Titre cinématique */}
                <div className="leap-title" ref={titleRef}>
                    <span className="hero-glitch" data-text="WHAT'S UP DANGER">WHAT'S UP DANGER</span>
                </div>

            </div>
        </section>
    );
}
