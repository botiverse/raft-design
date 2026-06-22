import { cn } from "cnfast";
import { tv as tvBase, type TVLite } from "tailwind-variants/lite";

export type { VariantProps } from "tailwind-variants/lite";

type SlotFunction = (props?: unknown) => string;
type SlotRecord = Record<string, SlotFunction>;
type RecipeFunction = ((props?: unknown) => string | SlotRecord) & Record<string, unknown>;

export const tv: TVLite = ((options: unknown) => {
  const recipe = tvBase(options as never) as unknown as RecipeFunction;

  const wrappedRecipe = ((props?: unknown) => {
    const result = recipe(props);

    if (typeof result === "string") {
      return cn(result);
    }

    return Object.fromEntries(
      Object.entries(result).map(([slotName, slot]) => [
        slotName,
        (slotProps?: unknown) => cn(slot(slotProps)),
      ]),
    );
  }) as RecipeFunction;

  return Object.assign(wrappedRecipe, recipe);
}) as unknown as TVLite;
