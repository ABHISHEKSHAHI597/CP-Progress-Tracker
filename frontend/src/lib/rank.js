/**
 * The Codeforces rank ladder, which is the colour system for this whole
 * interface. Bands follow the official rating cut-offs; Master and
 * International Master share a hue, as do the three Grandmaster tiers.
 */

export const TIERS = [
  { key: "unrated", label: "Unrated", min: null, max: null, color: "#5c626c" },
  { key: "newbie", label: "Newbie", min: 0, max: 1199, color: "#98a0ac" },
  { key: "pupil", label: "Pupil", min: 1200, max: 1399, color: "#45c17f" },
  { key: "specialist", label: "Specialist", min: 1400, max: 1599, color: "#35c2c2" },
  { key: "expert", label: "Expert", min: 1600, max: 1899, color: "#5d8dfa" },
  { key: "candidate", label: "Candidate Master", min: 1900, max: 2099, color: "#b07df0" },
  { key: "master", label: "Master", min: 2100, max: 2299, color: "#f2994a" },
  { key: "intmaster", label: "International Master", min: 2300, max: 2399, color: "#f2994a" },
  { key: "grandmaster", label: "Grandmaster", min: 2400, max: 2599, color: "#ff5f56" },
  { key: "intgrandmaster", label: "International Grandmaster", min: 2600, max: 2999, color: "#ff5f56" },
  { key: "legendary", label: "Legendary Grandmaster", min: 3000, max: Infinity, color: "#ff3b30" },
];

const UNRATED = TIERS[0];

/** Contiguous colour bands, used to paint the ladder and the chart. */
export const BANDS = [
  { from: 0, to: 1200, color: "#98a0ac" },
  { from: 1200, to: 1400, color: "#45c17f" },
  { from: 1400, to: 1600, color: "#35c2c2" },
  { from: 1600, to: 1900, color: "#5d8dfa" },
  { from: 1900, to: 2100, color: "#b07df0" },
  { from: 2100, to: 2400, color: "#f2994a" },
  { from: 2400, to: 3000, color: "#ff5f56" },
  { from: 3000, to: 3500, color: "#ff3b30" },
];

export const LADDER_MIN = 0;
export const LADDER_MAX = 3500;

export function tierOf(rating) {
  if (rating === null || rating === undefined || Number.isNaN(rating)) {
    return UNRATED;
  }

  return (
    TIERS.find(
      (tier) => tier.min !== null && rating >= tier.min && rating <= tier.max
    ) || UNRATED
  );
}

export function tierColor(rating) {
  return tierOf(rating).color;
}

/** Problem difficulties use the same scale, so chips read at a glance. */
export function problemColor(rating) {
  if (!rating) return "#5c626c";
  return tierColor(rating);
}

/** Position on the 800–3500 axis, clamped, as a percentage. */
export function ladderPercent(rating) {
  const clamped = Math.min(Math.max(rating || LADDER_MIN, LADDER_MIN), LADDER_MAX);
  return ((clamped - LADDER_MIN) / (LADDER_MAX - LADDER_MIN)) * 100;
}

export function formatRating(rating) {
  return rating || rating === 0 ? Math.round(rating) : "—";
}

/** "3 hours ago", "Yesterday", "12 Mar" — never a raw timestamp. */
export function relativeTime(value) {
  if (!value || value === "N/A") return "unknown";

  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return "unknown";

  const minutes = Math.floor((Date.now() - then.getTime()) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;

  return then.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
