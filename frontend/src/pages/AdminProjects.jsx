import { useState, useEffect } from 'react';
import { apiFetch } from '../api/apiFetch';
import toast from '../components/Toast/toastManager';

export default function AdminProjects({ token, onAuthError }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        project_url: '',
        github_url: '',
        is_active: 1,
        sort_order: 0
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        const { ok, data } = await apiFetch('/api/projects', { auth: false });
        if (ok) {
            setProjects(data);
        } else {
            setError('Erreur de chargement des projets');
        }
        setLoading(false);
    };

    const handleEdit = (project) => {
        setEditingProject(project.id);
        setFormData({
            title: project.title,
            description: project.description || '',
            image_url: project.image_url || '',
            project_url: project.project_url || '',
            github_url: project.github_url || '',
            is_active: project.is_active,
            sort_order: project.sort_order
        });
    };

    const handleCreateNew = () => {
        setEditingProject('new');
        setFormData({
            title: '',
            description: '',
            image_url: '',
            project_url: '',
            github_url: '',
            is_active: 1,
            sort_order: 0
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce projet définitivement ?")) return;
        const { ok } = await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
        if (ok) {
            toast.success('Projet supprimé');
            fetchProjects();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingProject === 'new' ? '/api/projects' : `/api/projects/${editingProject}`;
        const method = editingProject === 'new' ? 'POST' : 'PUT';

        const { ok } = await apiFetch(url, { method, body: formData });
        if (ok) {
            toast.success(editingProject === 'new' ? 'Projet créé !' : 'Projet mis à jour !');
            setEditingProject(null);
            fetchProjects();
        }
    };

    return (
        <div className="admin-projects">
            <div className="admin-header-actions">
                <h3>Gestion des Projets</h3>
                <button onClick={handleCreateNew} className="action-btn success">+ Nouveau Projet</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {editingProject && (
                <div className="admin-form-container">
                    <h4>{editingProject === 'new' ? 'Créer un projet' : 'Modifier le projet'}</h4>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-group">
                            <label>Titre</label>
                            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Description (Aussi utilisée pour l'affichage de la carte)</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="4"></textarea>
                        </div>
                        <div className="form-group">
                            <label>Image URL (Ex: /images/projet.jpg)</label>
                            <input type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
                        </div>
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Lien Projet</label>
                                <input type="text" value={formData.project_url} onChange={e => setFormData({ ...formData, project_url: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Lien GitHub</label>
                                <input type="text" value={formData.github_url} onChange={e => setFormData({ ...formData, github_url: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group-row">
                            <div className="form-group checkbox-group">
                                <label>Visible</label>
                                <input type="checkbox" checked={formData.is_active === 1} onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })} />
                            </div>
                            <div className="form-group">
                                <label>Ordre d'affichage</label>
                                <input type="number" value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="action-btn submit">Sauvegarder</button>
                            <button type="button" onClick={() => setEditingProject(null)} className="action-btn cancel">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Ordre</th>
                            <th>Image</th>
                            <th>Titre</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Chargement...</td></tr>
                        )}
                        {!loading && projects.map(p => (
                            <tr key={p.id} >
                                <td>{p.sort_order}</td>
                                <td>
                                    {p.image_url ? <img src={p.image_url} alt="mini" className="table-thumbnail" /> : 'Aucune'}
                                </td>
                                <td>{p.title}</td>
                                <td>
                                    <span className={`status-badge ${p.is_active ? 'active' : 'inactive'}`}>
                                        {p.is_active ? 'Visible' : 'Masqué'}
                                    </span>
                                </td>
                                <td className="table-actions">
                                    <button onClick={() => handleEdit(p)} className="action-btn edit">Modifier</button>
                                    <button onClick={() => handleDelete(p.id)} className="action-btn delete">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                        {!loading && projects.length === 0 && (
                            <tr><td colSpan="5">Aucun projet trouvé.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
