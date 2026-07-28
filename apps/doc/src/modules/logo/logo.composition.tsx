import { RaftLogo, RaftLogoLockup, RaftWordmark } from "raft-ui";

export function LogoMarkContent() {
  return <RaftLogo role="img" aria-label="Raft" className="h-20 w-auto" />;
}

export function LogoWordmarkContent() {
  return <RaftWordmark role="img" aria-label="Raft" className="h-12 w-auto max-w-full" />;
}

export function LogoLockupContent() {
  return <RaftLogoLockup role="img" aria-label="Raft" className="h-16 w-auto max-w-full" />;
}

// @docs-source-strip-start
export function LogoComposition() {
  return (
    <div className="grid w-full gap-8 md:grid-cols-3">
      <div className="flex min-h-36 items-center justify-center bg-layer-panel p-6">
        <LogoMarkContent />
      </div>
      <div className="flex min-h-36 items-center justify-center bg-layer-panel p-6">
        <LogoWordmarkContent />
      </div>
      <div className="flex min-h-36 items-center justify-center bg-layer-panel p-6">
        <LogoLockupContent />
      </div>
      <div className="flex items-center justify-center gap-3 md:col-span-3">
        <RaftLogo aria-hidden className="h-8 w-auto" />
        <span>Decorative mark beside visible brand text</span>
      </div>
    </div>
  );
}
// @docs-source-strip-end
