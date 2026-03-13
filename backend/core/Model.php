<?php
/**
 * Model.php — Modèle de base avec CRUD générique
 * 
 * Fournit les opérations CRUD standard via PDO.
 * Les modèles enfants définissent $table et peuvent surcharger les méthodes.
 */

require_once __DIR__ . '/../config/Database.php';

class Model
{
    /**
     * Connexion PDO
     */
    protected PDO $db;

    /**
     * Nom de la table (à définir dans les modèles enfants)
     */
    protected string $table = '';

    /**
     * Constructeur : récupère la connexion PDO
     */
    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Récupérer tous les enregistrements
     * 
     * @return array
     */
    public function findAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM {$this->table} ORDER BY id DESC");
        return $stmt->fetchAll();
    }

    /**
     * Récupérer un enregistrement par son ID
     * 
     * @param int $id
     * @return array|false
     */
    public function findById(int $id)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Créer un nouvel enregistrement
     * 
     * @param array $data Tableau associatif [colonne => valeur]
     * @return int ID de l'enregistrement créé
     */
    public function create(array $data): int
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));

        $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Mettre à jour un enregistrement
     * 
     * @param int   $id
     * @param array $data Tableau associatif [colonne => valeur]
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        $sets = [];
        foreach (array_keys($data) as $column) {
            $sets[] = "{$column} = :{$column}";
        }
        $setString = implode(', ', $sets);

        $data['id'] = $id;
        $sql = "UPDATE {$this->table} SET {$setString} WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($data);
    }

    /**
     * Supprimer un enregistrement
     * 
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Compter le nombre total d'enregistrements
     * 
     * @return int
     */
    public function count(): int
    {
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM {$this->table}");
        return (int) $stmt->fetch()['total'];
    }
}
