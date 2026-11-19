import { useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaExclamationTriangle } from "react-icons/fa";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import PageBackButton from "../../components/PageBackButton";
import MovieCard from "../../components/MovieCard";
import EmptyState from "../../components/EmptyState";
import { SkeletonGrid } from "../../components/Skeletons";
import { search } from "../../services/serviceAPI";
import { SearchContext } from "../../context/searchContext";
import { FilterBar } from "../../components/FilterBar";
import { ALL_GENRES, NO_FILTERS, applyFilters, listSorts } from "../../utils/filters";
import "../Home/HomePage.css";
import "./SearchPage.css";

const hasPoster = (content) => Boolean(content?.poster_path && (content.title || content.name));

/** Search results across movies and series. The query lives in the URL (?q=), so results survive a refresh and Back. */
const SearchPage = () => {
    const [params] = useSearchParams();
    const query = (params.get("q") || "").trim();
    const { canGoBack } = useAppNavigation();
    const { setSearchQuery } = useContext(SearchContext);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(Boolean(query));
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const [filters, setFilters] = useState(NO_FILTERS);

    // Keep the search field in step with the page (e.g. after a refresh or Back to an earlier search)
    useEffect(() => { setSearchQuery(query); }, [query, setSearchQuery]);

    useEffect(() => {
        if (!query) {
            setResults([]);
            setLoading(false);
            return;
        }
        let ignore = false; // drop responses for a query the viewer has already moved past
        setLoading(true);
        setError("");
        search(query, "/search")
            .then((data) => { if (!ignore) setResults(data); })
            .catch((err) => { if (!ignore) { setError(err.message); setResults([]); } })
            .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [query, attempt]);

    const retry = useCallback(() => setAttempt((n) => n + 1), []);

    const found = Array.from(new Map(results.map((content) => [content.id, content])).values()).filter(hasPoster);
    const items = applyFilters(found, filters);

    const heading = !query
        ? "Search the library"
        : loading
            ? "Finding your next watch..."
            : `Results for "${query}"`;

    return (
        <main className="page-content search-page">
            {canGoBack && <PageBackButton />}
            <div className="section-heading">
                <div>
                    <span className="eyebrow">Search library</span>
                    <h1>{heading}</h1>
                </div>
                {query && !loading && !error && found.length > 0 && (
                    <FilterBar genres={ALL_GENRES} sorts={listSorts("Best match")} filters={filters} onChange={setFilters} />
                )}
            </div>
            {!query ? (
                <EmptyState
                    icon={<FaSearch />}
                    title="What do you want to watch?"
                    message="Type a title, actor, or series in the search bar above."
                />
            ) : loading ? (
                <SkeletonGrid count={12} label="Searching the library..." />
            ) : error ? (
                <EmptyState
                    tone="error"
                    icon={<FaExclamationTriangle />}
                    title="Search is taking a moment"
                    message={error}
                    action={{ label: "Try again", onClick: retry }}
                />
            ) : items.length ? (
                <div className="movie-list">
                    {items.map((content) => <MovieCard key={content.id} content={content} />)}
                </div>
            ) : (
                <EmptyState
                    icon={<FaSearch />}
                    title="No titles found"
                    message={found.length ? "No results match these filters." : "Try a different title, actor, or series."}
                    action={found.length ? { label: "Clear filters", onClick: () => setFilters(NO_FILTERS) } : undefined}
                />
            )}
        </main>
    );
};

export default SearchPage;
