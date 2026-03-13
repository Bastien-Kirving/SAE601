<?php
/**
 * SettingController.php — API pour les paramètres du profil
 */
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Setting.php';

class SettingController extends Controller
{
    private Setting $settingModel;

    public function __construct()
    {
        $this->settingModel = new Setting();
    }

    /**
     * GET /api/settings
     */
    public function index(): void
    {
        $settings = $this->settingModel->getAllSettings();
        $this->jsonResponse($settings);
    }

    /**
     * PUT /api/settings
     * Body: { "hero_title": "...", "hero_bio": "..." }
     */
    public function update(): void
    {
        $data = $this->getRequestBody();

        if (empty($data)) {
            $this->jsonResponse(['error' => 'Aucune donnée fournie'], 400);
            return;
        }

        try {
            $this->settingModel->updateSettings($data);
            $this->jsonResponse(['message' => 'Paramètres mis à jour']);
        } catch (Exception $e) {
            $this->jsonResponse([
                'error' => 'Erreur lors de la mise à jour',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
