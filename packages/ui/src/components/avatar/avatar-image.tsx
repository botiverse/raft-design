import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { tv } from "tailwind-variants";

// Managed avatar image. Base UI tracks its load state and hides it (revealing the
// Avatar fallback) while loading or on error. Fills the frame edge-to-edge.
const avatarImage = tv({
  base: ["size-full object-cover"],
});

// className narrowed to string (Base UI also allows a state callback, unused here)
// so it composes with tv().
export type AvatarImageProps = Omit<AvatarPrimitive.Image.Props, "className"> & {
  className?: string;
};

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={avatarImage({ className })}
      {...props}
    />
  );
}
