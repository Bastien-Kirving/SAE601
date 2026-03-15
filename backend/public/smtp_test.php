<?php
/**
 * smtp_test.php — Diagnostic SMTP temporaire
 * ⚠️  SUPPRIMER CE FICHIER APRÈS LE TEST
 */

// Sécurité minimale : accès local ou avec clé
if (!isset($_GET['key']) || $_GET['key'] !== 'test_smtp_2026') {
    http_response_code(403);
    die('Accès refusé');
}

require_once __DIR__ . '/../config/config.php';

header('Content-Type: text/plain; charset=utf-8');

echo "=== Diagnostic SMTP ===\n\n";
echo "SMTP_HOST : " . SMTP_HOST . "\n";
echo "SMTP_PORT : " . SMTP_PORT . "\n";
echo "SMTP_USER : " . SMTP_USER . "\n";
echo "SMTP_PASS : " . (empty(SMTP_PASS) ? '[VIDE]' : '[DEFINI - ' . strlen(SMTP_PASS) . ' chars]') . "\n\n";

// Test 1 : stream_socket_client disponible ?
echo "--- Test 1 : stream_socket_client ---\n";
if (!function_exists('stream_socket_client')) {
    echo "ECHEC : stream_socket_client() n'est pas disponible sur ce serveur.\n\n";
} else {
    echo "OK : stream_socket_client() est disponible.\n\n";
}

// Test 2 : Connexion TCP vers smtp.gmail.com:587
echo "--- Test 2 : Connexion TCP smtp.gmail.com:587 ---\n";
$errno = 0; $errstr = '';
$sock = @stream_socket_client("tcp://smtp.gmail.com:587", $errno, $errstr, 10);
if (!$sock) {
    echo "ECHEC : Impossible de se connecter à smtp.gmail.com:587\n";
    echo "Erreur : $errstr ($errno)\n";
    echo "→ Infomaniak bloque probablement les connexions SMTP sortantes vers Gmail.\n\n";
} else {
    echo "OK : Connexion TCP établie.\n";
    $banner = fgets($sock, 512);
    echo "Banner : " . trim($banner) . "\n\n";
    fclose($sock);
}

// Test 3 : Connexion TCP vers mail.infomaniak.com:587
echo "--- Test 3 : Connexion TCP mail.infomaniak.com:587 ---\n";
$sock2 = @stream_socket_client("tcp://mail.infomaniak.com:587", $errno, $errstr, 10);
if (!$sock2) {
    echo "ECHEC : Impossible de se connecter à mail.infomaniak.com:587\n";
    echo "Erreur : $errstr ($errno)\n\n";
} else {
    echo "OK : Connexion TCP établie vers mail.infomaniak.com:587\n";
    $banner2 = fgets($sock2, 512);
    echo "Banner : " . trim($banner2) . "\n\n";
    fclose($sock2);
}

echo "=== Fin du diagnostic ===\n";
echo "⚠️  Supprimez ce fichier après le test !\n";
