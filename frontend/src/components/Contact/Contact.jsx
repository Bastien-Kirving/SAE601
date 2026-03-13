import { useState } from 'react';
import toast from '../Toast/toastManager';
import './Contact.css';

export default function Contact({ theme = 'miles' }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        content: ''
    });
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            setStatus('success');
            toast.success('Message envoyé avec succès');
            setFormData({ name: '', email: '', subject: '', content: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            toast.error('Erreur de connexion');
            setStatus('error');
        }
    };

    return (
        <div className={`contact-container theme-${theme}`}>
            {/* INVERTED NYC BACKGROUND */}
            <div className="contact-background-wrapper">
                <div className="city-glow-overlay" />
                <div className="city-lights">
                    {Array.from({ length: 25 }, (_, i) => (
                        <div
                            key={`light-${i}`}
                            className="city-light"
                            style={{
                                left: `${5 + (i * 3.7) % 90}%`,
                                bottom: `${5 + (i * 17) % 70}%`,
                                '--flicker-dur': `${2 + (i % 5) * 0.8}s`,
                                '--flicker-delay': `${(i * 0.3) % 3}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            <h1 className="hero-title contact-title" style={{ position: 'relative', zIndex: 2 }}>
                <span className="hero-title-line hero-glitch" data-text="Contact">Contact</span>
            </h1>

            <div className="contact-card">
                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Votre Nom"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Votre Email"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Sujet"
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Votre Message..."
                            rows="5"
                            required
                            className="form-input form-textarea"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className={`submit-btn ${status}`}
                    >
                        {status === 'loading' && <span className="btn-text">Envoi...</span>}
                        {status === 'success' && <span className="btn-text">Message Envoyé !</span>}
                        {status === 'error' && <span className="btn-text">Erreur</span>}
                        {status === 'idle' && <span className="btn-text">Envoyer le message</span>}
                    </button>
                </form>

                <div className="contact-info">
                    <p>📧 contact@bastien-portfolio.fr</p>
                    <p>📍 Troyes, France</p>
                    <p>Disponibilité: Alternance 2024</p>

                    <div className="social-links">
                        <a href="https://github.com/votre-profil" target="_blank" rel="noreferrer" className="social-link">GH</a>
                        <a href="https://linkedin.com/in/votre-profil" target="_blank" rel="noreferrer" className="social-link">IN</a>
                        <a href="https://twitter.com/votre-profil" target="_blank" rel="noreferrer" className="social-link">TW</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
