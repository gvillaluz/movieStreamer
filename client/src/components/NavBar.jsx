import SearchBar from "./SearchBar";
import './NavBar.css';
import { Link } from "react-router-dom";
import { useContext } from "react";
import { SearchContext } from "../context/searchContext";

const NavBar = () => {
    const { isDescriptionPage, setIsDescriptionPage } = useContext(SearchContext);
    return (
        <div className="navbar">
            <h2>Movie Stream</h2>
            <div className="navbar-tabs">
                <ul>
                    <Link to="/" className="link">
                        <li>Home</li>
                    </Link>
                    <Link to="/movie" className="link">
                        <li>Movies</li>
                    </Link>
                    <Link to="/series" className="link">
                        <li>Tv Series</li>
                    </Link>
                    <Link to="/favorites" className="link">
                        <li>Favorites</li>
                    </Link>
                </ul>
            </div>
            {!isDescriptionPage && <SearchBar />}
        </div>
    )
}

export default NavBar;