import { useRef } from "react";

import { TaskCardStateMatrixComposition } from "./compositions/task-card-state-matrix.composition";

/** Docs-only gallery layout and overlay container for the state matrix composition. */
export function TaskCardStateGallery() {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full max-w-5xl">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TaskCardStateMatrixComposition portalRef={portalRef} />
      </div>
      <div
        ref={portalRef}
        className="pointer-events-none absolute inset-0 z-50 *:pointer-events-auto"
      />
    </div>
  );
}
