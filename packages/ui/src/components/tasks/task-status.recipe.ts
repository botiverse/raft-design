import { tv } from "../../lib/tv";

export type TaskStatusId = "todo" | "in-progress" | "in-review" | "done" | "closed";

export const taskStatus = tv({
  variants: {
    theme: {
      brutal: "",
      elegant: "",
    },
    status: {
      todo: "",
      "in-progress": "",
      "in-review": "",
      done: "",
      closed: "",
    },
  },
  compoundVariants: [
    { theme: "brutal", status: "todo", class: "bg-brutal-orange" },
    { theme: "brutal", status: "in-progress", class: "bg-brutal-cyan" },
    { theme: "brutal", status: "in-review", class: "bg-brutal-lavender" },
    { theme: "brutal", status: "done", class: "bg-brutal-lime" },
    { theme: "brutal", status: "closed", class: "bg-brutal-stone" },
    {
      theme: "elegant",
      status: "todo",
      class: "bg-ink-8 text-foreground-muted",
    },
    {
      theme: "elegant",
      status: "in-progress",
      class: "bg-primary-400 text-primary-950",
    },
    {
      theme: "elegant",
      status: "in-review",
      class: "bg-warning text-warning-foreground",
    },
    {
      theme: "elegant",
      status: "done",
      class: "bg-success text-success-foreground",
    },
    {
      theme: "elegant",
      status: "closed",
      class: "bg-inactive text-inactive-foreground",
    },
  ],
});
