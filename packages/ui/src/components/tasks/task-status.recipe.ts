import { tv } from "../../lib/tv";

export type TaskStatusId = "todo" | "in_progress" | "in_review" | "done" | "closed";

export const taskStatus = tv({
  variants: {
    theme: {
      brutal: "",
      elegant: "",
    },
    status: {
      todo: "",
      in_progress: "",
      in_review: "",
      done: "",
      closed: "",
    },
  },
  compoundVariants: [
    { theme: "brutal", status: "todo", class: "bg-brutal-orange" },
    { theme: "brutal", status: "in_progress", class: "bg-brutal-cyan" },
    { theme: "brutal", status: "in_review", class: "bg-brutal-lavender" },
    { theme: "brutal", status: "done", class: "bg-brutal-lime" },
    { theme: "brutal", status: "closed", class: "bg-brutal-stone" },
    {
      theme: "elegant",
      status: "todo",
      class: "bg-[oklch(0.209_0.006_91.63_/_0.078)] text-[oklch(0.359_0.005_106.65)]",
    },
    {
      theme: "elegant",
      status: "in_progress",
      class: "bg-primary-400 text-primary-950",
    },
    {
      theme: "elegant",
      status: "in_review",
      class: "bg-warning-base text-foreground-inverse",
    },
    {
      theme: "elegant",
      status: "done",
      class: "bg-[oklch(0.714_0.176_153.03)] text-[oklch(1_0_0)]",
    },
    {
      theme: "elegant",
      status: "closed",
      class: "bg-[oklch(0.573_0_0)] text-[oklch(0.946_0_0)]",
    },
  ],
});
