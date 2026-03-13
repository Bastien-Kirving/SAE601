/**
 * toastManager.js — Gestionnaire de notifications toast (event-based)
 *
 * Permet d'appeler toast.success() / toast.error() / toast.warning()
 * depuis N'IMPORTE QUEL fichier JS (y compris en dehors de React).
 *
 * Le composant <ToastContainer /> écoute ces événements et les affiche.
 */

const listeners = [];
let nextId = 0;

const toastManager = {
    /**
     * S'abonner aux événements de toast
     * @param {Function} callback - (toast) => void
     * @returns {Function} unsubscribe
     */
    subscribe(callback) {
        listeners.push(callback);
        return () => {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
        };
    },

    /**
     * Émettre un toast
     * @param {'success'|'error'|'warning'} type
     * @param {string} message
     * @param {number} duration - en ms (défaut : 4000)
     */
    _emit(type, message, duration = 4000) {
        const toast = { id: nextId++, type, message, duration };
        listeners.forEach(cb => cb(toast));
    },

    success(message, duration) {
        this._emit('success', message, duration);
    },

    error(message, duration) {
        this._emit('error', message, duration || 5000);
    },

    warning(message, duration) {
        this._emit('warning', message, duration);
    }
};

export default toastManager;
