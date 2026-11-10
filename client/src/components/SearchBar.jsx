import { useContext, useEffect, useRef, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import './SearchBar.css';
import { SearchContext } from "../context/searchContext";

const MOBILE_QUERY = "(max-width: 1024px)";

const SearchBar = () => {
    const { searchQuery, setSearchQuery, handleSearch } = useContext(SearchContext);
    const [expanded, setExpanded] = useState(false);
    const inputRef = useRef(null);

    // The expanded state only matters on phones; on wider screens the field is always visible.
    const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;

    useEffect(() => {
        if (expanded) inputRef.current?.focus();
    }, [expanded]);

    const hasQuery = searchQuery.trim().length > 0;
    const closing = expanded && !hasQuery;

    const handleButtonClick = (e) => {
        if (!isMobile()) return; // desktop: plain submit

        if (!expanded) {
            e.preventDefault();
            setExpanded(true);
        } else if (!hasQuery) {
            e.preventDefault();
            setExpanded(false);
        }
    };

    const onSubmit = (e) => {
        handleSearch(e);
        if (isMobile() && hasQuery) {
            inputRef.current?.blur();
            setExpanded(false);
        }
    };

    const label = !expanded ? "Open search" : closing ? "Close search" : "Search";

    return (
        <div className={`search-container${expanded ? " expanded" : ""}`}>
            <form onSubmit={onSubmit} role="search">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search movies, series..."
                    aria-label="Search movies and series"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") setExpanded(false); }}
                />
                <button type="submit" onClick={handleButtonClick} aria-label={label}>
                    <span className="search-label">Search</span>
                    <span className="search-icon" aria-hidden="true">
                        {closing ? <FaTimes /> : <FaSearch />}
                    </span>
                </button>
            </form>
        </div>
    )
}

export default SearchBar;
