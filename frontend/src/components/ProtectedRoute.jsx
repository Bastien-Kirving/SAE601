import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const token = localStorage.getItem('adminToken');
    const navigate = useNavigate();
    const location = useLocation();
    // Track whether we already verified this token to avoid re-verifying on every navigation
    const verifiedToken = useRef(null);

    useEffect(() => {
        if (!token) {
            setVerifying(false);
            navigate('/admin/login', { state: { from: location }, replace: true });
            return;
        }

        // Token already verified this session — skip the API call
        if (verifiedToken.current === token) {
            setIsAuthenticated(true);
            setVerifying(false);
            return;
        }

        fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) {
                // Invalid token
                localStorage.removeItem('adminToken');
                setIsAuthenticated(false);
                setVerifying(false);
                navigate('/admin/login', { state: { from: location }, replace: true });
                return;
            }
            return res.json();
        })
        .then(data => {
            if (data && data.valid) {
                verifiedToken.current = token;
                setIsAuthenticated(true);
                setVerifying(false);
            } else if (data) {
                localStorage.removeItem('adminToken');
                setIsAuthenticated(false);
                setVerifying(false);
                navigate('/admin/login', { state: { from: location }, replace: true });
            }
        })
        .catch(() => {
            // Network error
            localStorage.removeItem('adminToken');
            setIsAuthenticated(false);
            setVerifying(false);
            navigate('/admin/login', { state: { from: location }, replace: true });
        });
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    if (verifying) {
        return (
            <div className="admin-login-container">
                <div className="admin-login-card">
                    <h2>Vérification de session...</h2>
                    <p style={{ textAlign: 'center', opacity: 0.7 }}>Veuillez patienter.</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : null;
}
