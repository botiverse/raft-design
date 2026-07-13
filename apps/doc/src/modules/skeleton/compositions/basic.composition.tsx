import { Skeleton } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SkeletonBasicContent() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" className="size-9" />
      <div className="grid w-48 gap-2">
        <Skeleton variant="line" className="w-32" />
        <Skeleton variant="line" className="w-44" />
      </div>
      <Skeleton variant="block" className="size-10" />
    </div>
  );
}

// @docs-source-strip-start
export function SkeletonBasicComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SkeletonBasicContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
