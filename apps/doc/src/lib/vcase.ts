/**
 * Makes a composition a vcase screenshot case (`apps/doc/vcase.config.mjs`):
 * `export const meta = vcase({ id: "ui.button.preview" })`, inside the file's
 * `@docs-source-strip` markers so readers never see it. vcase reads the object
 * from the source without running it, so every value must be a literal. It
 * finds the call by the name `vcase`, so this stands in for `@vcase/react`'s.
 */
export function vcase<const T extends { id: string }>(meta: T): T {
  return meta;
}
