import { useState } from "react";
import EmptyList from "../components/EmptyList";

const FavoritesPage = () => {
    const [tvSeries, setTvSeries] = useState([])
    return (
        (tvSeries.length === 0 ? (
            <EmptyList page={"Favorite Movies or Series"} message={"Browse movies or series, add them to your favorites."} />
        ) : (
            <div>
                Favorites
            </div>
        ))
    )
}

export default FavoritesPage;