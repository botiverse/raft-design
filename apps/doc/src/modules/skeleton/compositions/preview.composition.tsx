import { Skeleton } from "raft-ui";

export function SkeletonPreviewContent() {
  return (
    <div className="flex min-h-20 items-center justify-center">
      <Skeleton variant="line" className="w-44" />
    </div>
  );
}
