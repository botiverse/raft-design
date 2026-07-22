/** Continuation gutter clock — 24h `HH:MM` (matches source `formatClock24`). */
export function playgroundGutterClock(createdAt: string): string {
  const match = createdAt.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return createdAt;
  let hours = Number(match[1]);
  const minutes = match[2]!;
  const period = match[3]?.toUpperCase();
  if (period === "AM") {
    if (hours === 12) hours = 0;
  } else if (period === "PM" && hours !== 12) {
    hours += 12;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}
