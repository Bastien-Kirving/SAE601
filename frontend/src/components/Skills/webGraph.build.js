/**
 * webGraph.build.js — Theme config and graph construction
 */

export const THEME = {
  miles: { hex: '#FF1744', rgb: '255,23,68' },
  gwen: { hex: '#E040FB', rgb: '224,64,251' },
  glitch: { hex: '#00FF88', rgb: '0,255,136' },
};

/**
 * Builds nodes and edges from skill categories.
 * @param {Array} categories - Array of [categoryName, skills[]] pairs
 * @param {number} w - Container width
 * @param {number} h - Container height
 * @returns {{ nodes: Object, edges: Array }}
 */
export function buildGraph(categories, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const n = categories.length;
  const nodes = {};
  const edges = [];

  const catRing = Math.min(w * 0.33, h * 0.36, 210);

  categories.forEach(([cat, skills], i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const catId = `C:${cat}`;

    nodes[catId] = {
      id: catId,
      type: 'category',
      label: cat,
      x: cx + Math.cos(angle) * catRing,
      y: cy + Math.sin(angle) * catRing,
      homeX: cx + Math.cos(angle) * catRing,
      homeY: cy + Math.sin(angle) * catRing,
      vx: 0, vy: 0,
      r: 24,
      phase: Math.random() * Math.PI * 2,
    };

    const skillRing = Math.min(65 + skills.length * 4, 115);

    skills.forEach((skill, j) => {
      const sa = angle + (j / skills.length) * Math.PI * 2 + (i % 2 === 0 ? 0.4 : -0.4);
      const sid = `S:${skill.id ?? skill.name}`;

      nodes[sid] = {
        id: sid,
        type: 'skill',
        label: skill.name,
        icon: skill.icon,
        level: skill.level,
        catId,
        skill: { ...skill, category: cat },
        x: nodes[catId].x + Math.cos(sa) * skillRing,
        y: nodes[catId].y + Math.sin(sa) * skillRing,
        vx: 0, vy: 0,
        r: 11 + (skill.level / 100) * 7,
        phase: Math.random() * Math.PI * 2,
      };

      edges.push({
        id: `${catId}>${sid}`,
        source: catId,
        target: sid,
      });
    });
  });

  return { nodes, edges };
}
