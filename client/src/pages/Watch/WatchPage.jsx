import { useParams, useNavigate } from 'react-router-dom';
import './WatchPage.css';
import { useEffect, useState } from 'react';
import { getEpisodesBySeason, getVideoById } from '../../services/serviceAPI';

const WatchPage = () => {
    const { id, category } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState();
    const [episode, setEpisode] = useState(1);
    const [episodes, setEpisodes] = useState(null);
    const [season, setSeason] = useState(1);
    const [loading, setLoading] = useState(true);

    const isSeries = category === 'tv' ? true : false;

    useEffect(() => {
        console.log("RUN");
        const loadMovieDetail = async () => {
            const data = await getVideoById(id, category);
            console.log(data);
            setDetail(data);

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
    }, [id, category]);

    useEffect(() => {
        const getEpisodes = async () => {
            if (isSeries) {
                const episodesResult = await getEpisodesBySeason(id, season);
                console.log(episodesResult);
                setEpisodes(episodesResult);
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

    const vidsrcMovie = `https://vidsrc.me/embed/movie/${id}`;
    const vidsrcSeries = `https://vidsrc.me/embed/tv/${id}/${season}/${episode}`;

    const vidsrcV2Movie = `https://vidsrc.to/embed/movie/${id}`;
    const vidsrcV2Series = `https://vidsrc.to/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;

    const embedMovie = `https://www.2embed.cc/embed/${id}`;
    const embedSeries = `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;

    return (
        <>
            <div
                className='main-watch-container'
                allowFullScreen
            >
                <iframe
                    className='video'
                    src={isSeries ? embedSeries : embedMovie}
                    allowFullScreen
                    allow="fullscreen"
                    frameBorder={"0"}
                />
                {loading ? 
                    <div>
                        <div className='loader'></div>
                    </div>
                    :
                    <div className='detail-container'>
                        {isSeries 
                            ? <div
                                className='season-container'
                            >
                                <button 
                                    className='back-btn'
                                    onClick={() => navigate(-1)}
                                >
                                    ← Back
                                </button>
                                <p>{detail.original_name}</p>
                                <select
                                    value={season}
                                    onChange={(e) => handleSeasonChange(Number(e.target.value))}
                                >
                                    {Array.from({ length: parseInt(detail.number_of_seasons) }, (_, i) => i + 1).map(num => (
                                        <option key={num} value={num}>
                                            Season {num}
                                        </option>
                                    ))}
                                </select>
                                <div className='episode-container'>
                                    {episodes?.episodes.map(ep => (
                                        <div 
                                            key={ep.episode_number}
                                            className={`series ${ep.episode_number === episode ? 'current' : ""}`}
                                            onClick={() => setEpisode(ep.episode_number)}
                                        >
                                            {ep.episode_number !== episode ? <p>{ep.episode_number}</p>
                                            : <div className="bars">
                                                <div className="bar" />
                                                <div className="bar" />
                                                <div className="bar" />
                                            </div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            : <div
                                className='current movie'
                            >
                                {detail.title}
                                <div className="bars">
                                    <div className="bar" />
                                    <div className="bar" />
                                    <div className="bar" />
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>
        </>
    )
}

export default WatchPage;