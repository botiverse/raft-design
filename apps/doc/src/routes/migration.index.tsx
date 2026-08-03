import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge, Text } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { MIGRATION_GUIDES } from "#/data/migration.ts";

export const Route = createFileRoute("/migration/")({ component: MigrationIndexPage });

function MigrationIndexPage() {
  return (
    <DocPage
      title="Migration"
      description="Source-file guides for moving slock-ui-backup usage to raft-ui."
      toc={[]}
      showToc={false}
      articleClassName="mx-auto max-w-4xl"
    >
      <div className="grid gap-5">
        <div className="flex items-center justify-between gap-4 border-b border-line-muted pb-3">
          <Text.Sans size="body" variant="placeholder">
            {MIGRATION_GUIDES.length} source files
          </Text.Sans>
          <Text.Mono size="meta" variant="placeholder">
            {countComponents()} component refs
          </Text.Mono>
        </div>

        <div className="overflow-hidden rounded-lg bg-layer-panel">
          {MIGRATION_GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              to="/migration/$sourceFile"
              params={{ sourceFile: guide.slug }}
              className="group grid gap-3 border-t border-line-muted px-4 py-4 transition-colors first:border-t-0 hover:bg-fill-muted/60 focus-visible:outline-none focus-visible:ring-[0.5px] focus-visible:ring-primary-500"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Text.Mono size="code" variant="muted" className="min-w-0 flex-1 truncate">
                  {guide.sourceFile}
                </Text.Mono>
                <ArrowRight
                  className="size-4 shrink-0 text-foreground-placeholder transition-transform group-hover:translate-x-0.5 group-hover:text-foreground-muted"
                  aria-hidden
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {guide.components.map((component) => (
                  <Badge
                    key={`${guide.slug}-${component.component}`}
                    appearance="soft"
                    variant="muted"
                    className="text-[11px]"
                  >
                    {component.componentLabel}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DocPage>
  );
}

function countComponents() {
  return MIGRATION_GUIDES.reduce((total, guide) => total + guide.components.length, 0);
}
