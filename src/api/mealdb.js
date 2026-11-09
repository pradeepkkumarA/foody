import axios from 'axios';

// TheMealDB public API (free test key "1"): https://www.themealdb.com/api.php
const client = axios.create({
  baseURL: 'https://www.themealdb.com/api/json/v1/1',
  timeout: 15000,
});

// In-memory cache of in-flight/settled requests, so navigating back and forth
// (or several components asking for the same list) never re-fetches.
const cache = new Map();

function get(path, params = {}) {
  const key = `${path}?${new URLSearchParams(params)}`;
  if (!cache.has(key)) {
    const request = client
      .get(path, { params })
      .then((res) => res.data)
      .catch((err) => {
        cache.delete(key); // allow retry after a failure
        throw err;
      });
    cache.set(key, request);
  }
  return cache.get(key);
}

// The API returns { meals: null } (or occasionally a string) when nothing matches.
const mealsOf = (data) => (Array.isArray(data?.meals) ? data.meals : []);

/** All categories with image + description. */
export const getCategories = () => get('/categories.php').then((d) => d.categories ?? []);

/** All areas (cuisines), e.g. "Italian", "Japanese". */
export const getAreas = () =>
  get('/list.php', { a: 'list' }).then((d) =>
    mealsOf(d)
      .map((m) => m.strArea)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
  );

/** All ingredient names. */
export const getIngredients = () =>
  get('/list.php', { i: 'list' }).then((d) =>
    mealsOf(d)
      .map((m) => m.strIngredient?.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
  );

/** Filter endpoints return light objects: { idMeal, strMeal, strMealThumb }. */
export const filterByCategory = (category) => get('/filter.php', { c: category }).then(mealsOf);
export const filterByArea = (area) => get('/filter.php', { a: area }).then(mealsOf);
export const filterByIngredient = (ingredient) =>
  get('/filter.php', { i: ingredient.trim().toLowerCase().replace(/\s+/g, '_') }).then(mealsOf);

/** Full meal objects whose name matches the query. */
export const searchByName = (query) => get('/search.php', { s: query }).then(mealsOf);

export const getMealById = (id) => get('/lookup.php', { i: id }).then((d) => mealsOf(d)[0] ?? null);

/** Not cached – every call should give a new random meal. */
export const getRandomMeal = () =>
  client.get('/random.php').then((res) => mealsOf(res.data)[0] ?? null);

/**
 * Builds the full browsable catalogue by listing every category. Each meal
 * belongs to exactly one category, so this yields every meal once and lets us
 * show the category on each card without a lookup per meal.
 */
export async function getCatalog(categories) {
  const lists = await Promise.all(
    categories.map((c) =>
      filterByCategory(c.strCategory).then((meals) =>
        meals.map((m) => ({ ...m, strCategory: c.strCategory })),
      ),
    ),
  );
  const byId = new Map();
  lists.flat().forEach((m) => byId.set(m.idMeal, m));
  return [...byId.values()].sort((a, b) => a.strMeal.localeCompare(b.strMeal));
}

/** Turns strIngredient1..20 / strMeasure1..20 into [{ name, measure }]. */
export function parseIngredients(meal) {
  const items = [];
  for (let i = 1; i <= 20; i += 1) {
    const name = meal[`strIngredient${i}`]?.trim();
    if (name) items.push({ name, measure: meal[`strMeasure${i}`]?.trim() ?? '' });
  }
  return items;
}

/** Splits the instruction blob into readable steps. */
export function parseInstructions(text = '') {
  return text
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*(step\s*\d+[:.)]?|\d+[.)])\s*/i, '').trim())
    .filter((line) => line.length > 1);
}

/** Returns the YouTube video id from a watch URL, if any. */
export function youtubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1) || null;
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

export const ingredientImage = (name) =>
  `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}-Small.png`;

/** TheMealDB serves resized thumbnails at <url>/small|medium|large. */
export const thumb = (url, size = 'medium') => (url ? `${url}/${size}` : '');
