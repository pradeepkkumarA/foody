# Foody 🍲

A recipe browser built with **React**, **Tailwind CSS** and **Axios**, powered by the free [TheMealDB API](https://www.themealdb.com/api.php).

## Features

- **Browse recipes**: a responsive grid of recipe cards showing the photo, name and category, with a "Show more" button for long lists.
- **Search** by name or keyword. A keyword also matches recipes that use it as an ingredient, so "salmon" finds *Salmon Teriyaki* and any other dish made with salmon.
- **Filters**:
  - **Category / meal type** (Breakfast, Starter, Side, Dessert, Seafood, Vegetarian, …) as quick chips
  - **Cuisine** (Italian, Japanese, Indian, …)
  - **Ingredients**: pick one or more with autocomplete. Recipes must contain *all* of them.
- **Search and filters combine** (AND). The active filters are shown as removable chips, and there's a "Clear all" button.
- **Recipe details page** (`/recipe/:id`): ingredients with measures and pictures (you can tick them off as you cook), numbered steps, category and cuisine links, tags, an embedded YouTube video and a link to the original source.
- **Easy return**: "Back to recipes" brings you back to the same search and filters. They are stored in the URL, so filtered views can also be bookmarked or shared.
- **Favorites**: tap the heart on any card or recipe. Favorites are saved in `localStorage`, stay after a reload, and have their own page.
- **Surprise me**: opens a random recipe.
- Loading skeletons, empty and error states (with retry), keyboard-friendly controls, and a mobile-first layout.

## Tech stack

| Concern  | Choice |
| -------- | ------ |
| UI       | React 19 + React Router 7 |
| Styling  | Tailwind CSS 4 |
| Requests | Axios (with an in-memory response cache) |
| Build    | Vite |

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

The app uses client-side routing. When you deploy to a static host, send unknown paths to `index.html`. `public/_redirects` (Netlify) and `vercel.json` (Vercel) already do this.

## How search & filtering works

TheMealDB's free API filters by only **one** value per request and returns only id, name and thumbnail from its filter endpoints. To combine filters:

1. On load, the app requests `categories.php` and then `filter.php?c=<category>` for each category. Together these give the full catalogue, with every meal's category, in about 14 small requests.
2. Category and name/keyword matching happen in the browser on that catalogue, so they are instant.
3. Cuisine (`filter.php?a=`) and each selected ingredient (`filter.php?i=`) are fetched as sets of ids and intersected with the catalogue.
4. Keyword search also runs a debounced `filter.php?i=<keyword>`, so the search box finds dishes by ingredient too.

Each response is cached for the session, so going back and forth never fetches the same thing twice.

## Project structure

```
src/
  api/mealdb.js            Axios client, endpoints, response parsing helpers
  context/FavoritesContext Favorites state persisted to localStorage
  hooks/                   useAsync (request state + retry), useDebounce
  components/              Navbar, RecipeCard/Grid, SearchBar, CategoryChips,
                           IngredientPicker, FavoriteButton, status messages
  pages/                   Home, RecipeDetail, Favorites, NotFound
```
