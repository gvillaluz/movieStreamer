import { useContext } from "react";
import './SearchBar.css';
import { SearchContext } from "../context/searchContext";

const SearchBar = () => {
    const { searchQuery, setSearchQuery, handleSearch } = useContext(SearchContext);
 
    return (
        <div className="search-container">
            <form onSubmit={handleSearch}>
                <input 
                    type="text" 
                    placeholder="Search movies, series..."
                    aria-label="Search movies and series"
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>
        </div>
    )
}

export default SearchBar;