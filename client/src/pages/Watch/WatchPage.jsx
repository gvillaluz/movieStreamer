import { useParams, useNavigate } from 'react-router-dom';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import './WatchPage.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getEpisodesBySeason, getVideoById } from '../../services/serviceAPI';
import { convertRuntime } from '../../utils/DurationUtils';
import { getEntry, parsePlayerMessage, recordProgress } from '../../utils/watchHistory';
import WatchPageRelated from './components/WatchPageRelated';
import { FaExclamationTriangle, FaFilm, FaPlay } from 'react-icons/fa';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { SkeletonGrid } from '../../components/Skeletons';

// Embed providers. Not every title exists on every provider, so the viewer can switch.
const SERVERS = [
    { id: 'vidlink', label: 'Server 1' },
    { id: 'vidfast', label: 'Server 2' },
    { id: 'vsembed', label: 'Server 3' },
];

const WatchPage = () => {
    const { id, category } = useParams();
    const navigate = useNavigate();
    const { goBack, backStack } = useAppNavigation();
    const [detail, setDetail] = useState();
    const [episode, setEpisode] = useState(1);
    const [episodes, setEpisodes] = useState(null);
    const [season, setSeason] = useState(1);
    const [genres, setGenres] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenOverview, setIsOpenOverview] = useState(false);
    // null = automatic (see below); otherwise the server the viewer picked last
    const [server, setServer] = useState(() => {
        try {
            const saved = localStorage.getItem('player_server');
            return SERVERS.some(s => s.id === saved) ? saved : null;
        } catch {
            return null;
        }
    });

    const isSeries = category === 'tv' ? true : false;

    const playerRef = useRef(null);
    const lastSavedRef = useRef(0);
    // Where this title was left off. Read once per title so saving progress while watching
    // never changes the player URL (that would reload the video).
    const resume = useMemo(() => getEntry(id, category), [id, category]);

    useEffect(() => {
        const loadMovieDetail = async () => {
            setLoading(true);
            setLoadError("");
            let data;
            try {
                data = await getVideoById(id, category);
            } catch (err) {
                setLoadError(err.message || "Unable to load video details right now.");
                setLoading(false);
                return;
            }

            setDetail(data);
            setGenres(data.genres);

            if (isSeries) {
                const saved = localStorage.getItem(`progress_${id}`);
                if (saved) {
                    const { season, episode } = JSON.parse(saved);

                    setSeason(season);
                    setEpisode(episode);
                }
            }

            setLoading(false);
        }

        loadMovieDetail();
    }, [id, category, reloadKey]);

    useEffect(() => {
        const getEpisodes = async () => {
            if (isSeries) {
                setEpisodes(null);
                try {
                    const episodesResult = await getEpisodesBySeason(id, season);
                    const today = new Date();

                    const episodeList = (episodesResult?.episodes ?? [])
                        .filter(ep =>
                            ep.air_date &&
                            new Date(ep.air_date) <= today
                        ).map((ep, index) => ({
                            ...ep,
                            vidsrcEpisode: index + 1
                        }));

                    setEpisodes(episodeList);
                } catch {
                    setEpisodes([]);
                }
            }
        }

        getEpisodes();
    }, [season, isSeries]);

    // Save how far the viewer got, from the progress events the embedded player posts to this page
    useEffect(() => {
        const onMessage = (event) => {
            // Origins are whitelisted in parsePlayerMessage. Not checking event.source because
            // some players post from a frame nested inside the iframe.
            if (!playerRef.current) return;
            const msg = parsePlayerMessage(event);
            if (!msg || (msg.tmdbId !== undefined && String(msg.tmdbId) !== String(id))) return;

            // Players report many times a second; save every few seconds, and always on the end
            const now = Date.now();
            if (!msg.ended && now - lastSavedRef.current < 5000) return;
            lastSavedRef.current = now;

            recordProgress({
                id,
                category,
                title: isSeries ? (detail?.name || detail?.original_name) : detail?.title,
                poster_path: detail?.poster_path,
                season: msg.season ?? season,
                episode: msg.episode ?? episode,
                time: msg.time,
                duration: msg.duration,
                ended: msg.ended,
            });
        };

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [id, category, isSeries, detail, season, episode]);

    // Bring the playing episode into view inside the list (without scrolling the page)
    useEffect(() => {
        if (!episodes?.length) return;
        const list = document.querySelector('.episode-container');
        const current = list?.querySelector('.series.current');
        if (!list || !current) return;
        list.scrollTo({
            top: current.offsetTop - list.offsetTop - (list.clientHeight - current.offsetHeight) / 2,
            behavior: 'smooth',
        });
    }, [episodes]);

    const handleEpisodeClick = (selectedEpisode) => {
        setEpisode(selectedEpisode);

        localStorage.setItem(`progress_${id}`, JSON.stringify({
            season,
            episode: selectedEpisode
        }));
    }

    const handleSeasonChange = (selectedSeason) => {
        setSeason(selectedSeason);
        setEpisode(1);
        localStorage.setItem(`progress_${id}`, JSON.stringify({
            season: selectedSeason,
            episode: 1
        }));
    }

    // VidLink is the default for everything, anime included: it loads the right show and has working
    // subtitles. VidFast (no anime route) and vsembed were tested and are not reliable for anime.
    const activeServer = server ?? 'vidlink';

    const handleServerChange = (selected) => {
        setServer(selected);
        try {
            localStorage.setItem('player_server', selected);
        } catch { /* storage unavailable: the choice just won't persist */ }
    };

    // Pick up where the viewer left off (only for the episode they were actually watching)
    const resumeAt = resume && (!isSeries || (resume.season === season && resume.episode === episode))
        ? Math.floor(resume.time)
        : 0;
    const startAt = resumeAt > 0 ? `&startAt=${resumeAt}` : '';

    // Only providers that serve their own player are used. Wrappers such as VidCore and Videasy
    // nest the real player in a sandboxed iframe, which the player detects and refuses to run in.
    // VidFast is loaded from vidfast.vc directly: vidfast.pro redirects there, which adds a round trip
    // and moves the player to a different origin than the iframe's `allow="fullscreen"` was granted to,
    // so its fullscreen button did nothing.
    // VidLink and VidFast show their controls (and a CC button) on any mouse movement;
    // vsembed is the original provider, kept as the last resort: its controls often never appear.
    const videoSourceLink = activeServer === 'vidfast'
        ? (isSeries
            ? `https://vidfast.vc/tv/${id}/${season}/${episode}?autoPlay=false&nextButton=true&theme=e50914${startAt}`
            : `https://vidfast.vc/movie/${id}?autoPlay=false&theme=e50914${startAt}`)
        : activeServer === 'vsembed'
        ? (isSeries
            ? `https://vsembed.ru/embed/tv/${id}/${season}/${episode}?ds_lang=en${startAt}`
            : `https://vsembed.ru/embed/movie/${id}?ds_lang=en${startAt}`)
        : (isSeries
            ? `https://vidlink.pro/tv/${id}/${season}/${episode}?autoplay=false&nextbutton=true${startAt}`
            : `https://vidlink.pro/movie/${id}?autoplay=false${startAt}`);

    // Go to this title's details page. history -1 is unreliable here: the embedded player
    // adds its own history entries, so "back" would just step through its episodes.
    // When the viewer came from the details page, return along the trail so the details page keeps
    // its own way back (to the list or search they started from). Otherwise (opened from "Continue
    // watching" or a direct link) open the details page and keep the trail, so Back there still works.
    const goToDetails = () => {
        const section = isSeries ? "series" : "movie";
        const name = (isSeries ? (detail?.name || detail?.original_name) : detail?.title) || "title";
        const slug = name.replaceAll(/\s+/g, "").toLowerCase();
        const target = `/${section}/${id}/${slug}`;
        if (backStack[backStack.length - 1]?.startsWith(`/${section}/${id}/`)) {
            goBack(target);
        } else {
            navigate(target, { state: { backStack } });
        }
        window.scrollTo({ top: 0 });
    };

    const info = (() => {
        if (!detail) return null;
        const title = isSeries ? (detail.name || detail.original_name) : detail.title;
        const origin = Array.isArray(detail.origin_country) ? detail.origin_country.join(", ") : detail.origin_country;
        const meta = isSeries
            ? [
                detail.first_air_date && `${detail.first_air_date.split('-')[0]}${detail.last_air_date ? `-${detail.last_air_date.split('-')[0]}` : ''}`,
                detail.number_of_seasons && `${detail.number_of_seasons} Seasons`,
                origin,
            ]
            : [detail.release_date, detail.runtime ? convertRuntime(detail.runtime) : null, origin];

        return (
            <div className='watch-info'>
                <div className='title-and-ratings'>
                    <h1>{title}</h1>
                    {detail.vote_average > 0 && <p className='rating'>{`⭐ ${detail.vote_average.toFixed(1)}`}</p>}
                </div>
                <p className='sub-detail'>{meta.filter(Boolean).join(' | ')}</p>
                {genres?.length > 0 && (
                    <div className='badges-container'>
                        {genres.map((genre) => (
                            <div key={genre.id} className='badges'>{genre.name}</div>
                        ))}
                    </div>
                )}
                {detail.overview && (
                    <>
                        <div className={`overview-container ${isOpenOverview ? 'viewing' : ''}`}>
                            <p className='overview'>{detail.overview}</p>
                        </div>
                        <button
                            className='overview-toggle'
                            onClick={() => setIsOpenOverview(!isOpenOverview)}
                            aria-expanded={isOpenOverview}
                        >
                            {isOpenOverview ? 'Show less ▲' : 'Show more ▼'}
                        </button>
                    </>
                )}
            </div>
        );
    })();

    const episodesPanel = isSeries && detail && (
        <aside className='watch-side'>
            <div className='season-container'>
                <h3>Episodes</h3>
                <div className="custom-select">
                    <button type='button' className="selected" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
                        <span>Season {season}</span>
                        <span aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {isOpen && (
                        <div className="options">
                            {Array.from({ length: detail.number_of_seasons }, (_, i) => i + 1).map(num => (
                                <div
                                    key={num}
                                    className={`option ${num === season ? 'active' : ''}`}
                                    onClick={() => { handleSeasonChange(num); setIsOpen(false); }}
                                >
                                    Season {num}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className='episode-container'>
                    {episodes === null && (
                        <SkeletonGrid className="episode-skeletons" count={4} label="Loading episodes..." />
                    )}
                    {episodes?.length === 0 && (
                        <EmptyState
                            compact
                            icon={<FaFilm />}
                            title="No episodes available"
                            message="No aired episodes were found for this season."
                        />
                    )}
                    {episodes?.map((ep, i) => (
                        <div
                            key={`${season}-${ep.episode_number}`}
                            className={`series ${ep.episode_number === episode ? 'current' : ""}`}
                            style={{ '--i': Math.min(i, 12) }}
                            onClick={() => handleEpisodeClick(ep.episode_number)}
                            role='button'
                            tabIndex={0}
                            aria-current={ep.episode_number === episode ? 'true' : undefined}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleEpisodeClick(ep.episode_number);
                                }
                            }}
                        >
                            <div className='episode-thumb'>
                                {ep.still_path
                                    ? <img src={`https://image.tmdb.org/t/p/w200${ep.still_path}`} className='episode-img' alt="" loading="lazy" />
                                    : <div className='episode-img placeholder' aria-hidden="true"><FaFilm /></div>}
                                <span className='episode-play' aria-hidden="true"><FaPlay /></span>
                            </div>
                            <div className='episode-detail'>
                                <div className='episode-count-container'>
                                    <h4>{`E${ep.episode_number}`}</h4>
                                    <p>{convertRuntime(ep.runtime)}</p>
                                </div>
                                <p className='episode-overview'>{ep.overview}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );

    return (
        <main className='watch-page'>
            <div className='watch-topbar'>
                <button className='back-btn' onClick={goToDetails}>← Back to details</button>
                <h2 className='watch-label'>Now playing</h2>
                <div className='watch-tools'>
                    <div className='server-switch' role='group' aria-label='Video server'>
                        {SERVERS.map(s => (
                            <button
                                key={s.id}
                                type='button'
                                className={`server-btn${activeServer === s.id ? ' active' : ''}`}
                                aria-pressed={activeServer === s.id}
                                onClick={() => handleServerChange(s.id)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className={`watch-layout${isSeries ? ' has-side' : ''}`}>
                <section className='watch-main'>
                    <div className='player-frame'>
                        {/* Wait for the details so the right provider is chosen (anime vs. other series) */}
                        {!loading && (
                            <iframe
                                ref={playerRef}
                                className='video'
                                title='Video player'
                                src={videoSourceLink}
                                allowFullScreen
                                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                                frameBorder={"0"}
                            />
                        )}
                    </div>
                    {loading ? (
                        <LoadingState label="Loading player details..." />
                    ) : loadError ? (
                        <EmptyState
                            compact
                            tone="error"
                            icon={<FaExclamationTriangle />}
                            title="Couldn't load details"
                            message={loadError}
                            action={{ label: "Try again", onClick: () => setReloadKey((k) => k + 1) }}
                        />
                    ) : (
                        <>
                            {info}
                            <div className='watch-related'>
                                <WatchPageRelated category={isSeries ? 'tv' : 'movie'} id={id} />
                            </div>
                        </>
                    )}
                </section>
                {!loading && !loadError && episodesPanel}
            </div>
        </main>
    )
}

export default WatchPage;
