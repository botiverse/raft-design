import { tv } from "../../lib/tv";

export const messageSystem = tv({
  slots: {
    systemRoot: ["mb-1 flex min-w-0 items-center justify-center gap-2 px-2 py-1.5"],
    systemTime: ["shrink-0 whitespace-nowrap font-mono text-xs text-foreground/40"],
    systemContent: ["min-w-0 truncate text-xs text-foreground/50"],
    systemDisclosure: [
      "group flex max-w-full items-center gap-1.5 px-2 py-1",
      "text-xs text-foreground/50 transition-colors hover:text-foreground/75",
      "[&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:rotate-90 [&_svg]:text-foreground/35 [&_svg]:transition-transform",
      "aria-expanded:[&_svg]:-rotate-90",
    ],
  },
});
