<?php
/**
 * SkillController.php — Contrôleur Compétences
 * 
 * Endpoints :
 * - GET  /api/skills → index()          (public)
 * - POST /api/skills → store()          (protégé)
 */

require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Skill.php';

class SkillController extends Controller
{
    private Skill $skillModel;

    public function __construct()
    {
        $this->skillModel = new Skill();
    }

    /**
     * GET /api/skills — Lister toutes les compétences (groupées par catégorie)
     */
    public function index(): void
    {
        $skills = $this->skillModel->findAllSorted();
        $this->jsonResponse($skills);
    }

    /**
     * POST /api/skills — Créer une compétence
     * Body : { name, category, level, icon, sort_order }
     */
    public function store(): void
    {
        $data = $this->getRequestBody();

        if (!$this->validateRequired($data, ['name'])) {
            return;
        }

        $skillData = [
            'name' => $data['name'],
            'category' => $data['category'] ?? null,
            'level' => isset($data['level']) ? (int) $data['level'] : 50,
            'icon' => $data['icon'] ?? null,
            'sort_order' => isset($data['sort_order']) ? (int) $data['sort_order'] : 0
        ];

        $skillId = $this->skillModel->create($skillData);
        $skill = $this->skillModel->findById($skillId);

        $this->jsonResponse([
            'message' => 'Compétence créée avec succès',
            'skill' => $skill
        ], 201);
    }

    /**
     * PUT /api/skills/{id} — Mettre à jour une compétence
     */
    public function update(int $id): void
    {
        $existing = $this->skillModel->findById($id);
        if (!$existing) {
            $this->jsonResponse(['error' => 'Compétence non trouvée'], 404);
            return;
        }

        $data = $this->getRequestBody();

        $skillData = [
            'name' => $data['name'] ?? $existing['name'],
            'category' => $data['category'] ?? $existing['category'],
            'level' => isset($data['level']) ? (int) $data['level'] : $existing['level'],
            'icon' => $data['icon'] ?? $existing['icon'],
            'sort_order' => isset($data['sort_order']) ? (int) $data['sort_order'] : $existing['sort_order']
        ];

        $this->skillModel->update($id, $skillData);
        $updated = $this->skillModel->findById($id);

        $this->jsonResponse([
            'message' => 'Compétence mise à jour avec succès',
            'skill' => $updated
        ]);
    }

    /**
     * DELETE /api/skills/{id} — Supprimer une compétence
     */
    public function destroy(int $id): void
    {
        $existing = $this->skillModel->findById($id);
        if (!$existing) {
            $this->jsonResponse(['error' => 'Compétence non trouvée'], 404);
            return;
        }

        $this->skillModel->delete($id);

        $this->jsonResponse(['message' => 'Compétence supprimée avec succès']);
    }
}
