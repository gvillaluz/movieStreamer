// TMDB genre ids. Movies and series use different lists; some ids (Comedy, Drama, ...) are shared.
export const MOVIE_GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 27, name: "Horror" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 53, name: "Thriller" },
];

export const TV_GENRES = [
    { id: 10759, name: "Action & Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 9648, name: "Mystery" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
];

// For pages that mix movies and series (Search, Favorites)
export const ALL_GENRES = [...MOVIE_GENRES, ...TV_GENRES.filter((tv) => !MOVIE_GENRES.some((movie) => movie.id === tv.id))]
    .sort((a, b) => a.name.localeCompare(b.name));

// Sort options. The "" option is each page's own order (popular list, best search match, date added).
const POPULAR = { value: "popular", label: "Most popular" };
const TOP_RATED = { value: "top_rated", label: "Top rated" };
const NEWEST = { value: "newest", label: "Newest" };

export const BROWSE_SORTS = [{ value: "", label: "Most popular" }, TOP_RATED, NEWEST];
export const listSorts = (defaultLabel) => [{ value: "", label: defaultLabel }, POPULAR, TOP_RATED, NEWEST];

export const NO_FILTERS = { genre: "", sort: "" };

/** "tv" or "movie". Rows from /tv endpoints have no media_type, only a `name`. */
export const mediaTypeOf = (item) =>
    item.media_type === "tv" || (!item.media_type && item.name && !item.title) ? "tv" : "movie";

/** TMDB numbers movies and series separately, so the same id can be two different titles. */
export const isSameTitle = (a, b) => String(a.id) === String(b.id) && mediaTypeOf(a) === mediaTypeOf(b);

const genreIdsOf = (item) => item.genre_ids || item.genres?.map((genre) => genre.id) || [];
const dateOf = (item) => item.release_date || item.first_air_date || "";

export const matchesGenre = (item, genre) => !genre || genreIdsOf(item).includes(Number(genre));

export const sortItems = (items, sort) => {
    if (sort === "popular") return [...items].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    if (sort === "top_rated") return [...items].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    if (sort === "newest") return [...items].sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
    return items;
};

/** Genre + sort done in the browser, for lists that are already loaded. */
export const applyFilters = (items, { genre, sort }) => sortItems(items.filter((item) => matchesGenre(item, genre)), sort);
