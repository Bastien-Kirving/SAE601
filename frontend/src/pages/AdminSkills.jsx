import { useState, useEffect } from 'react';
import { apiFetch } from '../api/apiFetch';
import toast from '../components/Toast/toastManager';

export default function AdminSkills({ token, onAuthError }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ name: '', icon: '' });
    const [editingSkill, setEditingSkill] = useState(null);

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        const { ok, data } = await apiFetch('/api/skills', { auth: false });
        if (ok) {
            setSkills(data);
        } else {
            setError('Erreur de chargement des compétences');
        }
        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('folder', 'skills');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });

            const result = await response.json();
            if (response.ok) {
                setFormData({ ...formData, icon: result.url });
                toast.success('Image uploadée !');
            } else {
                toast.error(result.error || "Erreur d'upload");
            }
        } catch (err) {
            toast.error("Erreur réseau lors de l'upload");
        } finally {
            setUploading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingSkill('new');
        setFormData({ name: '', icon: '' });
    };

    const handleEdit = (skill) => {
        setEditingSkill(skill.id);
        setFormData({
            name: skill.name,
            icon: skill.icon || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingSkill === 'new' ? '/api/skills' : `/api/skills/${editingSkill}`;
        const method = editingSkill === 'new' ? 'POST' : 'PUT';

        const { ok } = await apiFetch(url, { method, body: formData });
        if (ok) {
            toast.success(editingSkill === 'new' ? 'Compétence ajoutée !' : 'Compétence mise à jour !');
            setEditingSkill(null);
            fetchSkills();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette compétence ?')) return;
        const { ok } = await apiFetch(`/api/skills/${id}`, { method: 'DELETE' });
        if (ok) {
            toast.success('Compétence supprimée');
            fetchSkills();
        }
    };

    return (
        <div className="admin-skills">
            <div className="admin-header-actions">
                <h3>Gestion des Compétences</h3>
                <button onClick={handleCreateNew} className="action-btn success">+ Nouvelle Compétence</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {editingSkill && (
                <div className="admin-form-container">
                    <h4>{editingSkill === 'new' ? 'Ajouter une compétence' : 'Modifier la compétence'}</h4>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Titre de la compétence</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Ex: React, PHP..." />
                            </div>
                        </div>
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Image (URL)</label>
                                <input type="text" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="URL de l'image ou icône" />
                            </div>
                            <div className="form-group">
                                <label>Ou importer un fichier</label>
                                <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                {uploading && <span className="upload-loader">Upload en cours...</span>}
                            </div>
                        </div>

                        {formData.icon && (
                            <div className="form-preview">
                                <label>Aperçu</label>
                                <img src={formData.icon.startsWith('http') ? formData.icon : `${import.meta.env.VITE_API_BASE_URL || ''}${formData.icon}`} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="action-btn submit" disabled={uploading}>Sauvegarder</button>
                            <button type="button" onClick={() => setEditingSkill(null)} className="action-btn cancel">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Aperçu</th>
                            <th>Titre</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Chargement...</td></tr>
                        )}
                        {!loading && skills.map(s => (
                            <tr key={s.id}>
                                <td style={{ width: '80px' }}>
                                    {s.icon ? (
                                        <img 
                                            src={s.icon.startsWith('http') ? s.icon : `${import.meta.env.VITE_API_BASE_URL || ''}${s.icon}`} 
                                            alt={s.name} 
                                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} 
                                        />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                                    )}
                                </td>
                                <td><strong>{s.name}</strong></td>
                                <td>
                                    <button onClick={() => handleEdit(s)} className="action-btn edit">Modifier</button>
                                    <button onClick={() => handleDelete(s.id)} className="action-btn delete">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
