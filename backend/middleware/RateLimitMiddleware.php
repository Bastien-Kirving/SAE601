<?php
/**
 * RateLimitMiddleware.php — Protection brute-force & spam
 *
 * Limite les tentatives par IP selon la route :
 *   POST /api/login    → 5 tentatives / 60 secondes
 *   POST /api/messages → 3 messages   / 300 secondes (5 min)
 *
 * Stockage : fichiers temporaires (sys_get_temp_dir).
 * Compatible hébergement mutualisé — aucune dépendance externe.
 */

class RateLimitMiddleware
{
    /**
     * Limites par "METHOD:URI"
     * ['max' => nombre de tentatives, 'window' => fenêtre en secondes]
     */
    private const LIMITS = [
        'POST:/api/login'    => ['max' => 5, 'window' => 60],
        'POST:/api/messages' => ['max' => 3, 'window' => 300],
    ];

    /**
     * Point d'entrée appelé par le Router
     */
    public function handle(): bool
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri    = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $key    = $method . ':' . $uri;

        $config = self::LIMITS[$key] ?? null;
        if ($config === null) {
            // Route non soumise au rate limiting
            return true;
        }

        $ip = $this->getClientIp();
        $this->checkLimit($key, $ip, $config['max'], $config['window']);

        return true;
    }

    /**
     * Vérifie et enregistre la tentative — stoppe si limite atteinte
     */
    private function checkLimit(string $action, string $ip, int $max, int $window): void
    {
        $storageDir = sys_get_temp_dir() . '/rl_' . substr(md5(__FILE__), 0, 8) . '/';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0700, true);
        }

        $safeKey = preg_replace('/[^a-zA-Z0-9_]/', '_', $action . '_' . $ip);
        $file    = $storageDir . $safeKey . '.json';
        $lockFile = $file . '.lock';
        $now     = time();

        // Verrou exclusif pour éviter les race conditions
        $lock = fopen($lockFile, 'c');
        flock($lock, LOCK_EX);

        // Lire les tentatives existantes
        $attempts = [];
        if (file_exists($file)) {
            $raw      = file_get_contents($file);
            $attempts = json_decode($raw, true) ?? [];
        }

        // Ne conserver que les tentatives dans la fenêtre de temps
        $attempts = array_values(
            array_filter($attempts, fn(int $t) => ($now - $t) < $window)
        );

        // Limite atteinte ?
        if (count($attempts) >= $max) {
            $retryAfter = $window - ($now - $attempts[0]);
            $retryAfter = max(1, (int) $retryAfter);

            flock($lock, LOCK_UN);
            fclose($lock);

            http_response_code(429);
            header('Retry-After: ' . $retryAfter);
            echo json_encode([
                'error'       => 'Trop de tentatives. Réessayez dans ' . $retryAfter . ' secondes.',
                'retry_after' => $retryAfter,
            ]);
            exit();
        }

        // Enregistrer la nouvelle tentative
        $attempts[] = $now;
        file_put_contents($file, json_encode($attempts));

        flock($lock, LOCK_UN);
        fclose($lock);
    }

    /**
     * Récupère l'IP réelle du client
     * Priorité : Cloudflare > REMOTE_ADDR
     */
    private function getClientIp(): string
    {
        // Cloudflare : header fiable si le site passe par CF
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $cfIp = trim($_SERVER['HTTP_CF_CONNECTING_IP']);
            if (filter_var($cfIp, FILTER_VALIDATE_IP)) {
                return $cfIp;
            }
        }

        $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        return filter_var($remoteAddr, FILTER_VALIDATE_IP) ? $remoteAddr : '0.0.0.0';
    }
}
