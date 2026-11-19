import { useContext, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import EmptyState from "../../components/EmptyState";
import { SearchContext } from "../../context/searchContext";
import MovieCard from "../../components/MovieCard";
import '../Favorites/FavoritesPage.css';
import PageBackButton from "../../components/PageBackButton";
import { FilterBar } from "../../components/FilterBar";
import { ALL_GENRES, NO_FILTERS, applyFilters, listSorts } from "../../utils/filters";

const FavoritesPage = () => {
    const { favorites } = useContext(SearchContext);
    const { go } = useAppNavigation();
    const [filters, setFilters] = useState(NO_FILTERS);
    const saved = favorites.filter((fav) => fav.poster_path);
    const items = applyFilters(saved, filters);

    return (
        <main className="page-content favorites-page">
            <div className="page-heading">
                <PageBackButton />
                <div>
                    <span className="eyebrow">Your collection</span>
                    <h1>Favorites</h1>
                </div>
                {saved.length > 0 && (
                    <FilterBar genres={ALL_GENRES} sorts={listSorts("Date added")} filters={filters} onChange={setFilters} />
                )}
            </div>
            {saved.length === 0 ? (
                <EmptyState
                    icon={<FaRegHeart />}
                    title="No favorites yet"
                    message="Open any movie or series and tap Add to favorites to save it here."
                    action={{ label: "Browse movies", onClick: () => go("/movie") }}
                />
            ) : items.length === 0 ? (
                <EmptyState
                    icon={<FaRegHeart />}
                    title="No favorites match"
                    message="None of your saved titles match these filters."
                    action={{ label: "Clear filters", onClick: () => setFilters(NO_FILTERS) }}
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
