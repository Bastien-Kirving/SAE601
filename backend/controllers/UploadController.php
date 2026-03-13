<?php
/**
 * UploadController.php — Gestion des uploads de fichiers
 */

require_once __DIR__ . '/../core/Controller.php';

class UploadController extends Controller
{
    /**
     * POST /api/upload — Uploader un fichier
     */
    public function upload(): void
    {
        if (!isset($_FILES['file'])) {
            $this->jsonResponse(['error' => 'Aucun fichier reçu'], 400);
            return;
        }

        $file = $_FILES['file'];
        $folder = $_POST['folder'] ?? 'misc';
        
        // Sécurité : Vérifier l'extension
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'];
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($extension, $allowedExtensions)) {
            $this->jsonResponse(['error' => 'Extension non autorisée (uniquement images)'], 400);
            return;
        }

        // Créer le nom de fichier unique
        $newName = uniqid('upload_', true) . '.' . $extension;
        
        // Chemin physique (f:\SAE601\backend\public\uploads\...)
        $targetDir = __DIR__ . '/../public/uploads/' . $folder . '/';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        
        $targetPath = $targetDir . $newName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            // URL publique (ex: /uploads/skills/upload_xyz.png)
            $publicUrl = '/uploads/' . $folder . '/' . $newName;
            $this->jsonResponse([
                'url' => $publicUrl,
                'message' => 'Fichier uploadé avec succès'
            ]);
        } else {
            $this->jsonResponse(['error' => "Erreur lors de l'enregistrement du fichier"], 500);
        }
    }
}
