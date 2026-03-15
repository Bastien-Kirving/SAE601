import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/apiFetch';

const LIMIT = 20;

export default function AdminMessages({ token, onAuthError }) {
    const [messages,   setMessages]   = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page,       setPage]       = useState(1);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState('');

    const fetchMessages = useCallback(async (targetPage) => {
        setLoading(true);
        const { ok, data } = await apiFetch(`/api/messages?page=${targetPage}&limit=${LIMIT}`);
        if (ok) {
            setMessages(data.messages || []);
            setPagination(data.pagination || null);
        } else {
            setError('Erreur lors du chargement des messages');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMessages(page);
    }, [page, fetchMessages]);

    const handleMarkRead = async (id) => {
        const { ok } = await apiFetch(`/api/messages/${id}`, { method: 'PUT' });
        if (ok) {
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: 1 } : m));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce message ?')) return;
        const { ok } = await apiFetch(`/api/messages/${id}`, { method: 'DELETE' });
        if (ok) {
            // Recharger la page courante (le total a changé)
            fetchMessages(page);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="admin-messages">
            <div className="admin-header-flex">
                <h3>
                    Boîte de réception
                    {pagination && ` (${pagination.total} message${pagination.total > 1 ? 's' : ''})`}
                </h3>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <p style={{ opacity: 0.5 }}>Chargement des messages...</p>
            ) : messages.length === 0 ? (
                <p>Aucun message reçu pour le moment.</p>
            ) : (
                <>
                    <div className="messages-list">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message-card ${msg.is_read ? 'read' : 'unread'}`}>
                                <div className="message-header">
                                    <div className="user-info">
                                        <strong>{msg.name}</strong> ({msg.email})
                                        <span className="msg-date">{new Date(msg.created_at).toLocaleString('fr-FR')}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {!msg.is_read && (
                                            <button
                                                className="action-btn success"
                                                onClick={() => handleMarkRead(msg.id)}
                                                title="Marquer comme lu"
                                            >
                                                ✓ Lu
                                            </button>
                                        )}
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(msg.id)}
                                            title="Supprimer le message"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                                <h4>{msg.subject || 'Sans sujet'}</h4>
                                <div className="message-content">
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contrôles de pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                className="action-btn"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                            >
                                ← Précédent
                            </button>

                            <span style={{ opacity: 0.7 }}>
                                Page {pagination.page} / {pagination.pages}
                            </span>

                            <button
                                className="action-btn"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= pagination.pages}
                            >
                                Suivant →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
