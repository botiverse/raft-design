import type { ComponentPropsWithRef, ReactNode } from "react";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// The canonical section-eyebrow typographic token. Default color is muted; pass
// `className="!text-black"` for a fully-black eyebrow.
const sectionEyebrow = tv({
  slots: {
    root: ["text-xs font-bold uppercase tracking-widest"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["text-black/60"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type SectionEyebrowProps = {
  /** Element to render. `span` (default), `div` for block-level eyebrows,
   *  `label` for form field labels. */
  as?: "span" | "div" | "label";
  /** Forwarded to the `<label htmlFor>` attribute when `as="label"`. */
  htmlFor?: string;
  className?: string;
  children?: ReactNode;
  ref?: ComponentPropsWithRef<"span">["ref"];
};

export function SectionEyebrow({
  as = "span",
  htmlFor,
  className,
  children,
  ref,
}: SectionEyebrowProps) {
  const theme = useTheme();
  const { root } = sectionEyebrow({ theme });
  const render = as === "label" ? <label htmlFor={htmlFor} /> : as === "div" ? <div /> : <span />;

  return useRender({
    render,
    ref,
    props: {
      "data-slot": "section-eyebrow",
      className: root({ className }),
      children,
    },
  });
}
