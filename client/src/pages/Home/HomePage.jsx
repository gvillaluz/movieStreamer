import { useCallback, useContext, useEffect, useState } from "react";
import { FaArrowRight, FaFilm, FaPlay, FaSearch, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import MovieCard from "../../components/MovieCard";
import EmptyState from "../../components/EmptyState";
import ScrollRow from "../../components/ScrollRow";
import { HomeSkeleton, SkeletonGrid } from "../../components/Skeletons";
import { loadHomeContent } from "../../services/serviceAPI";
import { SearchContext } from "../../context/searchContext";
import "./HomePage.css";

const SECTIONS = [
    { key: "trending", title: "Trending now", eyebrow: "Your next favorite", to: "/movie" },
    { key: "newMovies", title: "New movies", eyebrow: "Fresh from theaters", to: "/movie" },
    { key: "newSeries", title: "New TV series", eyebrow: "Now on the air", to: "/series" },
    { key: "popularMovies", title: "Popular movies", eyebrow: "Most watched", to: "/movie" },
    { key: "popularSeries", title: "Popular series", eyebrow: "Binge-worthy", to: "/series" },
];

const hasPoster = (content) => Boolean(content?.poster_path && (content.title || content.name));

const HomePage = () => {
    const navigate = useNavigate();
    const { contents, searchResults, isSearching } = useContext(SearchContext);
    const [feed, setFeed] = useState(null);
    const [error, setError] = useState("");

    const load = useCallback(() => {
        setError("");
        setFeed(null);
        loadHomeContent()
            .then(setFeed)
            .catch((err) => setError(err.message || "Please check your connection and try again."));
    }, []);

    useEffect(() => { load(); }, [load]);

    if (error) {
        return (
            <EmptyState
                tone="error"
                icon={<FaExclamationTriangle />}
                title="Home is taking a moment"
                message={error}
                action={{ label: "Try again", onClick: load }}
            />
        );
    }

    if (!feed) {
        return <HomeSkeleton label="Curating your watchlist..." />;
    }

    if (searchResults || isSearching) {
        const searchItems = Array.from(new Map(contents.map((content) => [content.id, content])).values()).filter(hasPoster);
        return (
            <main className="main-content home-search-results">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">Search library</span>
                        <h1>{isSearching ? "Finding your next watch..." : `Results for "${searchResults}"`}</h1>
                    </div>
                </div>
                {isSearching ? (
                    <SkeletonGrid count={12} label="Searching the library..." />
                ) : searchItems.length ? (
                    <div className="movie-list">
                        {searchItems.map((content) => <MovieCard key={content.id} content={content} />)}
                    </div>
                ) : (
                    <EmptyState
                        icon={<FaSearch />}
                        title="No titles found"
                        message="Try a different title, actor, or series."
                    />
                )}
            </main>
        );
    }

    const featured = feed.trending?.find((item) => item.backdrop_path || item.poster_path);
    const featuredTitle = featured?.title || featured?.name;
    const featuredType = featured?.media_type === "tv" ? "series" : "movie";
    const featuredBackdrop = featured?.backdrop_path || featured?.poster_path;

    const renderSection = ({ key, title, eyebrow, to }) => {
        const items = (feed[key] || []).filter(hasPoster).slice(0, 20);
        return (
            <section className="home-section" key={key}>
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">{eyebrow}</span>
                        <h2>{title}</h2>
                    </div>
                    <button className="text-button" onClick={() => navigate(to)}>
                        Explore <FaArrowRight />
                    </button>
                </div>
                {items.length ? (
                    <ScrollRow label={title}>
                        {items.map((content) => <MovieCard key={`${content.id}-${content.media_type || key}`} content={content} />)}
                    </ScrollRow>
                ) : (
                    <EmptyState
                        compact
                        icon={<FaFilm />}
                        title={`Nothing in ${title.toLowerCase()} yet`}
                        message="Check back soon, new titles land all the time."
                    />
                )}
            </section>
        );
    };

    return (
        <main
            className={`home-page${featured ? "" : " no-hero"}`}
            style={featured ? { "--hero-image": `url(https://image.tmdb.org/t/p/original${featuredBackdrop})` } : undefined}
        >
            {featured && (
                <section className="hero">
                    <div className="hero-copy">
                        <span className="eyebrow">Trending this week</span>
                        <h1>{featuredTitle}</h1>
                        <p>{featured.overview || "Find something unforgettable to watch tonight."}</p>
                        <div className="hero-actions">
                            <button
                                className="primary-button"
                                onClick={() => navigate(`/${featuredType}/${featured.id}/${featuredTitle.replaceAll(/\s+/g, "").toLowerCase()}`)}
                            >
                                <FaPlay /> View details
                            </button>
                            <span className="rating-pill">★ {featured.vote_average?.toFixed(1) || "—"} rating</span>
                        </div>
                    </div>
                </section>
            )}
            <div className="home-content">
                {SECTIONS.map(renderSection)}
            </div>
        </main>
    );
};

export default HomePage;
