import { useState, useCallback } from 'react';
import './Navbar.css';

const NAV_LINKS = [
    { id: 'section-profile', label: 'Profil' },
    { id: 'section-projects', label: 'Projets' },
    { id: 'section-skills', label: 'Compétences' },
    { id: 'section-contact', label: 'Contact' },
];

export default function Navbar({ theme = 'miles' }) {
    const [open, setOpen] = useState(false);

    const toggle = () => setOpen((prev) => !prev);

    const scrollTo = useCallback((sectionId) => {
        setOpen(false);
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    return (
        <nav className={`burger-nav ${open ? 'burger-nav--open' : ''}`}>
            {/* Burger Icon */}
            <button
                className="burger-icon"
                onClick={toggle}
                aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={open}
            >
                <span className="burger-bar burger-bar--1" />
                <span className="burger-bar burger-bar--2" />
                <span className="burger-bar burger-bar--3" />
            </button>

            {/* Full-screen overlay menu */}
            <div className="burger-overlay" onClick={toggle}>
                <ul className="burger-menu" onClick={(e) => e.stopPropagation()}>
                    {NAV_LINKS.map((link, i) => (
                        <li
                            key={link.id}
                            className="burger-menu-item"
                            style={{ transitionDelay: open ? `${0.1 + i * 0.08}s` : '0s' }}
                        >
                            <button
                                className="burger-menu-link"
                                onClick={() => scrollTo(link.id)}
                            >
                                <span className="burger-menu-number">0{i + 1}</span>
                                <span className="burger-menu-label" data-text={link.label}>{link.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
