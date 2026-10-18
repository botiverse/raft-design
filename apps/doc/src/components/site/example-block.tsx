import { Component, useCallback, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { Code, Smartphone } from "lucide-react";
import {
  Button,
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockTitle,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Skeleton,
} from "@botiverse/raft-ui";
import { cn } from "@botiverse/raft-ui/cn";

import { PreviewThemeScope, useResolvedPreviewMode } from "#/components/preview-theme.tsx";
import { CodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";
import { ShikiHighlightedCode } from "#/lib/code-block/shiki-highlighted-code.tsx";

import { hasExample, loadExample, loadExampleSource } from "#/lib/examples.ts";

type Theme = "page" | "light" | "dark" | "both";

/** A composition that throws (one that needs props, say) shows a note instead of breaking the page. */
class ExampleBoundary extends Component<
  { path: string; children: ReactNode },
  { error: Error | null }
> {
  override state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <p className="font-mono text-mono-meta text-foreground-hint">
        {this.props.path} could not be rendered on its own: {this.state.error.message}
      </p>
    );
  }
}

/**
 * An `example` block: the composition rendered live, then its source. The
 * canvas follows the page's mode; Light, Dark and Both pin it, and Phone loads
 * the same composition in a 375px frame so media queries see a phone.
 */
export function ExampleBlock({ path }: { path: string }) {
  const [Example, setExample] = useState<ComponentType | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>("page");
  const [phone, setPhone] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const pageMode = useResolvedPreviewMode();
  const handleThemeChange = useCallback((value: unknown) => setTheme(value as Theme), []);
  const togglePhone = useCallback(() => setPhone((current) => !current), []);
  const toggleCode = useCallback(() => setShowCode((current) => !current), []);

  useEffect(() => {
    let cancelled = false;
    void loadExample(path).then((component) => {
      if (!cancelled) setExample(() => component);
    });
    void loadExampleSource(path).then((code) => {
      if (!cancelled) setSource(code);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!hasExample(path)) {
    return (
      <div className="my-6 rounded-container border border-dashed border-line-seam p-4 font-mono text-mono-meta text-foreground-hint">
        Missing example: {path}
      </div>
    );
  }

  const modes: ("light" | "dark")[] =
    theme === "both" ? ["light", "dark"] : [theme === "page" ? pageMode : theme];

  return (
    <figure className="my-6 overflow-hidden rounded-container border border-line-hairline">
      <div className="flex flex-wrap items-center gap-2 border-b border-line-hairline bg-layer-canvas px-3 py-2">
        <figcaption className="mr-auto min-w-0 truncate font-mono text-mono-meta text-foreground-hint">
          {path}
        </figcaption>
        <SegmentedControl
          aria-label="Example theme"
          value={theme}
          onValueChange={handleThemeChange}
        >
          <SegmentedControlItem value="page">
            <SegmentedControlLabel>Page</SegmentedControlLabel>
          </SegmentedControlItem>
          <SegmentedControlItem value="light">
            <SegmentedControlLabel>Light</SegmentedControlLabel>
          </SegmentedControlItem>
          <SegmentedControlItem value="dark">
            <SegmentedControlLabel>Dark</SegmentedControlLabel>
          </SegmentedControlItem>
          <SegmentedControlItem value="both">
            <SegmentedControlLabel>Both</SegmentedControlLabel>
          </SegmentedControlItem>
        </SegmentedControl>
        <Button
          variant={phone ? "default" : "ghost"}
          size="icon-md"
          aria-label="Phone width"
          aria-pressed={phone}
          onClick={togglePhone}
        >
          <Smartphone />
        </Button>
        <Button
          variant={showCode ? "default" : "ghost"}
          size="icon-md"
          aria-label="Show code"
          aria-pressed={showCode}
          onClick={toggleCode}
        >
          <Code />
        </Button>
      </div>

      <div className={cn("grid", modes.length === 2 && "md:grid-cols-2")}>
        {modes.map((mode) => (
          <PreviewThemeScope
            key={mode}
            mode={mode}
            className="relative flex min-h-40 items-center justify-center bg-layer-canvas p-6 not-last:border-b md:not-last:border-r md:not-last:border-b-0 border-line-hairline"
          >
            {modes.length === 2 ? (
              <span className="absolute top-2 left-3 font-mono text-mono-meta text-foreground-hint">
                {mode === "light" ? "Light" : "Dark"}
              </span>
            ) : null}
            {phone ? (
              <iframe
                title={`${path} at phone width`}
                src={`/iframe/example?path=${encodeURIComponent(path)}&mode=${mode}`}
                className="h-[560px] w-[375px] max-w-full rounded-container border border-line-seam bg-layer-canvas"
              />
            ) : Example ? (
              <ExampleBoundary path={path}>
                <Example />
              </ExampleBoundary>
            ) : (
              <Skeleton className="h-10 w-40" />
            )}
          </PreviewThemeScope>
        ))}
      </div>

      {showCode && source ? (
        <CodeBlock className="rounded-none border-0 border-t border-line-hairline">
          <CodeBlockHeader>
            <CodeBlockTitle>tsx</CodeBlockTitle>
            <CodeBlockActions>
              <CodeCopyAction code={source} />
            </CodeBlockActions>
          </CodeBlockHeader>
          <CodeBlockBody>
            <ShikiHighlightedCode code={source} language="tsx" />
          </CodeBlockBody>
        </CodeBlock>
      ) : null}
    </figure>
  );
}
