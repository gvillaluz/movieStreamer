import { FaArrowRight, FaFilm } from "react-icons/fa";
import { useAppNavigation } from "../hooks/useAppNavigation";
import MovieCard from "./MovieCard";
import EmptyState from "./EmptyState";
import ScrollRow from "./ScrollRow";
import { isComingSoon } from "../utils/releaseStatus";
import "./ContentRow.css";

const MAX_ITEMS = 20;
const RANKED_ITEMS = 10;

const hasPoster = (content) => Boolean(content?.poster_path && (content.title || content.name));

/**
 * A titled, horizontally scrolling row of posters (Home, Movies, TV Series).
 * `ranked` turns it into a Top 10 row: the first ten titles, each with its big rank number.
 * `to` adds an Explore link to a page that really shows more of the same.
 * Unreleased titles only show in the row marked `upcoming` (Coming soon), and that row shows nothing else.
 */
const ContentRow = ({ title, eyebrow, items = [], to, ranked = false, upcoming = false }) => {
    const { go } = useAppNavigation();
    const shown = items
        .filter((content) => hasPoster(content) && isComingSoon(content) === upcoming)
        .slice(0, ranked ? RANKED_ITEMS : MAX_ITEMS);

    return (
        <section className={`home-section${ranked ? " ranked-section" : ""}`}>
            <div className="section-heading">
                <div>
                    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                    <h2>{title}</h2>
                </div>
                {to && (
                    <button className="text-button" onClick={() => go(to)}>
                        Explore <FaArrowRight />
                    </button>
                )}
            </div>
            {shown.length ? (
                <ScrollRow label={title}>
                    {shown.map((content, i) => {
                        const key = `${content.id}-${content.media_type || "item"}`;
                        if (!ranked) return <MovieCard key={key} content={content} />;
                        return (
                            <div className="top10-item" key={key}>
                                <span className="top10-rank" aria-label={`Number ${i + 1}`}>{i + 1}</span>
                                <MovieCard content={content} />
                            </div>
                        );
                    })}
                </ScrollRow>
            ) : (
                <EmptyState
                    compact
                    icon={<FaFilm />}
                    title={`Nothing in ${title.toLowerCase()} yet`}
                    message="Check back soon, new titles land all the time."
                />
            )}
        </section>
    );
};

export default ContentRow;
