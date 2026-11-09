import RecipeCard from './RecipeCard.jsx';

export const gridClass = 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

export default function RecipeGrid({ meals }) {
  return (
    <div className={gridClass}>
      {meals.map((meal) => (
        <RecipeCard key={meal.idMeal} meal={meal} />
      ))}
    </div>
  );
}

export function RecipeGridSkeleton({ count = 8 }) {
  return (
    <div className={gridClass} aria-busy="true" aria-label="Loading recipes">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
          <div className="aspect-[4/3] animate-pulse bg-stone-200" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
