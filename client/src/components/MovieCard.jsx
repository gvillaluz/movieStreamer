import './MovieCard.css'
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ content }) => {
    const navigate = useNavigate();
    const imageUrl = `https://image.tmdb.org/t/p/w200${content.poster_path}`;
    const title = !content.title ? content.name : content.title;
    const releaseDate = content.release_date || content.first_air_date;
    const year = releaseDate ? releaseDate.split("-")[0] : "TBA";
    const type = content.media_type === "tv" || content.name ? "series" : "movie";
    const typeLabel = type === "series" ? "Series" : "Movie";
    const rating = content.vote_average ? content.vote_average.toFixed(1) : null;

    return (
        <div 
            className="movie-card" 
            role="link"
            tabIndex="0"
            onClick={() => {
                    navigate(`/${type}/${content.id}/${title.replaceAll(/\s+/g, "").toLowerCase()}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            }
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/${type}/${content.id}/${title.replaceAll(/\s+/g, "").toLowerCase()}`);
                }
            }}
        >
            <img src={imageUrl} alt={`${title} poster`} id='poster' loading="lazy" />
            <span className="type-badge" aria-hidden="true">{typeLabel}</span>
            <div className="movie-details">
                <h4>{title}</h4>
                <div className="movie-meta">
                    <span className="meta-year">{year}</span>
                    <span className="meta-type">{typeLabel}</span>
                    {rating && <span className="meta-rating"><span aria-hidden="true">★</span> {rating}</span>}
                </div>
            </div>
        </div>
    )
}

export default MovieCard;