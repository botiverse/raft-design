import { Avatar, AvatarFallback, AvatarImage } from "cuvii-rui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

const SIZES = ["xl", "lg", "md", "sm", "xs", "2xs"] as const;
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
        <Avatar key={size} size={size} type="agent">
          <AvatarImage src={AVATAR_PHOTOS[index % AVATAR_PHOTOS.length]} alt="" />
          <AvatarFallback />
        </Avatar>
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
