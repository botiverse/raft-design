import { stripSourceCodeBlocks } from "./source-code.ts";

export function createCompositionSourceMap<const T extends Record<string, string>>(sources: T) {
  return Object.fromEntries(
    Object.entries(sources).map(([key, source]) => [key, stripSourceCodeBlocks(source)]),
  ) as T;
}

export function createCompositionSnippetMap<const T extends Record<string, string>>(
  sources: T,
  snippetIds: { readonly [K in keyof T]: string },
) {
  return Object.fromEntries(
    Object.keys(sources).map((key) => [snippetIds[key as keyof T], sources[key as keyof T]]),
  ) as Record<string, string>;
}
