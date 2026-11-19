import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import ContentRow from "../../components/ContentRow";
import EmptyState from "../../components/EmptyState";
import MovieList from "../../components/MovieList";
import PageBackButton from "../../components/PageBackButton";
import { RowsSkeleton } from "../../components/Skeletons";
import { SearchContext } from "../../context/searchContext";
import { loadBrowseContent } from "../../services/serviceAPI";
import { FilterBar } from "../../components/FilterBar";
import { BROWSE_SORTS, MOVIE_GENRES, NO_FILTERS, TV_GENRES } from "../../utils/filters";
import "./BrowsePage.css";

// Row order. Each key matches a row in serviceAPI's movieRows / seriesRows.
const MOVIE_SECTIONS = [
    { key: "top10", title: "Top 10 movies this week", eyebrow: "Most watched right now", ranked: true },
    { key: "nowPlaying", title: "In theaters", eyebrow: "Fresh from theaters" },
    { key: "topRated", title: "Top rated", eyebrow: "All-time greats" },
    { key: "comingSoon", title: "Coming soon", eyebrow: "Mark your calendar", upcoming: true },
    { key: "action", title: "Action", eyebrow: "Edge of your seat" },
    { key: "comedy", title: "Comedy", eyebrow: "Feel-good laughs" },
    { key: "scifi", title: "Science fiction", eyebrow: "Other worlds" },
    { key: "horror", title: "Horror", eyebrow: "Lights off" },
    { key: "drama", title: "Drama", eyebrow: "Stories that stay" },
    { key: "thriller", title: "Thriller", eyebrow: "Hold your breath" },
    { key: "romance", title: "Romance", eyebrow: "Date night" },
    { key: "animation", title: "Animation", eyebrow: "Drawn to life" },
    { key: "family", title: "Family", eyebrow: "For all ages" },
    { key: "crime", title: "Crime", eyebrow: "On the case" },
    { key: "documentary", title: "Documentary", eyebrow: "True stories" },
];

const SERIES_SECTIONS = [
    { key: "top10", title: "Top 10 series this week", eyebrow: "Most watched right now", ranked: true },
    { key: "onTheAir", title: "New episodes", eyebrow: "Now on the air" },
    { key: "topRated", title: "Top rated", eyebrow: "All-time greats" },
    { key: "kdramas", title: "Korean dramas", eyebrow: "K-drama picks" },
    { key: "anime", title: "Anime", eyebrow: "Straight from Japan" },
    { key: "drama", title: "Drama", eyebrow: "Stories that stay" },
    { key: "comedy", title: "Comedy", eyebrow: "Feel-good laughs" },
    { key: "crime", title: "Crime", eyebrow: "On the case" },
    { key: "scifiFantasy", title: "Sci-fi & fantasy", eyebrow: "Other worlds" },
    { key: "actionAdventure", title: "Action & adventure", eyebrow: "Edge of your seat" },
    { key: "mystery", title: "Mystery", eyebrow: "Whodunit" },
    { key: "animation", title: "Animation", eyebrow: "Drawn to life" },
    { key: "documentary", title: "Documentary", eyebrow: "True stories" },
    { key: "family", title: "Family", eyebrow: "For all ages" },
];

/**
 * Movies or TV Series (`type` is "movies" or "series"): grouped rows like Home, then the full list below.
 * A search or a filter hides the rows, and the list below shows the results instead.
 */
const BrowsePage = ({ type, title }) => {
    const { listSearch } = useContext(SearchContext);
    const location = useLocation();
    const searching = listSearch.path === location.pathname && listSearch.query !== "";
    const sections = type === "series" ? SERIES_SECTIONS : MOVIE_SECTIONS;
    const [filters, setFilters] = useState(NO_FILTERS);
    const filtering = filters.genre !== "" || filters.sort !== "";

    const [feed, setFeed] = useState(null);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        setFeed(null);
        setError("");
        loadBrowseContent(type)
            .then(setFeed)
            .catch((err) => setError(err.message));
    }, [type, attempt]);

    let rows;
    if (error) {
        rows = (
            <EmptyState
                compact
                tone="error"
                icon={<FaExclamationTriangle />}
                title="Could not load these rows"
                message={error}
                action={{ label: "Try again", onClick: () => setAttempt((n) => n + 1) }}
            />
        );
    } else if (!feed) {
        rows = <RowsSkeleton count={2} label={`Loading ${type}...`} />;
    } else {
        rows = sections.map(({ key, ...section }) => <ContentRow key={key} {...section} items={feed[key]} />);
    }

    return (
        <main className="page-content browse-page">
            <div className="page-heading">
                <PageBackButton />
                <h1>{title}</h1>
                <FilterBar
                    genres={type === "series" ? TV_GENRES : MOVIE_GENRES}
                    sorts={BROWSE_SORTS}
                    filters={filters}
                    onChange={setFilters}
                />
            </div>
            {!searching && !filtering && <div className="browse-rows">{rows}</div>}
            <MovieList type={type} filters={filters} />
        </main>
    );
};

export default BrowsePage;
