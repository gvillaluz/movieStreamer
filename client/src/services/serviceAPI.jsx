import axios from "axios";

const API_KEY = "2bf23a317267ca670ddf722b39a5dd69";
const API_URL = "https://api.themoviedb.org/3";

const API_ORG_URL = "https://archive.org/advancedsearch.php";

const embedUrl = `https://vidsrc.me/embed/movie`;

export const loadMovies = async () => {
    let movies = [];
    try {
        for (let i = 1; i <= 5; i++) {
            const response = await axios.get(`${API_URL}/movie/popular?api_key=${API_KEY}&page=${i}`);
            movies.push(...response.data.results);
        }
        console.log(movies)
    } catch (err) {
        console.log(err);
        return null;
    }

    return movies;
}

export const loadSeries = async () => {
    let series = [];
    try {
        for (let i = 1; i <= 5; i++) {
            const response = await axios.get(`${API_URL}/tv/popular?api_key=${API_KEY}&page=${i}`);
            series.push(...response.data.results);
        }
        return series;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export const search = async (searchQuery, pathname) => {
    if (pathname === "/" && pathname !== "/movie" && pathname !== "series") {
        pathname = "/multi";
    } else if (pathname === "/series") {
        pathname = "/tv";
    }
    
    try {
        const response = await axios.get(`${API_URL}/search${pathname}?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`);
        return response.data.results;
    } catch (err) {
        alert(err);
        return null;
    } 
}

export const searchById = async (id, category) => {
    if (!id) return null;
    
    try {
        const response = await axios.get(`${API_URL}/${category}/${id}?api_key=${API_KEY}`);
        const video = await axios.get(`${API_URL}/${category}/${id}/videos?api_key=${API_KEY}`);
        const trailer = video.data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
        const data = response.data;

        const value = {
            data,
            trailer
        }
        
        return value;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export const getSimilarContent = async (category, genres) =>  {
    const similar = await axios.get(`${API_URL}/discover/${category}?api_key=${API_KEY}&with_genres=${genres}`);

    return similar.data.results ?? null;
}

export const getVideoById = async (id, category) => {
    try {
        const data = await axios.get(`${API_URL}/${category}/${id}?api_key=${API_KEY}`);

        return data.data;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const getEpisodesBySeason = async (id, season) => {
    try {
        const data = await axios.get(`${API_URL}/tv/${id}/season/${season}?api_key=${API_KEY}`);

        return data.data;
    } catch (e) {
        console.log(e);
        return null;
    }
}