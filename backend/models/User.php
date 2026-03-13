<?php
/**
 * User.php — Modèle Utilisateur
 * 
 * Table : users
 * Champs : id, username, email, password, role, created_at, updated_at
 */

require_once __DIR__ . '/../core/Model.php';

class User extends Model
{
    protected string $table = 'users';

    /**
     * Trouver un utilisateur par email
     * 
     * @param string $email
     * @return array|false
     */
    public function findByEmail(string $email)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = :email");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    }

    /**
     * Créer un utilisateur avec mot de passe hashé
     * 
     * @param array $data [username, email, password, role]
     * @return int ID du nouvel utilisateur
     */
    public function createUser(array $data): int
    {
        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        return $this->create($data);
    }

    /**
     * Vérifier le mot de passe d'un utilisateur
     * 
     * @param string $password      Mot de passe en clair
     * @param string $hashedPassword Mot de passe hashé
     * @return bool
     */
    public function verifyPassword(string $password, string $hashedPassword): bool
    {
        return password_verify($password, $hashedPassword);
    }
}
