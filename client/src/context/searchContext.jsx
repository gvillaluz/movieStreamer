import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { search, loadMovies, loadSeries } from "../services/serviceAPI";

export const SearchContext = createContext();

export function SearchProvider({ children }) {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [contents, setContent] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [isDescriptionPage, setIsDescriptionPage] = useState(false);

    useEffect(() => {
        const isDescription = !["/movie", "/series", "/favorites", "/"].includes(location.pathname);
        setIsDescriptionPage(isDescription);
    }, [location.pathname]);

    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    }, [])

    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites])

    const addToFavorites = (movie) => {
        setFavorites(prev => {
            if (prev.some(content => content.id === movie.id)) {
                return prev.filter(fav => fav.id !== movie.id);
            }
            return [...prev, movie];
        });
    }

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        console.log(location.pathname);
        const data = await search(searchQuery, location.pathname);
        setContent(data);
        setSearchQuery("");
    }

    const response = async (type) => {
        setContent([]);
        const data = type == "series" ? await loadSeries() : await loadMovies();
        setContent(data);
    }

    const value = {
        searchQuery, 
        contents,
        setSearchQuery,
        response,
        handleSearch,
        favorites,
        addToFavorites,
        isDescriptionPage,
        setIsDescriptionPage,
    }

    return  (
        <SearchContext.Provider value={value} >
            { children }
        </SearchContext.Provider>
    )
}