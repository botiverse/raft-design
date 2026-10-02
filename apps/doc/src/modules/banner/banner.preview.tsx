import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Banner, BannerAction, BannerDescription, BannerTitle, Button } from "raft-ui";
import type { BannerProps } from "raft-ui";
import { CircleAlert, CircleCheck, CircleX, Info, X } from "lucide-react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { SIZES, STATUSES } from "./banner.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

const STATUS_ICON = {
  default: Info,
  destructive: CircleX,
  warning: CircleAlert,
  info: Info,
  success: CircleCheck,
} as const;

type BannerPlaygroundPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function BannerPlaygroundPreview({ code, collapsedCode }: BannerPlaygroundPreviewProps) {
  const [status, setStatus] = useState<NonNullable<BannerProps["status"]>>("warning");
  const [size, setSize] = useState<NonNullable<BannerProps["size"]>>("md");
  const [withIcon, setWithIcon] = useState(true);
  const [withTitle, setWithTitle] = useState(false);
  const [withActions, setWithActions] = useState(false);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value as NonNullable<BannerProps["status"]>);
  }, []);
  const handleSizeChange = useCallback((value: string) => {
    setSize(value as NonNullable<BannerProps["size"]>);
  }, []);
  const Icon = STATUS_ICON[status];

  return (
    <Preview>
      <Preview.Canvas>
        <Banner status={status} size={size} className="w-[28rem]">
          {withIcon ? <Icon /> : null}
          {withTitle ? <BannerTitle>Review required</BannerTitle> : null}
          <BannerDescription>This action can&rsquo;t be undone.</BannerDescription>
          {withActions ? (
            <BannerAction>
              <Button size="icon-xs" aria-label="Dismiss">
                <X />
              </Button>
            </BannerAction>
          ) : null}
        </Banner>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Status" htmlFor="banner-preview-status">
          <Preview.Select
            id="banner-preview-status"
            label="Status"
            options={STATUSES}
            value={status}
            onValueChange={handleStatusChange}
          />
        </Preview.Control>
        <Preview.Control label="Size" htmlFor="banner-preview-size">
          <Preview.Select
            id="banner-preview-size"
            label="Size"
            options={SIZES}
            value={size}
            onValueChange={handleSizeChange}
          />
        </Preview.Control>
        <Preview.Control label="With icon" htmlFor="banner-preview-with-icon">
          <Preview.Checkbox
            id="banner-preview-with-icon"
            label="With icon"
            checked={withIcon}
            onCheckedChange={setWithIcon}
          />
        </Preview.Control>
        <Preview.Control label="With title" htmlFor="banner-preview-with-title">
          <Preview.Checkbox
            id="banner-preview-with-title"
            label="With title"
            checked={withTitle}
            onCheckedChange={setWithTitle}
          />
        </Preview.Control>
        <Preview.Control label="With actions" htmlFor="banner-preview-with-actions">
          <Preview.Checkbox
            id="banner-preview-with-actions"
            label="With actions"
            checked={withActions}
            onCheckedChange={setWithActions}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
