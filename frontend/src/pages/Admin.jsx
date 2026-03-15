import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import ToastContainer from '../components/Toast/ToastContainer';
import { setAuthErrorHandler } from '../api/apiFetch';
import './Admin.login.css';
import './Admin.layout.css';
import './Admin.components.css';
import './Admin.forms.css';

const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AdminMessages = lazy(() => import('./AdminMessages'));
const AdminProjects = lazy(() => import('./AdminProjects'));
const AdminSkills = lazy(() => import('./AdminSkills'));
const AdminThemes = lazy(() => import('./AdminThemes'));
const AdminProfile = lazy(() => import('./AdminProfile'));

export default function Admin() {
    const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Fonction utilitaire : déconnexion (réutilisée partout)
    const forceLogout = () => {
        localStorage.removeItem('adminToken');
        setToken(null);
        navigate('/admin/login');
    };

    const handleLogout = () => {
        forceLogout();
    };

    // Fermer le sidebar lors d'un changement de route (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Enregistrer le handler de logout dans apiFetch pour la gestion globale 401
    useEffect(() => {
        setAuthErrorHandler(handleLogout);
    }, []);

    return (
        <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Overlay mobile */}
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />

            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-brand">SAE601 Admin</div>
                <nav className="admin-nav">
                    <Link to="/admin/dashboard" className={location.pathname === '/admin/dashboard' ? 'active' : ''}>Dashboard</Link>
                    <Link to="/admin/projects" className={location.pathname === '/admin/projects' ? 'active' : ''}>Projets</Link>
                    <Link to="/admin/skills" className={location.pathname === '/admin/skills' ? 'active' : ''}>Compétences</Link>
                    <Link to="/admin/messages" className={location.pathname === '/admin/messages' ? 'active' : ''}>Messages</Link>
                    <Link to="/admin/profile" className={location.pathname === '/admin/profile' ? 'active' : ''}>Profil</Link>
                    <Link to="/admin/themes" className={location.pathname === '/admin/themes' ? 'active' : ''}>Thèmes</Link>
                </nav>
                <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
            </aside>
            <main className="admin-content">
                <header className="admin-header">
                    <button className="admin-burger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                    </button>
                    <h2>Bienvenue dans l'espace administrateur</h2>
                </header>
                <div className="admin-body">
                    <Suspense fallback={<div style={{ padding: '2rem', opacity: 0.5 }}>Chargement...</div>}>
                        <Routes>
                            <Route path="dashboard" element={<AdminDashboard token={token} />} />
                            <Route path="projects" element={<AdminProjects token={token} onAuthError={handleLogout} />} />
                            <Route path="skills" element={<AdminSkills token={token} onAuthError={handleLogout} />} />
                            <Route path="messages" element={<AdminMessages token={token} onAuthError={handleLogout} />} />
                            <Route path="profile" element={<AdminProfile token={token} onAuthError={handleLogout} />} />
                            <Route path="themes" element={<AdminThemes token={token} onAuthError={handleLogout} />} />
                        </Routes>
                    </Suspense>
                </div>
            </main>

            {/* ---- TOAST NOTIFICATIONS ---- */}
            <ToastContainer />
        </div>
    );
}
