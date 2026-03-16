<?php
/**
 * router.php — Routeur pour le serveur PHP intégré (développement local)
 *
 * Usage : php -S localhost:8080 router.php
 *
 * - Sert les fichiers statiques de public/ directement
 * - Passe toutes les autres requêtes à index.php (API)
 */

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Fichiers statiques dans public/
$publicFile = __DIR__ . '/public' . $path;

if (is_file($publicFile)) {
    $ext = strtolower(pathinfo($publicFile, PATHINFO_EXTENSION));
    $mimeTypes = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
        'css'  => 'text/css',
        'js'   => 'application/javascript',
    ];
    header('Content-Type: ' . ($mimeTypes[$ext] ?? 'application/octet-stream'));
    readfile($publicFile);
    exit;
}

// Tout le reste → API
require __DIR__ . '/index.php';
