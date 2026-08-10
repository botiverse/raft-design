import { SidebarItemChannelComposition } from "./compositions/channel-item.composition.tsx";
import { SidebarItemDirectMessageComposition } from "./compositions/direct-message-item.composition.tsx";
import { SidebarItemNavigationComposition } from "./compositions/navigation-item.composition.tsx";

export function SidebarItemStatesComposition() {
  return (
    <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-3">
      <CompositionGroup title="Navigation">
        <SidebarItemNavigationComposition />
      </CompositionGroup>
      <CompositionGroup title="Channels">
        <SidebarItemChannelComposition />
      </CompositionGroup>
      <CompositionGroup title="Direct messages">
        <SidebarItemDirectMessageComposition />
      </CompositionGroup>
    </div>
  );
}

function CompositionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <h2 className="mb-2 text-xs font-medium text-foreground-muted">{title}</h2>
      {children}
    </section>
  );
}
