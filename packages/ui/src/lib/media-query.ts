/**
 * Read the browser media-query capability without making it a required global.
 * SSR, jsdom, and embedded hosts can expose `window` without `matchMedia`.
 */
export function getMediaQueryList(query: string): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }

  return window.matchMedia(query);
}

export function subscribeMediaQuery(query: string, onChange: () => void) {
  const media = getMediaQueryList(query);
  if (!media) return () => undefined;

  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function getMediaQueryMatches(query: string) {
  return getMediaQueryList(query)?.matches ?? false;
}
