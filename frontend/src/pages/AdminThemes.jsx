import { useState, useEffect } from 'react';
import { apiFetch } from '../api/apiFetch';
import toast from '../components/Toast/toastManager';

export default function AdminThemes() {
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { ok, data } = await apiFetch('/api/themes', { auth: false });
        if (ok) {
            setThemes(data.themes || []);
        } else {
            setError('Erreur de chargement des thèmes');
        }
        setLoading(false);
    };

    const handleThemeChange = (id, field, value) => {
        const safeThemes = Array.isArray(themes) ? themes : [];
        setThemes(safeThemes.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleResetDefaults = (themeId, themeName) => {
        const baseColors = {
            'miles': { primary: '#FF1744', secondary: '#E040FB', bg: '#0a0510', text: '#FFFFFF' },
            'gwen':  { primary: '#E040FB', secondary: '#00E5FF', bg: '#FFFFFF',  text: '#000000' },
            'glitch':{ primary: '#00FF88', secondary: '#FF00FF', bg: '#000000',  text: '#FFFFFF' }
        };

        const nameLower = themeName.toLowerCase();
        let key = '';
        if (nameLower.includes('gwen')) key = 'gwen';
        else if (nameLower.includes('miles')) key = 'miles';
        else if (nameLower.includes('glitch')) key = 'glitch';

        if (key && baseColors[key]) {
            const defaults = baseColors[key];
            const safeThemes = Array.isArray(themes) ? themes : [];
            setThemes(safeThemes.map(t => t.id === themeId ? {
                ...t,
                primary_color: defaults.primary,
                secondary_color: defaults.secondary,
                bg_color: defaults.bg,
                text_color: defaults.text
            } : t));
            toast.success(`Couleurs réinitialisées pour ${themeName}`);
        }
    };

    const handleSaveTheme = async (theme) => {
        const { ok } = await apiFetch(`/api/themes/${theme.id}`, {
            method: 'PUT',
            body: {
                name: theme.name,
                primary_color: theme.primary_color,
                secondary_color: theme.secondary_color,
                bg_color: theme.bg_color,
                text_color: theme.text_color
            }
        });

        if (ok) {
            toast.success(`Thème ${theme.name} sauvegardé !`);
        }
    };

    return (
        <div className="admin-themes">
            {error && <div className="error-message">{error}</div>}

            <div className="admin-form-container">
                <h3>Éditeur de Couleurs (Thèmes Dynamiques)</h3>
                <p className="admin-subtitle">Modifiez les variables de couleurs pour chaque identité.</p>
                {loading && <p style={{ opacity: 0.5 }}>Chargement...</p>}
                <div className="themes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {(Array.isArray(themes) ? themes : []).map(theme => (
                        <div key={theme.id} className="theme-edit-card" style={{ border: '1px solid var(--admin-border-color)', padding: '1.5rem', borderRadius: '8px', background: 'var(--admin-surface-color)' }}>
                            <h4 style={{ textTransform: 'capitalize', marginBottom: '1.5rem', color: 'var(--admin-text-primary)' }}>{theme.name}</h4>

                            <div className="form-group">
                                <label>Couleur Primaire</label>
                                <input type="color" value={theme.primary_color || '#000000'} onChange={e => handleThemeChange(theme.id, 'primary_color', e.target.value)} style={{ width: '100%', height: '40px', cursor: 'pointer' }} />
                                <small>{theme.primary_color}</small>
                            </div>

                            <div className="form-group">
                                <label>Couleur Secondaire / Magique</label>
                                <input type="color" value={theme.secondary_color || '#000000'} onChange={e => handleThemeChange(theme.id, 'secondary_color', e.target.value)} style={{ width: '100%', height: '40px', cursor: 'pointer' }} />
                                <small>{theme.secondary_color}</small>
                            </div>

                            <div className="form-group">
                                <label>Couleur de Fond Globale</label>
                                <input type="color" value={theme.bg_color || '#000000'} onChange={e => handleThemeChange(theme.id, 'bg_color', e.target.value)} style={{ width: '100%', height: '40px', cursor: 'pointer' }} />
                                <small>{theme.bg_color}</small>
                            </div>

                            <div className="form-group">
                                <label>Couleur du Texte</label>
                                <input type="color" value={theme.text_color || '#ffffff'} onChange={e => handleThemeChange(theme.id, 'text_color', e.target.value)} style={{ width: '100%', height: '40px', cursor: 'pointer' }} />
                                <small>{theme.text_color}</small>
                            </div>

                            <div className="form-actions-inline" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={() => handleSaveTheme(theme)} className="action-btn submit" style={{ flex: 2, margin: 0 }}>Mettre à jour</button>
                                <button onClick={() => handleResetDefaults(theme.id, theme.name)} className="action-btn cancel" style={{ flex: 1 }} title="Restaurer les couleurs par défaut">Défaut</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
