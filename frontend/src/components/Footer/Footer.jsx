import './Footer.css';

/* Mini toile d'araignée décorative */
function SpiderCorner({ side }) {
    const flip = side === 'right' ? 'scale(-1,1)' : '';
    return (
        <svg className="footer-web" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
            <g transform={flip} style={{ transformOrigin: '60px 40px' }}>
                {/* rayons */}
                {[0, 18, 36, 54, 72].map((a, i) => {
                    const rad = (a * Math.PI) / 180;
                    return (
                        <line key={i}
                            x1="0" y1="80"
                            x2={Math.cos(rad) * 110}
                            y2={80 - Math.sin(rad) * 110}
                            className="footer-web-line"
                        />
                    );
                })}
                {/* anneaux concentriques */}
                {[25, 50, 75, 100].map((r, i) => {
                    const points = [0, 18, 36, 54, 72].map(a => {
                        const rad = (a * Math.PI) / 180;
                        const scale = r / 110;
                        return `${Math.cos(rad) * 110 * scale},${80 - Math.sin(rad) * 110 * scale}`;
                    }).join(' ');
                    return <polyline key={i} points={`0,80 ${points}`} className="footer-web-line" fill="none" />;
                })}
            </g>
        </svg>
    );
}

export default function Footer({ theme = 'miles' }) {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            {/* Ligne accent thème */}
            <div className="footer-accent-line" />

            {/* Toiles décoratives */}
            <SpiderCorner side="left" />
            <SpiderCorner side="right" />

            <div className="footer-inner">
                {/* Logo / Signature */}
                <div className="footer-brand">
                    <span className="footer-name">Bastien Lièvre</span>
                    <span className="footer-role">Développeur Web Full-Stack</span>
                </div>

                {/* Centre */}
                <div className="footer-center">
                    <span className="footer-spider">🕷</span>
                    <p className="footer-copy">
                        © {year} — Fait avec <span className="footer-heart">♥</span> &amp; React
                    </p>
                    <p className="footer-universe">
                        <span className="footer-universe-text">Somewhere in the Spider-Verse</span>
                    </p>
                </div>

                {/* Liens */}
                <div className="footer-links">
                    <a
                        href="https://github.com/Belrode"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        aria-label="GitHub"
                    >
                        <span className="footer-link-icon footer-link-icon--github" aria-hidden="true" />
                    </a>
                    <span className="footer-link-sep">·</span>
                    <a
                        href="https://www.linkedin.com/in/bastien-lievre-developpementweb-alternance/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        aria-label="LinkedIn"
                    >
                        <span className="footer-link-icon footer-link-icon--linkedin" aria-hidden="true" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
