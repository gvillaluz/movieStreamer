import { FaPlay, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./MovieCard.css";
import "./ContinueCard.css";

const timeLeft = (entry) => {
    const minutes = Math.max(1, Math.round((entry.duration - entry.time) / 60));
    if (minutes < 60) return `${minutes}m left`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m left`;
};

/** A poster card for a title that was started but not finished: progress bar, resume on click. */
const ContinueCard = ({ entry, onRemove }) => {
    const navigate = useNavigate();
    const isSeries = entry.category === "tv";
    const percent = Math.min(100, Math.round((entry.time / entry.duration) * 100));
    const subtitle = isSeries ? `S${entry.season} · E${entry.episode}` : "Movie";

    const resume = () => {
        // The watch page restores the season/episode of a series from this key
        if (isSeries) {
            try {
                localStorage.setItem(`progress_${entry.id}`, JSON.stringify({ season: entry.season, episode: entry.episode }));
            } catch { /* ignore */ }
        }
        navigate(`/watch/${entry.category}/${entry.id}`);
        window.scrollTo({ top: 0 });
    };

    return (
        <div
            className="movie-card continue-card"
            role="link"
            tabIndex="0"
            aria-label={`Continue watching ${entry.title}, ${subtitle}, ${percent}% watched`}
            onClick={resume}
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    resume();
                }
            }}
        >
            <div className="continue-poster">
                {entry.poster_path
                    ? <img src={`https://image.tmdb.org/t/p/w200${entry.poster_path}`} alt="" id="poster" loading="lazy" />
                    : <div className="continue-no-poster" aria-hidden="true" />}
                <span className="continue-play" aria-hidden="true"><FaPlay /></span>
                <div className="continue-bar" role="presentation">
                    <span style={{ width: `${percent}%` }} />
                </div>
            </div>
            <button
                type="button"
                className="continue-remove"
                aria-label={`Remove ${entry.title} from continue watching`}
                onClick={(event) => { event.stopPropagation(); onRemove(entry); }}
            >
                <FaTimes aria-hidden="true" />
            </button>
            <div className="movie-details">
                <h4>{entry.title}</h4>
                <div className="movie-meta">
                    <span>{subtitle}</span>
                    <span>{timeLeft(entry)}</span>
                </div>
            </div>
        </div>
    );
};

export default ContinueCard;
