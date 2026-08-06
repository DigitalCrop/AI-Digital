import { forwardRef, memo } from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = forwardRef(function SearchBar(
  { value, onChange, placeholder = 'Search tasks…' },
  ref
) {
  return (
    <div className="relative w-full max-w-md">
      <FiSearch
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10"
        aria-label="Search tasks by title"
      />
    </div>
  );
});

export default memo(SearchBar);
