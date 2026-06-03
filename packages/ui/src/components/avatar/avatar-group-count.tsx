import type { ComponentPropsWithRef } from "react";
import { useTheme } from "../../lib/theme/use-theme.ts";
import { avatar, type AvatarSize } from "./avatar.tsx";

// Trailing "+N" overflow chip for an AvatarGroup. Reuses the Avatar `root` frame
// (same size + border per step) but omits `type`, swapping the role fill for a
// neutral stone chip with centered tabular text.
export type AvatarGroupCountProps = ComponentPropsWithRef<"span"> & {
  /** Matches the frame scale of the sibling avatars. */
  size: AvatarSize;
};

export function AvatarGroupCount({ size, className, ...props }: AvatarGroupCountProps) {
  const theme = useTheme();
  const { root } = avatar({ theme, size });
  return (
    <span
      data-slot="avatar-group-count"
      className={root({
        class: [
          "bg-brutal-stone font-bold text-xs leading-none tabular-nums text-black",
          className,
        ],
      })}
      {...props}
    />
  );
}
