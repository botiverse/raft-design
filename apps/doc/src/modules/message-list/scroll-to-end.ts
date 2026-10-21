/** Scroll a list to its end, as Back to Bottom does. */
export function scrollToEnd(list: HTMLDivElement | null) {
  list?.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
}
