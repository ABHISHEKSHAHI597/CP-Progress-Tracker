/** True when the query is empty or appears in the handle. */
export function matchesQuery(user, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return String(user.handle ?? "").toLowerCase().includes(needle);
}
