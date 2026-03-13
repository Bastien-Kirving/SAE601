import { useState, useEffect } from 'react';
import { apiFetch } from '../api/apiFetch';
import toast from '../components/Toast/toastManager';

const DEFAULT_NODES = [
    { id: '1', label: '21 ans', detail: 'Né en 2004', pos: { top: '25%', left: '85%' } },
    { id: '2', label: 'BUT MMI', detail: 'Métiers du Multimédia', pos: { top: '60%', left: '90%' } },
    { id: '3', label: 'Passion', detail: 'Programmation', pos: { top: '85%', left: '70%' } },
    { id: '4', label: 'Full-Stack', detail: 'React • PHP', pos: { top: '85%', left: '30%' } },
    { id: '5', label: 'France', detail: 'Disponible', pos: { top: '60%', left: '10%' } },
    { id: '6', label: 'Créatif', detail: 'Three.js • CSS', pos: { top: '25%', left: '15%' } },
];

export default function AdminProfile({ token, onAuthError }) {
    const [settings, setSettings] = useState({
        hero_title: '',
        hero_bio: '',
        hero_image: '',
        hero_nodes: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { ok, data } = await apiFetch('/api/settings', { auth: false });
        if (!ok) {
            setError('Erreur de chargement');
            setLoading(false);
            return;
        }

        let nodes = DEFAULT_NODES;
        if (data.hero_nodes) {
            try {
                const parsedNodes = JSON.parse(data.hero_nodes);
                if (Array.isArray(parsedNodes)) {
                    nodes = parsedNodes.map(node => ({
                        ...node,
                        pos: node.pos || { top: '50%', left: '50%' }
                    }));
                }
            } catch (e) {
                console.error("Erreur parse nodes JSON", e);
            }
        }

        setSettings({
            hero_title: data.hero_title || '',
            hero_bio: data.hero_bio || '',
            hero_image: data.hero_image || '',
            hero_nodes: nodes
        });
        setLoading(false);
    };

    const handleNodeChange = (index, field, value) => {
        const newNodes = [...settings.hero_nodes];
        newNodes[index] = { ...newNodes[index], [field]: value };
        setSettings({ ...settings, hero_nodes: newNodes });
    };

    const handleAddNode = () => {
        if (settings.hero_nodes.length >= 6) {
            toast.warning("Vous avez atteint le nombre maximum de bulles (6).");
            return;
        }

        // Zones de distribution périphérique pour éviter le titre (haut) et la photo (centre)
        const zones = [
            { t: 25, l: 85 }, // Haut-Droite
            { t: 60, l: 90 }, // Milieu-Droite
            { t: 85, l: 70 }, // Bas-Droite
            { t: 85, l: 30 }, // Bas-Gauche
            { t: 60, l: 10 }, // Milieu-Gauche
            { t: 25, l: 15 }, // Haut-Gauche
        ];

        const count = settings.hero_nodes.length;
        const zone = zones[count % zones.length];

        // Petit décalage si on dépasse le nombre de zones (6)
        const iteration = Math.floor(count / zones.length);
        const jitterX = iteration * 3;
        const jitterY = iteration * 3;

        const newNode = {
            id: Date.now().toString(),
            label: 'Nouvelle Info',
            detail: 'Détail ici',
            icon: '',
            pos: {
                top: `${zone.t + jitterY}%`,
                left: `${zone.l + jitterX}%`
            }
        };
        setSettings({ ...settings, hero_nodes: [...settings.hero_nodes, newNode] });
    };

    const handleRemoveNode = (index) => {
        if (window.confirm('Supprimer cette bulle d\'info ?')) {
            const newNodes = settings.hero_nodes.filter((_, i) => i !== index);
            setSettings({ ...settings, hero_nodes: newNodes });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const body = {
            hero_title: settings.hero_title,
            hero_bio: settings.hero_bio,
            hero_image: settings.hero_image,
            hero_nodes: JSON.stringify(settings.hero_nodes)
        };

        const { ok } = await apiFetch('/api/settings', { method: 'PUT', body });
        if (ok) {
            toast.success('Profil mis à jour avec succès !');
        }
    };

    return (
        <div className="admin-profile">
            {error && <div className="error-message">{error}</div>}
            {loading && <div style={{ opacity: 0.5, marginBottom: '1rem' }}>Chargement...</div>}

            <form onSubmit={handleSave} className="admin-form">
                <div className="admin-form-container">
                    <h3>Identité Principale</h3>
                    <div className="form-group">
                        <label>Titre Principal (H1)</label>
                        <input
                            type="text"
                            value={settings.hero_title}
                            onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sous-titre / Bio</label>
                        <textarea
                            value={settings.hero_bio}
                            onChange={e => setSettings({ ...settings, hero_bio: e.target.value })}
                            rows="2"
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label>Image de Profil (URL)</label>
                        <input
                            type="text"
                            value={settings.hero_image}
                            onChange={e => setSettings({ ...settings, hero_image: e.target.value })}
                        />
                    </div>
                </div>

                <div className="admin-form-container" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Bulles d'Informations (Nodes)</h3>
                        {settings.hero_nodes.length < 6 && (
                            <button type="button" onClick={handleAddNode} className="action-btn success">
                                + Ajouter une bulle
                            </button>
                        )}
                    </div>
                    <p className="admin-subtitle" style={{ marginBottom: '1.5rem' }}>
                        Ces informations apparaissent autour de votre photo sur la toile.
                    </p>

                    <div className="nodes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {settings.hero_nodes.map((node, index) => (
                            <div key={node.id || index} className="node-edit-card" style={{ border: '1px solid var(--admin-border-color)', padding: '1.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', position: 'relative' }}>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveNode(index)}
                                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--admin-accent-red)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', padding: '0.5rem' }}
                                    title="Supprimer"
                                >
                                    ✕
                                </button>
                                <h4 style={{ marginBottom: '1.5rem', color: 'var(--admin-accent-blue)' }}>Bulle #{index + 1}</h4>
                                <div className="form-group">
                                    <label>Libellé (gras)</label>
                                    <input
                                        type="text"
                                        value={node.label}
                                        onChange={e => handleNodeChange(index, 'label', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Détail (petit)</label>
                                    <input
                                        type="text"
                                        value={node.detail}
                                        onChange={e => handleNodeChange(index, 'detail', e.target.value)}
                                    />
                                </div>
                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Top (%)</label>
                                        <input
                                            type="text"
                                            value={node.pos.top}
                                            onChange={e => {
                                                const newNodes = [...settings.hero_nodes];
                                                newNodes[index].pos = { ...newNodes[index].pos, top: e.target.value };
                                                setSettings({ ...settings, hero_nodes: newNodes });
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Left (%)</label>
                                        <input
                                            type="text"
                                            value={node.pos.left}
                                            onChange={e => {
                                                const newNodes = [...settings.hero_nodes];
                                                newNodes[index].pos = { ...newNodes[index].pos, left: e.target.value };
                                                setSettings({ ...settings, hero_nodes: newNodes });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-actions" style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <button type="submit" className="action-btn submit" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                        Sauvegarder tout le Profil
                    </button>
                </div>
            </form>
        </div>
    );
}
