import { FaFilm, FaExclamationTriangle } from "react-icons/fa";
import MovieCard from "./MovieCard";
import EmptyState from "./EmptyState";
import { SkeletonGrid } from "./Skeletons";
import useSimilarContent from "../hooks/useSimilarContent";

/** "More Like This" block shared by the details and watch pages. */
const RelatedList = ({ category, id, listClassName }) => {
    const { items, loading, error, retry } = useSimilarContent(category, id);

    return (
        <>
            <h3>More Like This</h3>
            {loading ? (
                <SkeletonGrid className={listClassName} count={6} label="Loading recommendations..." />
            ) : error ? (
                <EmptyState
                    compact
                    tone="error"
                    icon={<FaExclamationTriangle />}
                    title="Couldn't load recommendations"
                    action={{ label: "Retry", onClick: retry }}
                />
            ) : items.length ? (
                <div className={listClassName}>
                    {items.map((content) => <MovieCard key={content.id} content={content} />)}
                </div>
            ) : (
                <EmptyState
                    compact
                    icon={<FaFilm />}
                    title="No recommendations yet"
                    message="We couldn't find similar titles for this one."
                />
            )}
        </>
    );
};

export default RelatedList;
