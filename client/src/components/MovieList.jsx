import { useContext, useEffect, useState } from "react";
import { loadMovies, loadSeries } from "../services/serviceAPI"
import MovieCard from "./MovieCard";
import './MovieList.css';
import { SearchContext } from "../context/searchContext";

const MovieList = (props) => {
    const { contents, response} =  useContext(SearchContext);
    const [loading, setLoading] = useState(true);
    
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

    return (
        (!loading ? (
            <div className="movie-list">
                {uniqueContents.map((content, index) => (
                    content.poster_path && <MovieCard key={content.id + '-' + index} content={content} type={props.type} />
                ))}
            </div>
        ) : (
            <div className="loading">
                <div className="loader"></div>
                <h3>Loading {props.type}.....</h3>
            </div>

        ))
    )
}

export default MovieList;