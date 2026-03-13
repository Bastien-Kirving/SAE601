<?php
try {
    $db = new PDO("mysql:host=localhost;dbname=portfolio_db;charset=utf8mb4", "root", "", [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $stmt = $db->query("SELECT name FROM messages ORDER BY id DESC LIMIT 1");
    $msg = $stmt->fetch();
    echo "Nom inséré en base : " . $msg['name'] . "\n";
} catch (Exception $e) {
    echo "Erreur : " . $e->getMessage();
}
