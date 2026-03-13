<?php
/**
 * api.php — Définition des routes API
 * 
 * Enregistre toutes les routes vers les controllers.
 * $router est fourni par index.php
 */

// ============================================
// AUTH (public)
// ============================================
$router->post('/api/login', ['AuthController', 'login']);
$router->post('/api/register', ['AuthController', 'register']);
$router->get('/api/auth/verify', ['AuthController', 'verify'], ['AuthMiddleware']); // protégé

// ============================================
// PROJECTS
// ============================================
$router->get('/api/projects', ['ProjectController', 'index']);          // public
$router->get('/api/projects/{id}', ['ProjectController', 'show']);           // public
$router->post('/api/projects', ['ProjectController', 'store'], ['AuthMiddleware']); // protégé
$router->put('/api/projects/{id}', ['ProjectController', 'update'], ['AuthMiddleware']); // protégé
$router->delete('/api/projects/{id}', ['ProjectController', 'destroy'], ['AuthMiddleware']); // protégé

// ============================================
// SKILLS
// ============================================
$router->get('/api/skills', ['SkillController', 'index']);                   // public
$router->post('/api/skills', ['SkillController', 'store'], ['AuthMiddleware']); // protégé
$router->put('/api/skills/{id}', ['SkillController', 'update'], ['AuthMiddleware']); // protégé
$router->delete('/api/skills/{id}', ['SkillController', 'destroy'], ['AuthMiddleware']); // protégé

// ============================================
// THEMES
// ============================================
$router->get('/api/themes', ['ThemeController', 'index']);             // public
$router->put('/api/themes/{id}', ['ThemeController', 'update'], ['AuthMiddleware']); // protégé

// ============================================
// SETTINGS (Profil)
// ============================================
$router->get('/api/settings', ['SettingController', 'index']);           // public
$router->put('/api/settings', ['SettingController', 'update'], ['AuthMiddleware']); // protégé

// ============================================
// UPLOADS
// ============================================
$router->post('/api/upload', ['UploadController', 'upload'], ['AuthMiddleware']); // protégé

// ============================================
// MESSAGES
// ============================================
$router->post('/api/messages', ['MessageController', 'store']);               // public (contact)
$router->get('/api/messages', ['MessageController', 'index'], ['AuthMiddleware']); // protégé (admin)
$router->delete('/api/messages/{id}', ['MessageController', 'destroy'], ['AuthMiddleware']); // protégé (admin)
