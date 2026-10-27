import { Button as BaseButton } from "@base-ui/react/button";
import { X } from "lucide-react";
import type { ComponentPropsWithRef } from "react";
import { chipRemoveBase } from "../../lib/chip-remove";
import type { DataAttributes } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { tv } from "../../lib/tv";

const filterChip = tv({
  slots: {
    root: [
      "inline-flex h-8 min-w-0 shrink items-center",
      "gap-1.5 rounded-control bg-info-soft pr-1 pl-2.5",
      "font-sans text-control font-semibold text-foreground",
      "[&>svg]:pointer-events-none [&>svg]:shrink-0",
      "[&>svg:not([class*='size-'])]:size-3.5 [&>svg:not([class*='stroke-'])]:stroke-2",
    ],
    label: ["min-w-0 truncate"],
    remove: [...chipRemoveBase, "size-6"],
  },
});

export type FilterChipProps = ComponentPropsWithRef<"span"> & DataAttributes;

/**
 * The filter in effect, beside the filter button that chose it: an `info-soft`
 * chip as high as the button, with an optional 14px icon, a `FilterChipLabel`
 * and a `FilterChipRemove` × that resets the filter.
 */
export function FilterChip({ className, ...props }: FilterChipProps) {
  const { root } = filterChip();
  return <span data-slot="filter-chip" className={root({ className })} {...props} />;
}

export type FilterChipLabelProps = ComponentPropsWithRef<"span">;

/** The name of the active filter. It truncates when the row has no room. */
export function FilterChipLabel({ className, ...props }: FilterChipLabelProps) {
  const { label } = filterChip();
  return <span data-slot="filter-chip-label" className={label({ className })} {...props} />;
}

export type FilterChipRemoveProps = Omit<StyledProps<BaseButton.Props>, "aria-label" | "type"> &
  DataAttributes & {
    /**
     * What the × does, said in words: the chip shows only a glyph. Name the
     * result, such as "Clear Filter" or "Show All".
     */
    "aria-label": string;
  };

/** The × that resets the filter to its default. Shows an X unless given children. */
export function FilterChipRemove({
  className,
  children,
  render,
  nativeButton,
  ...props
}: FilterChipRemoveProps) {
  const { remove } = filterChip();
  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="filter-chip-remove"
      className={remove({ className })}
    >
      {children ?? <X aria-hidden />}
    </BaseButton>
  );
}
