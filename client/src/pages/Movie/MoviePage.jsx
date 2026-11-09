import MovieList from "../../components/MovieList";
import PageBackButton from "../../components/PageBackButton";

const MoviePage = () => {
    return (
        <main className="page-content">
            <div className="page-heading">
                <PageBackButton />
                <h1>Movies</h1>
            </div>
            <MovieList type={"movies"} />
        </main>
    )
}

export default MoviePage;