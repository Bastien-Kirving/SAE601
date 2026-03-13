<?php
/**
 * MessageController.php — Contrôleur Messages (Contact)
 * 
 * Endpoints :
 * - POST /api/messages → store()    (public — formulaire contact)
 * - GET  /api/messages → index()    (protégé — admin)
 */

require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Message.php';

class MessageController extends Controller
{
    private Message $messageModel;

    public function __construct()
    {
        $this->messageModel = new Message();
    }

    /**
     * GET /api/messages — Lister tous les messages (admin uniquement)
     */
    public function index(): void
    {
        $messages = $this->messageModel->findAll();
        $unreadCount = $this->messageModel->countUnread();

        $this->jsonResponse([
            'messages' => $messages,
            'unread_count' => $unreadCount,
            'total' => count($messages)
        ]);
    }

    /**
     * POST /api/messages — Envoyer un message via le formulaire de contact
     * Body : { name, email, subject, content }
     */
    public function store(): void
    {
        $data = $this->getRequestBody();

        if (!$this->validateRequired($data, ['name', 'email', 'content'])) {
            return;
        }

        // Construire les données (htmlspecialchars a déjà été appliqué par getRequestBody)
        $messageData = [
            'name' => $data['name'],
            'email' => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
            'subject' => $data['subject'] ?? '',
            'content' => $data['content']
        ];

        // Valider l'email
        if (!filter_var($messageData['email'], FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse(['error' => 'Email invalide'], 400);
            return;
        }

        $messageId = $this->messageModel->create($messageData);

        // Envoyer une notification par email
        $this->sendEmailNotification($messageData);

        $this->jsonResponse([
            'message' => 'Message envoyé avec succès',
            'id' => $messageId
        ], 201);
    }

    /**
     * DELETE /api/messages/{id} — Supprimer un message
     */
    public function destroy(int $id): void
    {
        if ($this->messageModel->delete($id)) {
            $this->jsonResponse(['message' => 'Message supprimé']);
        } else {
            $this->jsonResponse(['error' => 'Erreur lors de la suppression'], 500);
        }
    }

    /**
     * Envoyer une notification par email pour un nouveau message
     */
    private function sendEmailNotification(array $data): void
    {
        $to = ADMIN_EMAIL;
        $subject = "Nouveau message de contact : " . ($data['subject'] ?? 'Sans objet');
        
        $body = "Vous avez reçu un nouveau message via votre portfolio :\n\n";
        $body .= "Nom : " . $data['name'] . "\n";
        $body .= "Email : " . $data['email'] . "\n";
        $body .= "Sujet : " . ($data['subject'] ?? 'N/A') . "\n\n";
        $body .= "Message :\n" . $data['content'] . "\n\n";
        $body .= "--- \nCe message a été envoyé automatiquement depuis votre Portfolio SAE601.";

        $headers = "From: webmaster@portfolio.com\r\n";
        $headers .= "Reply-To: " . $data['email'] . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        // On utilise @mail pour ignorer les erreurs si le serveur n'est pas configuré
        // En local, cela retournera false sans planter l'exécution.
        @mail($to, $subject, $body, $headers);
    }
}
