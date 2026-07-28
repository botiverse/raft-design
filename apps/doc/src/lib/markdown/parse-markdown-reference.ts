import type { MarkdownReference } from "./markdown-reference.types.ts";

/** Decodes the `dataMarkdownReference` attribute a node override reads off its anchor. */
export function parseMarkdownReference(marker: unknown): MarkdownReference | undefined {
  if (typeof marker !== "string") return undefined;

  const params = new URLSearchParams(marker);
  const kind = params.get("kind");

  if (kind === "task") {
    const number = params.get("number");
    return number ? { kind, number } : undefined;
  }

  if (kind === "mention") {
    const name = params.get("name");
    return name ? { kind, name } : undefined;
  }

  if (kind === "channel") {
    const name = params.get("name");
    return name ? { kind, name, shortId: params.get("shortId") ?? undefined } : undefined;
  }

  return undefined;
}
