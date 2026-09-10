import { cn } from "./cn";
import { tv as tvBase } from "tailwind-variants/lite";
import type { TVLite } from "tailwind-variants/lite";

export type { VariantProps } from "tailwind-variants/lite";

type SlotFunction = (props?: unknown) => string;
type SlotRecord = Record<string, SlotFunction>;
type RecipeResult = string | SlotRecord;
type RuntimeRecipeResult = RecipeResult | null | undefined;
type RuntimeRecipeFunction = ((props?: unknown) => RuntimeRecipeResult) & Record<string, unknown>;
type WrappedRecipeFunction = ((props?: unknown) => RecipeResult) & Record<string, unknown>;

export const tv: TVLite = ((options: unknown) => {
  const recipe = tvBase(options as never) as unknown as RuntimeRecipeFunction;

  const wrappedRecipe = ((props?: unknown) => {
    const result = recipe(props);

    if (result == null || typeof result === "string") {
      return cn(result);
    }

    return Object.fromEntries(
      Object.entries(result).map(([slotName, slot]) => [
        slotName,
        (slotProps?: unknown) => cn(slot(slotProps)),
      ]),
    );
  }) as WrappedRecipeFunction;

  return Object.assign(wrappedRecipe, recipe);
}) as unknown as TVLite;
