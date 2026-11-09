import { Link } from 'react-router-dom';
import { thumb } from '../api/mealdb.js';
import FavoriteButton from './FavoriteButton.jsx';

export default function RecipeCard({ meal }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/recipe/${meal.idMeal}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
        <div className="aspect-[4/3] overflow-hidden bg-stone-100">
          <img
            src={thumb(meal.strMealThumb)}
            onError={(e) => {
              // Fall back to the original image if the resized one is missing.
              if (e.currentTarget.src !== meal.strMealThumb) e.currentTarget.src = meal.strMealThumb;
            }}
            alt={meal.strMeal}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {meal.strCategory && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                {meal.strCategory}
              </span>
            )}
            {meal.strArea && (
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                {meal.strArea}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 font-semibold leading-snug text-stone-900 group-hover:text-orange-700">
            {meal.strMeal}
          </h3>
        </div>
      </Link>
      <FavoriteButton meal={meal} className="absolute right-3 top-3" />
    </article>
  );
}
