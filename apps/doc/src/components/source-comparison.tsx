import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import {
  Badge,
  InlineCode,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type BadgeProps,
  type Theme,
} from "raft-ui";
import { CircleAlert, CircleCheck, Search, Star } from "lucide-react";
import { CodeBlock } from "./code-block.tsx";
import { DocsCodeBlock } from "./docs-code-block.tsx";
import { PreviewThemeScope, type PreviewMode } from "./preview-theme.tsx";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type SourceScene = string | { label: string; path: string };

type SourceSceneGroup = {
  label: string;
  scenes: readonly SourceScene[];
};

type SourceComparisonItem = {
  id?: string;
  label: string;
  source: ReactNode;
  brutal?: ReactNode;
  elegant?: ReactNode;
  elegantDark?: ReactNode;
  current?: ReactNode;
  sourceCode?: CodeContent;
  brutalCode?: CodeContent;
  elegantCode?: CodeContent;
  elegantDarkCode?: CodeContent;
  currentCode?: CodeContent;
  /** Full-width code shown once below the comparison grid (migrated composition). */
  compositionCode?: CodeContent;
  compositionCollapsedCode?: CodeContent;
  compositionPath?: string;
  compositionSource?: string;
  compositionShowLineNumbers?: boolean;
  status?: "match" | "difference" | "review" | "new";
  note?: ReactNode;
  sourceScenes?: readonly SourceSceneGroup[];
};

type SourceComparisonProps = {
  items: readonly SourceComparisonItem[];
  layout?: "auto" | "grid";
  previewSize?: "default" | "tall" | "popover";
  sourceScenes?: readonly SourceSceneGroup[];
};

type ComparisonPane = {
  label: string;
  children: ReactNode;
  code?: CodeContent;
  family?: Theme;
  mode?: PreviewMode;
};

const STATUS = {
  match: "Match",
  difference: "Intentional difference",
  review: "Review",
  new: "New",
} as const;

const STATUS_VARIANT = {
  match: "success",
  difference: "information",
  review: "primary",
  new: "accent",
} as const;

const STATUS_ICON = {
  match: CircleCheck,
  difference: CircleAlert,
  review: Search,
  new: Star,
} as const;

const frameClass = "overflow-clip bg-[oklch(0.991_0_0)] shadow-[0_0_0_0.5px_oklch(0_0_0_/_0.20)]";
const horizontalDividerClass = "border-[oklch(0_0_0_/_0.06)]";

function ComparisonPreview({
  label,
  children,
  code,
  family,
  mode,
  labelPlacement = "header",
  previewSize = "default",
}: {
  label: string;
  children: ReactNode;
  code?: CodeContent;
  family?: Theme;
  mode?: PreviewMode;
  labelPlacement?: "header" | "corner";
  previewSize?: "default" | "tall" | "popover";
}) {
  const previewMinHeight = {
    default: "min-h-28",
    tall: "min-h-56",
    popover: "min-h-80",
  }[previewSize];

  return (
    <div
      data-source-comparison-pane={label.toLowerCase()}
      className="grid min-w-0 grid-rows-[minmax(6rem,1fr)_auto]"
    >
      <PreviewThemeScope
        family={family}
        mode={mode}
        className={`relative flex h-full min-h-0 w-full ${previewMinHeight} items-center justify-center bg-background px-5 py-6 text-foreground`}
      >
        {labelPlacement === "corner" ? (
          <span className="pointer-events-none absolute top-4 left-4 font-mono text-[10px] leading-none font-medium text-foreground-placeholder uppercase">
            {label}
          </span>
        ) : null}
        {children}
      </PreviewThemeScope>
      {code ? (
        <div className={`border-t ${horizontalDividerClass} bg-[oklch(0.986_0_0)] px-4 py-4`}>
          <CodeBlock html={code} variant="embedded" />
        </div>
      ) : null}
    </div>
  );
}

function getComparisonPanes(item: SourceComparisonItem): ComparisonPane[] {
  if (item.brutal || item.elegant || item.elegantDark) {
    return [
      {
        label: "Source",
        children: item.source,
        code: item.sourceCode,
        family: "brutal" as Theme,
        mode: "light" as PreviewMode,
      },
      {
        label: "Brutal",
        children: item.brutal,
        code: item.brutalCode,
        family: "brutal" as Theme,
        mode: "light" as PreviewMode,
      },
      {
        label: "Elegant",
        children: item.elegant,
        code: item.elegantCode,
        family: "elegant" as Theme,
        mode: "light" as PreviewMode,
      },
      {
        label: "Elegant dark",
        children: item.elegantDark,
        code: item.elegantDarkCode,
        family: "elegant" as Theme,
        mode: "dark" as PreviewMode,
      },
    ].filter((pane) => pane.children);
  }

  return [
    {
      label: "Source",
      children: item.source,
      code: item.sourceCode,
      family: "brutal" as Theme,
      mode: "light" as PreviewMode,
    },
    { label: "Current", children: item.current, code: item.currentCode },
  ].filter((pane) => pane.children);
}

function getSceneLabel(scene: SourceScene) {
  return typeof scene === "string" ? scene : scene.label;
}

function getScenePath(scene: SourceScene) {
  if (typeof scene !== "string") {
    return scene.path;
  }

  return `/Users/cuvii/Development/zolplay/slock-ui-backup/${scene}`;
}

function getDisplayScenePath(scene: SourceScene) {
  const path = getScenePath(scene);
  const packagesIndex = path.indexOf("packages/");

  return packagesIndex >= 0 ? path.slice(packagesIndex) : path;
}

function getSceneCount(groups: readonly SourceSceneGroup[]) {
  return groups.reduce((count, group) => count + group.scenes.length, 0);
}

function SourceSceneReferences({ groups }: { groups: readonly SourceSceneGroup[] }) {
  const sceneCount = getSceneCount(groups);

  return (
    <TooltipProvider>
      <div className="mt-3 w-full overflow-hidden bg-white shadow-[0_0_0_0.5px_oklch(0_0_0_/_0.22)]">
        <div className="flex items-center justify-between gap-3 border-b border-[oklch(0_0_0_/_0.06)] bg-[oklch(0.988_0.002_286)] px-3 py-2.5">
          <p className="font-mono text-xs leading-snug font-semibold text-foreground-muted uppercase">
            Source refs
          </p>
          <span className="font-mono text-xs leading-snug font-semibold text-foreground-placeholder uppercase">
            {sceneCount} {sceneCount === 1 ? "location" : "locations"}
          </span>
        </div>
        <div className="grid gap-6 px-3 py-2.5">
          {groups.map((group) => (
            <div key={group.label} className="grid min-w-0 gap-2">
              <span className="text-sm leading-5 font-medium text-foreground-muted">
                {group.label}
              </span>
              <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                {group.scenes.map((scene) => (
                  <Tooltip key={getScenePath(scene)}>
                    <TooltipTrigger
                      render={<span tabIndex={0} className="inline-flex select-none" />}
                    >
                      <InlineCode className="!text-[14px] leading-5">
                        {getSceneLabel(scene)}
                      </InlineCode>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[36rem] font-mono">
                      {getDisplayScenePath(scene)}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function SourceComparison({
  items,
  layout = "auto",
  previewSize,
  sourceScenes,
}: SourceComparisonProps) {
  return (
    <div data-source-comparison className="space-y-16">
      {items.map((item) => {
        const status = item.status ?? "review";
        const StatusIcon = STATUS_ICON[status];
        const panes = getComparisonPanes(item);
        const itemSourceScenes = item.sourceScenes ?? sourceScenes;
        const isGridLayout = layout === "grid" && panes.length >= 4;
        const columnClass = isGridLayout
          ? "md:grid-cols-2"
          : panes.length >= 4
            ? "xl:grid-cols-4"
            : panes.length === 3
              ? "xl:grid-cols-3"
              : "md:grid-cols-2";
        const previewFrameClass = isGridLayout
          ? `grid gap-px bg-[oklch(0_0_0_/_0.10)] ${columnClass} ${frameClass}`
          : `grid divide-y divide-[oklch(0_0_0_/_0.06)] ${columnClass} ${frameClass} md:divide-x md:divide-y-0 md:divide-[oklch(0_0_0_/_0.10)]`;
        return (
          <section
            key={item.id ?? item.label}
            id={item.id}
            data-source-comparison-item={item.label}
            data-source-comparison-status={status}
            className={`space-y-5${item.id ? " scroll-mt-8" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-2 px-1">
              <h3 className="text-sm font-medium text-foreground-strong">{item.label}</h3>
              <Badge appearance="soft" variant={STATUS_VARIANT[status] as BadgeProps["variant"]}>
                <StatusIcon aria-hidden className="size-3" />
                {STATUS[status]}
              </Badge>
              {item.note ? (
                <p className="mt-2 w-full text-sm leading-relaxed text-foreground-muted">
                  {item.note}
                </p>
              ) : null}
              {itemSourceScenes ? <SourceSceneReferences groups={itemSourceScenes} /> : null}
            </div>
            <div className="space-y-2">
              <div className="space-y-2">
                {isGridLayout ? null : (
                  <div
                    className={`ml-2 grid gap-y-2 px-1 font-mono text-[10px] leading-none font-medium text-foreground-placeholder uppercase ${columnClass}`}
                  >
                    {panes.map((pane) => (
                      <div key={pane.label}>{pane.label}</div>
                    ))}
                  </div>
                )}
                <div className={previewFrameClass}>
                  {panes.map((pane) => (
                    <ComparisonPreview
                      key={pane.label}
                      label={pane.label}
                      code={pane.code}
                      family={pane.family}
                      mode={pane.mode}
                      labelPlacement={isGridLayout ? "corner" : "header"}
                      previewSize={previewSize ?? (isGridLayout ? "tall" : "default")}
                    >
                      {pane.children}
                    </ComparisonPreview>
                  ))}
                </div>
              </div>
              {item.compositionCode && item.compositionPath && item.compositionSource ? (
                <DocsCodeBlock.Panel
                  path={item.compositionPath}
                  source={item.compositionSource}
                  html={item.compositionCode}
                  collapsedHtml={item.compositionCollapsedCode}
                  showLineNumbers={item.compositionShowLineNumbers ?? false}
                />
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
