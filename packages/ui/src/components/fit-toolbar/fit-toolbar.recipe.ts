import { tv } from "../../lib/tv";

export const fitToolbar = tv({
  slots: {
    root: ["flex min-w-0 max-w-full flex-nowrap items-center", "data-fit-wrapping:flex-wrap"],
    group: [
      "group/fit-group flex shrink-0 flex-nowrap items-center",
      "data-fit-wrap:order-last data-fit-wrap:basis-full",
    ],
    full: ["contents group-data-fit-group/fit-group:hidden"],
    short: ["hidden group-data-fit-group/fit-group:contents"],
  },
});
