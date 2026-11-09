import "./EmptyState.css";

/**
 * Friendly placeholder for empty lists and failed loads.
 * `tone="error"` announces assertively; `compact` is for inline use inside a section.
 */
const EmptyState = ({ icon, title, message, action, tone = "default", compact = false }) => (
    <div
        className={`empty-state${compact ? " compact" : ""}${tone === "error" ? " error" : ""}`}
        role={tone === "error" ? "alert" : "status"}
    >
        {icon && <span className="empty-state-icon" aria-hidden="true">{icon}</span>}
        <h2>{title}</h2>
        {message && <p>{message}</p>}
        {action && (
            <button type="button" className="primary-button empty-state-action" onClick={action.onClick}>
                {action.label}
            </button>
        )}
    </div>
);

export default EmptyState;
