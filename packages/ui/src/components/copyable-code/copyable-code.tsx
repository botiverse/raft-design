"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { useClipboard } from "foxact/use-clipboard";
import { Check, Copy } from "lucide-react";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/index";

const copyableCode = tv({
  slots: {
    root: ["group/copyable-code flex w-full min-w-0 items-center gap-2"],
    code: ["min-w-0 flex-1 font-mono text-xs"],
    codeInner: ["block w-full min-w-0 max-w-full break-all"],
    action: [
      "shrink-0",
      "[&_[data-slot=button]]:transition-[color,background-color,box-shadow]",
      "[&_[data-slot=button]]:duration-150 [&_[data-slot=button]]:ease-out",
    ],
    iconSwap: [
      "relative inline-grid size-3",
      "[&_[data-slot=copyable-code-icon]]:col-start-1 [&_[data-slot=copyable-code-icon]]:row-start-1",
      "[&_[data-slot=copyable-code-icon]]:origin-center",
      "[&_[data-slot=copyable-code-icon]]:transition-[opacity,filter,scale]",
      "[&_[data-slot=copyable-code-icon]]:duration-170",
      "[&_[data-slot=copyable-code-icon]]:ease-[cubic-bezier(0.16,1,0.3,1)]",
      "[&_[data-slot=copyable-code-icon]]:will-change-[opacity,filter,scale]",
      "motion-reduce:[&_[data-slot=copyable-code-icon]]:transition-none",
      "data-[state=idle]:[&_[data-icon=copy]]:scale-100 data-[state=idle]:[&_[data-icon=copy]]:opacity-100 data-[state=idle]:[&_[data-icon=copy]]:blur-0",
      "data-[state=idle]:[&_[data-icon=check]]:scale-[0.72] data-[state=idle]:[&_[data-icon=check]]:opacity-0 data-[state=idle]:[&_[data-icon=check]]:blur-[1px]",
      "data-[state=copied]:[&_[data-icon=check]]:scale-100 data-[state=copied]:[&_[data-icon=check]]:opacity-100 data-[state=copied]:[&_[data-icon=check]]:blur-0",
      "data-[state=copied]:[&_[data-icon=copy]]:scale-[0.72] data-[state=copied]:[&_[data-icon=copy]]:opacity-0 data-[state=copied]:[&_[data-icon=copy]]:blur-[1px]",
    ],
  },
  variants: {
    theme: {
      brutal: {
        code: ["border-2 border-line-strong bg-black text-[oklch(0.88_0.18_132)] shadow-sm"],
        codeInner: "break-all",
      },
      elegant: {
        code: [
          "bg-[oklch(0.988_0.002_106.42)] text-[oklch(0.45_0.04_74)]",
          "shadow-[0_0_0_0.5px_oklch(0_0_0_/_0.22)]",
          "dark:bg-layer-panel dark:text-[oklch(0.82_0.06_90)] dark:shadow-[0_0_0_0.5px_oklch(1_0_0_/_0.16)]",
        ],
        codeInner: [
          "border-x border-dashed border-[oklch(0_0_0_/_0.12)] bg-layer-panel px-1",
          "dark:border-[oklch(1_0_0_/_0.14)] dark:bg-layer-popover",
        ],
        action: [
          "[&_[data-slot=button]]:text-foreground-muted",
          "[&_[data-slot=button]]:shadow-none",
          "[&_[data-slot=button]]:hover:bg-transparent [&_[data-slot=button]]:hover:text-foreground-strong [&_[data-slot=button]]:hover:before:bg-transparent",
        ],
      },
    },
    size: {
      sm: {
        code: "px-3 py-1.5 leading-5",
      },
      md: {
        code: "px-3 py-2 leading-5",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
  compoundVariants: [
    {
      theme: "elegant",
      size: "sm",
      class: { code: "px-2 py-0", codeInner: "py-1.5 leading-5" },
    },
    {
      theme: "elegant",
      size: "md",
      class: { code: "px-2 py-0", codeInner: "py-2 leading-5" },
    },
  ],
});

type CopyableCodeSize = NonNullable<VariantProps<typeof copyableCode>["size"]>;

type CopyableCodeContextValue = {
  copied: boolean;
  copyValue: (value: string) => Promise<void>;
  size: CopyableCodeSize;
};

const CopyableCodeContext = createContext<CopyableCodeContextValue | null>(null);

function useCopyableCode(part: string) {
  const context = useContext(CopyableCodeContext);
  if (!context) {
    throw new Error(`${part} must be used inside CopyableCodeRoot.`);
  }
  return context;
}

export type CopyableCodeRootProps = Omit<ComponentPropsWithRef<"div">, "onCopy"> &
  Pick<VariantProps<typeof copyableCode>, "size"> & {
    copied?: boolean;
    onCopy?: (value: string) => void | Promise<void>;
  };

export function CopyableCodeRoot({
  copied,
  onCopy,
  size = "md",
  className,
  ...props
}: CopyableCodeRootProps) {
  const theme = useThemeFamily();
  const { root } = copyableCode({ theme, size });
  const { copied: clipboardCopied, copy } = useClipboard({ timeout: 1400 });
  const effectiveCopied = copied ?? clipboardCopied;

  const copyValue = useCallback(
    async (value: string) => {
      await copy(value);
      await onCopy?.(value);
    },
    [copy, onCopy],
  );

  const context = useMemo<CopyableCodeContextValue>(
    () => ({
      copied: effectiveCopied,
      copyValue,
      size,
    }),
    [copyValue, effectiveCopied, size],
  );

  return (
    <CopyableCodeContext.Provider value={context}>
      <div
        data-slot="copyable-code-root"
        data-size={size}
        data-state={effectiveCopied ? "copied" : "idle"}
        className={root({ className })}
        {...props}
      />
    </CopyableCodeContext.Provider>
  );
}

export type CopyableCodeProps = ComponentPropsWithRef<"code"> & {
  truncate?: boolean;
};

export function CopyableCode({ children, className, truncate, ...props }: CopyableCodeProps) {
  const { size } = useCopyableCode("CopyableCode");
  const theme = useThemeFamily();
  const { code, codeInner } = copyableCode({ theme, size });
  const scrollClassName =
    "overflow-x-auto overflow-y-hidden break-normal whitespace-nowrap text-clip [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

  return (
    <code
      data-slot="copyable-code"
      data-truncate={truncate ? "true" : undefined}
      className={code({ className })}
      {...props}
    >
      <span
        data-slot="copyable-code-inner"
        className={codeInner({ className: [truncate && scrollClassName] })}
      >
        {children}
      </span>
    </code>
  );
}

export type CopyableCodeActionProps = Omit<ButtonProps, "children" | "className"> & {
  ariaLabel?: string;
  buttonClassName?: string;
  className?: string;
  copiedAriaLabel?: string;
  children?: ReactNode | ((state: { copied: boolean }) => ReactNode);
};

export function CopyableCodeAction({
  ariaLabel = "Copy code",
  children,
  buttonClassName,
  className,
  copiedAriaLabel = "Copied code",
  onClick,
  size,
  variant,
  ...props
}: CopyableCodeActionProps) {
  const { copied, copyValue } = useCopyableCode("CopyableCodeAction");
  const theme = useThemeFamily();
  const { action } = copyableCode({ theme });
  const accessibleLabel = copied ? copiedAriaLabel : ariaLabel;
  const buttonSize = size ?? (theme === "elegant" ? "icon-xs" : "icon-sm");
  const buttonVariant = variant ?? (theme === "elegant" ? "ghost" : "outline");

  const handleClick: NonNullable<ButtonProps["onClick"]> = async (event) => {
    const root = (event.currentTarget as HTMLElement).closest('[data-slot="copyable-code-root"]');
    const value = root?.querySelector('[data-slot="copyable-code"]')?.textContent ?? "";
    await copyValue(value);
    onClick?.(event);
  };

  return (
    <span data-slot="copyable-code-action" className={action({ className })}>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        aria-label={accessibleLabel}
        aria-live="polite"
        onClick={handleClick}
        className={buttonClassName}
        {...props}
      >
        {typeof children === "function"
          ? children({ copied })
          : (children ?? <CopyableCodeActionIcon copied={copied} />)}
      </Button>
    </span>
  );
}

function CopyableCodeActionIcon({ copied }: { copied: boolean }) {
  const { iconSwap } = copyableCode();

  return (
    <span
      data-slot="copyable-code-icon-swap"
      data-state={copied ? "copied" : "idle"}
      className={iconSwap()}
      aria-hidden
    >
      <Copy data-slot="copyable-code-icon" data-icon="copy" className="size-3" strokeWidth={1.75} />
      <Check
        data-slot="copyable-code-icon"
        data-icon="check"
        className="size-3"
        strokeWidth={1.75}
      />
    </span>
  );
}
