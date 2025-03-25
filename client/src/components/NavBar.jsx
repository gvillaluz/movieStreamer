import SearchBar from "./SearchBar";
import './NavBar.css';
import { Link } from "react-router-dom";

const NavBar = () => {
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
                    <Link to="/tv" className="link">
                        <li>Tv Series</li>
                    </Link>
                    <Link to="/favorites" className="link">
                        <li>Favorites</li>
                    </Link>
                </ul>
            </div>
            <SearchBar />
        </div>
    )
}

export default NavBar;