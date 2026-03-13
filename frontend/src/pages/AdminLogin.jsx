import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Admin.css'; // Utilize same styling as admin

export default function AdminLogin() {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Redirection target after successful login
    const from = location.state?.from?.pathname || '/admin/dashboard';

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur de connexion');
            }

            const data = await response.json();
            localStorage.setItem('adminToken', data.token);
            navigate(from, { replace: true });
        } catch (error) {
            setLoginError(error.message);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <h2>Admin Backoffice</h2>
                <form onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} required />
                    </div>
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} required />
                    </div>
                    {loginError && <div className="error-message">{loginError}</div>}
                    <button type="submit" className="login-btn">Se connecter</button>
                </form>
                <Link to="/" className="back-home-link">Retour au site</Link>
            </div>
        </div>
    );
}
