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

export const loadMovies = async () => {
    try {
        const pages = await Promise.all([
            request("/movie/popular", { page: 1 }),
            request("/movie/popular", { page: 2 }),
        ]);
        return pages.flatMap((page) => page.results);
    } catch {
        throw new Error("Unable to load movies right now.");
    }
};

export const loadSeries = async () => {
    try {
        const pages = await Promise.all([
            request("/tv/popular", { page: 1 }),
            request("/tv/popular", { page: 2 }),
        ]);
        return pages.flatMap((page) => page.results);
    } catch {
        throw new Error("Unable to load series right now.");
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

export const loadHomeContent = async () => {
    try {
        const [trending, newMovies, newSeries, popularMovies, popularSeries] = await Promise.all([
            request("/trending/all/week"),
            request("/movie/now_playing", { page: 1 }),
            request("/tv/on_the_air", { page: 1 }),
            request("/movie/popular", { page: 1 }),
            request("/tv/popular", { page: 1 }),
        ]);

        return {
            trending: trending.results.filter((item) => item.media_type !== "person"),
            newMovies: newMovies.results,
            newSeries: newSeries.results,
            popularMovies: popularMovies.results,
            popularSeries: popularSeries.results,
        };
    } catch {
        throw new Error("Unable to load the home feed right now.");
    }
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