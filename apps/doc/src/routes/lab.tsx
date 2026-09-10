import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { LogoShineLab } from "#/modules/logo/logo-shine.lab.tsx";
import { LogoSnapLab } from "#/modules/logo/logo-snap.lab.tsx";
import { PixelLoaderLab } from "#/modules/pixel-loader/pixel-loader.lab.tsx";

/**
 * Rendered INSIDE the docs shell, not as a standalone page (@xxchan: "/lab
 * 感觉不应该独立页面，需要有 sidebar").
 *
 * It used to carry `staticData: { standalone: true }`, which is what stripped
 * the sidebar and left it unreachable from the nav — you had to know the URL.
 * Same call as `/dashboard`: Playground simulates a whole product and wants the
 * viewport, but these are reference examples, and the docs chrome is what
 * carries the nav and the theme switcher.
 */
export const Route = createFileRoute("/lab")({
  component: LabPage,
});

const SECTIONS = [
  {
    id: "pixel-loader",
    title: "Pixel loader",
    description: "Five visible keys cycle through raft.build pixel sprites and the Raft mark.",
    render: () => <PixelLoaderLab />,
  },
  {
    id: "logo-shine",
    title: "Logo shine",
    description: "A primary-colored light band sweeps across the complete lockup.",
    render: () => <LogoShineLab />,
  },
  {
    id: "logo-snap",
    title: "Logo snap",
    description: "The mark assembles from two pieces, followed by the wordmark and a comic impact.",
    render: () => <LogoSnapLab />,
  },
] as const;

function LabPage() {
  return (
    <DocPage
      title="Lab"
      description="Motion and animation experiments: loaders and logo treatments, shown at the size they ship at."
      toc={SECTIONS.map(({ id, title }) => ({ id, title }))}
    >
      {SECTIONS.map(({ id, title, description, render }, index) => (
        // `showThemeSwitcher` on the first section only — it is a DocSection
        // affordance, and one switcher per page is how the other doc pages read.
        // These are motion pieces whose contrast differs sharply between brutal
        // and elegant, so being able to flip is the point of not being
        // standalone (the /dashboard review made the same call).
        <DocSection key={id} id={id} title={title} showThemeSwitcher={index === 0}>
          <LabIntro>{description}</LabIntro>
          {render()}
        </DocSection>
      ))}
    </DocPage>
  );
}

/** DocSection has no `description` prop; the lab copy renders as a lead line. */
function LabIntro({ children }: { children: ReactNode }) {
  return <p className="mb-7 text-sm leading-relaxed text-foreground-muted">{children}</p>;
}
