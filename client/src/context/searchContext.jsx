import { createContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { search, loadMovies, loadSeries } from "../services/serviceAPI";

export const SearchContext = createContext();

export function SearchProvider({ children }) {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [contents, setContent] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        const data = await search(searchQuery, location.pathname);
        setContent(data);
        setSearchQuery("");
    }

    const response = async (type) => {
        setContent([]);
        const data = type == "Series" ? await loadSeries() : await loadMovies();
        setContent(data);
    }

    const value = {
        searchQuery, 
        contents,
        setSearchQuery,
        response,
        handleSearch
    }

    return  (
        <SearchContext.Provider value={value} >
            { children }
        </SearchContext.Provider>
    )
}