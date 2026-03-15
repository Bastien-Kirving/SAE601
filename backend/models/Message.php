<?php
/**
 * Message.php — Modèle Message (contact)
 * 
 * Table : messages
 * Champs : id, name, email, subject, content, is_read, created_at
 */

require_once __DIR__ . '/../core/Model.php';

class Message extends Model
{
    protected string $table = 'messages';

    /**
     * Récupérer tous les messages triés par date (plus récents d'abord)
     * 
     * @return array
     */
    public function findAll(): array
    {
        $stmt = $this->db->query(
            "SELECT * FROM {$this->table} ORDER BY created_at DESC"
        );
        return $stmt->fetchAll();
    }

    /**
     * Récupérer une page de messages avec métadonnées de pagination.
     *
     * @param int $page  Page courante (commence à 1)
     * @param int $limit Nombre par page (max 50)
     * @return array { data, pagination: { page, limit, total, pages } }
     */
    public function findPaginated(int $page, int $limit): array
    {
        $limit  = min($limit, 50);
        $offset = ($page - 1) * $limit;

        $stmt = $this->db->prepare(
            "SELECT * FROM {$this->table} ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
        );
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $total = $this->count();

        return [
            'data'       => $stmt->fetchAll(),
            'pagination' => [
                'page'  => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => (int) ceil($total / max(1, $limit)),
            ],
        ];
    }

    /**
     * Récupérer les messages non lus
     *
     * @return array
     */
    public function findUnread(): array
    {
        $stmt = $this->db->query(
            "SELECT * FROM {$this->table} WHERE is_read = 0 ORDER BY created_at DESC"
        );
        return $stmt->fetchAll();
    }

    /**
     * Marquer un message comme lu
     * 
     * @param int $id
     * @return bool
     */
    public function markAsRead(int $id): bool
    {
        return $this->update($id, ['is_read' => 1]);
    }

    /**
     * Compter les messages non lus
     * 
     * @return int
     */
    public function countUnread(): int
    {
        $stmt = $this->db->query(
            "SELECT COUNT(*) as total FROM {$this->table} WHERE is_read = 0"
        );
        return (int) $stmt->fetch()['total'];
    }
}
