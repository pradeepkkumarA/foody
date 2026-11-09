import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  filterByArea,
  filterByIngredient,
  getAreas,
  getCatalog,
  getCategories,
  getIngredients,
  getRandomMeal,
} from '../api/mealdb.js';
import CategoryChips from '../components/CategoryChips.jsx';
import { ShuffleIcon, XIcon } from '../components/Icons.jsx';
import IngredientPicker from '../components/IngredientPicker.jsx';
import RecipeGrid, { RecipeGridSkeleton } from '../components/RecipeGrid.jsx';
import SearchBar from '../components/SearchBar.jsx';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage.jsx';
import useAsync from '../hooks/useAsync.js';
import useDebounce from '../hooks/useDebounce.js';

const PAGE_SIZE = 24;
const idSet = (meals) => new Set(meals.map((m) => m.idMeal));

export default function Home() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // All search/filter state lives in the URL so it survives visiting a recipe
  // and coming back, and so a filtered view can be bookmarked or shared.
  const query = params.get('q') ?? '';
  const category = params.get('c') ?? '';
  const area = params.get('a') ?? '';
  const ingredients = params.getAll('i');

  const update = (changes) => {
    // Start from the live URL rather than `params`: two quick changes (e.g. a
    // click followed by typing) can happen before React re-renders, and the
    // second one would otherwise undo the first.
    const next = new URLSearchParams(window.location.search);
    Object.entries(changes).forEach(([key, value]) => {
      next.delete(key);
      [].concat(value).filter(Boolean).forEach((v) => next.append(key, v));
    });
    setParams(next, { replace: true });
  };
  const clearAll = () => setParams({}, { replace: true });

  // ---- Reference data -----------------------------------------------------
  const categoriesReq = useAsync(getCategories, []);
  const areasReq = useAsync(getAreas, []);
  const ingredientsReq = useAsync(getIngredients, []);
  const categories = categoriesReq.data;
  const catalogReq = useAsync(() => getCatalog(categories), [categories], !!categories);

  // ---- Server-side filters (TheMealDB filters by one value per request) ---
  const areaReq = useAsync(() => filterByArea(area), [area], !!area);
  const ingredientKey = ingredients.join('|');
  const ingredientReq = useAsync(
    () => Promise.all(ingredients.map(filterByIngredient)).then((lists) => lists.map(idSet)),
    [ingredientKey],
    ingredients.length > 0,
  );

  // Keyword search: besides matching names, a term like "salmon" also finds
  // recipes that use it as an ingredient.
  const keyword = useDebounce(query.trim().toLowerCase(), 400);
  const keywordReq = useAsync(
    () => filterByIngredient(keyword).then((meals) => ({ keyword, ids: idSet(meals) })),
    [keyword],
    keyword.length >= 3,
  );

  // ---- Combine everything (AND between filters) ---------------------------
  const results = useMemo(() => {
    if (!catalogReq.data) return [];
    const q = query.trim().toLowerCase();
    const areaIds = areaReq.data ? idSet(areaReq.data) : null;
    const ingredientSets = ingredientReq.data ?? [];
    const keywordIds = keywordReq.data?.keyword === q ? keywordReq.data.ids : null;

    return catalogReq.data
      .filter((m) => !category || m.strCategory === category)
      .filter((m) => !areaIds || areaIds.has(m.idMeal))
      .filter((m) => ingredientSets.every((s) => s.has(m.idMeal)))
      .filter(
        (m) =>
          !q ||
          m.strMeal.toLowerCase().includes(q) ||
          m.strCategory.toLowerCase().includes(q) ||
          keywordIds?.has(m.idMeal),
      )
      .map((m) => (area ? { ...m, strArea: area } : m));
  }, [catalogReq.data, query, keywordReq.data, category, area, areaReq.data, ingredientReq.data]);

  // ---- Pagination (resets whenever the result set changes) ----------------
  const filterKey = [query, category, area, ingredientKey].join('§');
  const [page, setPage] = useState({ key: filterKey, count: PAGE_SIZE });
  const visibleCount = page.key === filterKey ? page.count : PAGE_SIZE;
  const visible = results.slice(0, visibleCount);

  // ---- Random recipe --------------------------------------------------------
  const [randomLoading, setRandomLoading] = useState(false);
  const surpriseMe = async () => {
    setRandomLoading(true);
    try {
      const meal = await getRandomMeal();
      if (meal) navigate(`/recipe/${meal.idMeal}`);
    } catch {
      /* ignore – button simply re-enables */
    } finally {
      setRandomLoading(false);
    }
  };

  const error = categoriesReq.error || catalogReq.error || areaReq.error || ingredientReq.error;
  const loading =
    !error &&
    (categoriesReq.loading ||
      catalogReq.loading ||
      areaReq.loading ||
      ingredientReq.loading ||
      !catalogReq.data ||
      (area && !areaReq.data) ||
      (ingredients.length > 0 && !ingredientReq.data));
  const retry = () => [categoriesReq, catalogReq, areaReq, ingredientReq].forEach((r) => r.error && r.retry());
  const hasFilters = Boolean(query || category || area || ingredients.length);

  return (
    <>
      {/* Hero + search */}
      <section className="bg-gradient-to-b from-orange-100 via-amber-50 to-stone-50">
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-12 text-center sm:pt-16">
          <h1 className="font-display text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            What are we cooking today?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">
            Browse hundreds of recipes from around the world. Search by name, then narrow it down by category, cuisine
            or the ingredients you have.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar value={query} onChange={(q) => update({ q })} />
          </div>
          <button
            type="button"
            onClick={surpriseMe}
            disabled={randomLoading}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-700 hover:text-orange-800 disabled:opacity-60"
          >
            <ShuffleIcon className="size-4" />
            {randomLoading ? 'Picking a recipe…' : 'Feeling lucky? Surprise me'}
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Filters */}
        <section aria-label="Filters" className="space-y-4">
          {categories && <CategoryChips categories={categories} value={category} onChange={(c) => update({ c })} />}

          <div className="grid gap-3 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Cuisine</span>
              <select
                value={area}
                onChange={(e) => update({ a: e.target.value })}
                disabled={!areasReq.data}
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">All cuisines</option>
                {areasReq.data?.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Ingredients <span className="font-normal normal-case tracking-normal">(recipes must use all of them)</span>
              </span>
              <IngredientPicker
                options={ingredientsReq.data ?? []}
                selected={ingredients}
                onChange={(i) => update({ i })}
                disabled={!ingredientsReq.data}
              />
            </div>
          </div>
        </section>

        {/* Result summary */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <h2 className="font-display text-2xl font-semibold text-stone-900">
            {hasFilters ? 'Matching recipes' : 'All recipes'}
            {!loading && !error && (
              <span className="ml-2 align-middle font-sans text-base font-normal text-stone-500">
                ({results.length})
              </span>
            )}
          </h2>
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {query && <ActiveFilter label={`“${query}”`} onRemove={() => update({ q: '' })} />}
              {category && <ActiveFilter label={category} onRemove={() => update({ c: '' })} />}
              {area && <ActiveFilter label={area} onRemove={() => update({ a: '' })} />}
              {ingredients.map((name) => (
                <ActiveFilter key={name} label={name} onRemove={() => update({ i: ingredients.filter((x) => x !== name) })} />
              ))}
              <button type="button" onClick={clearAll} className="font-medium text-orange-700 hover:underline">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <section className="mt-6" aria-live="polite">
          {error ? (
            <ErrorMessage onRetry={retry} />
          ) : loading ? (
            <RecipeGridSkeleton />
          ) : results.length === 0 ? (
            <StatusMessage
              emoji="🥄"
              title="No recipes found"
              action={
                <button type="button" onClick={clearAll} className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white hover:bg-orange-700">
                  Clear filters
                </button>
              }
            >
              Nothing matches all of your filters. Try removing one or searching for something else.
            </StatusMessage>
          ) : (
            <>
              <RecipeGrid meals={visible} />
              {visible.length < results.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setPage({ key: filterKey, count: visibleCount + PAGE_SIZE })}
                    className="rounded-full border border-stone-300 bg-white px-6 py-2.5 font-semibold text-stone-700 shadow-sm hover:border-orange-400 hover:text-orange-700"
                  >
                    Show more recipes
                  </button>
                  <p className="mt-2 text-sm text-stone-500">
                    Showing {visible.length} of {results.length}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}

function ActiveFilter({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/70 py-0.5 pl-3 pr-1 text-stone-700">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove filter ${label}`} className="grid size-5 place-items-center rounded-full hover:bg-stone-300">
        <XIcon className="size-3" />
      </button>
    </span>
  );
}
