import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import type { SlotElementProps } from "../../lib/data-attributes";
import { searchEntity } from "./search-entity.recipe";

export type SearchEntityResultProps = useRender.ComponentProps<"button"> & {
  selected?: boolean;
};
export function SearchEntityResult({
  selected = false,
  className,
  render,
  ...props
}: SearchEntityResultProps) {
  const { entity } = searchEntity();
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "search-entity-result",
    "data-selected": selected ? "true" : undefined,
    className: entity({ className }),
    type: render ? undefined : "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type SearchEntityResultContentProps = useRender.ComponentProps<"div">;
export function SearchEntityResultContent({
  className,
  render,
  ...props
}: SearchEntityResultContentProps) {
  const { entityContent } = searchEntity();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-entity-result-content",
    className: entityContent({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchEntityResultHeaderProps = useRender.ComponentProps<"div">;
export function SearchEntityResultHeader({
  className,
  render,
  ...props
}: SearchEntityResultHeaderProps) {
  const { entityHeader } = searchEntity();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-entity-result-header",
    className: entityHeader({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchEntityResultLeadingProps = useRender.ComponentProps<"div">;
export function SearchEntityResultLeading({
  className,
  render,
  ...props
}: SearchEntityResultLeadingProps) {
  const { entityLeading } = searchEntity();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-entity-result-leading",
    className: entityLeading({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchEntityResultIconProps = useRender.ComponentProps<"div">;
export function SearchEntityResultIcon({
  className,
  render,
  ...props
}: SearchEntityResultIconProps) {
  const { entityIcon } = searchEntity();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "search-entity-result-icon",
    className: entityIcon({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SearchEntityResultActivityProps = useRender.ComponentProps<"span">;
export function SearchEntityResultActivity({
  className,
  render,
  ...props
}: SearchEntityResultActivityProps) {
  const { entityActivity } = searchEntity();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-entity-result-activity",
    className: entityActivity({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

type SearchEntityResultTextProps = useRender.ComponentProps<"span"> & { muted?: boolean };

export type SearchEntityResultTitleProps = SearchEntityResultTextProps;
export function SearchEntityResultTitle({
  muted = false,
  className,
  render,
  ...props
}: SearchEntityResultTitleProps) {
  const { entityTitle } = searchEntity();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-entity-result-title",
    "data-muted": muted ? "" : undefined,
    className: entityTitle({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SearchEntityResultDescriptionProps = SearchEntityResultTextProps;
export function SearchEntityResultDescription({
  muted = false,
  className,
  render,
  ...props
}: SearchEntityResultDescriptionProps) {
  const { entityDescription } = searchEntity();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "search-entity-result-description",
    "data-muted": muted ? "" : undefined,
    className: entityDescription({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
