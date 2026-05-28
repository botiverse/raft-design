export const HTML_API_RESPONSE_MESSAGE =
  "The Slock server returned HTML instead of API JSON. This server URL may point at the web app instead of the backend API, or the required API routes may not be deployed yet.";

export async function readJsonResponse<T>(response: Response, fallback: string): Promise<T> {
  const raw = await response.text();
  if (responseLooksLikeHtml(response, raw)) {
    throw new Error(HTML_API_RESPONSE_MESSAGE);
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(fallback);
  }
}

export async function readJsonErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const raw = await response.text();
    if (responseLooksLikeHtml(response, raw)) {
      return HTML_API_RESPONSE_MESSAGE;
    }
    const payload = JSON.parse(raw) as { error?: string };
    return payload.error || fallback;
  } catch {
    return fallback;
  }
}

function responseLooksLikeHtml(response: Response, raw: string): boolean {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const trimmed = raw.trimStart().toLowerCase();
  return contentType.includes("text/html") || trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html");
}
