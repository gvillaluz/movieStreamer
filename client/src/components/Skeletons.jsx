import "./Skeletons.css";

const SkeletonCard = () => (
    <div className="movie-card skeleton-card" aria-hidden="true">
        <div className="skeleton skeleton-poster" />
        <div className="movie-details">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
        </div>
    </div>
);

/** A grid/row of placeholder cards. `className` lets it reuse the host list's layout. */
export const SkeletonGrid = ({ count = 12, className = "movie-list", label = "Loading..." }) => (
    <div className={className} role="status" aria-busy="true" aria-live="polite">
        <span className="visually-hidden">{label}</span>
        {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
);

/** Placeholder for the title details page: poster beside text blocks, then a related row. */
export const DetailSkeleton = ({ label = "Loading..." }) => (
    <main className="page-content detail-skeleton" role="status" aria-busy="true" aria-live="polite">
        <span className="visually-hidden">{label}</span>
        <div className="detail-skeleton-body" aria-hidden="true">
            <div className="skeleton detail-skeleton-poster" />
            <div className="detail-skeleton-text">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-line tiny" />
                <div className="skeleton skeleton-line wide" />
                <div className="skeleton skeleton-line wide" />
                <div className="skeleton skeleton-line wide short" />
                <div className="skeleton-actions">
                    <div className="skeleton skeleton-button" />
                </div>
            </div>
        </div>
    </main>
);

/** Page-level placeholder that mirrors the home layout: hero copy + two card rows. */
export const HomeSkeleton = ({ label = "Loading..." }) => (
    <main className="home-skeleton" role="status" aria-busy="true" aria-live="polite">
        <span className="visually-hidden">{label}</span>
        <section className="home-skeleton-hero" aria-hidden="true">
            <div className="skeleton skeleton-line tiny" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line wide" />
            <div className="skeleton skeleton-line wide short" />
            <div className="skeleton-actions">
                <div className="skeleton skeleton-button" />
                <div className="skeleton skeleton-button pill" />
            </div>
        </section>
        <div className="home-skeleton-rows" aria-hidden="true">
            {[0, 1].map((row) => (
                <div key={row}>
                    <div className="skeleton skeleton-line tiny" />
                    <div className="skeleton skeleton-heading" />
                    <div className="skeleton-row">
                        {Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            ))}
        </div>
    </main>
);
