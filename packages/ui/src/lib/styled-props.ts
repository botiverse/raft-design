import type { CSSProperties } from "react";

/**
 * Base UI components type `className` as `string | ((state) => string)`, but our
 * tv() recipes only accept a plain string. `StyledProps` narrows a Base UI
 * component's props to a string `className` so they can flow into a recipe.
 *
 * The state-callback form is intentionally dropped: our components express every
 * state through `data-*` variants in the recipe, so a caller never needs it.
 */
export type StyledProps<P> = Omit<P, "className" | "style"> & {
  className?: string;
  style?: CSSProperties;
};
