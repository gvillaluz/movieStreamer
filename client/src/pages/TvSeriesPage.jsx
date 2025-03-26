import { useState } from "react";
import EmptyList from "../components/EmptyList";
import MovieList from "../components/MovieList";

const TvSeriesPage = () => {
    return (
        <MovieList type={"series"} />
    )
}

export default TvSeriesPage;