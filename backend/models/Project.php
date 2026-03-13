<?php
/**
 * Project.php — Modèle Projet
 * 
 * Table : projects
 * Gère aussi la table pivot project_technologies (many-to-many)
 */

require_once __DIR__ . '/../core/Model.php';

class Project extends Model
{
    protected string $table = 'projects';

    /**
     * Récupérer tous les projets avec leurs technologies
     * 
     * @return array
     */
    public function findAllWithTechnologies(): array
    {
        $projects = $this->findAll();

        foreach ($projects as &$project) {
            $project['technologies'] = $this->getTechnologies($project['id']);
        }

        return $projects;
    }

    /**
     * Récupérer un projet par ID avec ses technologies
     * 
     * @param int $id
     * @return array|false
     */
    public function findByIdWithTechnologies(int $id)
    {
        $project = $this->findById($id);
        if ($project) {
            $project['technologies'] = $this->getTechnologies($id);
        }
        return $project;
    }

    /**
     * Récupérer les projets actifs uniquement
     * 
     * @return array
     */
    public function findActive(): array
    {
        $stmt = $this->db->query(
            "SELECT * FROM {$this->table} WHERE is_active = 1 ORDER BY sort_order ASC"
        );
        $projects = $stmt->fetchAll();

        foreach ($projects as &$project) {
            $project['technologies'] = $this->getTechnologies($project['id']);
        }

        return $projects;
    }

    /**
     * Créer un projet et attacher ses technologies
     * 
     * @param array $data         Données du projet
     * @param array $techIds      IDs des technologies
     * @return int
     */
    public function createWithTechnologies(array $data, array $techIds = []): int
    {
        $projectId = $this->create($data);
        $this->syncTechnologies($projectId, $techIds);
        return $projectId;
    }

    /**
     * Mettre à jour un projet et ses technologies
     * 
     * @param int   $id
     * @param array $data
     * @param array $techIds
     * @return bool
     */
    public function updateWithTechnologies(int $id, array $data, array $techIds = []): bool
    {
        $result = $this->update($id, $data);
        $this->syncTechnologies($id, $techIds);
        return $result;
    }

    /**
     * Récupérer les technologies d'un projet
     * 
     * @param int $projectId
     * @return array
     */
    private function getTechnologies(int $projectId): array
    {
        $stmt = $this->db->prepare(
            "SELECT t.id, t.name, t.color 
             FROM technologies t 
             INNER JOIN project_technologies pt ON t.id = pt.technology_id 
             WHERE pt.project_id = :project_id"
        );
        $stmt->execute(['project_id' => $projectId]);
        return $stmt->fetchAll();
    }

    /**
     * Synchroniser les technologies d'un projet (supprimer + réinsérer)
     * 
     * @param int   $projectId
     * @param array $techIds
     */
    private function syncTechnologies(int $projectId, array $techIds): void
    {
        // Supprimer les anciennes liaisons
        $stmt = $this->db->prepare("DELETE FROM project_technologies WHERE project_id = :id");
        $stmt->execute(['id' => $projectId]);

        // Insérer les nouvelles
        $stmt = $this->db->prepare(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (:pid, :tid)"
        );
        foreach ($techIds as $techId) {
            $stmt->execute(['pid' => $projectId, 'tid' => $techId]);
        }
    }
}
