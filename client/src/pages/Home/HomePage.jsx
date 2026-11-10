import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaFilm, FaPlay, FaSearch, FaExclamationTriangle } from "react-icons/fa";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import PageBackButton from "../../components/PageBackButton";
import MovieCard from "../../components/MovieCard";
import EmptyState from "../../components/EmptyState";
import ScrollRow from "../../components/ScrollRow";
import ContinueCard from "../../components/ContinueCard";
import { getContinueWatching, removeEntry } from "../../utils/watchHistory";
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

const HERO_SLIDES = 6;
const HERO_INTERVAL = 8000;
const heroImage = (item) => item.backdrop_path || item.poster_path;

const hasPoster = (content) => Boolean(content?.poster_path && (content.title || content.name));

const HomePage = () => {
    const { go, canGoBack } = useAppNavigation();
    const { contents, searchResults, isSearching } = useContext(SearchContext);
    const [feed, setFeed] = useState(null);
    const [error, setError] = useState("");
    const [heroIndex, setHeroIndex] = useState(0);
    const [heroPaused, setHeroPaused] = useState(false);
    // Titles the viewer started but didn't finish (kept in localStorage by the watch page)
    const [continueWatching, setContinueWatching] = useState(getContinueWatching);

    const removeFromContinue = (entry) => {
        removeEntry(entry.id, entry.category);
        setContinueWatching(getContinueWatching());
    };

    const heroSlides = useMemo(
        () => (feed?.trending || []).filter((item) => heroImage(item) && (item.title || item.name)).slice(0, HERO_SLIDES),
        [feed]
    );

    // Rotate the featured title on a timer (paused while hovered/focused or when the tab is hidden).
    // heroIndex is a dependency so a manual dot click restarts the countdown.
    useEffect(() => {
        if (heroSlides.length < 2 || heroPaused) return;
        const timer = setInterval(() => {
            if (!document.hidden) setHeroIndex((i) => (i + 1) % heroSlides.length);
        }, HERO_INTERVAL);
        return () => clearInterval(timer);
    }, [heroSlides.length, heroPaused, heroIndex]);

    const load = useCallback(() => {
        setError("");
        setFeed(null);
        setHeroIndex(0);
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
            <main className="page-content home-search-results">
                {/* Only when the search was started from another page (e.g. a title), so Back returns there */}
                {canGoBack && <PageBackButton />}
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

    const featured = heroSlides[heroIndex];
    const featuredTitle = featured?.title || featured?.name;
    const featuredType = featured?.media_type === "tv" ? "series" : "movie";

    const renderSection = ({ key, title, eyebrow, to }) => {
        const items = (feed[key] || []).filter(hasPoster).slice(0, 20);
        return (
            <section className="home-section" key={key}>
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">{eyebrow}</span>
                        <h2>{title}</h2>
                    </div>
                    <button className="text-button" onClick={() => go(to)}>
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
        <main className={`home-page${featured ? "" : " no-hero"}`}>
            {featured && (
                <div className="hero-backdrop" aria-hidden="true">
                    {heroSlides.map((slide, i) => (
                        <div
                            key={slide.id}
                            className={`hero-backdrop-slide${i === heroIndex ? " active" : ""}`}
                            style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w1280${heroImage(slide)})` }}
                        />
                    ))}
                </div>
            )}
            {featured && (
                <section
                    className="hero"
                    onMouseEnter={() => setHeroPaused(true)}
                    onMouseLeave={() => setHeroPaused(false)}
                    onFocus={() => setHeroPaused(true)}
                    onBlur={() => setHeroPaused(false)}
                >
                    <div className="hero-copy">
                        <div className="hero-slide" key={featured.id}>
                            <span className="eyebrow">Trending this week</span>
                            <h1>{featuredTitle}</h1>
                            <p>{featured.overview || "Find something unforgettable to watch tonight."}</p>
                            <div className="hero-actions">
                                <button
                                    className="primary-button"
                                    onClick={() => go(`/${featuredType}/${featured.id}/${featuredTitle.replaceAll(/\s+/g, "").toLowerCase()}`)}
                                >
                                    <FaPlay /> View details
                                </button>
                                <span className="rating-pill">★ {featured.vote_average?.toFixed(1) || "—"} rating</span>
                            </div>
                        </div>
                        {heroSlides.length > 1 && (
                            <div className="hero-dots" role="group" aria-label="Choose featured title">
                                {heroSlides.map((slide, i) => (
                                    <button
                                        key={slide.id}
                                        type="button"
                                        className={`hero-dot${i === heroIndex ? " active" : ""}`}
                                        aria-label={`Show ${slide.title || slide.name}`}
                                        aria-current={i === heroIndex}
                                        onClick={() => setHeroIndex(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}
            <div className="home-content">
                {continueWatching.length > 0 && (
                    <section className="home-section">
                        <div className="section-heading">
                            <div>
                                <span className="eyebrow">Pick up where you left off</span>
                                <h2>Continue watching</h2>
                            </div>
                        </div>
                        <ScrollRow label="Continue watching">
                            {continueWatching.map((entry) => (
                                <ContinueCard key={`${entry.category}-${entry.id}`} entry={entry} onRemove={removeFromContinue} />
                            ))}
                        </ScrollRow>
                    </section>
                )}
                {SECTIONS.map(renderSection)}
            </div>
        </main>
    );
};

export default HomePage;
