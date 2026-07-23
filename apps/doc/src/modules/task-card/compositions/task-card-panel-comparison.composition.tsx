import { TaskCardComparisonComposition } from "./task-card-comparison.composition.tsx";

export function TaskCardPanelComparisonComposition() {
  return (
    <section className="w-full max-w-md border-2 border-line-strong bg-layer-panel p-4 text-foreground">
      <header className="mb-4 border-b-2 border-line-strong pb-2 font-bold">Channel tasks</header>
      <TaskCardComparisonComposition showNotice={false} showChannelName />
    </section>
  );
}
