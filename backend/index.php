<?php
/**
 * index.php — Point d'entrée de l'API REST
 *
 * Toutes les requêtes HTTP passent par ce fichier
 * grâce au .htaccess (RewriteRule).
 *
 * En production : ce fichier est déployé à la racine de sites/bastien-lievre.com/api/
 * Le dossier controllers/, routes/, etc. sont au même niveau.
 */

// Ne jamais afficher les erreurs PHP en clair (cela casserait le JSON)
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);

// Capturer les erreurs fatales et les retourner en JSON propre
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode(['error' => 'Erreur serveur interne', 'detail' => $err['message']]);
    }
});

// ============================================
// 1. Configuration
// ============================================
$backendPath = __DIR__;

require_once $backendPath . '/config/config.php';

// ============================================
// 2. Headers CORS (origines définies dans .env)
// ============================================
$requestOrigin    = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedList      = array_map('trim', explode(',', ALLOWED_ORIGINS));

if (in_array($requestOrigin, $allowedList, true)) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Requête preflight OPTIONS → répondre immédiatement
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================
// 3. Autoload des fichiers
// ============================================
require_once $backendPath . '/core/Router.php';
require_once $backendPath . '/core/Controller.php';
require_once $backendPath . '/core/Model.php';
require_once $backendPath . '/config/Database.php';
require_once $backendPath . '/middleware/AuthMiddleware.php';
require_once $backendPath . '/middleware/RateLimitMiddleware.php';

// Models
require_once $backendPath . '/models/User.php';
require_once $backendPath . '/models/Project.php';
require_once $backendPath . '/models/Skill.php';
require_once $backendPath . '/models/Theme.php';
require_once $backendPath . '/models/Message.php';
require_once $backendPath . '/models/Setting.php';

// Controllers
require_once $backendPath . '/controllers/AuthController.php';
require_once $backendPath . '/controllers/ProjectController.php';
require_once $backendPath . '/controllers/SkillController.php';
require_once $backendPath . '/controllers/ThemeController.php';
require_once $backendPath . '/controllers/MessageController.php';
require_once $backendPath . '/controllers/SettingController.php';
require_once $backendPath . '/controllers/UploadController.php';
require_once $backendPath . '/controllers/StatsController.php';

// ============================================
// 4. Initialiser le routeur et charger les routes
// ============================================
$router = new Router();
require_once $backendPath . '/routes/api.php';

// ============================================
// 5. Dispatcher la requête
// ============================================
$router->dispatch();
