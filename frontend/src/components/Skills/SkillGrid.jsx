import { useState, useEffect } from 'react';
import './SkillGrid.css';

export default function SkillGrid({ skills, theme }) {
    if (!skills || skills.length === 0) return null;

    // Fonction pour mélanger un tableau (Fisher-Yates shuffle)
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Chaque ligne contient TOUTES les compétences, mais dans un ordre aléatoire différent
    const rows = [
        shuffleArray(skills),
        shuffleArray(skills),
        shuffleArray(skills),
        shuffleArray(skills)
    ];

    const getImageUrl = (skillName) => {
        const safeName = skillName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return `/images/skills/${safeName}.png`;
    };

    return (
        <div className={`skill-grid-container theme-${theme}`}>
            {rows.map((rowSkills, rowIndex) => {
                if (rowSkills.length === 0) return null;
                
                // Dupliquer les compétences de la ligne pour que l'effet visuel Marquee fonctionne
                // sans fin sur les grands écrans (min 8 cartes visuelles pour être sûr).
                let paddedSkills = [...rowSkills];
                while (paddedSkills.length < 8) {
                    paddedSkills = [...paddedSkills, ...rowSkills];
                }

                const direction = rowIndex % 2 === 0 ? 'left' : 'right';
                const speed = 25 + (rowIndex * 5); // ex: 25s, 30s, 35s, 40s

                const TrackContent = () => (
                    <>
                        {paddedSkills.map((skill, i) => (
                            <div key={`${skill.id || skill.name}-track-${i}`} className="marquee-item">
                                <div className="skill-card-inner">
                                    <div className="skill-icon-img">
                                        <img 
                                            src={skill.icon ? (skill.icon.startsWith('http') ? skill.icon : `${import.meta.env.VITE_API_BASE_URL || ''}${skill.icon}`) : getImageUrl(skill.name)} 
                                            alt={skill.name}
                                            onError={(e) => {
                                                if (skill.icon && !e.target.dataset.triedFallback) {
                                                    // Si l'icône de base foire, on essaie l'image locale
                                                    e.target.dataset.triedFallback = "true";
                                                    e.target.src = getImageUrl(skill.name);
                                                } else {
                                                    // Si tout foire, on affiche le bloc texte
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
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
                    </>
                );

                return (
                    <div key={rowIndex} className="marquee-row" style={{ '--anim-duration': `${speed}s` }}>
                        <div className={`marquee-track marquee-dir-${direction}`}>
                            <div className="marquee-group">
                                <TrackContent />
                            </div>
                            <div className="marquee-group" aria-hidden="true">
                                <TrackContent />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
