import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import LegacyButton from "../../../../packages/ui/src/legacy/button.tsx";
import { ButtonAccentComposition } from "./button/accent-composition.tsx";
import { ButtonDangerComposition } from "./button/danger-composition.tsx";
import { ButtonDangerOutlineComposition } from "./button/danger-outline-composition.tsx";
import { ButtonDangerSecondaryComposition } from "./button/danger-secondary-composition.tsx";
import { ButtonDefaultComposition } from "./button/default-composition.tsx";
import { ButtonGhostComposition } from "./button/ghost-composition.tsx";
import { ButtonIconOnlyComposition } from "./button/icon-only-composition.tsx";
import { ButtonInformationComposition } from "./button/information-composition.tsx";
import { ButtonInlineIconComposition } from "./button/inline-icon-composition.tsx";
import { ButtonLinkComposition } from "./button/link-composition.tsx";
import { ButtonMutedComposition } from "./button/muted-composition.tsx";
import { ButtonOutlineComposition } from "./button/outline-composition.tsx";
import { ButtonPrimaryComposition } from "./button/primary-composition.tsx";
import { ButtonSizesComposition } from "./button/sizes-composition.tsx";

export const BUTTON_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Accent: "apps/doc/src/compositions/button/accent-composition.tsx",
  Danger: "apps/doc/src/compositions/button/danger-composition.tsx",
  DangerOutline: "apps/doc/src/compositions/button/danger-outline-composition.tsx",
  DangerSecondary: "apps/doc/src/compositions/button/danger-secondary-composition.tsx",
  Default: "apps/doc/src/compositions/button/default-composition.tsx",
  Ghost: "apps/doc/src/compositions/button/ghost-composition.tsx",
  IconOnly: "apps/doc/src/compositions/button/icon-only-composition.tsx",
  Information: "apps/doc/src/compositions/button/information-composition.tsx",
  InlineIcon: "apps/doc/src/compositions/button/inline-icon-composition.tsx",
  Link: "apps/doc/src/compositions/button/link-composition.tsx",
  Muted: "apps/doc/src/compositions/button/muted-composition.tsx",
  Outline: "apps/doc/src/compositions/button/outline-composition.tsx",
  Primary: "apps/doc/src/compositions/button/primary-composition.tsx",
  Sizes: "apps/doc/src/compositions/button/sizes-composition.tsx",
} as const;

export const BUTTON_SOURCE_COMPARISON_COMPOSITION = {
  Accent: ButtonAccentComposition,
  Danger: ButtonDangerComposition,
  DangerOutline: ButtonDangerOutlineComposition,
  DangerSecondary: ButtonDangerSecondaryComposition,
  Default: ButtonDefaultComposition,
  Ghost: ButtonGhostComposition,
  IconOnly: ButtonIconOnlyComposition,
  Information: ButtonInformationComposition,
  InlineIcon: ButtonInlineIconComposition,
  Link: ButtonLinkComposition,
  Muted: ButtonMutedComposition,
  Outline: ButtonOutlineComposition,
  Primary: ButtonPrimaryComposition,
  Sizes: ButtonSizesComposition,
} as const;

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

export const BUTTON_SOURCE_COMPARISON_SOURCE = {
  Accent: ButtonAccentSourcePreview,
  Danger: ButtonDangerSourcePreview,
  Default: ButtonDefaultSourcePreview,
  IconOnly: ButtonIconOnlySourcePreview,
  Information: ButtonInformationSourcePreview,
  InlineIcon: ButtonInlineIconSourcePreview,
  Missing: ButtonMissingSourcePreview,
  Muted: ButtonMutedSourcePreview,
  Outline: ButtonOutlineSourcePreview,
  Primary: ButtonPrimarySourcePreview,
  Sizes: ButtonSizesSourcePreview,
} as const;
