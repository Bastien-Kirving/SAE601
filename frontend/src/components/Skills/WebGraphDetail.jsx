/**
 * WebGraphDetail.jsx — Skill detail overlay panel
 */

export function WebGraphDetail({ skill, hex, rgb, onClose }) {
  return (
    <div
      className="wg-detail-overlay"
      onClick={onClose}
    >
      <div
        className="wg-detail-card"
        style={{ '--th': hex, '--th-rgb': rgb }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="wg-detail-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>
        <div className="wg-detail-icon">{skill.icon}</div>
        <div className="wg-detail-name">{skill.name}</div>
        <div className="wg-detail-cat">{skill.category}</div>
        <div className="wg-detail-bar-track">
          <div
            className="wg-detail-bar-fill"
            style={{ width: `${skill.level}%` }}
          />
        </div>
        <div className="wg-detail-pct">{skill.level}%</div>
      </div>
    </div>
  );
}
