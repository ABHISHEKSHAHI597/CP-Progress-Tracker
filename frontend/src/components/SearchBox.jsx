/** Filters as you type. Escape or the cross clears it. */
function SearchBox({ value, onChange, placeholder = "Search by handle", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
        aria-hidden="true"
      >
        <circle cx="6" cy="6" r="4.25" />
        <path d="M9.2 9.2L12.5 12.5" strokeLinecap="round" />
      </svg>

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === "Escape" && onChange("")}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        spellCheck="false"
        className="w-full bg-ink-2 border border-line rounded-md pl-9 pr-9 py-2 text-[14px]
                   placeholder:text-faint focus:border-accent focus:outline-none transition-colors
                   [&::-webkit-search-cancel-button]:appearance-none"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded text-faint
                     hover:text-paper transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBox;
