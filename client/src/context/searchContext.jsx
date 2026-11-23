import { createContext, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { isSameTitle } from "../utils/filters";

export const SearchContext = createContext();

// Movies and TV Series filter their own list in place; every other page sends the query to /search.
const IN_PLACE_PAGES = ["/movie", "/series"];

export function SearchProvider({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { go } = useAppNavigation();
    const [searchQuery, setSearchQuery] = useState("");
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
    // A search made on Movies or TV Series, tagged with that page so it never leaks into the other one
    const [listSearch, setListSearch] = useState({ path: "", query: "" });
    const clearListSearch = useCallback(() => setListSearch({ path: "", query: "" }), []);

    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites])

    const addToFavorites = (movie) => {
        setFavorites(prev => {
            if (prev.some(content => isSameTitle(content, movie))) {
                return prev.filter(fav => !isSameTitle(fav, movie));
            }
            return [...prev, movie];
        });
    }

    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;

        if (!IN_PLACE_PAGES.includes(location.pathname)) {
            const to = `/search?q=${encodeURIComponent(query)}`;
            if (location.pathname === "/search") {
                // A new search from the results page replaces it, keeping the trail Back follows
                navigate(to, { replace: true, state: location.state });
            } else {
                go(to);
            }
            return;
        }

        // The list on this page does its own (paged) fetching for the query
        setListSearch({ path: location.pathname, query });
    }

    const value = {
        searchQuery,
        setSearchQuery,
        handleSearch,
        favorites,
        addToFavorites,
        listSearch,
        clearListSearch,
    }

    return  (
        <SearchContext.Provider value={value} >
            { children }
        </SearchContext.Provider>
    )
}