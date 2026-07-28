import type { MarkdownReference } from "./markdown-reference.types.ts";

/** Encodes a reference into the `dataMarkdownReference` anchor attribute. */
export function serializeMarkdownReference(reference: MarkdownReference) {
  const params = new URLSearchParams();
  params.set("kind", reference.kind);

  if (reference.kind === "task") {
    params.set("number", reference.number);
  } else {
    params.set("name", reference.name);
    if (reference.kind === "channel" && reference.shortId) {
      params.set("shortId", reference.shortId);
    }
  }

  return params.toString();
}
