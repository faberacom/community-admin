export function isStale(
  lastFetchedAt: number | null,
  staleTime: number,
): boolean {
  if (!lastFetchedAt) return true;
  return Date.now() - lastFetchedAt > staleTime;
}
