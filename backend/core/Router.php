<?php
/**
 * Router.php — Routeur REST simple
 * 
 * Gère le routing des requêtes HTTP vers les controllers.
 * Supporte les paramètres dynamiques {id} dans les URLs.
 */

class Router
{
    /**
     * Liste des routes enregistrées
     * Format : ['method' => 'GET', 'pattern' => '/api/projects/{id}', 'handler' => [Controller, 'method'], 'middleware' => []]
     */
    private array $routes = [];

    /**
     * Enregistrer une route GET
     */
    public function get(string $path, array $handler, array $middleware = []): void
    {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    /**
     * Enregistrer une route POST
     */
    public function post(string $path, array $handler, array $middleware = []): void
    {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    /**
     * Enregistrer une route PUT
     */
    public function put(string $path, array $handler, array $middleware = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    /**
     * Enregistrer une route DELETE
     */
    public function delete(string $path, array $handler, array $middleware = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    /**
     * Ajouter une route au registre
     */
    private function addRoute(string $method, string $path, array $handler, array $middleware): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middleware' => $middleware
        ];
    }

    /**
     * Dispatcher la requête HTTP vers le bon controller
     */
    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Gérer les requêtes OPTIONS (CORS preflight)
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        // Chercher une route correspondante
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            // Convertir le pattern en regex : {id} → ([0-9]+)
            $pattern = preg_replace('/\{([a-zA-Z]+)\}/', '([0-9]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $uri, $matches)) {
                // Retirer le match complet, garder les paramètres
                array_shift($matches);

                // Exécuter les middlewares
                foreach ($route['middleware'] as $middlewareClass) {
                    $middleware = new $middlewareClass();
                    $result = $middleware->handle();
                    if ($result === false) {
                        return; // Le middleware a déjà envoyé la réponse d'erreur
                    }
                }

                // Appeler le controller
                $controller = new $route['handler'][0]();
                $action = $route['handler'][1];

                call_user_func_array([$controller, $action], $matches);
                return;
            }
        }

        // Aucune route trouvée → 404
        http_response_code(404);
        echo json_encode([
            'error' => 'Route non trouvée',
            'method' => $method,
            'uri' => $uri
        ]);
    }
}
