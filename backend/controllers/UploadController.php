<?php
/**
 * UploadController.php — Gestion des uploads de fichiers
 */

require_once __DIR__ . '/../core/Controller.php';

class UploadController extends Controller
{
    /** Taille maximale autorisée : 5 Mo */
    private const MAX_FILE_SIZE = 5 * 1024 * 1024;

    /** Extensions de fichier acceptées */
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'];

    /**
     * Types MIME réels autorisés (vérifiés avec finfo, pas l'extension)
     * SVG → image/svg+xml  |  Certains SVG → text/html (rejeté volontairement)
     */
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/webp',
        'image/gif',
    ];

    /** Dossiers de destination autorisés (whitelist stricte) */
    private const ALLOWED_FOLDERS = ['skills', 'projects', 'misc'];

    /**
     * POST /api/upload — Uploader un fichier image
     */
    public function upload(): void
    {
        // 1. Présence du fichier
        if (!isset($_FILES['file'])) {
            $this->jsonResponse(['error' => 'Aucun fichier reçu'], 400);
            return;
        }

        $file = $_FILES['file'];

        // 2. Erreur PHP d'upload
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $this->jsonResponse(['error' => 'Erreur lors de l\'upload (code ' . $file['error'] . ')'], 400);
            return;
        }

        // 3. Taille maximale
        if ($file['size'] > self::MAX_FILE_SIZE) {
            $this->jsonResponse(['error' => 'Fichier trop volumineux (5 Mo maximum)'], 400);
            return;
        }

        // 4. Extension autorisée
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            $this->jsonResponse(['error' => 'Extension non autorisée (jpg, jpeg, png, svg, webp, gif uniquement)'], 400);
            return;
        }

        // 5. Type MIME réel (contenu du fichier, pas son nom)
        if (!function_exists('finfo_open')) {
            $this->jsonResponse(['error' => 'Extension PHP fileinfo manquante sur le serveur'], 500);
            return;
        }
        $finfo    = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            $this->jsonResponse(['error' => 'Type de fichier non autorisé (contenu invalide)'], 400);
            return;
        }

        // 6. Dossier de destination — whitelist stricte
        $folder = $_POST['folder'] ?? 'misc';
        if (!in_array($folder, self::ALLOWED_FOLDERS, true)) {
            $folder = 'misc';
        }

        // 7. Nom unique pour éviter les collisions
        $newName = uniqid('upload_', true) . '.' . $extension;

        // 8. Création du répertoire cible si inexistant
        // En production : backend est hors du web root, uploads doivent aller dans bastien-lievre.com/api/uploads/
        // En local      : backend/public/ est le web root
        $sitesDir = dirname(dirname(__DIR__)); // .../sites (prod) ou f:/SAE601 (local)
        if (is_dir($sitesDir . '/bastien-lievre.com')) {
            $targetDir = $sitesDir . '/bastien-lievre.com/api/uploads/' . $folder . '/';
        } else {
            $targetDir = __DIR__ . '/../public/uploads/' . $folder . '/';
        }
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }
        $targetPath = $targetDir . $newName;

        // 9. Déplacement sécurisé
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $publicUrl = '/api/uploads/' . $folder . '/' . $newName;
            $this->jsonResponse([
                'url'     => $publicUrl,
                'message' => 'Fichier uploadé avec succès',
            ]);
        } else {
            $this->jsonResponse(['error' => "Erreur lors de l'enregistrement du fichier"], 500);
        }
    }
}
