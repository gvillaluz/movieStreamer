import { useContext, useEffect, useRef } from "react";
import { FaExclamationTriangle, FaFilm, FaSearch } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import MovieCard from "./MovieCard";
import EmptyState from "./EmptyState";
import { SkeletonGrid } from "./Skeletons";
import { SearchContext } from "../context/searchContext";
import { usePagedContent } from "../hooks/usePagedContent";
import './MovieList.css';

const BATCH_SIZE = 50;
// Start the next batch this far before the viewer actually reaches the bottom
const PREFETCH_MARGIN = "0px 0px 600px 0px";

/** Popular movies or series (or in-place search results), loading 50 more each time the viewer nears the bottom. */
const MovieList = ({ type }) => {
    const { listSearch, clearListSearch } = useContext(SearchContext);
    const location = useLocation();
    const label = type === "movies" ? "Movies" : "TV Series";
    const query = listSearch.path === location.pathname ? listSearch.query : "";

    const { items, loading, loadingMore, error, hasMore, loadMore, reload } =
        usePagedContent({ type, query, batchSize: BATCH_SIZE });

    // Leaving the page drops its search, so coming back shows the popular list again
    useEffect(() => clearListSearch, [clearListSearch]);

    const sentinelRef = useRef(null);
    const canAutoLoad = hasMore && !error && !loading && !loadingMore && items.length > 0;

    // Recreated after every batch: a fresh observer reports straight away if the sentinel is still
    // in range (a tall screen), so the page keeps filling until it can scroll.
    useEffect(() => {
        const node = sentinelRef.current;
        if (!canAutoLoad || !node) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries.some((entry) => entry.isIntersecting)) loadMore(); },
            { rootMargin: PREFETCH_MARGIN }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [canAutoLoad, loadMore, items.length]);

    const heading = query ? `Search Results for '${query}'` : `Popular ${label}`;

    let body;
    if (loading) {
        body = <SkeletonGrid count={15} label={`Loading ${type}...`} />;
    } else if (error && !items.length) {
        body = (
            <EmptyState
                tone="error"
                icon={<FaExclamationTriangle />}
                title="Could not load titles"
                message={error}
                action={{ label: "Try again", onClick: loadMore }}
            />
        );
    } else if (!items.length) {
        body = query ? (
            <EmptyState
                icon={<FaSearch />}
                title="No results found"
                message={`Nothing matched '${query}'. Try a different title or spelling.`}
                action={{ label: "Clear search", onClick: clearListSearch }}
            />
        ) : (
            <EmptyState
                icon={<FaFilm />}
                title={`No ${label} to show`}
                message="Nothing is available right now. Please check back soon."
                action={{ label: "Reload", onClick: reload }}
            />
        );
    } else {
        body = (
            <>
                <div className="movie-list">
                    {items.map((content) => <MovieCard key={content.id} content={content} />)}
                </div>
                <div className="list-footer">
                    {loadingMore && <SkeletonGrid count={10} label={`Loading more ${type}...`} />}
                    {error && (
                        <div className="list-load-error" role="alert">
                            <span>Couldn't load more titles.</span>
                            <button type="button" className="list-retry" onClick={loadMore}>Try again</button>
                        </div>
                    )}
                    {!hasMore && items.length >= BATCH_SIZE && <p className="list-end">You've reached the end</p>}
                    {hasMore && !error && <div ref={sentinelRef} className="list-sentinel" aria-hidden="true" />}
                </div>
            </>
        );
    }

    return (
        <div className="main-content">
            <div className="list-heading">
                <h2>{loading && query ? "Searching..." : heading}</h2>
                {!loading && items.length > 0 && (
                    <span className="list-count">{items.length} titles</span>
                )}
            </div>
            {body}
        </div>
    )
}

export default MovieList;
