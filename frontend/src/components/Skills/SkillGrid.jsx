import { useMemo } from 'react';
import './SkillGrid.css';

export default function SkillGrid({ skills, theme }) {
    if (!skills || skills.length === 0) return null;

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Memoize the rows to prevent reshuffling and jumps on re-render
    const rows = useMemo(() => [
        shuffleArray(skills),
        shuffleArray(skills),
        shuffleArray(skills),
        shuffleArray(skills)
    ], [skills]);

    const getImageUrl = (skillName) => {
        const safeName = skillName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return `/images/skills/${safeName}.png`;
    };

    return (
        <div className={`skill-grid-container theme-${theme}`}>
            {rows.map((rowSkills, rowIndex) => {
                if (rowSkills.length === 0) return null;
                
                // Dupliquer les compétences pour remplir la rangée.
                // 20 cartes suffisent à couvrir les plus grands écrans (110px + gap).
                let paddedSkills = [...rowSkills];
                while (paddedSkills.length < 20) {
                    paddedSkills = [...paddedSkills, ...rowSkills];
                }

                const direction = rowIndex % 2 === 0 ? 'left' : 'right';
                const speed = 50 + (rowIndex * 10); // ex: 50s, 60s, 70s, 80s

                return (
                    <div key={rowIndex} className="marquee-row" style={{ '--anim-duration': `${speed}s` }}>
                        <div className={`marquee-track marquee-dir-${direction}`}>
                            <div className="marquee-group">
                                {paddedSkills.map((skill, i) => (
                                    <div key={`row-${rowIndex}-track-1-${i}`} className="marquee-item">
                                        <div className="skill-card-inner">
                                            <div className="skill-icon-img">
                                                <img 
                                                    src={skill.icon ? (skill.icon.startsWith('http') ? skill.icon : `${import.meta.env.VITE_API_BASE_URL || ''}${skill.icon}`) : getImageUrl(skill.name)} 
                                                    alt={skill.name}
                                                    onError={(e) => {
                                                        if (skill.icon && !e.target.dataset.triedFallback) {
                                                            e.target.dataset.triedFallback = "true";
                                                            e.target.src = getImageUrl(skill.name);
                                                        } else {
                                                            e.target.style.display = 'none';
                                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                                <div className="skill-icon-fallback" style={{ display: 'none' }}>
                                                    {skill.name.charAt(0)}
                                                </div>
                                            </div>
                                            <span className="skill-name">{skill.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="marquee-group" aria-hidden="true">
                                {paddedSkills.map((skill, i) => (
                                    <div key={`row-${rowIndex}-track-2-${i}`} className="marquee-item">
                                        <div className="skill-card-inner">
                                            <div className="skill-icon-img">
                                                <img 
                                                    src={skill.icon ? (skill.icon.startsWith('http') ? skill.icon : `${import.meta.env.VITE_API_BASE_URL || ''}${skill.icon}`) : getImageUrl(skill.name)} 
                                                    alt={skill.name}
                                                    onError={(e) => {
                                                        if (skill.icon && !e.target.dataset.triedFallback) {
                                                            e.target.dataset.triedFallback = "true";
                                                            e.target.src = getImageUrl(skill.name);
                                                        } else {
                                                            e.target.style.display = 'none';
                                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                                <div className="skill-icon-fallback" style={{ display: 'none' }}>
                                                    {skill.name.charAt(0)}
                                                </div>
                                            </div>
                                            <span className="skill-name">{skill.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
