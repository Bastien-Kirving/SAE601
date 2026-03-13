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
