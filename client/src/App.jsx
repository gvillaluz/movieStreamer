import './App.css'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import { Routes, Route } from 'react-router-dom'
import TvSeriesPage from './pages/TvSeriesPage'
import MoviePage from './pages/MoviePage'
import FavoritesPage from './pages/FavoritesPage'
import { SearchProvider } from './context/searchContext'

function App() {

  return (
    <>
      <SearchProvider>
        <NavBar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/movie' element={<MoviePage />} />
          <Route path='/tv' element={<TvSeriesPage />} />
          <Route path='/favorites' element={<FavoritesPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </SearchProvider>
    </>
  )
}

export default App
