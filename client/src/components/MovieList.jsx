import { useContext, useEffect, useState } from "react";
import { loadMovies, loadSeries } from "../services/serviceAPI"
import MovieCard from "./MovieCard";
import './Movielist.css';
import { SearchContext } from "../context/searchContext";
import { useLocation } from "react-router-dom";

const Movieast = (props) => {
    const { contents, response, searchResults, setSearchResults} =  useContext(SearchContext);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState("");
    const location = useLocation();
    
    useEffect(() => {
        const loadContent = async () => {
            response(props.type);
            setLoading(false);
        }
        loadContent()
    }, []);

    useEffect(() => {
        setSearchResults("");
        setType(props.type === "movies" ? "Movies" : "TV Series");
    }, [location.pathname, props.type]);

    const uniqueContents = Array.from(
        new Map(contents.map((content) => [content.id, content])).values()
    );

    return (
        (!loading ? (
            (uniqueContents.length !== 0 ? 
                <div className="main-content">
                    <h1>
                        {searchResults 
                            ? `Search Results for '${searchResults}'` 
                            : location.pathname !== "/" 
                                ? `Popular ${type}` 
                                : ""}
                    </h1>

                    <div className="movie-list">
                        {
                            uniqueContents.map((content, index) => (

                                content.poster_path && <MovieCard key={content.id + '-' + index} content={content} type={props.type} />
                            ))
                        }
                    </div> 
                </div>
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

export default Movieast;