<?php
/**
 * index.php — Point d'entrée de l'API REST
 * 
 * Toutes les requêtes HTTP passent par ce fichier
 * grâce au .htaccess (RewriteRule).
 */

// ============================================
// 1. Configuration
// ============================================
// En production (Infomaniak) : ce fichier est dans /web/api/index.php
// Le code backend privé est dans /backend/ (hors racine web)
// → les chemins remontent de 2 niveaux : /web/api/ → /web/ → /
$backendPath = is_dir(__DIR__ . '/controllers')
    ? __DIR__                          // Production : index.php à la racine du dossier API
    : (is_dir(__DIR__ . '/../../backend')
        ? __DIR__ . '/../../backend'   // Production : /backend/ hors web root
        : __DIR__ . '/..'              // Local : backend/public/../
      )
;

require_once $backendPath . '/config/config.php';

// ============================================
// 2. Headers CORS (origines définies dans .env)
// ============================================
$requestOrigin    = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedList      = array_map('trim', explode(',', ALLOWED_ORIGINS));

if (in_array($requestOrigin, $allowedList, true)) {
    // Origine explicitement autorisée → on la renvoie telle quelle
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Vary: Origin');
}
// Si l'origine n'est pas dans la liste, aucun header CORS n'est envoyé
// → le navigateur bloquera la requête cross-origin (comportement voulu).

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
