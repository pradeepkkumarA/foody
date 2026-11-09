import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'foody:favorites';
const FavoritesContext = createContext(null);

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Only the fields a card needs are stored, keeping localStorage small.
const summarize = ({ idMeal, strMeal, strMealThumb, strCategory, strArea }) => ({
  idMeal,
  strMeal,
  strMealThumb,
  strCategory: strCategory ?? null,
  strArea: strArea ?? null,
});

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      /* storage full or unavailable – favorites still work for this session */
    }
  }, [favorites]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (e) => e.key === STORAGE_KEY && setFavorites(load());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isFavorite = useCallback((id) => favorites.some((f) => f.idMeal === id), [favorites]);

  const toggleFavorite = useCallback((meal) => {
    setFavorites((prev) =>
      prev.some((f) => f.idMeal === meal.idMeal)
        ? prev.filter((f) => f.idMeal !== meal.idMeal)
        : [summarize(meal), ...prev],
    );
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, clearFavorites }),
    [favorites, isFavorite, toggleFavorite, clearFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
}
