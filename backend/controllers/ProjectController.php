<?php
/**
 * ProjectController.php — Contrôleur Projets (CRUD complet)
 * 
 * Endpoints :
 * - GET    /api/projects      → index()
 * - GET    /api/projects/{id} → show($id)
 * - POST   /api/projects      → store()       [auth]
 * - PUT    /api/projects/{id} → update($id)   [auth]
 * - DELETE /api/projects/{id} → destroy($id)  [auth]
 */

require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Project.php';

class ProjectController extends Controller
{
    private Project $projectModel;

    public function __construct()
    {
        $this->projectModel = new Project();
    }

    /**
     * GET /api/projects — Lister tous les projets actifs avec technologies
     */
    public function index(): void
    {
        $projects = $this->projectModel->findActive();
        $this->jsonResponse($projects);
    }

    /**
     * GET /api/projects/{id} — Afficher un projet avec ses technologies
     */
    public function show(int $id): void
    {
        $project = $this->projectModel->findByIdWithTechnologies($id);

        if (!$project) {
            $this->jsonResponse(['error' => 'Projet non trouvé'], 404);
            return;
        }

        $this->jsonResponse($project);
    }

    /**
     * POST /api/projects — Créer un nouveau projet
     * Body : { title, description, image_url, project_url, github_url, is_active, sort_order, technologies: [1,2,3] }
     */
    public function store(): void
    {
        $data = $this->getRequestBody();

        if (!$this->validateRequired($data, ['title'])) {
            return;
        }

        // Séparer et typer les technologies
        $techIds = isset($data['technologies']) && is_array($data['technologies'])
            ? array_map('intval', $data['technologies'])
            : [];
        unset($data['technologies']);

        // Forcer le typage entier
        if (isset($data['is_active']))
            $data['is_active'] = (int) $data['is_active'];
        if (isset($data['sort_order']))
            $data['sort_order'] = (int) $data['sort_order'];

        $projectId = $this->projectModel->createWithTechnologies($data, $techIds);
        $project = $this->projectModel->findByIdWithTechnologies($projectId);

        $this->jsonResponse([
            'message' => 'Projet créé avec succès',
            'project' => $project
        ], 201);
    }

    /**
     * PUT /api/projects/{id} — Modifier un projet
     * Body : { title, description, ..., technologies: [1,2,3] }
     */
    public function update(int $id): void
    {
        // Vérifier que le projet existe
        $existing = $this->projectModel->findById($id);
        if (!$existing) {
            $this->jsonResponse(['error' => 'Projet non trouvé'], 404);
            return;
        }

        $data = $this->getRequestBody();

        // Séparer et typer les technologies
        $techIds = isset($data['technologies']) && is_array($data['technologies'])
            ? array_map('intval', $data['technologies'])
            : [];
        unset($data['technologies']);

        // Forcer le typage entier
        if (isset($data['is_active']))
            $data['is_active'] = (int) $data['is_active'];
        if (isset($data['sort_order']))
            $data['sort_order'] = (int) $data['sort_order'];

        if (!empty($data)) {
            $this->projectModel->updateWithTechnologies($id, $data, $techIds);
        } elseif (!empty($techIds)) {
            // Uniquement mise à jour des technologies
            $this->projectModel->updateWithTechnologies($id, [], $techIds);
        }

        $project = $this->projectModel->findByIdWithTechnologies($id);

        $this->jsonResponse([
            'message' => 'Projet mis à jour',
            'project' => $project
        ]);
    }

    /**
     * DELETE /api/projects/{id} — Supprimer un projet
     */
    public function destroy(int $id): void
    {
        $existing = $this->projectModel->findById($id);
        if (!$existing) {
            $this->jsonResponse(['error' => 'Projet non trouvé'], 404);
            return;
        }

        $this->projectModel->delete($id);

        $this->jsonResponse(['message' => 'Projet supprimé avec succès']);
    }
}
