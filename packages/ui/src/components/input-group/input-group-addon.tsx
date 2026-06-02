import type { ComponentPropsWithRef, MouseEvent } from "react";
import { Search } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

// A non-editable slot inside the group — a leading icon, a `/` prefix, a trailing
// unit, etc. `inline-start` / `inline-end` pick which edge it hugs.
const inputGroupAddon = tv({
  base: [
    "flex shrink-0 items-center justify-center gap-2 px-3",
    "cursor-text select-none",
    "[&>svg:not([class*='size-'])]:size-4",
  ],
  variants: {
    theme: {
      brutal: ["text-black/50"],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
    align: {
      "inline-start": "order-first",
      "inline-end": "order-last",
    },
  },
  defaultVariants: {
    align: "inline-start",
  },
});

// Search preset adornment (theme-neutral layout): an 8px gap to the control plus
// a sibling rule that trims the control's left inset.
const searchAddon = tv({
  base: ["pr-2", "[&~[data-slot=input-group-control]]:pl-0"],
});

// Slug preset prefix: a full-height divider box carrying the brutal palette.
const slugAddon = tv({
  base: ["self-stretch border-r-2 font-display font-bold"],
  variants: {
    theme: {
      brutal: ["border-black bg-brutal-yellow/30 text-black/70"],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
  },
});

export type InputGroupAddonProps = ComponentPropsWithRef<"div"> &
  Omit<VariantProps<typeof inputGroupAddon>, "theme">;

function InputGroupAddonRoot({
  align = "inline-start",
  className,
  onClick,
  ...props
}: InputGroupAddonProps) {
  const theme = useTheme();
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={inputGroupAddon({ theme, align, className })}
      // Clicking the addon focuses the control, except when an interactive child
      // (e.g. a button) was the target.
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        if (event.target instanceof HTMLElement && event.target.closest("button")) return;
        event.currentTarget.parentElement
          ?.querySelector<HTMLInputElement>("[data-slot=input-group-control]")
          ?.focus();
      }}
      {...props}
    />
  );
}

// Faithful restoration of the old SearchInput's adornment: a 15px magnifier with
// an 8px gap to the control (the sibling rule trims the control's left inset).
function SearchAddon({ className, ...props }: WithoutChildren<InputGroupAddonProps>) {
  return (
    <InputGroupAddonRoot className={searchAddon({ className })} {...props}>
      <Search className="size-[15px] shrink-0" />
    </InputGroupAddonRoot>
  );
}

// Faithful restoration of the old SlugInput's prefix: a full-height yellow `/`
// box divided from the control by a right border.
function SlugAddon({ className, ...props }: WithoutChildren<InputGroupAddonProps>) {
  const theme = useTheme();
  return (
    <InputGroupAddonRoot aria-hidden className={slugAddon({ theme, className })} {...props}>
      /
    </InputGroupAddonRoot>
  );
}

export const InputGroupAddon = Object.assign(InputGroupAddonRoot, {
  Search: SearchAddon,
  Slug: SlugAddon,
});
