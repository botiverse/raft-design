import { RaftLogo, RaftLogoLockup, RaftWordmark } from "raft-ui";

export function LogoComposition() {
  return (
    <div className="grid w-full gap-8 md:grid-cols-3">
      <div className="flex min-h-36 items-center justify-center bg-layer-panel p-6">
        <RaftLogo role="img" aria-label="Raft" className="h-20 w-auto" />
      </div>
      <div className="flex min-h-36 items-center justify-center bg-layer-panel p-6">
        <RaftWordmark role="img" aria-label="Raft" className="h-12 w-auto max-w-full" />
      </div>
      <div className="flex min-h-36 items-center justify-center bg-layer-panel p-6">
        <RaftLogoLockup role="img" aria-label="Raft" className="h-16 w-auto max-w-full" />
      </div>
      <div className="flex items-center justify-center gap-3 md:col-span-3">
        <RaftLogo aria-hidden className="h-8 w-auto" />
        <span>Decorative mark beside visible brand text</span>
      </div>
    </div>
  );
}
