<?php
/**
 * Theme.php — Modèle Thème
 * 
 * Table : themes
 * Champs : id, name, primary_color, secondary_color, bg_color, text_color, custom_css, is_active, created_at
 */

require_once __DIR__ . '/../core/Model.php';

class Theme extends Model
{
    protected string $table = 'themes';

    /**
     * Récupérer le thème actif
     * 
     * @return array|false
     */
    public function findActive()
    {
        $stmt = $this->db->query(
            "SELECT * FROM {$this->table} WHERE is_active = 1 LIMIT 1"
        );
        return $stmt->fetch();
    }

    /**
     * Activer un thème (et désactiver les autres)
     * 
     * @param int $id
     * @return bool
     */
    public function activate(int $id): bool
    {
        // Désactiver tous les thèmes
        $this->db->exec("UPDATE {$this->table} SET is_active = 0");

        // Activer le thème sélectionné
        $stmt = $this->db->prepare("UPDATE {$this->table} SET is_active = 1 WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
