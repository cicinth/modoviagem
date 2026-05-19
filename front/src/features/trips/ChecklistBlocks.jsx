import { normalizeChecklist } from "./tripModel.js";

export function ListBlock({ title, items }) {
  return (
    <article className="info-block">
      <h3>{title}</h3>
      {items?.length ? (
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : (
        <p>Nada cadastrado ainda.</p>
      )}
    </article>
  );
}

export function ChecklistBlock({ title, items, onToggle, onOpenAll, limit = 5 }) {
  const normalizedItems = normalizeChecklist(items);
  const visibleItems = normalizedItems.slice(0, limit);
  const hiddenCount = Math.max(normalizedItems.length - visibleItems.length, 0);

  return (
    <article className="info-block">
      <h3>{title}</h3>
      {visibleItems.length ? (
        <div className="checklist-items">
          {visibleItems.map((item, index) => (
            <label className={item.done ? "check-item done" : "check-item"} key={`${item.text}-${index}`}>
              <input type="checkbox" checked={item.done} onChange={() => onToggle(index)} />
              <span>{item.text}</span>
            </label>
          ))}
        </div>
      ) : (
        <p>Nada cadastrado ainda.</p>
      )}
      {hiddenCount > 0 ? (
        <button className="more-button" type="button" onClick={onOpenAll}>
          ... ver mais {hiddenCount}
        </button>
      ) : null}
    </article>
  );
}

export function ChecklistModal({ title, items, onToggle, onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <article className="modal-card">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="back-button" type="button" onClick={onClose}>Fechar</button>
        </div>
        <div className="checklist-items modal-list">
          {normalizeChecklist(items).map((item, index) => (
            <label className={item.done ? "check-item done" : "check-item"} key={`${item.text}-${index}`}>
              <input type="checkbox" checked={item.done} onChange={() => onToggle(index)} />
              <span>{item.text}</span>
            </label>
          ))}
        </div>
      </article>
    </div>
  );
}
