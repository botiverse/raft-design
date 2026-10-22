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
- Chinese follows the Raft app's catalog rules, which `check` enforces: a space between a Chinese character and a Latin letter or digit, and one `…` for an ellipsis.
- The language's own guide and glossary is in its folder: [zh/GLOSSARY.md](./zh/GLOSSARY.md).

## Keeping translations current

`sourceHash` is a hash of the English page the translation was made from: its text without the front matter, with every run of whitespace read as one space (so rewrapping a paragraph doesn't count as a change). `node scripts/i18n.mjs sync` writes it for a new translation. When the English text changes afterwards, the hashes stop matching:

- `node scripts/i18n.mjs check` (CI, and `pnpm check:docs`) fails, so a pull request that changes an English page brings its translations up to date too. After updating a translation, run `node scripts/i18n.mjs sync --mark <path>` to record that it matches again.
- Should a stale translation reach the site anyway, the translated page shows a note that the English page has changed, with a link to it.

A translation links to other pages with the English page's relative paths. The site resolves them to the page in the reader's language; on GitHub they point into `i18n/<language>/` and work only where that page is translated.
