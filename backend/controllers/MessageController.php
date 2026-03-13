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

        $this->jsonResponse([
            'message' => 'Message envoyé avec succès',
            'id' => $messageId
        ], 201);
    }
}
