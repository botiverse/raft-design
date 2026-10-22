import { Link } from "@tanstack/react-router";
import {
  InlineCode,
  MarkdownHeading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@botiverse/raft-ui";

import type { ApiComponent, ChangeEntry } from "#/lib/content/api.ts";
import type { DocPage } from "#/lib/content/pages.ts";
import { useMessages } from "#/lib/i18n/use-locale.ts";

import { StatusLabel } from "./status-label.tsx";

/** Parts with the same props (every icon, say) share one table. */
function groupBySameProps(components: readonly ApiComponent[]) {
  const groups: { names: string[]; component: ApiComponent }[] = [];
  for (const component of components) {
    const key = JSON.stringify([component.props, component.native, component.deprecated]);
    const previous = groups.at(-1);
    if (
      previous &&
      JSON.stringify([
        previous.component.props,
        previous.component.native,
        previous.component.deprecated,
      ]) === key
    ) {
      previous.names.push(component.name);
    } else {
      groups.push({ names: [component.name], component });
    }
  }
  return groups;
}

function PropsTable({ component }: { component: ApiComponent }) {
  const messages = useMessages();
  if (component.props.length === 0) {
    return component.native ? (
      <p className="text-callout text-foreground-muted">{messages.takesAttributes}</p>
    ) : (
      <p className="text-callout text-foreground-muted">{messages.noProps}</p>
    );
  }
  return (
    <>
      <div className="overflow-x-auto rounded-container border border-line-hairline">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{messages.prop}</TableHead>
              <TableHead>{messages.type}</TableHead>
              <TableHead>{messages.default}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {component.props.map((prop) => (
              <TableRow key={prop.name}>
                <TableCell className="align-top">
                  <span className="font-mono text-mono-meta whitespace-nowrap">
                    {prop.name}
                    {prop.required ? (
                      <span className="text-foreground-hint"> (required)</span>
                    ) : null}
                  </span>
                  {prop.description || prop.deprecated ? (
                    <span className="mt-1 block max-w-80 text-caption text-foreground-muted">
                      {prop.deprecated ? messages.deprecatedProp : ""}
                      {prop.description}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="align-top font-mono text-mono-meta wrap-break-word">
                  {prop.type}
                </TableCell>
                <TableCell className="align-top font-mono text-mono-meta whitespace-nowrap">
                  {prop.default ?? ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {component.native ? (
        <p className="mt-2 text-callout text-foreground-muted">
          Also takes the attributes of its element.
        </p>
      ) : null}
    </>
  );
}

/** The API, generated from raft-ui's TypeScript: one table per exported part. */
export function ApiSection({ components }: { components: readonly ApiComponent[] }) {
  return (
    <section className="mt-12">
      <MarkdownHeading level={2} id="api" className="scroll-mt-6">
        API
      </MarkdownHeading>
      {components.length === 0 ? (
        <p className="text-body text-foreground-muted">
          raft-ui exports no component from this folder.
        </p>
      ) : (
        groupBySameProps(components).map(({ names, component }) => (
          <div key={names[0]} className="mt-8">
            <MarkdownHeading level={3} id={names[0]!.toLowerCase()} className="scroll-mt-6">
              {names.join(", ")}
            </MarkdownHeading>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-callout text-foreground-muted">
              {component.deprecated ? <StatusLabel status="deprecated" /> : null}
              {component.entry === "@botiverse/raft-ui/wip" ? (
                <StatusLabel status="experimental" />
              ) : null}
              {typeof component.deprecated === "string" ? (
                <span>{component.deprecated}</span>
              ) : null}
              {component.description ? <span>{component.description}</span> : null}
            </div>
            <PropsTable component={component} />
          </div>
        ))
      )}
    </section>
  );
}

export function RelatedSection({ pages }: { pages: readonly DocPage[] }) {
  const messages = useMessages();
  if (pages.length === 0) return null;
  return (
    <section className="mt-12">
      <MarkdownHeading level={2} id="related" className="scroll-mt-6">
        {messages.related}
      </MarkdownHeading>
      <ul className="flex flex-wrap gap-2">
        {pages.map((page) => (
          <li key={page.url}>
            <Link
              to={page.url}
              className="inline-flex h-8 items-center rounded-control border-[1.5px] border-line-strong px-3 text-subhead outline-none hover:overlay-medium focus-visible:shadow-focus"
            >
              {page.frontMatter.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Code spans in a changelog line, as the changelog writes them. */
function ChangeText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
          // oxlint-disable-next-line react/no-array-index-key -- a static split of one string
          <InlineCode key={index}>{part.slice(1, -1)}</InlineCode>
        ) : (
          part.replace(/\*\*/g, "")
        ),
      )}
    </>
  );
}

export function ChangesSection({ changes }: { changes: readonly ChangeEntry[] }) {
  const messages = useMessages();
  if (changes.length === 0) return null;
  return (
    <section className="mt-12">
      <MarkdownHeading level={2} id="changes" className="scroll-mt-6">
        {messages.changes}
      </MarkdownHeading>
      <ul className="flex flex-col rule-y rule-line-hairline">
        {changes.map((change) => (
          <li
            key={`${change.version}-${change.text}`}
            className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4"
          >
            <Link
              to="/changelog"
              className="w-28 shrink-0 font-mono text-mono-meta text-foreground-hint hover:text-foreground"
            >
              {change.version} · {change.kind}
            </Link>
            <span className="min-w-0 text-callout text-foreground-muted">
              <ChangeText text={change.text} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
