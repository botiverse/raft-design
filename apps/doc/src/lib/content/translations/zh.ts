// Every Chinese translation, as written (i18n/zh/). Imported only by
// `loadTranslations("zh")` (pages.ts), so it is its own chunk: a reader of the
// English site never downloads it.
export default import.meta.glob<string>(
  [
    "../../../../../../i18n/zh/design/**/*.md",
    "../../../../../../i18n/zh/packages/ui/src/components/*/*.md",
  ],
  { query: "?raw", import: "default", eager: true },
);
