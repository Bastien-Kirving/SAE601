<?php
/**
 * config.php — Configuration globale
 * Copier ce fichier en config.php et remplir les valeurs.
 */

// Base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'portfolio_db');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');

// JWT — Clé secrète HMAC-SHA256 (64 caractères hex)
// Générer avec : openssl rand -hex 32
define('JWT_SECRET', 'your_jwt_secret_here');

// CORS
define('ALLOWED_ORIGINS', '*');
