/**
 * apiFetch.js — Wrapper global pour les appels API authentifiés
 *
 * Centralise :
 * - L'ajout automatique du token JWT (Authorization: Bearer)
 * - L'ajout automatique de Content-Type: application/json
 * - La détection d'erreur 401 → callback onAuthError (logout)
 * - La détection d'erreur 500 → toast d'erreur serveur
 * - Les erreurs réseau → toast "Connexion impossible"
 * - Le parsing JSON automatique de la réponse
 *
 * Usage :
 *   import { apiFetch, setAuthErrorHandler } from '../api/apiFetch';
 *
 *   // Dans Admin.jsx, au montage :
 *   setAuthErrorHandler(handleLogout);
 *
 *   // Dans les sous-pages :
 *   const data = await apiFetch('/api/projects', { method: 'POST', body: { title: '...' } });
 */

import toast from '../components/Toast/toastManager';

let authErrorHandler = null;

/**
 * Configurer le callback appelé en cas d'erreur 401 (token invalide).
 * Doit être appelé une fois au montage du composant Admin.
 */
export function setAuthErrorHandler(handler) {
    authErrorHandler = handler;
}

/**
 * Effectuer un appel API avec gestion globale des erreurs.
 *
 * @param {string} url - ex: '/api/projects'
 * @param {Object} options
 * @param {string} [options.method='GET']
 * @param {Object|null} [options.body=null] - sera JSON.stringify automatiquement
 * @param {Object} [options.headers={}] - headers supplémentaires
 * @param {boolean} [options.auth=true] - ajouter le token JWT automatiquement
 * @param {boolean} [options.showErrorToast=true] - afficher un toast en cas d'erreur
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
export async function apiFetch(url, options = {}) {
    const {
        method = 'GET',
        body = null,
        headers = {},
        auth = true,
        showErrorToast = true
    } = options;

    // Construire les headers
    const finalHeaders = {
        ...headers
    };

    // Ajouter Content-Type si body est fourni
    if (body && !finalHeaders['Content-Type']) {
        finalHeaders['Content-Type'] = 'application/json';
    }

    // Ajouter le token JWT si auth est activé
    if (auth) {
        const token = localStorage.getItem('adminToken');
        if (token) {
            finalHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    // Construire les options fetch
    const fetchOptions = {
        method,
        headers: finalHeaders
    };

    if (body) {
        fetchOptions.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, fetchOptions);

        // --- 401 : Token invalide → session expirée ---
        if (response.status === 401) {
            if (authErrorHandler) {
                authErrorHandler();
            }
            return { ok: false, status: 401, data: null };
        }

        // --- Parser le JSON ---
        let data = null;
        try {
            data = await response.json();
        } catch {
            // Réponse sans body JSON (ex: 204 No Content)
            data = null;
        }

        // --- 500+ : Erreur serveur ---
        if (response.status >= 500) {
            if (showErrorToast) {
                toast.error('Erreur serveur. Veuillez réessayer plus tard.');
            }
            return { ok: false, status: response.status, data };
        }

        // --- 4xx autres (400, 404, 409...) ---
        if (!response.ok) {
            if (showErrorToast) {
                const msg = data?.error || `Erreur ${response.status}`;
                toast.error(msg);
            }
            return { ok: false, status: response.status, data };
        }

        // --- Succès ---
        return { ok: true, status: response.status, data };

    } catch (err) {
        // --- Erreur réseau (fetch failed) ---
        if (showErrorToast) {
            toast.error('Connexion impossible au serveur. Vérifiez votre connexion.');
        }
        return { ok: false, status: 0, data: null };
    }
}
