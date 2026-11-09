const chip = (active) =>
  `flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm font-medium transition-colors ${
    active
      ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
      : 'border-stone-200 bg-white text-stone-700 hover:border-orange-300 hover:text-orange-700'
  }`;

/** Horizontally scrollable category (meal type) selector. */
export default function CategoryChips({ categories, value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Category" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <button type="button" role="radio" aria-checked={!value} onClick={() => onChange('')} className={`${chip(!value)} pl-3.5`}>
        All
      </button>
      {categories.map((c) => {
        const active = value === c.strCategory;
        return (
          <button
            key={c.idCategory}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? '' : c.strCategory)}
            className={chip(active)}
          >
            <img src={c.strCategoryThumb} alt="" className="size-7 rounded-full bg-white object-cover" />
            {c.strCategory}
          </button>
        );
      })}
    </div>
  );
}
