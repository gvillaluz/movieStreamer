import { FaHeart } from 'react-icons/fa'
import './MovieCard.css'
import { useContext } from 'react';
import { SearchContext } from '../context/searchContext';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ content }) => {
    const { favorites, addToFavorites } = useContext(SearchContext);
    const navigate = useNavigate();
    const imageUrl = `https://image.tmdb.org/t/p/w200${content.poster_path}`;
    const title = !content.title ? content.name : content.title;
    const releaseDate = content.release_date || content.first_air_date;
    const date = `${releaseDate ? releaseDate.split("-")[0] : "TBA"} • ${content.media_type === "tv" || content.name ? "Series" : "Movie"}`;
    const isFavorite = favorites.some(fav => fav.id === content.id);
    const type = content.media_type === "tv" || content.name ? "series" : "movie";

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
            <button 
                type='button' 
                className='likeBtn'
                aria-label={isFavorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
                aria-pressed={isFavorite}
                onClick={(e) => {
                    e.stopPropagation();
                    addToFavorites(content);
                }}
            >
                <FaHeart className='likeIcon' fill={isFavorite ? "rgba(255, 0, 0, 0.648)" : "white"} />
            </button>
            <div className="movie-details">
                <h4>{title}</h4>
                <span>{date} {content.vote_average ? `• ${content.vote_average.toFixed(1)}` : ""}</span>
            </div>
        </div>
    )
}

export default MovieCard;