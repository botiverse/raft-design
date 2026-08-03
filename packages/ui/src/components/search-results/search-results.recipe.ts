import { tv } from "../../lib/tv";

export const searchResults = tv({
  slots: {
    summary: ["mb-3 block px-1 text-xs font-bold uppercase tracking-widest"],
    section: ["mb-3"],
    sectionHeading: ["px-1 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em]"],
    list: ["flex flex-col gap-2"],
    entity: ["flex w-full items-stretch border-2 text-left transition-colors"],
    entityOpen: ["min-w-0 flex-1 p-3 text-left"],
    message: ["w-full text-left transition-colors"],
    thread: ["overflow-hidden border-2 transition-colors"],
    threadHeader: ["border-b-2 px-3 py-2"],
    threadMessages: ["flex flex-col [&>*:first-child]:border-t-0"],
    empty: ["flex flex-col items-center justify-center text-center"],
    error: ["border-2 p-4"],
  },
  variants: {
    theme: {
      brutal: {
        summary: ["text-black/60"],
        sectionHeading: ["text-black/50"],
        entity: [
          "border-black/30 bg-white",
          "hover:border-black hover:shadow-raft-sm active:border-black active:shadow-raft-sm",
          "data-[selected=true]:border-black data-[selected=true]:shadow-raft-sm",
        ],
        entityOpen: [],
        message: [
          "border-2 border-black/30 bg-white p-3",
          "hover:border-black hover:shadow-raft-sm active:border-black active:shadow-raft-sm",
          "data-[selected=true]:border-black data-[selected=true]:shadow-raft-sm",
          "data-[nested=true]:border-x-0 data-[nested=true]:border-b-0 data-[nested=true]:border-t-2 data-[nested=true]:px-3 data-[nested=true]:py-3",
          "data-[nested=true]:border-black/10 data-[nested=true]:hover:border-black/10 data-[nested=true]:hover:bg-black/[0.03] data-[nested=true]:hover:shadow-none",
          "data-[nested=true][data-selected=true]:border-black data-[nested=true][data-selected=true]:bg-[oklch(0.96299649_0.06890535_97.696701)] data-[nested=true][data-selected=true]:shadow-none",
        ],
        thread: [
          "border-black/30 bg-white",
          "hover:border-black hover:shadow-raft-sm",
          "data-[selected=true]:border-black data-[selected=true]:shadow-raft-sm",
        ],
        threadHeader: ["border-black bg-[oklch(0.96625109_0.02494438_333.728876)]"],
        empty: [],
        error: ["border-black bg-white shadow-raft-sm"],
      },
      elegant: {},
    },
  },
});
