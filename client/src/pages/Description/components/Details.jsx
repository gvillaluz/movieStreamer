import { useContext } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { SearchContext } from "../../../context/searchContext";

const Details = ({content, category, handleWatchNow}) =>  {
    const { favorites, addToFavorites } = useContext(SearchContext);
    const isFavorite = favorites.some(fav => fav.id === content.id);
    const name = content.title ? content.title : content.name;

    // Keep only what a card needs, so the saved list stays small
    const toggleFavorite = () => addToFavorites({
        id: content.id,
        title: content.title,
        name: content.name,
        poster_path: content.poster_path,
        vote_average: content.vote_average,
        release_date: content.release_date,
        first_air_date: content.first_air_date,
        media_type: category,
    });

    // Series remember the last episode picked on the watch page (see WatchPage.jsx)
    let progress = null;
    if (category === "tv") {
        try {
            const saved = JSON.parse(localStorage.getItem(`progress_${content.id}`));
            if (saved?.season && saved?.episode) progress = saved;
        } catch { /* ignore unreadable progress */ }
    }

    const imageUrl = `https://image.tmdb.org/t/p/${window.innerWidth < 768 ? 'w342' : 'w500'}${content.poster_path}`;
    
    return (
        <>
            <div className="description-section">
                <h2 className="title mobile">{content.title ? content.title : content.name}</h2>
                <img src={imageUrl} alt="Content" />
                <div className="text-container">
                    <h2 className="title desktop">{content.title ? content.title : content.name}</h2>
                    {content.tagline && <p><strong>Tag Line:  </strong>{content.tagline}</p>}
                    <p><strong>{content.release_date ? "Release Date: " : "First Air Date: "}</strong>{content.release_date ? content.release_date : content.first_air_date}</p>
                    {!content.seasons ? (
                        <p><strong>Run Time: </strong> {content.runtime} minutes</p>
                    ) : (
                        <p>
                            <strong>Seasons: </strong> {content.seasons.length} <br></br>
                            <strong>Episodes: </strong>{content.number_of_episodes}
                        </p>
                    )}
                    <p><strong>Genres: </strong> {content.genres?.map(gen => gen.name).join(", ")}</p>
                    <p><strong>Language: </strong> {content.spoken_languages?.map(lang => lang.english_name).join(", ")}</p>
                    <p className="overview"><strong>Overview: </strong> </p>
                    <p className="overview-text">{content.overview}</p>
                    <p> ⭐ {content.vote_average} ({content.vote_count} votes)</p>
                    <div className="detail-actions">
                        <button
                            className="watch-btn"
                            onClick={handleWatchNow}
                        >
                            {progress ? `▶ Continue S${progress.season} E${progress.episode}` : "▶ Watch now"}
                        </button>
                        <button
                            type="button"
                            className={`fav-btn${isFavorite ? " active" : ""}`}
                            onClick={toggleFavorite}
                            aria-pressed={isFavorite}
                            aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
                        >
                            {isFavorite ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
                            {isFavorite ? "In favorites" : "Add to favorites"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Details;