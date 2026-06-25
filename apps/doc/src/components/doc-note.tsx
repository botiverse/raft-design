import { Text, type TextSansProps } from "raft-ui";

type DocNoteProps = TextSansProps;

export function DocNote({
  className,
  size = "body",
  variant = "placeholder",
  ...props
}: DocNoteProps) {
  return (
    <Text.Sans
      size={size}
      variant={variant}
      className={["pb-6", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
