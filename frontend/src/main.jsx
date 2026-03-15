/**
 * main.jsx — Point d'entrée React
 *
 * Render <App /> dans #root
 */

import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/index.css';

const App = lazy(() => import('./App'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <Suspense fallback={null}>
                    <Routes>
                        <Route path="/*" element={<App />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/*" element={
                            <ProtectedRoute>
                                <Admin />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>
);
