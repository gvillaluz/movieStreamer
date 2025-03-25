import axios from "axios";

const API_KEY = "2bf23a317267ca670ddf722b39a5dd69";
const API_URL = "https://api.themoviedb.org/3";

export const loadMovies = async () => {
    let movies = [];
    try {
        for (let i = 1; i <= 5; i++) {
            const response = await axios.get(`${API_URL}/movie/popular?api_key=${API_KEY}&page=${i}`);
            movies.push(...response.data.results);
        }
    } catch (err) {
        console.log(err);
    }

    console.log(movies);
    return movies;
}

export const loadSeries = async () => {
    let series = [];
    try {
        for (let i = 1; i <= 5; i++) {
            const response = await axios.get(`${API_URL}/tv/popular?api_key=${API_KEY}&page=${i}`);
            series.push(...response.data.results);
        }
        console.log(series);
        return series;
    } catch (err) {
        console.log(err);
    }
}

export const search = async (searchQuery, pathname) => {
    if (pathname === "/") pathname = "/multi"
    try {
        const response = await axios.get(`${API_URL}/search${pathname}?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`);
        console.log(response.data.results);
        return response.data.results;
    } catch (err) {
        alert(err);
    } 
}