import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import {
  Badge,
  InlineCode,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type BadgeProps,
  type Theme,
} from "raft-ui";
import { Circle, CircleAlert, CircleCheck, Search, Star } from "lucide-react";
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
  status?: "match" | "difference" | "review" | "new" | "todo";
  note?: ReactNode;
  sourceScenes?: readonly SourceSceneGroup[];
  previewClassName?: string;
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
  todo: "Todo",
} as const;

const STATUS_VARIANT = {
  match: "success",
  difference: "information",
  review: "primary",
  new: "accent",
  todo: "muted",
} as const;

const STATUS_ICON = {
  match: CircleCheck,
  difference: CircleAlert,
  review: Search,
  new: Star,
  todo: Circle,
} as const;

const frameClass = "overflow-clip bg-white shadow-[0_0_0_0.5px_oklch(0_0_0_/_0.20)]";
const horizontalDividerClass = "border-[oklch(0_0_0_/_0.06)]";

function ComparisonPreview({
  label,
  children,
  code,
  family,
  mode,
  labelPlacement = "header",
  previewSize = "default",
  previewClassName,
}: {
  label: string;
  children: ReactNode;
  code?: CodeContent;
  family?: Theme;
  mode?: PreviewMode;
  labelPlacement?: "header" | "corner";
  previewSize?: "default" | "tall" | "popover";
  previewClassName?: string;
}) {
  const previewMinHeight = {
    default: "min-h-28",
    tall: "min-h-56",
    popover: "min-h-80",
  }[previewSize];
  const showWipBadge = family === "elegant" && mode === "dark";

  return (
    <div
      data-source-comparison-pane={label.toLowerCase()}
      className="grid min-w-0 grid-rows-[minmax(6rem,1fr)_auto]"
    >
      <div
        className={[
          `relative flex h-full min-h-0 w-full min-w-0 max-w-full ${previewMinHeight} items-center justify-center overflow-hidden bg-white px-5 py-6 text-foreground`,
          previewClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {labelPlacement === "corner" ? (
          <span className="pointer-events-none absolute top-4 left-4 inline-flex items-center gap-1.5">
            <span className="font-mono text-[10px] leading-none font-medium text-foreground-placeholder uppercase">
              {label}
            </span>
            {showWipBadge ? (
              <Badge
                appearance="soft"
                variant="warning"
                uppercase
                className="h-4 px-1.5 text-[9px]"
              >
                WIP
              </Badge>
            ) : null}
          </span>
        ) : null}
        <div className="flex w-full min-w-0 max-w-full items-center justify-center">
          <PreviewThemeScope family={family} mode={mode} className="contents">
            {children}
          </PreviewThemeScope>
        </div>
      </div>
      {code ? (
        <div className={`border-t ${horizontalDividerClass} bg-[oklch(0.986_0_0)] px-4 py-4`}>
          <CodeBlock html={code} variant="embedded" />
        </div>
      ) : null}
    </div>
  );
}

function getComparisonPanes(item: SourceComparisonItem): ComparisonPane[] {
  if (item.brutal || item.elegant || item.elegantDark || item.current) {
    const brutal = item.brutal ?? item.current;
    const elegant = item.elegant ?? item.current;
    const elegantDark = item.elegantDark ?? item.current;
    const brutalCode = item.brutalCode ?? item.currentCode;
    const elegantCode = item.elegantCode ?? item.currentCode;
    const elegantDarkCode = item.elegantDarkCode ?? item.currentCode;

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
        children: brutal,
        code: brutalCode,
        family: "brutal" as Theme,
        mode: "light" as PreviewMode,
      },
      {
        label: "Elegant",
        children: elegant,
        code: elegantCode,
        family: "elegant" as Theme,
        mode: "light" as PreviewMode,
      },
      {
        label: "Elegant dark",
        children: elegantDark,
        code: elegantDarkCode,
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

function slugifyComparisonLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSourceComparisonItemIds(items: readonly SourceComparisonItem[]) {
  const counts = new Map<string, number>();

  return items.map((item) => {
    if (item.id) {
      return item.id;
    }

    const slug = slugifyComparisonLabel(item.label) || "item";
    const baseId = `source-comparison-${slug}`;
    const count = (counts.get(baseId) ?? 0) + 1;
    counts.set(baseId, count);

    return count === 1 ? baseId : `${baseId}-${count}`;
  });
}

function SourceSceneReferences({ groups }: { groups: readonly SourceSceneGroup[] }) {
  const sceneCount = getSceneCount(groups);
  const triggerLabel = `${sceneCount} source ${sceneCount === 1 ? "ref" : "refs"}`;

  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger
          className="font-mono text-[11px] leading-none font-semibold text-foreground-placeholder uppercase hover:text-foreground-muted"
          aria-label={triggerLabel}
        >
          {triggerLabel}
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-[min(34rem,calc(100vw-2rem))] p-0">
          <div className="border-b border-line-muted bg-[oklch(0.988_0.002_106.42)] px-3 py-2.5">
            <p className="font-mono text-xs leading-snug font-semibold text-foreground-muted uppercase">
              Source refs
            </p>
          </div>
          <div className="grid gap-6 px-3 py-3">
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
                        <InlineCode className="leading-5">{getSceneLabel(scene)}</InlineCode>
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
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}

export function SourceComparison({
  items,
  layout = "auto",
  previewSize,
  sourceScenes,
}: SourceComparisonProps) {
  const itemIds = getSourceComparisonItemIds(items);

  return (
    <div data-source-comparison className="space-y-16">
      {items.map((item, index) => {
        const itemId = itemIds[index];
        const status = item.status ?? "review";
        const StatusIcon = STATUS_ICON[status];
        const panes = getComparisonPanes(item);
        const itemSourceScenes = item.sourceScenes ?? sourceScenes;
        const isGridLayout = (layout === "grid" || panes.length >= 4) && panes.length >= 4;
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
            key={item.id ?? `${item.label}-${index}`}
            id={itemId}
            data-source-comparison-item={item.label}
            data-source-comparison-status={status}
            className="scroll-mt-8 space-y-5"
          >
            <div className="grid gap-2 px-1">
              <div className="flex min-w-0 items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-sm font-medium text-foreground-strong">
                    {item.label}
                  </h3>
                  <Badge
                    appearance="soft"
                    variant={STATUS_VARIANT[status] as BadgeProps["variant"]}
                  >
                    <StatusIcon aria-hidden className="size-3" />
                    {STATUS[status]}
                  </Badge>
                </div>
                {itemSourceScenes ? <SourceSceneReferences groups={itemSourceScenes} /> : null}
              </div>
              {item.note ? (
                <Text.Sans size="body" variant="placeholder">
                  {item.note}
                </Text.Sans>
              ) : null}
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
                      code={isGridLayout ? undefined : pane.code}
                      family={pane.family}
                      mode={pane.mode}
                      labelPlacement={isGridLayout ? "corner" : "header"}
                      previewSize={previewSize ?? (isGridLayout ? "tall" : "default")}
                      previewClassName={item.previewClassName}
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
