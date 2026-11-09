import { useId, useMemo, useState } from 'react';
import { ingredientImage } from '../api/mealdb.js';
import { XIcon } from './Icons.jsx';

/** Autocomplete multi-select for ingredients. Selected items appear as chips. */
export default function IngredientPicker({ options, selected, onChange, disabled }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const listId = useId();

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const taken = new Set(selected.map((s) => s.toLowerCase()));
    const starts = [];
    const contains = [];
    for (const name of options) {
      const n = name.toLowerCase();
      if (taken.has(n)) continue;
      if (n.startsWith(q)) starts.push(name);
      else if (n.includes(q)) contains.push(name);
    }
    return [...starts, ...contains].slice(0, 8);
  }, [query, options, selected]);

  const add = (name) => {
    onChange([...selected, name]);
    setQuery('');
    setHighlight(0);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && suggestions[highlight]) {
      e.preventDefault();
      add(suggestions[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Backspace' && !query && selected.length) {
      onChange(selected.slice(0, -1));
    }
  };

  const showList = open && suggestions.length > 0;

  return (
    <div className="relative">
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2 py-1.5 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
        {selected.map((name) => (
          <span key={name} className="flex items-center gap-1 rounded-full bg-emerald-50 py-0.5 pl-2.5 pr-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
            {name}
            <button
              type="button"
              onClick={() => onChange(selected.filter((s) => s !== name))}
              aria-label={`Remove ingredient ${name}`}
              className="grid size-5 place-items-center rounded-full hover:bg-emerald-200"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={selected.length ? 'Add another…' : 'Type an ingredient, e.g. chicken'}
          aria-label="Filter by ingredient"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm focus:outline-none disabled:cursor-not-allowed"
        />
      </div>
      {showList && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
          {suggestions.map((name, i) => (
            <li
              key={name}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(name)}
              onMouseEnter={() => setHighlight(i)}
              className={`flex cursor-pointer items-center gap-3 px-3 py-1.5 text-sm ${i === highlight ? 'bg-orange-50 text-orange-800' : 'text-stone-700'}`}
            >
              <img src={ingredientImage(name)} alt="" className="size-7 object-contain" loading="lazy" />
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
