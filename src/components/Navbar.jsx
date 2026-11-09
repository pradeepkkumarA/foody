import { Link, NavLink } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { HeartIcon } from './Icons.jsx';

const linkClass = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-orange-100 text-orange-700' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  }`;

export default function Navbar() {
  const { favorites } = useFavorites();
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-stone-900">
          <span aria-hidden>🍲</span>
          Foody
        </Link>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Recipes
          </NavLink>
          <NavLink to="/favorites" className={linkClass}>
            <HeartIcon className="size-4" />
            Favorites
            {favorites.length > 0 && (
              <span className="ml-0.5 rounded-full bg-orange-500 px-1.5 text-xs font-semibold text-white">
                {favorites.length}
              </span>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
