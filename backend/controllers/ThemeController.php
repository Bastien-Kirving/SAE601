<?php
/**
 * ThemeController.php — Contrôleur Thèmes
 * 
 * Endpoints :
 * - GET /api/themes         → index()       (public)
 * - PUT /api/themes/{id}    → update($id)   (protégé)
 */

require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Theme.php';

class ThemeController extends Controller
{
    private Theme $themeModel;

    public function __construct()
    {
        $this->themeModel = new Theme();
    }

    /**
     * GET /api/themes — Lister tous les thèmes (retourne aussi le thème actif)
     */
    public function index(): void
    {
        $themes = $this->themeModel->findAll();
        $active = $this->themeModel->findActive();

        $this->jsonResponse([
            'themes' => $themes,
            'active_theme' => $active
        ]);
    }

    /**
     * PUT /api/themes/{id} — Modifier et/ou activer un thème
     * Body : { name, primary_color, secondary_color, bg_color, text_color, custom_css, is_active }
     */
    public function update(int $id): void
    {
        $existing = $this->themeModel->findById($id);
        if (!$existing) {
            $this->jsonResponse(['error' => 'Thème non trouvé'], 404);
            return;
        }

        $data = $this->getRequestBody();

        // Si on active ce thème, désactiver les autres
        if (isset($data['is_active']) && (int) $data['is_active'] === 1) {
            $this->themeModel->activate($id);
            unset($data['is_active']);
        }

        // Mettre à jour les autres champs
        if (!empty($data)) {
            $this->themeModel->update($id, $data);
        }

        $theme = $this->themeModel->findById($id);

        $this->jsonResponse([
            'message' => 'Thème mis à jour',
            'theme' => $theme
        ]);
    }
}
