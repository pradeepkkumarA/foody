import { SearchIcon, XIcon } from './Icons.jsx';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search recipes, e.g. curry or salmon"
        aria-label="Search recipes"
        className="w-full rounded-full border-0 bg-white py-3.5 pl-12 pr-12 text-base shadow-md ring-1 ring-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
