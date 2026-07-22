import { TaskCardComparisonComposition } from "./task-card-comparison.composition.tsx";

export function TaskCardPanelComparisonComposition() {
  return (
    <section className="w-full max-w-md border border-line bg-layer-panel p-4 text-foreground">
      <header className="mb-4 border-b border-line pb-2 font-semibold">Channel tasks</header>
      <TaskCardComparisonComposition showNotice={false} />
    </section>
  );
}
