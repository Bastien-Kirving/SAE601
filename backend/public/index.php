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
require_once __DIR__ . '/../config/config.php';

// ============================================
// 2. Headers CORS (pour que React puisse appeler l'API)
// ============================================
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGINS);
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
require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../core/Model.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

// Models
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Project.php';
require_once __DIR__ . '/../models/Skill.php';
require_once __DIR__ . '/../models/Theme.php';
require_once __DIR__ . '/../models/Message.php';
require_once __DIR__ . '/../models/Setting.php';

// Controllers
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ProjectController.php';
require_once __DIR__ . '/../controllers/SkillController.php';
require_once __DIR__ . '/../controllers/ThemeController.php';
require_once __DIR__ . '/../controllers/MessageController.php';
require_once __DIR__ . '/../controllers/SettingController.php';
require_once __DIR__ . '/../controllers/UploadController.php';

// ============================================
// 4. Initialiser le routeur et charger les routes
// ============================================
$router = new Router();
require_once __DIR__ . '/../routes/api.php';

// ============================================
// 5. Dispatcher la requête
// ============================================
$router->dispatch();
