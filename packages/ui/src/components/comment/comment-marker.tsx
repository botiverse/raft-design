import { Button as BaseButton } from "@base-ui/react/button";
import type { DataAttributes } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { comment } from "./comment.recipe";

export type CommentMarkerProps = StyledProps<BaseButton.Props> &
  DataAttributes & {
    /** The marker of the discussion that is open. */
    active?: boolean;
  };

/**
 * Where there is no room for a margin: a small button beside a passage that
 * has comments, with the authors' avatars (an `AvatarGroup` of up to 3
 * `size="2xs"` avatars) and the count. It opens the discussion, in a bottom
 * sheet. Give it an `aria-label` that starts with the count ("2 comments").
 */
export function CommentMarker({
  className,
  render,
  nativeButton,
  active = false,
  ...props
}: CommentMarkerProps) {
  const { marker } = comment();
  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      data-slot="comment-marker"
      data-active={active ? "" : undefined}
      className={marker({ className })}
    />
  );
}
