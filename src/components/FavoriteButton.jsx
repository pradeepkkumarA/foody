import { useFavorites } from '../context/FavoritesContext.jsx';
import { HeartIcon } from './Icons.jsx';

export default function FavoriteButton({ meal, variant = 'icon', className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(meal.idMeal);
  const label = active ? `Remove ${meal.strMeal} from favorites` : `Add ${meal.strMeal} to favorites`;

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(meal);
  };

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          active
            ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
            : 'border-stone-300 bg-white text-stone-700 hover:border-rose-300 hover:text-rose-600'
        } ${className}`}
      >
        <HeartIcon filled={active} className="size-4" />
        {active ? 'Saved to favorites' : 'Save to favorites'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      className={`grid size-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 ${
        active ? 'text-rose-500' : 'text-stone-500 hover:text-rose-500'
      } ${className}`}
    >
      <HeartIcon filled={active} className="size-5" />
    </button>
  );
}
