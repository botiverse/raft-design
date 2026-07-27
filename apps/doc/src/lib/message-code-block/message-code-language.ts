const MESSAGE_CODE_LANGUAGE_ALIASES = {
  bash: "bash",
  css: "css",
  html: "html",
  js: "javascript",
  javascript: "javascript",
  json: "json",
  jsx: "jsx",
  md: "markdown",
  markdown: "markdown",
  sh: "bash",
  shell: "bash",
  ts: "typescript",
  tsx: "tsx",
  typescript: "typescript",
} as const;

export type MessageCodeLanguage =
  (typeof MESSAGE_CODE_LANGUAGE_ALIASES)[keyof typeof MESSAGE_CODE_LANGUAGE_ALIASES];

export function normalizeMessageCodeLanguage(
  language: string | null | undefined,
): MessageCodeLanguage | null {
  if (!language) return null;
  return (
    MESSAGE_CODE_LANGUAGE_ALIASES[
      language.toLocaleLowerCase() as keyof typeof MESSAGE_CODE_LANGUAGE_ALIASES
    ] ?? null
  );
}

export function supportsMessageCodeLanguage(language: string | null | undefined) {
  return normalizeMessageCodeLanguage(language) !== null;
}
