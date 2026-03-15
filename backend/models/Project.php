<?php
/**
 * Project.php — Modèle Projet
 *
 * Table : projects
 * Gère aussi la table pivot project_technologies (many-to-many)
 *
 * Optimisation N+1 : findActive() et findAllWithTechnologies() utilisent
 * une seule requête JOIN + GROUP_CONCAT au lieu d'une requête par projet.
 */

require_once __DIR__ . '/../core/Model.php';

class Project extends Model
{
    protected string $table = 'projects';

    // Séparateur interne pour GROUP_CONCAT (choisi pour être hors des données)
    private const TECH_SEP = '|||';

    /**
     * Récupérer tous les projets (admin) avec technologies — 1 seule requête.
     */
    public function findAllWithTechnologies(): array
    {
        $sql = "
            SELECT
                p.*,
                GROUP_CONCAT(t.id    ORDER BY t.name SEPARATOR '" . self::TECH_SEP . "') AS _tech_ids,
                GROUP_CONCAT(t.name  ORDER BY t.name SEPARATOR '" . self::TECH_SEP . "') AS _tech_names,
                GROUP_CONCAT(t.color ORDER BY t.name SEPARATOR '" . self::TECH_SEP . "') AS _tech_colors
            FROM {$this->table} p
            LEFT JOIN project_technologies pt ON p.id = pt.project_id
            LEFT JOIN technologies t ON pt.technology_id = t.id
            GROUP BY p.id
            ORDER BY p.id DESC
        ";
        $rows = $this->db->query($sql)->fetchAll();
        return array_map([$this, 'parseTechColumns'], $rows);
    }

    /**
     * Récupérer un projet par ID avec ses technologies — 1 seule requête.
     */
    public function findByIdWithTechnologies(int $id)
    {
        $sql = "
            SELECT
                p.*,
                GROUP_CONCAT(t.id    ORDER BY t.name SEPARATOR '" . self::TECH_SEP . "') AS _tech_ids,
                GROUP_CONCAT(t.name  ORDER BY t.name SEPARATOR '" . self::TECH_SEP . "') AS _tech_names,
                GROUP_CONCAT(t.color ORDER BY t.name SEPARATOR '" . self::TECH_SEP . "') AS _tech_colors
            FROM {$this->table} p
            LEFT JOIN project_technologies pt ON p.id = pt.project_id
            LEFT JOIN technologies t ON pt.technology_id = t.id
            WHERE p.id = :id
            GROUP BY p.id
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ? $this->parseTechColumns($row) : false;
    }

    /**
     * Récupérer les projets actifs avec technologies — 1 seule requête.
     */
    public function findActive(): array
    {
        $sql = "
            SELECT
                p.*,
                GROUP_CONCAT(t.id    ORDER BY t.name SEPARATOR '" . self::TECH_SEP . "') AS _tech_ids,
                GROUP_CONCAT(t.name  ORDER BY t.name SEPARATOR '" . self::TECH_SEP . "') AS _tech_names,
                GROUP_CONCAT(t.color ORDER BY t.name SEPARATOR '" . self::TECH_SEP . "') AS _tech_colors
            FROM {$this->table} p
            LEFT JOIN project_technologies pt ON p.id = pt.project_id
            LEFT JOIN technologies t ON pt.technology_id = t.id
            WHERE p.is_active = 1
            GROUP BY p.id
            ORDER BY p.sort_order ASC
        ";
        $rows = $this->db->query($sql)->fetchAll();
        return array_map([$this, 'parseTechColumns'], $rows);
    }

    /**
     * Créer un projet et attacher ses technologies.
     */
    public function createWithTechnologies(array $data, array $techIds = []): int
    {
        $projectId = $this->create($data);
        $this->syncTechnologies($projectId, $techIds);
        return $projectId;
    }

    /**
     * Mettre à jour un projet et ses technologies.
     */
    public function updateWithTechnologies(int $id, array $data, array $techIds = []): bool
    {
        $result = $this->update($id, $data);
        $this->syncTechnologies($id, $techIds);
        return $result;
    }

    // ----------------------------------------------------------------
    // Méthodes privées
    // ----------------------------------------------------------------

    /**
     * Convertit les colonnes GROUP_CONCAT (_tech_ids, _tech_names, _tech_colors)
     * en tableau 'technologies' structuré, puis les supprime de la ligne.
     */
    private function parseTechColumns(array $row): array
    {
        $ids    = $row['_tech_ids']    ?? null;
        $names  = $row['_tech_names']  ?? null;
        $colors = $row['_tech_colors'] ?? null;

        unset($row['_tech_ids'], $row['_tech_names'], $row['_tech_colors']);

        if ($ids === null) {
            $row['technologies'] = [];
            return $row;
        }

        $idsArr    = explode(self::TECH_SEP, $ids);
        $namesArr  = explode(self::TECH_SEP, $names ?? '');
        $colorsArr = explode(self::TECH_SEP, $colors ?? '');

        $row['technologies'] = array_map(
            fn($i) => [
                'id'    => (int) $idsArr[$i],
                'name'  => $namesArr[$i]  ?? '',
                'color' => $colorsArr[$i] ?? '',
            ],
            array_keys($idsArr)
        );

        return $row;
    }

    /**
     * Synchroniser les technologies d'un projet (supprimer + réinsérer).
     */
    private function syncTechnologies(int $projectId, array $techIds): void
    {
        $stmt = $this->db->prepare("DELETE FROM project_technologies WHERE project_id = :id");
        $stmt->execute(['id' => $projectId]);

        if (empty($techIds)) {
            return;
        }

        $stmt = $this->db->prepare(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (:pid, :tid)"
        );
        foreach ($techIds as $techId) {
            $stmt->execute(['pid' => $projectId, 'tid' => (int) $techId]);
        }
    }
}
