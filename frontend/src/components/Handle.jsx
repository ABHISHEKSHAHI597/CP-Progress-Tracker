import { tierOf } from "../lib/rank";

/**
 * A handle is an identifier, so it is set in mono and coloured by tier —
 * the same way competitive programmers already read handles everywhere else.
 * Legendary Grandmasters keep the traditional light first character.
 */
function Handle({ handle, rating, className = "", link = true }) {
  const tier = tierOf(rating);
  const legendary = tier.key === "legendary";

  const label = legendary ? (
    <>
      <span className="text-paper">{handle.slice(0, 1)}</span>
      {handle.slice(1)}
    </>
  ) : (
    handle
  );

  const body = (
    <span
      className={`font-mono font-medium tracking-tight ${className}`}
      style={{ color: tier.color }}
    >
      {label}
    </span>
  );

  if (!link) return body;

  return (
    <a
      href={`https://codeforces.com/profile/${handle}`}
      target="_blank"
      rel="noreferrer"
      title={`${handle} on Codeforces`}
      className="hover:underline underline-offset-4 decoration-from-font"
    >
      {body}
    </a>
  );
}

export default Handle;
