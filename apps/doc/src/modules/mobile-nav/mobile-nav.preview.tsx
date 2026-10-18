import { MobileNavComposition } from "./mobile-nav.composition.tsx";

export function MobileNavPreview() {
  return (
    <div className="flex min-h-80 w-full items-end justify-center overflow-hidden bg-layer-sidebar">
      <MobileNavComposition />
    </div>
  );
}
