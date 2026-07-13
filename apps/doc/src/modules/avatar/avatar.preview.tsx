import { Avatar, type AvatarProps } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { SIZE_OPTIONS, TYPES } from "./avatar.constants.ts";

type PlaygroundValues = {
  size: NonNullable<AvatarProps["size"]>;
  type: NonNullable<AvatarProps["type"]>;
};

export function AvatarPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{ size: "lg", type: "agent" }}
      controls={[
        { name: "size", label: "Size", type: "select", options: SIZE_OPTIONS },
        { name: "type", label: "Type", type: "select", options: TYPES },
      ]}
      render={(values) => <Avatar size={values.size} type={values.type} />}
    />
  );
}
