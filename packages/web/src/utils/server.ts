/**
 * Derive the server URL for machine connections.
 */
export function getServerUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Dev mode: vite on :5173, server on :3001
  const origin = window.location.origin;
  if (origin.includes(":5173")) {
    return origin.replace(":5173", ":3001");
  }
  return origin;
}
