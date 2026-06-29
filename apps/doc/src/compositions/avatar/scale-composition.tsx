import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

const SIZES = ["xl", "lg", "md", "sm", "xs", "2xs"] as const;
const SIZE_LABELS = {
  xl: "64px profile",
  lg: "48px mention",
  md: "36px panel",
  sm: "32px list",
  xs: "20px compact",
  "2xs": "14px preview",
} as const;
const AVATAR_PHOTOS = [
  "https://unsplash.com/photos/n4KewLKFOZw/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/H6FbE_vxaxQ/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/mxwcEIqJ63Y/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/8CEKQlmnf50/download?force=true&w=160&h=160&fit=crop&crop=faces",
] as const;

export function AvatarScaleContent() {
  return (
    <>
      {SIZES.map((size, index) => (
        <div key={size} className="flex flex-col items-center gap-1.5">
          <Avatar size={size} type="agent">
            <AvatarImage src={AVATAR_PHOTOS[index % AVATAR_PHOTOS.length]} alt="" />
            <AvatarFallback />
          </Avatar>
          <span className="rounded-sm border border-black/10 bg-white/70 px-1 py-0.5 font-mono text-[9px] leading-none text-black/70">
            {size} / {SIZE_LABELS[size]}
          </span>
        </div>
      ))}
    </>
  );
}

// @docs-source-strip-start
export function AvatarScaleComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className} gap="loose">
      <AvatarScaleContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
