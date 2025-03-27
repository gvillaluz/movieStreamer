import { useContext, useEffect, useState } from "react";
import { loadMovies, loadSeries } from "../services/serviceAPI"
import MovieCard from "./MovieCard";
import './MovieList.css';
import { SearchContext } from "../context/searchContext";
import { useLocation } from "react-router-dom";

const MovieList = (props) => {
    const { contents, response} =  useContext(SearchContext);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    
    useEffect(() => {
        const loadContent = async () => {
            response(props.type);
            setLoading(false);
        }
        loadContent()
    }, []);

    const uniqueContents = Array.from(
        new Map(contents.map((content) => [content.id, content])).values()
    );

    const movieGenres = [
        { id: 28, name: "Action" },
        { id: 12, name: "Adventure" },
        { id: 16, name: "Animation" },
        { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" },
        { id: 99, name: "Documentary" },
        { id: 18, name: "Drama" },
        { id: 10751, name: "Family" },
        { id: 14, name: "Fantasy" },
        { id: 36, name: "History" },
        { id: 27, name: "Horror" },
        { id: 10402, name: "Music" },
        { id: 9648, name: "Mystery" },
        { id: 10749, name: "Romance" },
        { id: 878, name: "Science Fiction" },
        { id: 10770, name: "TV Movie" },
        { id: 53, name: "Thriller" },
        { id: 10752, name: "War" },
        { id: 37, name: "Western" }
    ];

    const tvGenres = [
        { id: 10759, name: "Action & Adventure" },
        { id: 16, name: "Animation" },
        { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" },
        { id: 99, name: "Documentary" },
        { id: 18, name: "Drama" },
        { id: 10751, name: "Family" },
        { id: 10762, name: "Kids" },
        { id: 9648, name: "Mystery" },
        { id: 10763, name: "News" },
        { id: 10764, name: "Reality" },
        { id: 10765, name: "Sci-Fi & Fantasy" },
        { id: 10766, name: "Soap" },
        { id: 10767, name: "Talk" },
        { id: 10768, name: "War & Politics" },
        { id: 37, name: "Western" }
    ];
    
    const combinedGenres = [
        ...movieGenres,
        ...tvGenres.filter(tvGenre => !movieGenres.some(movieGenre => movieGenre.id === tvGenre.id))
    ];
    

    return (
        (!loading ? (
            (uniqueContents.length !== 0 ? 
            <>
                <div className="dropdown">
                    <select>
                        {
                            location.pathname !== "/favorites" && 
                                (
                                    location.pathname !== "/" ? (
                                    props.type !== "series" ? (
                                        movieGenres.map(op => (
                                            <option key={op.id} value={op.id}>{op.name}</option>
                                        ))
                                        ) : (
                                            tvGenres.map(op => (
                                                <option key={op.id} value={op.id}>{op.name}</option>
                                            ))
                                        )
                                    ) : (
                                        combinedGenres.map(op => (
                                            <option key={op.id} value={op.id}>{op.name}</option>
                                        ))
                                    )
                                )
                        }
                    </select>
                </div>
                <div className="movie-list">
                    {
                        uniqueContents.map((content, index) => (
                            content.poster_path && <MovieCard key={content.id + '-' + index} content={content} type={props.type} />
                        ))
                    }
                </div> 
            </>
            : 
            <div className="no-content">
                <h2>No Search Results Found.</h2>
            </div>
            )
        ) : (
            <div className="loading">
                <div className="loader"></div>
                <h3>Loading {props.type}.....</h3>
            </div>

        ))
    )
}

export default MovieList;