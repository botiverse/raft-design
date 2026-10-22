# Translations

The documentation is written in English, in `design/` and `packages/ui/src/components/`. A translation lives here, one folder per language, mirroring the path of the page it translates:

| English | Chinese |
| --- | --- |
| `design/foundations/color.md` | `i18n/zh/design/foundations/color.md` |
| `packages/ui/src/components/button/button.md` | `i18n/zh/packages/ui/src/components/button/button.md` |

The site serves the English page at its usual URL and the translation under the language's prefix: `/foundations/color` and `/zh/foundations/color`. A page that is not translated yet shows the English text under `/zh/`, with a note saying so.

## Writing a translation

- Front matter holds `title`, `summary` and `sourceHash`. Everything else (`order`, `status`, `related` and so on) comes from the English page.
- Keep the headings, in the same number, depth and order as the English page. `node scripts/i18n.mjs sync` gives each one the English page's anchor (`## 颜色的含义 {#meanings-of-color}`), so links between pages and shared URLs work in both languages.
- Keep links as the English page writes them: relative paths to the English Markdown files. The site resolves them to the page in the reader's language.
- Leave code, `example` and `tokens` blocks, token names and component names as they are.
- The language's own guide and glossary is in its folder: [zh/GLOSSARY.md](./zh/GLOSSARY.md).

## Keeping translations current

`sourceHash` is a hash of the English file the translation was made from. `node scripts/i18n.mjs sync` writes it for a new translation; when the English page changes afterwards, the hashes stop matching:

- the site shows a note on the translated page that the English page has changed, with a link to it;
- `node scripts/i18n.mjs check` (run by CI) lists the stale translations as warnings, and fails on a translation whose English page is gone or whose headings no longer match.

After bringing a translation up to date, run `node scripts/i18n.mjs sync --mark <path>` to record that it now matches.
