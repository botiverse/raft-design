import { tv } from "../../lib/tv";

export type TaskStatusId = "todo" | "in_progress" | "in_review" | "done" | "closed";

export const taskStatus = tv({
  variants: {
    theme: {
      brutal: "",
      elegant: "",
    },
    status: {
      todo: "bg-brutal-orange",
      in_progress: "bg-brutal-cyan",
      in_review: "bg-brutal-lavender",
      done: "bg-brutal-lime",
      closed: "bg-brutal-stone",
    },
  },
});
