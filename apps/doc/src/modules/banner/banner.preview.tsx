import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  type BannerActionProps,
  type BannerProps,
} from "raft-ui";
import { CircleAlert, CircleCheck, CircleX, Info, X } from "lucide-react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { ACTION_ALIGNS, SIZES, STATUSES } from "./banner.constants.ts";

const STATUS_ICON = {
  default: Info,
  destructive: CircleX,
  warning: CircleAlert,
  info: Info,
  success: CircleCheck,
} as const;

type PlaygroundValues = {
  status: BannerProps["status"];
  size: NonNullable<BannerProps["size"]>;
  actionAlign: NonNullable<BannerActionProps["align"]>;
  withIcon: boolean;
  withTitle: boolean;
  withActions: boolean;
};

export function BannerPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{
        status: "warning",
        size: "md",
        actionAlign: "middle",
        withIcon: true,
        withTitle: false,
        withActions: false,
      }}
      controls={[
        { name: "status", label: "Status", type: "select", options: STATUSES },
        { name: "size", label: "Size", type: "select", options: SIZES },
        { name: "actionAlign", label: "Action align", type: "select", options: ACTION_ALIGNS },
        { name: "withIcon", label: "With icon", type: "boolean" },
        { name: "withTitle", label: "With title", type: "boolean" },
        { name: "withActions", label: "With actions", type: "boolean" },
      ]}
      render={(values) => {
        const Icon = STATUS_ICON[values.status];
        return (
          <Banner status={values.status} size={values.size} className="w-[28rem]">
            {values.withIcon ? <Icon /> : null}
            {values.withTitle ? <BannerTitle>Review required</BannerTitle> : null}
            <BannerDescription>This action can&rsquo;t be undone.</BannerDescription>
            {values.withActions ? (
              <BannerAction align={values.actionAlign}>
                <Button size="icon-xs" aria-label="Dismiss">
                  <X />
                </Button>
              </BannerAction>
            ) : null}
          </Banner>
        );
      }}
    />
  );
}
