import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { search, loadMovies, loadSeries } from "../services/serviceAPI";
import { useAppNavigation } from "../hooks/useAppNavigation";

export const SearchContext = createContext();

const RESULT_PAGES = ["/", "/movie", "/series"];

export function SearchProvider({ children }) {
    const location = useLocation();
    const { go } = useAppNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const [contents, setContent] = useState([]);
    // Read saved favorites up front. Loading them in an effect lets the "save" effect
    // overwrite storage with [] first (StrictMode runs effects twice in dev).
    const [favorites, setFavorites] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem("favorites"));
            return Array.isArray(stored) ? stored : [];
        } catch {
            return [];
        }
    });
    const [searchResults, setSearchResults] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState("");

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
        const query = searchQuery.trim();
        if (!query) return;

        // Only these pages list search results. From anywhere else (a title's details, favorites) the
        // results are shown on Home, and Back there returns to the page the search was started from.
        if (!RESULT_PAGES.includes(location.pathname)) go("/");

        setIsSearching(true);
        setError("");
        try {
            const data = await search(query, location.pathname);
            setContent(data);
            setSearchResults(query);
        } catch (err) {
            setError(err.message);
            setContent([]);
        } finally {
            setIsSearching(false);
        }
    }

    const response = async (type) => {
        setContent([]);
        setError("");
        try {
            const data = type === "series" ? await loadSeries() : await loadMovies();
            setContent(data);
        } catch (err) {
            setError(err.message);
        }
    }

    const value = {
        searchQuery, 
        contents,
        setSearchQuery,
        response,
        handleSearch,
        favorites,
        addToFavorites,
        searchResults,
        setSearchResults,
        isSearching,
        error,
        setError
    }

    return  (
        <SearchContext.Provider value={value} >
            { children }
        </SearchContext.Provider>
    )
}