import MovieCard from "../../../components/MovieCard";
import ScrollRow from "../../../components/ScrollRow";
import { SkeletonGrid } from "../../../components/Skeletons";
import useSimilarContent from "../../../hooks/useSimilarContent";

// Fewer recommendations than this reads as a broken row, so it's left out
const MIN_ITEMS = 4;

/**
 * "Since you watched X" / "More like X": TMDB recommendations for one title the viewer watched or saved.
 * `seed` is { id, category: "movie" | "tv", title, reason: "watched" | "favorite" }.
 */
const RecommendationRow = ({ seed }) => {
    const { items, loading, error } = useSimilarContent(seed.category, seed.id);

    if (!loading && (error || items.length < MIN_ITEMS)) return null;

    const fromFavorite = seed.reason === "favorite";
    const title = fromFavorite ? `More like ${seed.title}` : `Since you watched ${seed.title}`;

    return (
        <section className="home-section">
            <div className="section-heading">
                <div>
                    <span className="eyebrow">{fromFavorite ? "From your favorites" : "Picked for you"}</span>
                    <h2>{title}</h2>
                </div>
            </div>
            {loading ? (
                <SkeletonGrid className="skeleton-row" count={8} label={`Loading picks like ${seed.title}...`} />
            ) : (
                <ScrollRow label={title}>
                    {items.slice(0, 20).map((content) => <MovieCard key={content.id} content={content} />)}
                </ScrollRow>
            )}
        </section>
    );
};

export default RecommendationRow;
