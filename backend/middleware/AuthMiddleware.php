<?php
/**
 * AuthMiddleware.php — Middleware d'authentification JWT
 * 
 * Vérifie le token JWT dans le header Authorization.
 * Implémentation JWT manuelle (sans librairie externe).
 */

require_once __DIR__ . '/../config/config.php';

class AuthMiddleware
{
    /**
     * Vérifier l'authentification
     * 
     * @return bool|array False si non authentifié, payload si OK
     */
    public function handle()
    {
        $headers = $this->getAuthorizationHeader();

        if (!$headers) {
            http_response_code(401);
            echo json_encode(['error' => 'Token d\'authentification manquant']);
            exit();
            return false;
        }

        // Extraire le token du header "Bearer <token>"
        $token = str_replace('Bearer ', '', $headers);

        // Vérifier et décoder le token
        $payload = $this->verifyToken($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Token invalide ou expiré']);
            exit();
            return false;
        }

        // Stocker l'utilisateur authentifié pour le controller
        $_REQUEST['auth_user'] = $payload;
        return true;
    }

    /**
     * Générer un token JWT
     * 
     * @param array $payload Données à encoder (user_id, email, role)
     * @return string Token JWT
     */
    public static function generateToken(array $payload): string
    {
        // Header
        $header = self::base64UrlEncode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));

        // Payload avec expiration (24h)
        $payload['iat'] = time();
        $payload['exp'] = time() + (24 * 60 * 60);
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        // Signature
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", JWT_SECRET, true)
        );

        return "$header.$payloadEncoded.$signature";
    }

    /**
     * Décoder un token JWT sans vérifier l'expiration (pour les tests ou lecture simple)
     * 
     * @param string $token
     * @return array|false
     */
    public static function decodeToken(string $token)
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        return json_decode(self::base64UrlDecode($parts[1]), true);
    }

    /**
     * Vérifier et décoder un token JWT (avec signature et expiration)
     * 
     * @param string $token
     * @return array|false
     */
    public function verifyToken(string $token)
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        [$header, $payload, $signature] = $parts;

        // Vérifier la signature
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
        );

        if ($signature !== $expectedSignature) {
            return false;
        }

        // Décoder le payload avec notre nouvelle méthode
        $data = self::decodeToken($token);

        // Vérifier l'expiration
        if (isset($data['exp']) && $data['exp'] < time()) {
            return false;
        }

        return $data;
    }

    /**
     * Récupérer le header Authorization
     */
    private function getAuthorizationHeader(): ?string
    {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        } elseif (function_exists('getallheaders')) {
            $requestHeaders = getallheaders();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        return $headers;
    }

    /**
     * Encodage Base64 URL-safe
     */
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Décodage Base64 URL-safe
     */
    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
