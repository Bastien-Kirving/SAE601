<?php
/**
 * Database.php — Connexion PDO Singleton
 * 
 * Utilisation :
 *   $db = Database::getInstance();
 *   $stmt = $db->query("SELECT * FROM users");
 */

require_once __DIR__ . '/config.php';

class Database
{
    /**
     * Instance unique (Singleton)
     */
    private static ?Database $instance = null;

    /**
     * Connexion PDO
     */
    private PDO $pdo;

    /**
     * Constructeur privé — empêche new Database()
     * Se connecte à MySQL via PDO avec les constantes de config.php
     */
    private function __construct()
    {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';

            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,     // Erreurs en exceptions
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,          // Résultats en tableau associatif
                PDO::ATTR_EMULATE_PREPARES => false                      // Requêtes préparées natives
            ]);
        } catch (PDOException $e) {
            // En production, ne pas afficher le message d'erreur brut
            die(json_encode([
                'error' => 'Erreur de connexion à la base de données',
                'details' => $e->getMessage()
            ]));
        }
    }

    /**
     * Récupérer l'instance unique de Database
     * 
     * @return Database
     */
    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /**
     * Récupérer la connexion PDO
     * 
     * @return PDO
     */
    public function getConnection(): PDO
    {
        return $this->pdo;
    }

    /**
     * Empêcher le clonage (Singleton)
     */
    private function __clone()
    {
    }
}
