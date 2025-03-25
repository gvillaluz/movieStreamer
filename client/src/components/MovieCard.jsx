import { FaHeart } from 'react-icons/fa'
import './MovieCard.css'

const MovieCard = ({ content, type }) => {
    const imageUrl = `https://image.tmdb.org/t/p/w200${content.poster_path}`;
    const title = !content.title ? content.name : content.title;
    const date = !content.release_date ? content.first_air_date + " • Series" : content.release_date + " • Movie";
    return (
        <div className="movie-card">
            <img src={imageUrl} alt="Poster" id='poster' />
            <button type='button' className='likeBtn'>
                <FaHeart className='likeIcon' />
            </button>
            <div className="movie-details">
                <h4>{title}</h4>
                <span>{date}</span>
            </div>
        </div>
    )
}

export default MovieCard;