/** True when the query is empty or appears in the handle, rank or Codeforces id. */
export function matchesQuery(user, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return [user.handle, user.rank, user.cfId]
    .filter((field) => field != null)
    .some((field) => String(field).toLowerCase().includes(needle));
}
