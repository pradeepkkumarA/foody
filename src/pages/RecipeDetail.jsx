import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getMealById, ingredientImage, parseIngredients, parseInstructions, youtubeId } from '../api/mealdb.js';
import FavoriteButton from '../components/FavoriteButton.jsx';
import { ArrowLeftIcon, ExternalIcon, PlayIcon } from '../components/Icons.jsx';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage.jsx';
import useAsync from '../hooks/useAsync.js';

export default function RecipeDetail() {
  const { id } = useParams();
  const { data: meal, loading, error, retry } = useAsync(() => getMealById(id), [id]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <BackButton />
      {error ? (
        <ErrorMessage onRetry={retry} />
      ) : loading ? (
        <DetailSkeleton />
      ) : !meal ? (
        <StatusMessage
          emoji="🔍"
          title="Recipe not found"
          action={
            <Link to="/" className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white hover:bg-orange-700">
              Browse recipes
            </Link>
          }
        >
          We couldn’t find a recipe with that id.
        </StatusMessage>
      ) : (
        <Recipe key={meal.idMeal} meal={meal} />
      )}
    </div>
  );
}

/** Goes back in history (keeping the user's search & filters), or home on a direct visit. */
function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.key !== 'default';
  return (
    <button
      type="button"
      onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}
      className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-200/60 hover:text-stone-900"
    >
      <ArrowLeftIcon className="size-4" />
      Back to recipes
    </button>
  );
}

function Recipe({ meal }) {
  const ingredients = parseIngredients(meal);
  const steps = parseInstructions(meal.strInstructions);
  const videoId = youtubeId(meal.strYoutube);
  const tags = meal.strTags?.split(',').map((t) => t.trim()).filter(Boolean) ?? [];
  const [checked, setChecked] = useState(() => new Set());

  const toggle = (i) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <article>
      {/* Header */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="aspect-square w-full rounded-3xl object-cover shadow-lg sm:aspect-[4/3] lg:aspect-square"
        />
        <div>
          <div className="flex flex-wrap gap-2">
            {meal.strCategory && (
              <Link
                to={`/?c=${encodeURIComponent(meal.strCategory)}`}
                className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 hover:bg-orange-200"
              >
                {meal.strCategory}
              </Link>
            )}
            {meal.strArea && (
              <Link
                to={`/?a=${encodeURIComponent(meal.strArea)}`}
                className="rounded-full bg-stone-200/70 px-3 py-1 text-sm font-medium text-stone-700 hover:bg-stone-300"
              >
                {meal.strArea} cuisine
              </Link>
            )}
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-stone-900 sm:text-5xl">{meal.strMeal}</h1>
          {tags.length > 0 && (
            <p className="mt-3 text-sm text-stone-500">
              {tags.map((t) => `#${t}`).join('  ')}
            </p>
          )}
          <dl className="mt-6 flex gap-8 text-sm">
            <div>
              <dt className="text-stone-500">Ingredients</dt>
              <dd className="text-2xl font-semibold text-stone-900">{ingredients.length}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Steps</dt>
              <dd className="text-2xl font-semibold text-stone-900">{steps.length}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <FavoriteButton meal={meal} variant="full" />
            {meal.strYoutube && (
              <a
                href={meal.strYoutube}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                <PlayIcon className="size-4" />
                Watch on YouTube
              </a>
            )}
            {meal.strSource && (
              <a
                href={meal.strSource}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-stone-400"
              >
                <ExternalIcon className="size-4" />
                Original source
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section aria-labelledby="ingredients-heading" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <h2 id="ingredients-heading" className="font-display text-2xl font-semibold text-stone-900">
              Ingredients
            </h2>
            <p className="mt-1 text-xs text-stone-500">Tap an ingredient to tick it off.</p>
            <ul className="mt-4 divide-y divide-stone-100">
              {ingredients.map(({ name, measure }, i) => (
                <li key={`${name}-${i}`}>
                  <label className="flex cursor-pointer items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked.has(i)}
                      onChange={() => toggle(i)}
                      className="size-4 shrink-0 accent-orange-600"
                    />
                    <img src={ingredientImage(name)} alt="" loading="lazy" className="size-10 shrink-0 object-contain" />
                    <span className={`flex-1 text-sm ${checked.has(i) ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                      <span className="font-medium">{name}</span>
                      {measure && <span className="block text-stone-500">{measure}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="space-y-10">
          <section aria-labelledby="instructions-heading">
            <h2 id="instructions-heading" className="font-display text-2xl font-semibold text-stone-900">
              Instructions
            </h2>
            <ol className="mt-5 space-y-5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-orange-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-stone-700">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {videoId && (
            <section aria-labelledby="video-heading">
              <h2 id="video-heading" className="font-display text-2xl font-semibold text-stone-900">
                Video
              </h2>
              <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-stone-900 shadow-sm">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                  title={`How to make ${meal.strMeal}`}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="size-full"
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading recipe" className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center">
      <div className="aspect-square animate-pulse rounded-3xl bg-stone-200" />
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded-full bg-stone-200" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200" />
      </div>
    </div>
  );
}
