import MovieList from "../../components/MovieList";
import PageBackButton from "../../components/PageBackButton";

const TvSeriesPage = () => {
    return (
        <main className="page-content">
            <div className="page-heading">
                <PageBackButton />
                <h1>TV Series</h1>
            </div>
            <MovieList type={"series"} />
        </main>
    )
}

export default TvSeriesPage;