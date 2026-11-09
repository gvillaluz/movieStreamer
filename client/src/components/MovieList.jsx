import { useCallback, useContext, useEffect, useState } from "react";
import { FaExclamationTriangle, FaFilm, FaSearch } from "react-icons/fa";
import MovieCard from "./MovieCard";
import EmptyState from "./EmptyState";
import { SkeletonGrid } from "./Skeletons";
import './MovieList.css';
import { SearchContext } from "../context/searchContext";
import { useLocation } from "react-router-dom";

const MovieList = (props) => {
    const { contents, response, searchResults, setSearchResults, isSearching, error} =  useContext(SearchContext);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState("");
    const location = useLocation();
    
    const retry = useCallback(async () => {
        setLoading(true);
        try {
            await response(props.type);
        } finally {
            setLoading(false);
        }
    }, [props.type]);

    useEffect(() => { retry(); }, [retry]);

    useEffect(() => {
        setSearchResults("");
        setType(props.type === "movies" ? "Movies" : "TV Series");
    }, [location.pathname, props.type]);

    const uniqueContents = Array.from(
        new Map(contents.map((content) => [content.id, content])).values()
    ).filter(con => 
        con.poster_path &&
        (con.release_date || con.first_air_date) && 
        (con.title || con.name)
    );

    const heading = searchResults ? `Search Results for '${searchResults}'` : `Popular ${type}`;
    const busy = loading || isSearching;

    return (
        <div className="main-content">
            <div className="list-heading">
                <h2>{isSearching ? "Searching..." : heading}</h2>
                {!busy && !error && uniqueContents.length > 0 && (
                    <span className="list-count">{uniqueContents.length} titles</span>
                )}
            </div>
            {busy ? (
                <SkeletonGrid count={15} label={`Loading ${props.type}...`} />
            ) : error ? (
                <EmptyState
                    tone="error"
                    icon={<FaExclamationTriangle />}
                    title="Could not load titles"
                    message={error}
                    action={{ label: "Try again", onClick: retry }}
                />
            ) : uniqueContents.length ? (
                <div className="movie-list">
                    {uniqueContents.map((content, index) => <MovieCard key={content.id + '-' + index} content={content} type={props.type} />)}
                </div>
            ) : searchResults ? (
                <EmptyState
                    icon={<FaSearch />}
                    title="No results found"
                    message={`Nothing matched '${searchResults}'. Try a different title or spelling.`}
                    action={{ label: "Clear search", onClick: () => { setSearchResults(""); retry(); } }}
                />
            ) : (
                <EmptyState
                    icon={<FaFilm />}
                    title={`No ${type} to show`}
                    message="Nothing is available right now. Please check back soon."
                    action={{ label: "Reload", onClick: retry }}
                />
            )}
        </div>
    )
}

export default MovieList;