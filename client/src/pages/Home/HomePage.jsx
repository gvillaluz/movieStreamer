import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaFilm, FaPlay, FaExclamationTriangle } from "react-icons/fa";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import MovieCard from "../../components/MovieCard";
import EmptyState from "../../components/EmptyState";
import ScrollRow from "../../components/ScrollRow";
import ContinueCard from "../../components/ContinueCard";
import RecommendationRow from "./components/RecommendationRow";
import { getContinueWatching, getRecentlyWatched, removeEntry } from "../../utils/watchHistory";
import { HomeSkeleton } from "../../components/Skeletons";
import { loadHomeContent } from "../../services/serviceAPI";
import { SearchContext } from "../../context/searchContext";
import "./HomePage.css";

/*
 * Row order. `personal: n` is a slot for the viewer's nth recommendation row ("Since you watched",
 * "More like" a favorite); slots with no history behind them are skipped. `to` adds an Explore link
 * only where a list page really shows more of the same.
 */
const SECTIONS = [
    { personal: 0 },
    { key: "trending", title: "Trending now", eyebrow: "Your next favorite", to: "/movie" },
    { key: "newMovies", title: "New movies", eyebrow: "Fresh from theaters", to: "/movie" },
    { key: "kdramas", title: "Korean dramas", eyebrow: "K-drama picks" },
    { personal: 1 },
    { key: "newSeries", title: "New TV series", eyebrow: "Now on the air", to: "/series" },
    { key: "popularMovies", title: "Popular movies", eyebrow: "Most watched", to: "/movie" },
    { key: "anime", title: "Anime", eyebrow: "Straight from Japan" },
    { personal: 2 },
    { key: "topRatedMovies", title: "Top rated movies", eyebrow: "All-time greats" },
    { key: "popularSeries", title: "Popular series", eyebrow: "Binge-worthy", to: "/series" },
    { key: "actionMovies", title: "Action & adventure", eyebrow: "Edge of your seat" },
    { key: "comedyMovies", title: "Comedy", eyebrow: "Feel-good laughs" },
    { key: "horrorMovies", title: "Horror", eyebrow: "Lights off" },
    { key: "comingSoon", title: "Coming soon", eyebrow: "Mark your calendar" },
];

const MAX_WATCHED_ROWS = 2;

/** Titles to base recommendation rows on: the latest things watched, then the newest favorite not already used. */
const getPersonalSeeds = (favorites) => {
    const seeds = getRecentlyWatched()
        .slice(0, MAX_WATCHED_ROWS)
        .map(({ id, category, title }) => ({ id, category, title, reason: "watched" }));

    const favorite = [...favorites].reverse().find((fav) => !seeds.some((seed) => String(seed.id) === String(fav.id)));
    if (favorite && (favorite.title || favorite.name)) {
        seeds.push({
            id: favorite.id,
            // Older favorites were saved without media_type; series have `name`, movies `title`
            category: favorite.media_type || (favorite.name && !favorite.title ? "tv" : "movie"),
            title: favorite.title || favorite.name,
            reason: "favorite",
        });
    }
    return seeds;
};

const HERO_SLIDES = 6;
const HERO_INTERVAL = 8000;
const heroImage = (item) => item.backdrop_path || item.poster_path;

const hasPoster = (content) => Boolean(content?.poster_path && (content.title || content.name));

const HomePage = () => {
    const { go } = useAppNavigation();
    const { favorites } = useContext(SearchContext);
    const [feed, setFeed] = useState(null);
    const [error, setError] = useState("");
    const [heroIndex, setHeroIndex] = useState(0);
    const [heroPaused, setHeroPaused] = useState(false);
    // Titles the viewer started but didn't finish (kept in localStorage by the watch page)
    const [continueWatching, setContinueWatching] = useState(getContinueWatching);

    // Picked once per visit, so rows don't reshuffle when a favorite is toggled elsewhere
    const [personalSeeds] = useState(() => getPersonalSeeds(favorites));

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

    const featured = heroSlides[heroIndex];
    const featuredTitle = featured?.title || featured?.name;
    const featuredType = featured?.media_type === "tv" ? "series" : "movie";

    const renderSection = ({ personal, key, title, eyebrow, to }) => {
        if (personal !== undefined) {
            const seed = personalSeeds[personal];
            return seed ? <RecommendationRow key={`${seed.category}-${seed.id}`} seed={seed} /> : null;
        }
        const items = (feed[key] || []).filter(hasPoster).slice(0, 20);
        return (
            <section className="home-section" key={key}>
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">{eyebrow}</span>
                        <h2>{title}</h2>
                    </div>
                    {to && (
                        <button className="text-button" onClick={() => go(to)}>
                            Explore <FaArrowRight />
                        </button>
                    )}
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
