import { NO_FILTERS } from "../utils/filters";
import "./FilterBar.css";

/** Genre and sort pickers, placed on a page's title line. `filters` is { genre, sort }; "" means no filter. */
export const FilterBar = ({ genres, sorts, filters, onChange }) => {
    const active = filters.genre !== "" || filters.sort !== "";

    return (
        <div className="filter-bar" role="group" aria-label="Filters">
            <select className="filter-select" aria-label="Genre" value={filters.genre} onChange={(e) => onChange({ ...filters, genre: e.target.value })}>
                <option value="">All genres</option>
                {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
            </select>
            <select className="filter-select" aria-label="Sort by" value={filters.sort} onChange={(e) => onChange({ ...filters, sort: e.target.value })}>
                {sorts.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}
            </select>
            {active && (
                <button type="button" className="filter-clear" onClick={() => onChange(NO_FILTERS)}>
                    Clear filters
                </button>
            )}
        </div>
    );
};

const MEDIA_OPTIONS = [
    { value: "", label: "All" },
    { value: "movie", label: "Movies" },
    { value: "tv", label: "Series" },
];

/** All / Movies / Series switch (Home). `value` is "", "movie" or "tv". */
export const MediaToggle = ({ value, onChange }) => (
    <div className="media-toggle" role="group" aria-label="Show">
        {MEDIA_OPTIONS.map((option) => (
            <button
                key={option.value}
                type="button"
                className={value === option.value ? "active" : ""}
                aria-pressed={value === option.value}
                onClick={() => onChange(option.value)}
            >
                {option.label}
            </button>
        ))}
    </div>
);
