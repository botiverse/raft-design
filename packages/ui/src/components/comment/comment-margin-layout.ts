/** One card in the margin: where its anchor is and how tall the card is, in px. */
export type CommentMarginLayoutItem = {
  id: string;
  /** The y of the card's anchor, measured from the top of the margin. */
  top: number;
  /** The card's rendered height. */
  height: number;
};

export type CommentMarginLayoutOptions = {
  /** Space between two cards that would otherwise touch, in px. Default 8. */
  gap?: number;
  /** The card pinned to its anchor; the others make room around it. */
  activeId?: string | null;
};

export type CommentMarginLayout = {
  /** The resolved top of each card, by id. */
  tops: Record<string, number>;
  /** The bottom of the lowest card: the height the margin needs. */
  height: number;
};

/**
 * Places the cards of a comment margin the way Google Docs does. Cards keep
 * document order (by their anchor's top; equal tops keep the order given) and
 * never overlap: each sits at its anchor, or `gap` below the card before it.
 * The active card is pinned to its anchor instead, the cards above it are
 * pushed up to make room and the cards below it pushed down. Nothing goes
 * above 0: when the cards above the active one don't fit between 0 and its
 * anchor, they stack from 0 and the active card follows them.
 */
export function resolveCommentMarginLayout(
  items: readonly CommentMarginLayoutItem[],
  { gap = 8, activeId = null }: CommentMarginLayoutOptions = {},
): CommentMarginLayout {
  const order = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => a.item.top - b.item.top || a.index - b.index)
    .map(({ item }) => item);
  const tops = order.map((item) => item.top);

  const stackDown = (from: number, floor: number) => {
    let next = floor;
    for (let i = from; i < order.length; i += 1) {
      tops[i] = Math.max(order[i]!.top, next);
      next = tops[i]! + order[i]!.height + gap;
    }
  };

  const pinned = activeId == null ? -1 : order.findIndex((item) => item.id === activeId);
  if (pinned < 0) {
    stackDown(0, 0);
  } else {
    tops[pinned] = Math.max(order[pinned]!.top, 0);
    for (let i = pinned - 1; i >= 0; i -= 1) {
      tops[i] = Math.min(order[i]!.top, tops[i + 1]! - gap - order[i]!.height);
    }
    if (pinned > 0 && tops[0]! < 0) {
      stackDown(0, 0);
    } else {
      stackDown(pinned + 1, tops[pinned]! + order[pinned]!.height + gap);
    }
  }

  const result: Record<string, number> = {};
  let height = 0;
  order.forEach((item, i) => {
    result[item.id] = tops[i]!;
    height = Math.max(height, tops[i]! + item.height);
  });
  return { tops: result, height };
}
