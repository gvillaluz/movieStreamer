import { useState } from "react";
import EmptyList from "../components/EmptyList";
import MovieList from "../components/MovieList";

const TvSeriesPage = () => {
    const [tvSeries, setTvSeries] = useState([])
    return (
        <MovieList type={"Series"} />
    )
}

export default TvSeriesPage;