import { Link } from 'react-router-dom';
import RecipeGrid from '../components/RecipeGrid.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function Favorites() {
  const { favorites, clearFavorites } = useFavorites();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-stone-900">Your favorites</h1>
          <p className="mt-1 text-stone-600">
            {favorites.length
              ? `${favorites.length} saved recipe${favorites.length === 1 ? '' : 's'} — kept on this device.`
              : 'Recipes you save will show up here.'}
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            type="button"
            onClick={() => window.confirm('Remove all saved recipes?') && clearFavorites()}
            className="text-sm font-medium text-stone-500 hover:text-rose-600"
          >
            Clear all
          </button>
        )}
      </div>

      {favorites.length ? (
        <RecipeGrid meals={favorites} />
      ) : (
        <StatusMessage
          emoji="💛"
          title="No favorites yet"
          action={
            <Link to="/" className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white hover:bg-orange-700">
              Find something tasty
            </Link>
          }
        >
          Tap the heart on any recipe to save it for later.
        </StatusMessage>
      )}
    </div>
  );
}
