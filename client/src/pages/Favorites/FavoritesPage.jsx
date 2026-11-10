import { useContext } from "react";
import { FaRegHeart } from "react-icons/fa";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import EmptyState from "../../components/EmptyState";
import { SearchContext } from "../../context/searchContext";
import MovieCard from "../../components/MovieCard";
import '../Favorites/FavoritesPage.css';
import PageBackButton from "../../components/PageBackButton";

const FavoritesPage = () => {
    const { favorites } = useContext(SearchContext);
    const { go } = useAppNavigation();
    const items = favorites.filter((fav) => fav.poster_path);

    return (
        <main className="page-content favorites-page">
            <div className="page-heading">
                <PageBackButton />
                <div>
                    <span className="eyebrow">Your collection</span>
                    <h1>Favorites</h1>
                </div>
            </div>
            {items.length === 0 ? (
                <EmptyState
                    icon={<FaRegHeart />}
                    title="No favorites yet"
                    message="Open any movie or series and tap Add to favorites to save it here."
                    action={{ label: "Browse movies", onClick: () => go("/movie") }}
                />
            ) : (
                <div className="movie-list">
                    {items.map((fav, index) => <MovieCard key={fav.id + '-' + index} content={fav} />)}
                </div>
            )}
        </main>
    );
}

export default FavoritesPage;
