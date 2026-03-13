<?php
/**
 * AuthController.php — Contrôleur d'authentification
 * 
 * Endpoints :
 * - POST /api/login    → login()
 * - POST /api/register → register()
 */

require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AuthController extends Controller
{
    private User $userModel;

    public function __construct(?User $userModel = null)
    {
        $this->userModel = $userModel ?? new User();
    }

    /**
     * POST /api/login
     * Body : { email, password }
     * Retourne : { token, user }
     */
    public function login(): void
    {
        $data = $this->getRequestBody();

        // Valider les champs requis
        if (!$this->validateRequired($data, ['email', 'password'])) {
            return;
        }

        // Chercher l'utilisateur par email
        $user = $this->userModel->findByEmail($data['email']);

        if (!$user) {
            $this->jsonResponse(['error' => 'Email ou mot de passe incorrect'], 401);
            return;
        }

        // Vérifier le mot de passe
        if (!$this->userModel->verifyPassword($data['password'], $user['password'])) {
            $this->jsonResponse(['error' => 'Email ou mot de passe incorrect'], 401);
            return;
        }

        // Générer le token JWT
        $token = AuthMiddleware::generateToken([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);

        // Réponse sans le mot de passe
        unset($user['password']);

        $this->jsonResponse([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * POST /api/register
     * Body : { username, email, password }
     * Retourne : { token, user }
     */
    public function register(): void
    {
        $data = $this->getRequestBody();

        // Valider les champs requis
        if (!$this->validateRequired($data, ['username', 'email', 'password'])) {
            return;
        }

        // Vérifier que l'email n'est pas déjà utilisé
        if ($this->userModel->findByEmail($data['email'])) {
            $this->jsonResponse(['error' => 'Cet email est déjà utilisé'], 409);
            return;
        }

        // Créer l'utilisateur
        $userId = $this->userModel->createUser([
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'admin'
        ]);

        // Générer le token JWT
        $token = AuthMiddleware::generateToken([
            'user_id' => $userId,
            'email' => $data['email'],
            'role' => 'admin'
        ]);

        $this->jsonResponse([
            'message' => 'Inscription réussie',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'username' => $data['username'],
                'email' => $data['email'],
                'role' => 'admin'
            ]
        ], 201);
    }

    /**
     * GET /api/auth/verify
     * Vérifie la validité du token JWT (le middleware s'en charge).
     * Si on arrive ici, c'est que le token est valide.
     * Retourne : { valid: true, user: { user_id, email, role } }
     */
    public function verify(): void
    {
        // Le middleware AuthMiddleware a déjà validé le token
        // et stocké le payload dans $_REQUEST['auth_user']
        $authUser = $_REQUEST['auth_user'] ?? null;

        if (!$authUser) {
            $this->jsonResponse(['error' => 'Token invalide'], 401);
            return;
        }

        $this->jsonResponse([
            'valid' => true,
            'user' => [
                'user_id' => $authUser['user_id'] ?? null,
                'email' => $authUser['email'] ?? null,
                'role' => $authUser['role'] ?? null
            ]
        ]);
    }
}
