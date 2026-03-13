-- ============================================
-- Portfolio SAE601 — Database Schema
-- Base : portfolio_db | Charset : utf8mb4
-- ============================================

CREATE DATABASE IF NOT EXISTS portfolio_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE portfolio_db;

-- ============================================
-- 1. USERS — Comptes administrateurs
-- ============================================
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,  -- hash bcrypt
    role        ENUM('admin', 'user') DEFAULT 'admin',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 2. PROJECTS — Projets du portfolio
-- ============================================
CREATE TABLE projects (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    image_url       VARCHAR(500),
    project_url     VARCHAR(500),
    github_url      VARCHAR(500),
    is_active       TINYINT(1) DEFAULT 1,      -- 1 = visible, 0 = masqué
    sort_order      INT DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 3. TECHNOLOGIES — Stack technique
-- ============================================
CREATE TABLE technologies (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE,
    color   VARCHAR(7) DEFAULT '#FF1744'   -- couleur badge hex
) ENGINE=InnoDB;

-- ============================================
-- 4. PROJECT_TECHNOLOGIES — Pivot many-to-many
-- ============================================
CREATE TABLE project_technologies (
    project_id      INT NOT NULL,
    technology_id   INT NOT NULL,
    PRIMARY KEY (project_id, technology_id),
    FOREIGN KEY (project_id)    REFERENCES projects(id)      ON DELETE CASCADE,
    FOREIGN KEY (technology_id) REFERENCES technologies(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 5. SKILLS — Compétences affichées
-- ============================================
CREATE TABLE skills (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    category    VARCHAR(100),               -- ex: "Frontend", "Backend", "DevOps"
    level       INT DEFAULT 50,             -- pourcentage 0-100
    icon        VARCHAR(100),               -- nom d'icône ou URL
    sort_order  INT DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 6. MESSAGES — Formulaire de contact
-- ============================================
CREATE TABLE messages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    subject     VARCHAR(255),
    content     TEXT NOT NULL,
    is_read     TINYINT(1) DEFAULT 0,       -- 0 = non lu, 1 = lu
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 7. THEMES — Thèmes visuels
-- ============================================
CREATE TABLE themes (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    primary_color   VARCHAR(7) DEFAULT '#FF1744',
    secondary_color VARCHAR(7) DEFAULT '#E040FB',
    bg_color        VARCHAR(7) DEFAULT '#0D0D0D',
    text_color      VARCHAR(7) DEFAULT '#FFFFFF',
    custom_css      TEXT,                   -- CSS custom stocké en base
    is_active       TINYINT(1) DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 8. USER_PREFERENCES — Préférences utilisateur
-- ============================================
CREATE TABLE user_preferences (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    theme_id    INT,
    dark_mode   TINYINT(1) DEFAULT 1,       -- 1 = dark, 0 = light
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- 9. SETTINGS — Paramètres globaux du site
-- ============================================
CREATE TABLE settings (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL UNIQUE,
    setting_value   TEXT,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
