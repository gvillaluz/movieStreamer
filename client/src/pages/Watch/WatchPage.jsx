import { useParams, useNavigate } from 'react-router-dom';
import './WatchPage.css';
import { useEffect, useState } from 'react';
import { getEpisodesBySeason, getVideoById } from '../../services/serviceAPI';
import { convertRuntime } from '../../utils/DurationUtils';
import RelatedContent from '../Description/components/RelatedContent';
import WatchPageRelated from './components/WatchPageRelated';
import { FaExclamationTriangle, FaFilm } from 'react-icons/fa';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { SkeletonGrid } from '../../components/Skeletons';

const WatchPage = () => {
    const { id, category } = useParams();
    const navigate = useNavigate();
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

    const isSeries = category === 'tv' ? true : false;

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

    const series = `https://vsembed.ru/embed/tv/${id}/${season}/${episode}?ds_lang=en`;
    const movie = `https://vsembed.ru/embed/movie/${id}`;

    const videoSourceLink = isSeries ? series : movie;

    console.log('video URL:', videoSourceLink);
    console.log('season:', season, 'episode:', episode);

    return (
        <>
            <div className='watch-page-header'>
                <button 
                    className='back-btn mobile'
                    onClick={() => navigate(-1)}
                >
                    ←
                </button>
                <h2 className='title'>
                    NOW PLAYING
                </h2>
            </div>
            <div
                className='main-watch-container'
                allowFullScreen
            >
                <iframe
                    className='video'
                    src={videoSourceLink}
                    allowFullScreen
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    frameBorder={"0"}
                />
                {loading ?
                    <LoadingState label="Loading player details..." />
                    : loadError ?
                    <div className='detail-container'>
                        <EmptyState
                            compact
                            tone="error"
                            icon={<FaExclamationTriangle />}
                            title="Couldn't load details"
                            message={loadError}
                            action={{ label: "Try again", onClick: () => setReloadKey((k) => k + 1) }}
                        />
                    </div>
                    :
                    <div className='detail-container'>
                        <button 
                            className='back-btn desktop'
                            onClick={() => navigate(-1)}
                        >
                            ← Back
                        </button>
                        {isSeries 
                            ? <div
                                className='season-container'
                            >
                                <div className='title-and-ratings'>
                                    <h4>{detail.original_name}</h4>
                                    <p>{`⭐ ${detail.vote_average.toFixed(1)}`}</p>
                                </div>
                                <p className='sub-detail'>{`${detail.first_air_date.split('-')[0]}-${detail.last_air_date.split('-')[0]} | ${detail.number_of_seasons} Seasons | ${detail.origin_country}`}</p>
                                <div className='badges-container'>
                                    {genres.map((genre) => (
                                        <div key={genre.id} className='badges'>
                                            {genre.name}
                                        </div>
                                    ))}
                                </div>
                                <div className={`overview-container ${isOpenOverview ? 'viewing' : ''}`}>
                                    <p className='overview'>{detail.overview}</p>
                                </div>
                                <button 
                                    className='overview-toggle'
                                    onClick={() => setIsOpenOverview(!isOpenOverview)}
                                >
                                    {isOpenOverview ? 'Show less ▲' : 'Show more ▼'}
                                </button>
                                <div className="custom-select">
                                    <div className="selected" onClick={() => setIsOpen(!isOpen)}>
                                        Season {season} ▼
                                    </div>
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
                                    {episodes?.map(ep => (
                                        <div 
                                            key={ep.episode_number}
                                            className={`series ${ep.episode_number === episode ? 'current' : ""}`}
                                            onClick={() => handleEpisodeClick(ep.episode_number)}
                                        >
                                            <img
                                                src={`https://image.tmdb.org/t/p/w200${ep.still_path}`}
                                                className='episode-img'
                                            />
                                            <div className='episode-detail'>
                                                <div className='episode-count-container'>
                                                    <h4>{`E${ep.episode_number}`}</h4>
                                                    <p>{convertRuntime(ep.runtime)}</p>
                                                </div>
                                                <p className='episode-overview'>
                                                    {ep.overview}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            : <div>
                                <div className='movie-detail'>
                                    <div className='title-and-ratings'>
                                        <h4>{detail.title}</h4>
                                        <p>{`⭐ ${detail.vote_average.toFixed(1)}`}</p>
                                    </div>
                                    <p className='sub-detail'>{`${detail.release_date} | ${convertRuntime(detail.runtime)} | ${detail.origin_country}`}</p>
                                    <div className='badges-container'>
                                        {genres.map((genre) => (
                                            <div key={genre.id} className='badges'>
                                                {genre.name}
                                            </div>
                                        ))}
                                    </div>
                                    <div className={`overview-container ${isOpenOverview ? 'viewing' : ''}`}>
                                        <p className='overview'>{detail.overview}</p>
                                    </div>
                                    <button 
                                        className='overview-toggle'
                                        onClick={() => setIsOpenOverview(!isOpenOverview)}
                                    >
                                        {isOpenOverview ? 'Show less ▲' : 'Show more ▼'}
                                    </button>
                                </div>
                            </div>
                        }
                        <WatchPageRelated category={isSeries ? 'tv' : 'movie'} id={id} />
                    </div>
                }
            </div>
        </>
    )
}

export default WatchPage;