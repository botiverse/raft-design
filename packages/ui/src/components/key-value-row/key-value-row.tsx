import type { ReactNode } from "react";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Small muted label above a value cell. The canonical detail-panel key/value
// convention: label `text-xs text-black/50`, value `text-sm text-black`.
const keyValueRow = tv({
  slots: {
    root: "",
    header: ["mb-1 flex items-center gap-2"],
    label: ["text-xs"],
    action: ["shrink-0"],
    value: ["text-sm"],
  },
  variants: {
    theme: {
      brutal: {
        label: "text-black/50",
        value: "text-black",
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    mono: {
      true: {
        value: "font-mono",
      },
      false: {
        value: "",
      },
    },
    breakAll: {
      true: {
        value: "break-all",
      },
      false: {
        value: "",
      },
    },
  },
  defaultVariants: {
    mono: false,
    breakAll: false,
  },
});

export type KeyValueRowProps = Omit<useRender.ComponentProps<"div">, "children"> &
  Omit<VariantProps<typeof keyValueRow>, "theme"> & {
    label: ReactNode;
    value: ReactNode;
    /** Optional inline trailing element rendered next to the label. */
    action?: ReactNode;
    /** Additional classes on the value cell. */
    valueClassName?: string;
  };

export function KeyValueRow({
  label,
  value,
  mono,
  breakAll,
  action,
  valueClassName,
  className,
  render,
  ref,
  ...props
}: KeyValueRowProps) {
  const theme = useTheme();
  const {
    root,
    header,
    label: labelSlot,
    action: actionSlot,
    value: valueSlot,
  } = keyValueRow({ theme, mono, breakAll });

  return useRender({
    render: render ?? <div />,
    ref,
    props: {
      "data-slot": "key-value-row",
      className: root({ className }),
      children: (
        <>
          <div className={header()}>
            <div className={labelSlot()}>{label}</div>
            {action ? <div className={actionSlot()}>{action}</div> : null}
          </div>
          <div className={valueSlot({ className: valueClassName })}>{value}</div>
        </>
      ),
      ...props,
    },
  });
}
