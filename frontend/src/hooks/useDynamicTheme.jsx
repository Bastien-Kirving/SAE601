import { useState, useEffect, useMemo } from 'react';

// Helper to expand hex colors to rgb values for CSS rgba() conversion
function hexToRgb(hex) {
    if (!hex) return '255, 255, 255';
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const bigint = parseInt(hex, 16);
    return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

// Helper to normalize DB names to frontend theme keys
function normalizeThemeName(dbName) {
    if (!dbName) return '';
    const lower = dbName.toLowerCase();
    if (lower.includes('miles')) return 'miles';
    if (lower.includes('gwen')) return 'gwen';
    if (lower.includes('glitch')) return 'glitch';
    return lower.replace(/\s+/g, '-');
}

export function useDynamicTheme(initialTheme = 'miles') {
    const [theme, setTheme] = useState(initialTheme);
    const [dbThemes, setDbThemes] = useState([]);

    // Fetch themes from DB to generate dynamic CSS overrides
    useEffect(() => {
        fetch('/api/themes')
            .then(res => res.json())
            .then(data => setDbThemes(data.themes || []))
            .catch(err => console.error("Erreur de chargement des thèmes:", err));
    }, []);

    // Active theme data object from the normalized array
    const activeThemeData = dbThemes.find(t => normalizeThemeName(t.name) === theme);

    // Stable function reference — only recreated when dbThemes changes (once after fetch).
    // Without useMemo, React sees a new component type every render and unmounts/remounts
    // the <style> element, triggering a full CSS recalculation each time.
    const ThemeStyles = useMemo(() => function ThemeStyles() {
        if (dbThemes.length === 0) return null;
        return (
            <style>
                {dbThemes.map(t => {
                    const slug = normalizeThemeName(t.name);
                    return `
                    .theme-${slug} {
                        --primary-color: ${t.primary_color};
                        --primary-color-rgb: ${hexToRgb(t.primary_color)};
                        --secondary-color: ${t.secondary_color};
                        --secondary-color-rgb: ${hexToRgb(t.secondary_color)};
                        --bg-color: ${t.bg_color};
                        --bg-color-rgb: ${hexToRgb(t.bg_color)};
                        --text-color: ${t.text_color};
                        --text-color-rgb: ${hexToRgb(t.text_color)};
                    }
                `}).join('')}
            </style>
        );
    }, [dbThemes]);

    return {
        theme,
        setTheme,
        activeThemeData,
        ThemeStyles
    };
}
