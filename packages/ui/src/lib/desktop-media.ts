/**
 * Where the desktop layout and its metrics begin: from 768px, with a mouse or
 * a trackpad (design/foundations/spacing.md#hit-targets). The same query as
 * the desktop blocks in styles.css and foundation.css, for code that has to
 * decide in JavaScript what CSS decides with `md:pointer-fine:`.
 */
export const DESKTOP_MEDIA_QUERY = "(width >= 48rem) and (pointer: fine)";
