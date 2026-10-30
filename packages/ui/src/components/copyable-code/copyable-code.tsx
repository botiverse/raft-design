"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "../../lib/use-copy-to-clipboard";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";

const copyableCode = tv({
  slots: {
    root: ["group/copyable-code flex w-full min-w-0 items-center gap-2"],
    code: [
      "min-w-0 flex-1 font-mono",
      "rounded-control border border-line-hairline bg-layer-code",
      "text-mono-code text-foreground",
    ],
    codeInner: ["block w-full min-w-0 max-w-full break-all"],
    action: [
      "shrink-0",
      "**:data-[slot=button]:transition-[color,background-color,box-shadow]",
      "**:data-[slot=button]:duration-150 **:data-[slot=button]:ease-out",
    ],
    iconSwap: [
      "relative inline-grid",
      "**:data-[slot=copyable-code-icon]:col-start-1 **:data-[slot=copyable-code-icon]:row-start-1",
      "**:data-[slot=copyable-code-icon]:origin-center",
      "**:data-[slot=copyable-code-icon]:transition-[opacity,filter,scale]",
      "**:data-[slot=copyable-code-icon]:duration-170",
      "**:data-[slot=copyable-code-icon]:ease-[cubic-bezier(0.16,1,0.3,1)]",
      "**:data-[slot=copyable-code-icon]:will-change-[opacity,filter,scale]",
      "motion-reduce:**:data-[slot=copyable-code-icon]:transition-none",
      "data-[state=idle]:**:data-[icon=copy]:scale-100 data-[state=idle]:**:data-[icon=copy]:opacity-100 data-[state=idle]:[&_[data-icon=copy]]:blur-0",
      "data-[state=idle]:**:data-[icon=check]:scale-[0.72] data-[state=idle]:**:data-[icon=check]:opacity-0 data-[state=idle]:**:data-[icon=check]:blur-[1px]",
      "data-[state=copied]:**:data-[icon=check]:scale-100 data-[state=copied]:**:data-[icon=check]:opacity-100 data-[state=copied]:[&_[data-icon=check]]:blur-0",
      "data-[state=copied]:**:data-[icon=copy]:scale-[0.72] data-[state=copied]:**:data-[icon=copy]:opacity-0 data-[state=copied]:**:data-[icon=copy]:blur-[1px]",
      "size-4",
      "**:data-[slot=copyable-code-icon]:size-4 **:data-[slot=copyable-code-icon]:stroke-2",
    ],
  },
  variants: {
    size: {
      sm: {
        code: ["px-3 leading-5", "py-[5px]"],
      },
      md: {
        code: ["px-3 leading-5", "min-h-10 py-[9px]"],
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
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

// `onCopy`/`onError` are the copy lifecycle here, not the DOM handlers of the
// same name, so both are removed from the inherited div props before declaring
// our own signatures.
export type CopyableCodeRootProps = Omit<ComponentPropsWithRef<"div">, "onCopy" | "onError"> &
  Pick<VariantProps<typeof copyableCode>, "size"> & {
    copied?: boolean;
    /** Called with the copied text only after a write that actually landed. */
    onCopy?: (value: string) => void | Promise<void>;
    /** Called when every copy strategy failed, so the consumer can tell the user. */
    onError?: (error: Error) => void;
  };

export function CopyableCodeRoot({
  copied,
  onCopy,
  onError,
  size = "md",
  className,
  ...props
}: CopyableCodeRootProps) {
  const { root } = copyableCode({ size });
  const { copied: clipboardCopied, copyText } = useCopyToClipboard({ timeout: 1400 });
  const effectiveCopied = copied ?? clipboardCopied;

  const copyValue = useCallback(
    async (value: string) => {
      try {
        await copyText(value);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)));
        return;
      }
      await onCopy?.(value);
    },
    [copyText, onCopy, onError],
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
  const { code, codeInner } = copyableCode({ size });
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
  buttonClassName?: string;
  className?: string;
  children?: ReactNode | ((state: { copied: boolean }) => ReactNode);
};

export function CopyableCodeAction({
  children,
  buttonClassName,
  className,
  onClick,
  size,
  variant,
  ...props
}: CopyableCodeActionProps) {
  const { copied, copyValue } = useCopyableCode("CopyableCodeAction");
  const { action } = copyableCode();
  const accessibleLabel = copied ? "Copied code" : "Copy code";
  const buttonSize = size ?? "icon-md";
  const buttonVariant = variant ?? "ghost";

  const handleClick = useCallback<NonNullable<ButtonProps["onClick"]>>(
    async (event) => {
      const root = (event.currentTarget as HTMLElement).closest('[data-slot="copyable-code-root"]');
      const value = root?.querySelector('[data-slot="copyable-code"]')?.textContent ?? "";
      await copyValue(value);
      onClick?.(event);
    },
    [copyValue, onClick],
  );

  return (
    <span data-slot="copyable-code-action" className={action({ className })}>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        aria-label={props["aria-label"] ?? accessibleLabel}
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
