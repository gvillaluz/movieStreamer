import SearchBar from "./SearchBar";
import './NavBar.css';
import { Link, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { SearchContext } from "../context/searchContext";

const NavBar = () => {
    const { isDescriptionPage, setIsDescriptionPage } = useContext(SearchContext);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const reloadPage = (path) => {
        if (path === location.pathname) window.location.reload();
        setIsOpen(false);
    }

    return (
        <div className="navbar">
            <h2>Movie Stream</h2>

            <div className="navbar-right">
                <button 
                    className="hamburger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? '✕' : '☰'}
                </button>
                <div className={`navbar-tabs ${isOpen ? 'open' : ''}`}>
                    <ul>
                        <Link to="/" className={`link ${location.pathname === "/" ? "active" : ""}`} onClick={() => reloadPage("/")}>
                            <li>Home</li>
                        </Link>
                        <Link to="/movie" className={`link ${location.pathname === "/movie" ? "active" : ""}`} onClick={() => reloadPage("/movie")}>
                            <li>Movies</li>
                        </Link>
                        <Link to="/series" className={`link ${location.pathname === "/series" ? "active" : ""}`} onClick={() => reloadPage("/series")}>
                            <li>TV Series</li>
                        </Link>
                        <Link to="/favorites" className={`link ${location.pathname === "/favorites" ? "active" : ""}`} onClick={() => reloadPage("/favorites")}>
                            <li>Favorites</li>
                        </Link>
                    </ul>
                </div>
                {!isDescriptionPage && <SearchBar />}
            </div>
        </div>
    )
}

export default NavBar;