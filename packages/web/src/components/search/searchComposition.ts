export function getCommittedSearchQuery(query: string, isComposing: boolean): string | null {
  if (isComposing) {
    return null;
  }

  const trimmed = query.trim();
  return trimmed ? trimmed : null;
}
