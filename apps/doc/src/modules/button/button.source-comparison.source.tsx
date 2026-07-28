import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import LegacyButton from "../../../../../packages/ui/src/legacy/button.tsx";

type ButtonSourcePreviewProps = {
  children: ReactNode;
  className?: string;
  gap?: "default" | "loose";
  layout?: "wrap" | "grid";
};

function ButtonSourcePreview({
  children,
  className,
  gap = "default",
  layout = "wrap",
}: ButtonSourcePreviewProps) {
  const gapClassName = gap === "loose" ? "gap-4" : "gap-2.5";
  const layoutClassName =
    layout === "grid"
      ? `grid grid-cols-[max-content_max-content] grid-rows-[max-content_max-content] place-items-center justify-center ${gapClassName}`
      : `flex flex-wrap items-center justify-center ${gapClassName}`;

  return (
    <div
      className={["flex h-full min-h-28 w-full items-center justify-center px-3 py-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={layoutClassName}>{children}</div>
    </div>
  );
}

function MissingSource() {
  return (
    <span className="font-mono text-[10px] font-medium text-foreground-placeholder uppercase">
      Missing
    </span>
  );
}

export function ButtonDefaultSourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <LegacyButton>Default</LegacyButton>
    </ButtonSourcePreview>
  );
}

export function ButtonPrimarySourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <LegacyButton tone="yellow">Primary</LegacyButton>
    </ButtonSourcePreview>
  );
}

export function ButtonOutlineSourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <LegacyButton tone="white">Outline</LegacyButton>
    </ButtonSourcePreview>
  );
}

export function ButtonInformationSourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <LegacyButton tone="cyan">Information</LegacyButton>
    </ButtonSourcePreview>
  );
}

export function ButtonMutedSourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <LegacyButton tone="stone">Muted</LegacyButton>
    </ButtonSourcePreview>
  );
}

export function ButtonAccentSourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <LegacyButton tone="pink">Accent</LegacyButton>
    </ButtonSourcePreview>
  );
}

export function ButtonWarningSourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <LegacyButton tone="orange">Warning</LegacyButton>
    </ButtonSourcePreview>
  );
}

export function ButtonDangerSourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <LegacyButton tone="red">Danger</LegacyButton>
    </ButtonSourcePreview>
  );
}

export function ButtonMissingSourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <MissingSource />
    </ButtonSourcePreview>
  );
}

export function ButtonSizesSourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className} gap="loose" layout="grid">
      <LegacyButton tone="yellow" size="xs">
        XS
      </LegacyButton>
      <LegacyButton tone="yellow" size="sm">
        SM
      </LegacyButton>
      <LegacyButton tone="yellow" size="md">
        MD
      </LegacyButton>
      <LegacyButton tone="yellow" size="lg">
        LG
      </LegacyButton>
    </ButtonSourcePreview>
  );
}

export function ButtonIconOnlySourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <LegacyButton tone="yellow" shape="icon" aria-label="Add">
        <Plus size={14} />
      </LegacyButton>
    </ButtonSourcePreview>
  );
}

export function ButtonInlineIconSourcePreview({ className }: { className?: string }) {
  return (
    <ButtonSourcePreview className={className}>
      <LegacyButton tone="yellow" shape="iconText">
        <Plus size={14} />
        New
      </LegacyButton>
    </ButtonSourcePreview>
  );
}
