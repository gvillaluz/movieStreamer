import { useContext, useState } from "react";
import EmptyList from "../components/EmptyList";
import { SearchContext } from "../context/searchContext";
import MovieCard from "../components/MovieCard";

const FavoritesPage = () => {
    const { favorites } = useContext(SearchContext);

    return (
        (
            favorites.length === 0 ? (
                <EmptyList page={"Favorite Movies or Series"} message={"Browse movies or series, add them to your favorites."} />
            ) : (
                <div className="movie-list">
                    {favorites.map((fav, index) => (
                        fav.poster_path && <MovieCard key={fav.id + '-' + index} content={fav} />
                     ))}
                </div>
            )
        )
        

        
    )
}

export default FavoritesPage;