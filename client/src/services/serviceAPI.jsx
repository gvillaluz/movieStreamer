import axios from "axios";

const API_KEY = "2bf23a317267ca670ddf722b39a5dd69";
const API_URL = "https://api.themoviedb.org/3";

const request = async (path, params = {}) => {
    const response = await axios.get(`${API_URL}${path}`, {
        params: {
            api_key: API_KEY,
            language: "en-US",
            ...params,
        },
    });

    return response.data;
};

const today = () => new Date().toISOString().slice(0, 10);

// Discover params for each sort ("" is the popular list). "newest" stops at today, so unreleased titles stay out.
const sortParams = (kind, sort) => {
    if (sort === "top_rated") return { sort_by: "vote_average.desc", "vote_count.gte": 300 };
    if (sort === "newest") {
        const date = kind === "tv" ? "first_air_date" : "primary_release_date";
        return { sort_by: `${date}.desc`, [`${date}.lte`]: today(), "vote_count.gte": 20 };
    }
    return { sort_by: "popularity.desc" };
};

/**
 * One TMDB page (20 titles) of popular movies/series, of search results when `query` is set,
 * or of a genre/sort filter. `type` is "movies" or "series".
 * Search can't filter on TMDB's side, so the caller applies genre and sort to search results itself.
 */
export const loadContentPage = async ({ type, query = "", genre = "", sort = "", page = 1 }) => {
    const kind = type === "series" ? "tv" : "movie";
    let path = `/${kind}/popular`;
    let params = { page };
    if (query) {
        path = `/search/${kind}`;
        params = { query, include_adult: false, page };
    } else if (genre || sort) {
        path = `/discover/${kind}`;
        params = { page, with_genres: genre || undefined, ...sortParams(kind, sort) };
    }

    try {
        const data = await request(path, params);
        return { results: data.results || [], totalPages: data.total_pages || 0 };
    } catch {
        throw new Error(query
            ? "Search is unavailable right now."
            : `Unable to load ${type === "series" ? "series" : "movies"} right now.`);
    }
};

export const search = async (searchQuery, pathname) => {
    const endpoint = pathname === "/movie"
        ? "/search/movie"
        : pathname === "/series"
            ? "/search/tv"
            : "/search/multi";

    try {
        const data = await request(endpoint, {
            query: searchQuery,
            include_adult: false,
            page: 1,
        });
        return data.results.filter((item) => item.media_type !== "person");
    } catch {
        throw new Error("Search is unavailable right now.");
    }
};

const NOT_TALK_OR_REALITY = "10764,10767"; // keep variety and talk shows out of the drama/anime rows

const kdramaRow = () => ["/discover/tv", { with_original_language: "ko", with_genres: "18", without_genres: NOT_TALK_OR_REALITY, sort_by: "popularity.desc", "vote_count.gte": 20 }];
const animeRow = () => ["/discover/tv", { with_original_language: "ja", with_genres: "16", without_genres: NOT_TALK_OR_REALITY, sort_by: "popularity.desc", "vote_count.gte": 20 }];
const comingSoonRow = () => ["/discover/movie", { "primary_release_date.gte": today(), sort_by: "popularity.desc", with_release_type: "2|3" }];
const movieGenreRow = (genre, minVotes = 200) => ["/discover/movie", { with_genres: genre, sort_by: "popularity.desc", "vote_count.gte": minVotes }];
const seriesGenreRow = (genre, minVotes = 100) => ["/discover/tv", { with_genres: genre, without_genres: NOT_TALK_OR_REALITY, sort_by: "popularity.desc", "vote_count.gte": minVotes }];

/** Home rows: key -> [TMDB path, params]. Each is one page (20 titles). */
const homeRows = () => ({
    trending: ["/trending/all/week"],
    trendingToday: ["/trending/all/day"],
    newMovies: ["/movie/now_playing"],
    newSeries: ["/tv/on_the_air"],
    kdramas: kdramaRow(),
    popularMovies: ["/movie/popular"],
    anime: animeRow(),
    topRatedMovies: ["/movie/top_rated"],
    popularSeries: ["/tv/popular"],
    actionMovies: movieGenreRow("28"),
    comedyMovies: movieGenreRow("35"),
    horrorMovies: movieGenreRow("27", 100),
    comingSoon: comingSoonRow(),
});

/** Movies page rows. The full popular list sits under them, so there's no "Popular" row here. */
const movieRows = () => ({
    top10: ["/trending/movie/week"],
    nowPlaying: ["/movie/now_playing"],
    topRated: ["/movie/top_rated"],
    comingSoon: comingSoonRow(),
    action: movieGenreRow("28"),
    comedy: movieGenreRow("35"),
    scifi: movieGenreRow("878"),
    horror: movieGenreRow("27", 100),
    drama: movieGenreRow("18"),
    thriller: movieGenreRow("53"),
    romance: movieGenreRow("10749", 100),
    animation: movieGenreRow("16", 100),
    family: movieGenreRow("10751", 100),
    crime: movieGenreRow("80"),
    documentary: movieGenreRow("99", 50),
});

/** TV Series page rows. The full popular list sits under them, so there's no "Popular" row here. */
const seriesRows = () => ({
    top10: ["/trending/tv/week"],
    onTheAir: ["/tv/on_the_air"],
    topRated: ["/tv/top_rated"],
    kdramas: kdramaRow(),
    anime: animeRow(),
    drama: seriesGenreRow("18"),
    comedy: seriesGenreRow("35"),
    crime: seriesGenreRow("80"),
    scifiFantasy: seriesGenreRow("10765"),
    actionAdventure: seriesGenreRow("10759"),
    mystery: seriesGenreRow("9648"),
    animation: seriesGenreRow("16"),
    documentary: seriesGenreRow("99", 30),
    family: seriesGenreRow("10751", 50),
});

/**
 * Fetches every row in parallel. A row that fails comes back as an empty list; `failed` names those rows
 * so callers can decide whether the page can still show.
 */
const loadRows = async (rows) => {
    const entries = Object.entries(rows);
    const results = await Promise.allSettled(entries.map(([, [path, params]]) => request(path, { page: 1, ...params })));

    const feed = {};
    const failed = new Set();
    entries.forEach(([key], i) => {
        const result = results[i];
        if (result.status === "rejected") failed.add(key);
        feed[key] = result.status === "fulfilled"
            ? (result.value.results ?? []).filter((item) => item.media_type !== "person")
            : [];
    });
    return { feed, failed };
};

/**
 * Everything the home page shows. Trending feeds the hero and the Top 10, so the page can't load without it;
 * any other row that fails just comes back empty.
 */
export const loadHomeContent = async () => {
    const { feed, failed } = await loadRows(homeRows());
    if (failed.has("trending")) throw new Error("Unable to load the home feed right now.");
    return feed;
};

/** The grouped rows on the Movies or TV Series page (`type` is "movies" or "series"). Fails only if every row does. */
export const loadBrowseContent = async (type) => {
    const rows = type === "series" ? seriesRows() : movieRows();
    const { feed, failed } = await loadRows(rows);
    if (failed.size === Object.keys(rows).length) {
        throw new Error(`Unable to load ${type === "series" ? "series" : "movies"} right now.`);
    }
    return feed;
};

export const searchById = async (id, category) => {
    if (!id) return null;
    
    try {
        const [data, video] = await Promise.all([
            request(`/${category}/${id}`),
            request(`/${category}/${id}/videos`),
        ]);
        const trailer = video.results.find(v => v.type === "Trailer" && v.site === "YouTube");

        const value = {
            data,
            trailer
        }
        
        return value;
    } catch {
        throw new Error("Unable to load this title right now.");
    }
}

export const getSimilarContent = async (category, id) =>  {
    const similar = await request(`/${category}/${id}/recommendations`);
    return similar.results ?? null;
}

export const getVideoById = async (id, category) => {
    try {
        return await request(`/${category}/${id}`);
    } catch {
        throw new Error("Unable to load video details right now.");
    }
}

export const getEpisodesBySeason = async (id, season) => {
    try {
        return await request(`/tv/${id}/season/${season}`);
    } catch {
        throw new Error("Unable to load episodes right now.");
    }
}