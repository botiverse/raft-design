import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";

// The light-blue band across the top of a profile card (a hover card, a
// profile card) of someone from another server: the server's tile and name,
// then the relation word at the end ("External"). Blue because blue is
// "from another server" in Raft, the same meaning as the tile on the
// avatar's top-left corner. The words are the product's: raft-ui lays them
// out and holds none of them.
const originBand = tv({
  slots: {
    root: [
      "flex h-7 items-center gap-1.5 px-4",
      "bg-info-soft",
      "font-sans text-caption font-medium text-foreground",
    ],
    source: ["flex min-w-0 flex-1 items-center gap-1.5"],
    name: ["min-w-0 truncate"],
    relation: ["shrink-0 text-foreground-muted"],
  },
});

export type OriginBandProps = useRender.ComponentProps<"div">;

/** The band. Put it first in the card, above the header. */
export function OriginBand({ className, render, ...props }: OriginBandProps) {
  const { root } = originBand();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "origin-band",
    className: root({ className }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type OriginBandSourceProps = useRender.ComponentProps<"span">;

/** Where they are from: each server's tile (a `3xs` server `Avatar`) and
 *  `OriginBandName`. Takes the room the relation word leaves. */
export function OriginBandSource({ className, render, ...props }: OriginBandSourceProps) {
  const { source } = originBand();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "origin-band-source",
    className: source({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type OriginBandNameProps = useRender.ComponentProps<"span">;

/** The servers' names, on one line, truncated. */
export function OriginBandName({ className, render, ...props }: OriginBandNameProps) {
  const { name } = originBand();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "origin-band-name",
    className: name({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type OriginBandRelationProps = useRender.ComponentProps<"span">;

/** The relation word at the band's end, muted and never truncated. */
export function OriginBandRelation({ className, render, ...props }: OriginBandRelationProps) {
  const { relation } = originBand();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "origin-band-relation",
    className: relation({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
