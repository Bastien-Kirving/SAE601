import { useState, useEffect } from 'react';
import { apiFetch } from '../api/apiFetch';

export default function AdminMessages({ token, onAuthError }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        const { ok, data } = await apiFetch('/api/messages');
        if (ok) {
            setMessages(data.messages || []);
        } else {
            setError('Erreur lors du chargement des messages');
        }
        setLoading(false);
    };

    const handleMarkRead = async (id) => {
        const { ok } = await apiFetch(`/api/messages/${id}`, { method: 'PUT' });
        if (ok) {
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: 1 } : m));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce message ?')) return;

        const { ok, error } = await apiFetch(`/api/messages/${id}`, {
            method: 'DELETE'
        });

        if (ok) {
            setMessages(prev => prev.filter(m => m.id !== id));
        } else {
            alert(error || 'Erreur lors de la suppression');
        }
    };

    return (
        <div className="admin-messages">
            <div className="admin-header-flex">
                <h3>Boîte de réception ({messages.length})</h3>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {loading ? (
                <p style={{ opacity: 0.5 }}>Chargement des messages...</p>
            ) : messages.length === 0 ? (
                <p>Aucun message reçu pour le moment.</p>
            ) : (
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
            )}
        </div>
    );
}
