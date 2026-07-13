import { Skeleton, type SkeletonProps } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { VARIANTS } from "./skeleton.constants.ts";

type PlaygroundValues = {
  variant: NonNullable<SkeletonProps["variant"]>;
};

export function SkeletonPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{ variant: "line" }}
      controls={[{ name: "variant", label: "Variant", type: "select", options: VARIANTS }]}
      render={(values) => (
        <div className="flex min-h-20 items-center justify-center">
          <Skeleton
            variant={values.variant}
            className={
              values.variant === "line"
                ? "w-44"
                : values.variant === "circle"
                  ? "size-10"
                  : "size-12"
            }
          />
        </div>
      )}
    />
  );
}
