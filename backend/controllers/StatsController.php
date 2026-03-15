<?php
/**
 * StatsController.php — Statistiques du tableau de bord admin
 *
 * Endpoints :
 * - GET /api/stats → index() [auth]
 */

require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Message.php';
require_once __DIR__ . '/../config/Database.php';

class StatsController extends Controller
{
    private PDO $db;
    private Message $messageModel;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->messageModel = new Message();
    }

    /**
     * GET /api/stats — Retourner les statistiques globales du portfolio
     */
    public function index(): void
    {
        $totalProjects = (int) $this->db
            ->query("SELECT COUNT(*) as total FROM projects")
            ->fetch()['total'];

        $totalSkills = (int) $this->db
            ->query("SELECT COUNT(*) as total FROM skills")
            ->fetch()['total'];

        $totalMessages = (int) $this->db
            ->query("SELECT COUNT(*) as total FROM messages")
            ->fetch()['total'];

        $unreadMessages = $this->messageModel->countUnread();

        $stmt = $this->db->query(
            "SELECT id, name, email, subject, is_read, created_at
             FROM messages
             ORDER BY created_at DESC
             LIMIT 5"
        );
        $recentMessages = $stmt->fetchAll();

        $this->jsonResponse([
            'projects'        => $totalProjects,
            'skills'          => $totalSkills,
            'messages'        => $totalMessages,
            'unread_messages' => $unreadMessages,
            'recent_messages' => $recentMessages,
        ]);
    }
}
