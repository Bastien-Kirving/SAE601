<?php
/**
 * Controller.php — Contrôleur de base
 * 
 * Fournit des méthodes utilitaires à tous les controllers :
 * - jsonResponse() : envoyer une réponse JSON
 * - getRequestBody() : lire le body de la requête
 */

class Controller
{
    /**
     * Envoyer une réponse JSON avec un code HTTP
     * 
     * @param mixed $data    Données à encoder en JSON
     * @param int   $code    Code HTTP (200, 201, 400, 401, 404, 500)
     */
    protected function jsonResponse($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }

    /**
     * Lire et décoder le body JSON de la requête (avec nettoyage de sécurité)
     * 
     * @return array Données décodées et nettoyées
     */
    protected function getRequestBody(): array
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!is_array($data)) {
            return [];
        }

        return $this->sanitize($data);
    }

    /**
     * Nettoyer récursivement les données pour contrer les failles XSS.
     * Si une chaîne contient du JSON (ex: hero_nodes), on le décode,
     * on nettoie son contenu, puis on le ré-encode.
     * 
     * @param array $data Entrées à nettoyer
     * @return array Entrées nettoyées
     */
    private function sanitize(array $data): array
    {
        $clean = [];
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $clean[$key] = $this->sanitize($value);
            } elseif (is_string($value)) {
                // Tenter de détecter si la chaîne est du JSON imbriqué (ex: settings.hero_nodes)
                if (
                    (str_starts_with(trim($value), '[') && str_ends_with(trim($value), ']')) ||
                    (str_starts_with(trim($value), '{') && str_ends_with(trim($value), '}'))
                ) {
                    $decoded = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $clean[$key] = json_encode($this->sanitize($decoded), JSON_UNESCAPED_UNICODE);
                        continue;
                    }
                }

                // Nettoyage standard
                $clean[$key] = htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
            } else {
                // Garder les entiers, booléens, null intacts
                $clean[$key] = $value;
            }
        }
        return $clean;
    }

    /**
     * Valider que les champs requis sont présents dans les données
     * 
     * @param array $data     Données à valider
     * @param array $required Champs requis
     * @return bool
     */
    protected function validateRequired(array $data, array $required): bool
    {
        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $this->jsonResponse([
                    'error' => "Le champ '$field' est requis."
                ], 400);
                return false;
            }
        }
        return true;
    }
}
