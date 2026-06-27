import './App.css'
import NavBar from './components/NavBar'
import HomePage from './pages/Home/HomePage'
import { Routes, Route, useLocation } from 'react-router-dom'
import TvSeriesPage from './pages/Series/TvSeriesPage'
import MoviePage from './pages/Movie/MoviePage'
import FavoritesPage from './pages/Favorites/FavoritesPage'
import { SearchContext, SearchProvider } from './context/searchContext'
import { useContext } from 'react'
import DescriptionPage from './pages/Description/DescriptionPage'
import WatchPage from './pages/Watch/WatchPage'

function App() {
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch');
  return (
    <>
      <SearchProvider>
        {!isWatchPage && <NavBar />}
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/movie' element={<MoviePage />} />
          <Route path='/series' element={<TvSeriesPage />} />
          <Route path='/favorites' element={<FavoritesPage />} />
          <Route path="*" element={<HomePage />} />
          <Route path="/:category/:id/:content" element={<DescriptionPage />} />
          <Route path='/watch/:category/:id' element={<WatchPage />} />
        </Routes>
      </SearchProvider>
    </>
  )
}

export default App
