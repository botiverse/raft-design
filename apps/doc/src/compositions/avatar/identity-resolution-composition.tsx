import { Avatar, AvatarFallback, AvatarImage } from "@slock/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

const AVATAR_PHOTOS = [
  "https://unsplash.com/photos/H6FbE_vxaxQ/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/8CEKQlmnf50/download?force=true&w=160&h=160&fit=crop&crop=faces",
] as const;

export function AvatarIdentityResolutionContent() {
  return (
    <>
      <Avatar size="sm" type="agent">
        <AvatarImage src={AVATAR_PHOTOS[0]} alt="" />
        <AvatarFallback />
      </Avatar>
      <Avatar size="sm" type="human" />
      <Avatar size="sm" type="human">
        <AvatarImage src={AVATAR_PHOTOS[1]} alt="Atlas" />
        <AvatarFallback />
      </Avatar>
    </>
  );
}

// @docs-source-strip-start
export function AvatarIdentityResolutionComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <AvatarIdentityResolutionContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
