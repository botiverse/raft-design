import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { LogoShineLab } from "#/modules/logo/logo-shine.lab.tsx";
import { LogoSnapLab } from "#/modules/logo/logo-snap.lab.tsx";
import { PixelLoaderLab } from "#/modules/pixel-loader/pixel-loader.lab.tsx";

export const Route = createFileRoute("/lab")({
  staticData: { standalone: true },
  component: LabPage,
});

function LabPage() {
  return (
    <div className="h-full overflow-y-auto bg-layer-page text-foreground">
      <main className="w-full pb-24">
        <LabSection
          id="pixel-loader"
          title="Pixel loader"
          description="Five visible keys cycle through raft.build pixel sprites and the Raft mark."
        >
          <PixelLoaderLab />
        </LabSection>

        <LabSection
          id="logo-shine"
          title="Logo shine"
          description="A primary-colored light band sweeps across the complete lockup."
        >
          <LogoShineLab />
        </LabSection>

        <LabSection
          id="logo-snap"
          title="Logo snap"
          description="The mark assembles from two pieces, followed by the wordmark and a comic impact."
        >
          <LogoSnapLab />
        </LabSection>
      </main>
    </div>
  );
}

function LabSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-line-subtle py-12 first:border-t-0">
      <header className="mb-7 px-6">
        <h2 className="font-heading text-xl font-medium text-foreground-strong">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{description}</p>
      </header>
      {children}
    </section>
  );
}
