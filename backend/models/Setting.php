<?php
/**
 * Setting.php — Modèle pour les paramètres globaux (Bio, Profil, etc.)
 */
require_once __DIR__ . '/../core/Model.php';

class Setting extends Model
{
    protected string $table = 'settings';

    /**
     * Récupérer tous les settings sous forme de clé => valeur
     */
    public function getAllSettings(): array
    {
        $stmt = $this->db->query("SELECT setting_key, setting_value FROM {$this->table}");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $settings = [];
        foreach ($results as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        return $settings;
    }

    /**
     * Mettre à jour plusieurs settings en une fois
     */
    public function updateSettings(array $settings): void
    {
        $this->db->beginTransaction();
        try {
            $stmtInsert = $this->db->prepare(
                "INSERT INTO {$this->table} (setting_key, setting_value) 
                 VALUES (:key, :value) 
                 ON DUPLICATE KEY UPDATE setting_value = :value_update"
            );

            foreach ($settings as $key => $value) {
                $stmtInsert->execute([
                    'key' => $key,
                    'value' => $value,
                    'value_update' => $value
                ]);
            }
            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
