import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { tv } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";

// Managed avatar image. Base UI tracks its load state and hides it (revealing the
// Avatar fallback) while loading or on error. Fills the frame edge-to-edge.
const avatarImage = tv({
  base: ["size-full object-cover"],
});

export type AvatarImageProps = StyledProps<AvatarPrimitive.Image.Props>;

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={avatarImage({ className })}
      {...props}
    />
  );
}
