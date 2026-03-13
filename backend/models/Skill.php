<?php
/**
 * Skill.php — Modèle Compétence
 * 
 * Table : skills
 * Champs : id, name, category, level, icon, sort_order, created_at
 */

require_once __DIR__ . '/../core/Model.php';

class Skill extends Model
{
    protected string $table = 'skills';

    /**
     * Récupérer les compétences triées par catégorie puis par ordre
     * 
     * @return array
     */
    public function findAllSorted(): array
    {
        $stmt = $this->db->query(
            "SELECT * FROM {$this->table} ORDER BY category ASC, sort_order ASC"
        );
        return $stmt->fetchAll();
    }

    /**
     * Récupérer les compétences groupées par catégorie
     * 
     * @return array
     */
    public function findGroupedByCategory(): array
    {
        $skills = $this->findAllSorted();
        $grouped = [];

        foreach ($skills as $skill) {
            $category = $skill['category'] ?? 'Autre';
            $grouped[$category][] = $skill;
        }

        return $grouped;
    }
}
