function Loader({ label = "Loading" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 py-24 text-mute"
    >
      <svg width="26" height="26" viewBox="0 0 26 26" style={{ animation: "spin 900ms linear infinite" }}>
        <circle cx="13" cy="13" r="11" fill="none" stroke="#262b33" strokeWidth="2.5" />
        <path d="M13 2a11 11 0 0 1 11 11" fill="none" stroke="#5d8dfa" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <span className="text-[13px]">{label}</span>
    </div>
  );
}

export default Loader;
