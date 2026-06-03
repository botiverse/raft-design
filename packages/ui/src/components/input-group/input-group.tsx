import type { ComponentPropsWithRef, MouseEvent } from "react";
import { Search } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";
import { Input, type InputProps } from "../input/input.tsx";

// InputGroup family: the brutal shell is lifted off the control onto the wrapper
// so addons can sit inside the bordered box. All parts share one `tv()` slots
// config so theme / lift / align styling lives in a single place — ready for the
// elegant family to add per-slot overrides under `theme`.
//
// The invalid look is driven by the inner control (`data-slot=input-group-control`)
// via `has-*`. `lift` toggles the focus shadow (off for a faithful SearchInput,
// which never lifted). `align` (`inline-start` / `inline-end`) picks which edge an
// addon hugs.
const inputGroup = tv({
  slots: {
    root: ["group/input-group relative flex w-full min-w-0 items-center"],
    addon: [
      "flex shrink-0 items-center justify-center gap-2 px-3",
      "cursor-text select-none",
      "[&>svg:not([class*='size-'])]:size-4",
    ],
    // Search preset adornment (theme-neutral layout): an 8px gap to the control
    // plus a sibling rule that trims the control's left inset.
    searchAddon: ["pr-2", "[&~[data-slot=input-group-control]]:pl-0"],
    // Slug preset prefix: a full-height divider box carrying the brutal palette.
    slugAddon: ["self-stretch border-r-2 font-display font-bold"],
    // The bare control fills the row; the group owns the border/shadow/invalid.
    control: ["flex-1"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-black bg-white shadow-[var(--shadow)]",
          "has-[[data-slot=input-group-control][aria-invalid=true]]:border-brutal-red has-[[data-slot=input-group-control][aria-invalid=true]]:bg-brutal-red/5 has-[[data-slot=input-group-control][aria-invalid=true]]:ring-2 has-[[data-slot=input-group-control][aria-invalid=true]]:ring-brutal-red/60",
        ],
        addon: ["text-black/50"],
        slugAddon: ["border-black bg-brutal-yellow/30 text-black/70"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    lift: {
      true: {},
      false: {},
    },
    align: {
      "inline-start": { addon: "order-first" },
      "inline-end": { addon: "order-last" },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      lift: true,
      class: { root: "has-[[data-slot=input-group-control]:focus]:shadow-[var(--shadow-hover)]" },
    },
  ],
  defaultVariants: {
    lift: true,
    align: "inline-start",
  },
});

export type InputGroupProps = ComponentPropsWithRef<"div"> &
  Pick<VariantProps<typeof inputGroup>, "lift">;

export function InputGroup({ lift, className, ...props }: InputGroupProps) {
  const theme = useTheme();
  const { root } = inputGroup({ theme, lift });
  return <div role="group" data-slot="input-group" className={root({ className })} {...props} />;
}

export type InputGroupAddonProps = ComponentPropsWithRef<"div"> &
  Pick<VariantProps<typeof inputGroup>, "align">;

// A non-editable slot inside the group — a leading icon, a `/` prefix, a trailing
// unit, etc.
function InputGroupAddonRoot({
  align = "inline-start",
  className,
  onClick,
  ...props
}: InputGroupAddonProps) {
  const theme = useTheme();
  const { addon } = inputGroup({ theme, align });
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={addon({ className })}
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
  const { searchAddon } = inputGroup();
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
  const { slugAddon } = inputGroup({ theme });
  return (
    <InputGroupAddonRoot aria-hidden className={slugAddon({ className })} {...props}>
      /
    </InputGroupAddonRoot>
  );
}

export const InputGroupAddon = Object.assign(InputGroupAddonRoot, {
  Search: SearchAddon,
  Slug: SlugAddon,
});

// The bare control inside an InputGroup — the group owns the border/shadow/invalid
// look, so the input renders `unstyled` and just fills the row.
export type InputGroupInputProps = Omit<InputProps, "unstyled">;

export function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  const { control } = inputGroup();
  return (
    <Input unstyled data-slot="input-group-control" className={control({ className })} {...props} />
  );
}
