import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RotateCw } from "lucide-react";
import { Button, Skeleton } from "@botiverse/raft-ui";
import { PageLoadingLine } from "@botiverse/raft-ui/wip";

/**
 * An in-app web page loading: the line sits on the bottom edge of the page's
 * top bar, follows the progress the web view reports, and fades when the page
 * has loaded. Reload to play it again.
 */
export function PageLoadingLinePreviewContent() {
  const [run, setRun] = useState(0);
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    setValue(null);
    setRun((r) => r + 1);
  }, []);

  // The progress a web view reports over a three-second load.
  useEffect(() => {
    const steps: [number, () => void][] = [
      [600, () => setValue(20)],
      [1100, () => setValue(45)],
      [1800, () => setValue(70)],
      [2500, () => setValue(90)],
      [3000, () => setLoading(false)],
    ];
    const timers = steps.map(([at, step]) => setTimeout(step, at));
    return () => timers.forEach(clearTimeout);
  }, [run]);

  return (
    <div className="flex w-full max-w-md flex-col overflow-hidden rounded-container border border-line-hairline bg-layer-canvas">
      <div className="relative flex h-11 items-center gap-1 border-b border-line-hairline px-1">
        <Button variant="ghost" size="icon-md" aria-label="Back">
          <ArrowLeft />
        </Button>
        <div className="min-w-0 flex-1 truncate px-1 text-label">Release notes</div>
        <Button variant="ghost" size="icon-md" aria-label="Reload" onClick={reload}>
          <RotateCw />
        </Button>
        <PageLoadingLine loading={loading} value={value} aria-label="Loading page" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
