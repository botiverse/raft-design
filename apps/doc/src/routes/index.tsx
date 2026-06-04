import { createFileRoute, Link } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";

export const Route = createFileRoute("/")({ component: Home });

const TOC = [
  { id: "introduction", title: "Introduction" },
  { id: "installation", title: "Installation" },
] as const;

function Home() {
  return (
    <DocPage
      title="slock-ui"
      description="A React component library built on Base UI and styled with tailwind-variants."
      toc={TOC}
    >
      <DocSection id="introduction" title="Introduction">
        <p className="text-gray-600">
          slock-ui provides accessible primitives from{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">
            @base-ui/react
          </code>{" "}
          composed with Tailwind utilities through{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">
            tailwind-variants
          </code>
          . Browse the components in the sidebar to see their states and APIs.
        </p>
        <p className="mt-4">
          <Link
            to="/components/button"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View the Button component →
          </Link>
        </p>
      </DocSection>

      <DocSection id="installation" title="Installation">
        <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <code className="font-mono text-gray-900">pnpm add @slock/ui</code>
        </pre>
      </DocSection>
    </DocPage>
  );
}
