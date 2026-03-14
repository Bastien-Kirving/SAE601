/**
 * App.jsx — Composant racine
 *
 * Scroll-based background transition:
 *   Section Hero (top) → MultiverseBackground (tunnel)
 *   On scroll → Glitch transition → GlitchBackground (reactive)
 *
 * Performance: uses refs + direct DOM manipulation for scroll opacity
 * to avoid React re-renders on every scroll tick.
 */

import { useDynamicTheme } from './hooks/useDynamicTheme';
import { useScrollAnimations } from './hooks/useScrollAnimations';

import MultiverseBackground from './components/MultiverseBackground/MultiverseBackground';
import GlitchBackground from './components/MultiverseBackground/GlitchBackground';
import HeroProfile from './components/HeroProfile/HeroProfile';
import HeroSkill from './components/Skills/HeroSkill';
import HeroProject from './components/HeroProject/HeroProject';
import DimensionalRift from './components/SpiderTransition/DimensionalRift';
import SpotTransition from './components/SpotTransition/SpotTransition';
import Contact from './components/Contact/Contact';
import LeapOfFaith from './components/LeapOfFaith/LeapOfFaith';
import Footer from './components/Footer/Footer';
import SpiderWebClick from './components/SpiderWebClick';
import Navbar from './components/Navbar/Navbar';
import ToastContainer from './components/Toast/ToastContainer';
import './styles/app.css';
import './styles/app.cursors.css';
import './styles/app.glitch.css';

export default function App() {
    // 1. Theme Logic
    const { theme, setTheme, activeThemeData, ThemeStyles } = useDynamicTheme('miles');

    // 2. Scroll Animation Logic
    const { refs, multiverseVisible, glitchVisible } = useScrollAnimations();

    return (
        <div className={`app-container theme-${theme}`}>
            {/* ---- DYNAMIC THEME INJECTION ---- */}
            <ThemeStyles />

            {/* ---- THEME SWITCHER (Icons) ---- */}
            <div className="theme-switcher">
                <button
                    onClick={() => setTheme('miles')}
                    className={`theme-btn ${theme === 'miles' ? 'active' : ''}`}
                    title="Theme Miles Morales"
                >
                    <img src="/images/Miles-Morales-Logo.png" alt="Miles" />
                </button>
                <button
                    onClick={() => setTheme('gwen')}
                    className={`theme-btn ${theme === 'gwen' ? 'active' : ''}`}
                    title="Theme Gwen Stacy"
                >
                    <img src="/images/spider-man-spider-gwen.png" alt="Gwen" />
                </button>
                <button
                    onClick={() => setTheme('glitch')}
                    className={`theme-btn ${theme === 'glitch' ? 'active' : ''}`}
                    title="Theme Glitch"
                >
                    <img src="/images/mtuisatcorbb1-.png" alt="Glitch" />
                </button>
            </div>

            {/* ---- BURGER MENU NAVIGATION ---- */}
            <Navbar theme={theme} />

            {/* ---- SPIDER WEB CLICK EFFECT ---- */}
            <SpiderWebClick theme={theme} />

            {/* ---- BACKGROUNDS (fixed, layered) ---- */}

            {/* Multiverse tunnel — visible at top */}
            <div ref={refs.multiverse} className="bg-layer" style={{ willChange: 'opacity' }}>
                {multiverseVisible && <MultiverseBackground theme={theme} themeData={activeThemeData} />}
            </div>

            {/* Glitch bg — visible when scrolled */}
            <div ref={refs.glitch} className="bg-layer" style={{ opacity: 0, willChange: 'opacity' }}>
                {glitchVisible && <GlitchBackground theme={theme} themeData={activeThemeData} />}
            </div>

            {/* ---- GLITCH BURST OVERLAY (on transition) — ref-driven, no React state ---- */}
            <div ref={refs.glitchBurst} className="glitch-burst-overlay">
                <div className="glitch-burst-line glitch-burst-line-1" />
                <div className="glitch-burst-line glitch-burst-line-2" />
                <div className="glitch-burst-line glitch-burst-line-3" />
                <div className="glitch-burst-line glitch-burst-line-4" />
                <div className="glitch-burst-line glitch-burst-line-5" />
                <div className="glitch-burst-flash" />
            </div>

            {/* ---- SCROLLABLE CONTENT ---- */}
            <div className="scroll-content" ref={refs.scrollContainer}>
                {/* Section 1: Hero (multiverse visible) */}
                <section className="section section-hero">
                    <div className="hero-content" ref={refs.heroContent}>
                        <h1 className="hero-title">
                            <span className="hero-title-line hero-glitch" data-text="Portfolio">BASTIEN LIEVRE</span>
                            <span className="hero-subtitle">Développeur Web Full-Stack</span>
                        </h1>
                        <div className="scroll-indicator">
                            <span>Scroll</span>
                            <div className="scroll-arrow" />
                        </div>
                    </div>
                </section>

                {/* Section 2: Présentation (glitch bg visible) */}
                <section id="section-profile" className="section section-content">
                    <HeroProfile theme={theme} />
                </section>

                {/* Transition: Dimensional Rift — portail multiverse */}
                <DimensionalRift theme={theme} />

                {/* Section 3: Projets (glitch bg flows) */}
                <section id="section-projects" className="section section-projects">
                    <HeroProject theme={theme} />
                </section>

                {/* Transition: The Spot — portails dimensionnels */}
                <SpotTransition theme={theme} />

                {/* Section 4: Compétences */}
                <section id="section-skills" className="section section-skills">
                    <HeroSkill theme={theme} />
                </section>

                {/* Transition: Leap of Faith (What's up danger) */}
                <LeapOfFaith theme={theme} />

                {/* Section 5: Contact */}
                <section id="section-contact" className="section section-contact">
                    <Contact theme={theme} />
                </section>

                {/* Footer */}
                <Footer theme={theme} />
            </div>

            <ToastContainer />
        </div>
    );
}
