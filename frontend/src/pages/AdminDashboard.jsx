import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/apiFetch';

function StatCard({ label, value, accent, icon, to }) {
    const card = (
        <div className="dash-stat-card" style={{ '--dash-accent': accent }}>
            <span className="dash-stat-icon">{icon}</span>
            <div className="dash-stat-value">{value ?? '—'}</div>
            <div className="dash-stat-label">{label}</div>
        </div>
    );
    return to ? <Link to={to} style={{ textDecoration: 'none' }}>{card}</Link> : card;
}

export default function AdminDashboard({ token }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiFetch('/api/stats')
            .then(res => {
                if (res.ok) { setStats(res.data); }
                else { setError('Impossible de charger les statistiques.'); }
                setLoading(false);
            })
            .catch(() => { setError('Impossible de charger les statistiques.'); setLoading(false); });
    }, [token]);

    if (loading) return <div style={{ opacity: 0.5, padding: '1rem' }}>Chargement...</div>;
    if (error)   return <div style={{ color: 'var(--admin-accent-red)' }}>{error}</div>;
    if (!stats)  return <div style={{ color: 'var(--admin-accent-red)' }}>Réponse API invalide.</div>;

    return (
        <div className="dash-root">
            <div className="admin-header-actions" style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>Vue d'ensemble</h3>
            </div>

            {/* --- Cartes stats --- */}
            <div className="dash-grid">
                <StatCard
                    label="Projets"
                    value={stats.projects}
                    accent="var(--admin-accent-blue)"
                    icon="◈"
                    to="/admin/projects"
                />
                <StatCard
                    label="Compétences"
                    value={stats.skills}
                    accent="#a78bfa"
                    icon="◆"
                    to="/admin/skills"
                />
                <StatCard
                    label="Messages total"
                    value={stats.messages}
                    accent="var(--admin-accent-red)"
                    icon="◉"
                    to="/admin/messages"
                />
                <StatCard
                    label="Non lus"
                    value={stats.unread_messages}
                    accent={stats.unread_messages > 0 ? '#f59e0b' : 'var(--admin-text-secondary)'}
                    icon="◎"
                    to="/admin/messages"
                />
            </div>

            {/* --- Derniers messages --- */}
            <div className="dash-section">
                <div className="dash-section-header">
                    <h4>Derniers messages</h4>
                    <Link to="/admin/messages" className="dash-see-all">Voir tout →</Link>
                </div>

                {stats.recent_messages.length === 0 ? (
                    <p className="admin-subtitle">Aucun message reçu pour l'instant.</p>
                ) : (
                    <div className="dash-messages">
                        {stats.recent_messages.map(msg => (
                            <div key={msg.id} className={`dash-msg-row ${msg.is_read ? 'read' : ''}`}>
                                <div className="dash-msg-dot" />
                                <div className="dash-msg-info">
                                    <span className="dash-msg-name">{msg.name}</span>
                                    <span className="dash-msg-subject">{msg.subject || 'Sans objet'}</span>
                                </div>
                                <span className="dash-msg-date">
                                    {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- Raccourcis --- */}
            <div className="dash-section">
                <div className="dash-section-header">
                    <h4>Accès rapide</h4>
                </div>
                <div className="dash-shortcuts">
                    <Link to="/admin/projects" className="dash-shortcut">+ Nouveau projet</Link>
                    <Link to="/admin/skills"   className="dash-shortcut">+ Nouvelle compétence</Link>
                    <Link to="/admin/profile"  className="dash-shortcut">Modifier le profil</Link>
                    <Link to="/admin/themes"   className="dash-shortcut">Changer le thème</Link>
                </div>
            </div>
        </div>
    );
}
