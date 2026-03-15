<?php
/**
 * api.php — Définition des routes API
 * 
 * Enregistre toutes les routes vers les controllers.
 * $router est fourni par index.php
 */

// ============================================
// DIAGNOSTIC SMTP TEMPORAIRE — À SUPPRIMER APRÈS TEST
// ============================================
$router->get('/api/smtp-diag', function() {
    if (!isset($_GET['key']) || $_GET['key'] !== 'test_smtp_2026') {
        http_response_code(403); echo 'Accès refusé'; exit;
    }
    require_once __DIR__ . '/../config/config.php';
    header('Content-Type: text/plain; charset=utf-8');
    echo "=== Diagnostic SMTP ===\n\n";
    echo "SMTP_HOST : " . SMTP_HOST . "\n";
    echo "SMTP_PORT : " . SMTP_PORT . "\n";
    echo "SMTP_USER : " . SMTP_USER . "\n";
    echo "SMTP_PASS : " . (empty(SMTP_PASS) ? '[VIDE]' : '[DEFINI - ' . strlen(SMTP_PASS) . ' chars]') . "\n\n";
    // Test 1 : stream_socket_client
    echo "--- Test 1 : stream_socket_client disponible ? ---\n";
    echo function_exists('stream_socket_client') ? "OK\n\n" : "ECHEC : fonction indisponible\n\n";
    // Test 2 : Gmail
    echo "--- Test 2 : TCP smtp.gmail.com:587 ---\n";
    $s = @stream_socket_client("tcp://smtp.gmail.com:587", $e, $es, 8);
    if (!$s) { echo "ECHEC : $es ($e)\n\n"; } else { echo "OK : " . trim(fgets($s, 512)) . "\n\n"; fclose($s); }
    // Test 3 : Infomaniak
    echo "--- Test 3 : TCP mail.infomaniak.com:587 ---\n";
    $s2 = @stream_socket_client("tcp://mail.infomaniak.com:587", $e2, $es2, 8);
    if (!$s2) { echo "ECHEC : $es2 ($e2)\n\n"; } else { echo "OK : " . trim(fgets($s2, 512)) . "\n\n"; fclose($s2); }
    echo "⚠️ Supprimez cette route après le test !";
    exit;
});

// ============================================
// STATS (Dashboard admin)
// ============================================
$router->get('/api/stats', ['StatsController', 'index'], ['AuthMiddleware']); // protégé

// ============================================
// AUTH (public)
// ============================================
$router->post('/api/login', ['AuthController', 'login'], ['RateLimitMiddleware']);
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
$router->post('/api/messages', ['MessageController', 'store'], ['RateLimitMiddleware']); // public (contact)
$router->get('/api/messages', ['MessageController', 'index'], ['AuthMiddleware']); // protégé (admin)
$router->put('/api/messages/{id}', ['MessageController', 'markRead'], ['AuthMiddleware']); // protégé (admin)
$router->delete('/api/messages/{id}', ['MessageController', 'destroy'], ['AuthMiddleware']); // protégé (admin)
