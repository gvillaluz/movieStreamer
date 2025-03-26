import './App.css'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import { Routes, Route } from 'react-router-dom'
import TvSeriesPage from './pages/TvSeriesPage'
import MoviePage from './pages/MoviePage'
import FavoritesPage from './pages/FavoritesPage'
import { SearchContext, SearchProvider } from './context/searchContext'
import { useContext } from 'react'
import DescriptionPage from './pages/DescriptionPage'

function App() {

  return (
    <>
      <SearchProvider>
        <NavBar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/movie' element={<MoviePage />} />
          <Route path='/series' element={<TvSeriesPage />} />
          <Route path='/favorites' element={<FavoritesPage />} />
          <Route path="*" element={<HomePage />} />
          <Route path="/:category/:id/:content" element={<DescriptionPage />} />
        </Routes>
      </SearchProvider>
    </>
  )
}

export default App
