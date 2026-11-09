import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Home from './pages/Home.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import Favorites from './pages/Favorites.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500">
        Recipe data from{' '}
        <a href="https://www.themealdb.com" target="_blank" rel="noreferrer" className="font-medium text-orange-600 hover:underline">
          TheMealDB
        </a>
      </footer>
    </div>
  );
}
