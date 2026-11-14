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

/**
 * One TMDB page (20 titles) of popular movies/series, or of search results when `query` is set.
 * `type` is "movies" or "series".
 */
export const loadContentPage = async ({ type, query = "", page = 1 }) => {
    const kind = type === "series" ? "tv" : "movie";
    const path = query ? `/search/${kind}` : `/${kind}/popular`;

    try {
        const data = await request(path, query ? { query, include_adult: false, page } : { page });
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

const today = () => new Date().toISOString().slice(0, 10);
const NOT_TALK_OR_REALITY = "10764,10767"; // keep variety and talk shows out of the drama/anime rows

/** Home rows: key -> [TMDB path, params]. Each is one page (20 titles). */
const homeRows = () => ({
    newMovies: ["/movie/now_playing"],
    newSeries: ["/tv/on_the_air"],
    kdramas: ["/discover/tv", { with_original_language: "ko", with_genres: "18", without_genres: NOT_TALK_OR_REALITY, sort_by: "popularity.desc", "vote_count.gte": 20 }],
    popularMovies: ["/movie/popular"],
    anime: ["/discover/tv", { with_original_language: "ja", with_genres: "16", without_genres: NOT_TALK_OR_REALITY, sort_by: "popularity.desc", "vote_count.gte": 20 }],
    topRatedMovies: ["/movie/top_rated"],
    popularSeries: ["/tv/popular"],
    actionMovies: ["/discover/movie", { with_genres: "28", sort_by: "popularity.desc", "vote_count.gte": 200 }],
    comedyMovies: ["/discover/movie", { with_genres: "35", sort_by: "popularity.desc", "vote_count.gte": 200 }],
    horrorMovies: ["/discover/movie", { with_genres: "27", sort_by: "popularity.desc", "vote_count.gte": 100 }],
    comingSoon: ["/discover/movie", { "primary_release_date.gte": today(), sort_by: "popularity.desc", with_release_type: "2|3" }],
});

/**
 * Everything the home page shows. Trending feeds the hero, so the page can't load without it;
 * any other row that fails just comes back empty.
 */
export const loadHomeContent = async () => {
    const rows = Object.entries(homeRows());
    const [trending, ...results] = await Promise.allSettled([
        request("/trending/all/week"),
        ...rows.map(([, [path, params]]) => request(path, { page: 1, ...params })),
    ]);

    if (trending.status === "rejected") throw new Error("Unable to load the home feed right now.");

    const feed = { trending: trending.value.results.filter((item) => item.media_type !== "person") };
    rows.forEach(([key], i) => {
        feed[key] = results[i].status === "fulfilled" ? results[i].value.results ?? [] : [];
    });
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