import "./LoadingState.css";

const LoadingState = ({ label = "Loading your titles..." }) => (
    <div className="loading-state" role="status" aria-live="polite">
        <div className="loading-orb">
            <span />
            <span />
            <span />
        </div>
        <p>{label}</p>
    </div>
);

export default LoadingState;
