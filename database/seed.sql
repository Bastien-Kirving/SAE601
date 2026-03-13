-- ============================================
-- Portfolio SAE601 — Seed Data (Demo)
-- À exécuter APRÈS schema.sql
-- ============================================

USE portfolio_db;

-- ============================================
-- 1. Admin par défaut
--    Email : admin@portfolio.com
--    Mot de passe : admin123 (hashé en bcrypt)
-- ============================================
INSERT INTO users (username, email, password, role) VALUES
-- IMPORTANT : Le hash ci-dessous correspond à 'password' (Laravel default).
-- Après import, exécutez fix_password.php pour mettre le mot de passe à 'admin123'
-- Ou générez votre propre hash avec : php -r "echo password_hash('admin123', PASSWORD_BCRYPT);"
('Admin', 'admin@portfolio.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- ============================================
-- 2. Technologies disponibles
-- ============================================
INSERT INTO technologies (name, color) VALUES
('HTML',        '#E44D26'),
('CSS',         '#264DE4'),
('JavaScript',  '#F7DF1E'),
('PHP',         '#777BB4'),
('MySQL',       '#4479A1'),
('React',       '#61DAFB'),
('Node.js',     '#339933'),
('Three.js',    '#000000'),
('Git',         '#F05032'),
('API REST',    '#FF1744'),
('Tailwind',    '#38BDF8'),
('Python',      '#3776AB');

-- ============================================
-- 3. Projets de démo
-- ============================================
INSERT INTO projects (title, description, image_url, project_url, github_url, is_active, sort_order) VALUES
(
    'Portfolio Interactif',
    'Portfolio one-page avec design Spider-Man Miles Morales, scène 3D interactive, et backoffice complet connecté à une API REST PHP.',
    '/images/portfolio.jpg',
    '#',
    'https://github.com/user/portfolio',
    1,
    1
),
(
    'Ammu-Nation 3D',
    'Showroom d''armes en 3D avec Three.js. Navigation interactive, décomposition des modèles, et interface GTA-inspired.',
    '/images/ammu-nation.jpg',
    '#',
    'https://github.com/user/ammu-nation',
    1,
    2
),
(
    'Gestionnaire de Parcours',
    'Application web de gestion de parcours de formation avec Google Sheets, moteur de calcul et interface dynamique.',
    '/images/parcours.jpg',
    '#',
    'https://github.com/user/parcours',
    1,
    3
);

-- ============================================
-- 4. Liaison projets <-> technologies
-- ============================================
-- Portfolio Interactif (id=1) : React, PHP, MySQL, Three.js, API REST, CSS
INSERT INTO project_technologies (project_id, technology_id) VALUES
(1, 6), (1, 4), (1, 5), (1, 8), (1, 10), (1, 2);

-- Ammu-Nation 3D (id=2) : JavaScript, Three.js, HTML, CSS
INSERT INTO project_technologies (project_id, technology_id) VALUES
(2, 3), (2, 8), (2, 1), (2, 2);

-- Gestionnaire de Parcours (id=3) : JavaScript, HTML, CSS, API REST
INSERT INTO project_technologies (project_id, technology_id) VALUES
(3, 3), (3, 1), (3, 2), (3, 10);

-- ============================================
-- 5. Compétences
-- ============================================
INSERT INTO skills (name, category, level, icon, sort_order) VALUES
('HTML5',           'Frontend',     90, 'html5',        1),
('CSS3',            'Frontend',     85, 'css3',         2),
('JavaScript',      'Frontend',     80, 'javascript',   3),
('React',           'Frontend',     75, 'react',        4),
('Three.js',        'Frontend',     65, 'threejs',      5),
('PHP',             'Backend',      75, 'php',          6),
('MySQL',           'Backend',      70, 'mysql',        7),
('API REST',        'Backend',      75, 'api',          8),
('Git',             'DevOps',       80, 'git',          9),
('Responsive',      'Design',       85, 'responsive',   10);

-- ============================================
-- 6. Thème par défaut (Miles Morales)
-- ============================================
INSERT INTO themes (name, primary_color, secondary_color, bg_color, text_color, custom_css, is_active) VALUES
(
    'Miles Morales',
    '#FF1744', -- Neon Red
    '#E040FB', -- Purple
    '#0D0D0D', -- Dark Black
    '#FFFFFF',
    '/* Miles CSS */ .glitch { animation: glitch 1s infinite; }',
    1
),
(
    'Gwen Stacy',
    '#E040FB', -- Pink
    '#00E5FF', -- Cyan
    '#FFFFFF', -- White BG
    '#000000', -- Black Text
    '/* Gwen CSS */ body { background: #fff !important; color: #000 !important; }',
    0
),
(
    'Spider-Verse Glitch',
    '#00FF00', -- Green
    '#FF00FF', -- Magenta
    '#000000', -- Pitch Black
    '#FFFFFF',
    '/* Glitch CSS */ body { font-family: "Courier New", monospace; }',
    0
);

-- ============================================
-- 7. Préférences admin par défaut
-- ============================================
INSERT INTO user_preferences (user_id, theme_id, dark_mode) VALUES
(1, 1, 1);

-- ============================================
-- 8. Paramètres globaux
-- ============================================
INSERT INTO settings (setting_key, setting_value) VALUES
('site_title',      'Portfolio — Bastien'),
('site_subtitle',   'Développeur Web Full-Stack'),
('site_description','Portfolio de développement web — SAE601'),
('contact_email',   'contact@portfolio.com'),
('github_url',      'https://github.com/user'),
('linkedin_url',    'https://linkedin.com/in/user'),
('maintenance_mode','0');

-- ============================================
-- 9. Message de démo
-- ============================================
INSERT INTO messages (name, email, subject, content, is_read) VALUES
('Jean Dupont', 'jean.dupont@email.com', 'Super portfolio !', 'Bravo pour ton travail, le design est incroyable ! J''aimerais discuter d''une collaboration.', 0);
