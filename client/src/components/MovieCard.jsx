import { FaHeart } from 'react-icons/fa'
import './MovieCard.css'
import { useContext } from 'react';
import { SearchContext } from '../context/searchContext';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ content, type }) => {
    const { favorites, addToFavorites, setDescriptionContentId } = useContext(SearchContext);
    const navigate = useNavigate();
    const imageUrl = `https://image.tmdb.org/t/p/w200${content.poster_path}`;
    const title = !content.title ? content.name : content.title;
    const date = !content.release_date ? content.first_air_date + " • Series" : content.release_date + " • Movie";
    const isFavorite = favorites.some(fav => fav.id === content.id);

    return (
        <div 
            className="movie-card" 
            onClick={() => {
                    console.log("Id from MovieCard " + content.id)
                    navigate(`/${type.toLowerCase()}/${content.id}/${title.replaceAll(/\s+/g, "").toLowerCase()}`);
                    setDescriptionContentId(content.id);
                }
            }
        >
            <img src={imageUrl} alt="Poster" id='poster' />
            <button 
                type='button' 
                className='likeBtn'
                onClick={() => addToFavorites(content)}
            >
                <FaHeart className='likeIcon' fill={isFavorite ? "rgba(255, 0, 0, 0.648)" : "white"} />
            </button>
            <div className="movie-details">
                <h4>{title}</h4>
                <span>{date}</span>
                <span>{content.runtime}</span>
            </div>
        </div>
    )
}

export default MovieCard;