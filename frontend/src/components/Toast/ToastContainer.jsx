/**
 * ToastContainer.jsx — Composant d'affichage des notifications toast
 *
 * S'abonne au toastManager pour afficher les toasts empilés
 * en bas à droite de l'écran avec auto-dismiss.
 */

import { useState, useEffect, useCallback } from 'react';
import toastManager from './toastManager';
import './Toast.css';

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const unsubscribe = toastManager.subscribe((toast) => {
            setToasts(prev => [...prev, { ...toast, exiting: false }]);

            // Auto-dismiss après la durée spécifiée
            setTimeout(() => {
                setToasts(prev =>
                    prev.map(t => t.id === toast.id ? { ...t, exiting: true } : t)
                );
                // Retirer complètement après l'animation de sortie (300ms)
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== toast.id));
                }, 300);
            }, toast.duration);
        });

        return unsubscribe;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev =>
            prev.map(t => t.id === id ? { ...t, exiting: true } : t)
        );
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}
                >
                    <div className="toast-icon">
                        {toast.type === 'success' && '✓'}
                        {toast.type === 'error' && '✕'}
                        {toast.type === 'warning' && '⚠'}
                    </div>
                    <div className="toast-message">{toast.message}</div>
                    <button
                        className="toast-close"
                        onClick={() => dismissToast(toast.id)}
                        aria-label="Fermer la notification"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
