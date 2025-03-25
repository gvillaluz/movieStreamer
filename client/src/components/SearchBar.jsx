import { useContext, useState } from "react";
import './SearchBar.css';
import { SearchContext } from "../context/searchContext";

const SearchBar = () => {
    const { searchQuery, setSearchQuery, handleSearch } = useContext(SearchContext);
 
    return (
        <div className="search-container">
            <form>
                <input 
                    type="text" 
                    placeholder="Search Movie"
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </form>
        </div>
    )
}

export default SearchBar;