import { HelpCircle, MessageSquare, Pencil, Trash2, User, X } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Runtime-only reconstruction of the source member-detail scene.
 *
 * The preserved source remains reference-only under packages/ui/source.
 * This preview mirrors the source primitives and class contracts without
 * pulling its product stores, routing, permissions, or dialogs into docs.
 */
export function MemberDetailSourcePreview() {
  return (
    <section className="flex h-[36rem] w-full max-w-[30rem] flex-col overflow-hidden border-2 border-black bg-white font-sans text-black">
      <header className="flex h-[62px] shrink-0 items-center gap-3 border-b-2 border-black bg-white px-5">
        <span className="flex size-9 shrink-0 items-center justify-center border-2 border-black bg-brutal-lavender">
          <User className="size-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-base leading-tight">CaliCastle</strong>
          <span className="block truncate font-mono text-xs text-black/50">@CaliCastle</span>
        </span>
        <span
          className="flex size-7 items-center justify-center border-2 border-black bg-white shadow-raft-sm"
          aria-hidden
        >
          <MessageSquare className="size-3.5" aria-hidden />
        </span>
        <span
          className="flex size-7 items-center justify-center border-2 border-black bg-white shadow-raft-sm"
          aria-hidden
        >
          <X className="size-3.5" aria-hidden />
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <div className="flex items-start gap-4 px-5 py-5">
          <span className="flex size-16 shrink-0 items-center justify-center border-2 border-black bg-brutal-lavender">
            <User className="size-8" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-lg leading-tight">CaliCastle</strong>
            <span className="block truncate font-mono text-sm text-black/50">@CaliCastle</span>
          </span>
        </div>

        <SourceSection title="Description" compactTitle>
          <p className="text-sm text-black/40 italic">No description</p>
        </SourceSection>

        <SourceSection title="Info">
          <dl className="grid gap-3">
            <div>
              <dt className="mb-1 flex items-center gap-2 text-xs text-black/50">
                Role
                <HelpCircle className="size-3" aria-hidden />
                <Pencil className="size-3" aria-hidden />
              </dt>
              <dd className="m-0">
                <span className="inline-block border-2 border-black bg-brutal-orange px-2 py-0.5 text-xs font-bold">
                  Owner
                </span>
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-xs text-black/50">Email</dt>
              <dd className="m-0 break-all font-mono text-sm">cali@zolplay.com</dd>
            </div>
            <div>
              <dt className="mb-1 text-xs text-black/50">Joined</dt>
              <dd className="m-0 font-mono text-sm">May 27, 2026</dd>
            </div>
          </dl>
        </SourceSection>

        <SourceSection title="Created agents" count={1}>
          <div className="border-2 border-black/30 bg-white px-3 py-2">
            <div className="flex w-full min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center border-2 border-black bg-brutal-cyan text-xs">
                DX
              </span>
              <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
                <strong className="truncate text-sm font-bold text-black">Dex</strong>
                <span className="font-mono text-xs text-black/50">External agent</span>
              </span>
              <span
                className="size-2.5 shrink-0 rounded-full border border-black bg-brutal-lime"
                role="img"
                aria-label="Online"
              />
            </div>
          </div>
        </SourceSection>

        <SourceSection title="Actions">
          <span
            className="flex w-full items-center justify-center gap-2 border-2 border-black bg-brutal-red px-4 py-2 text-sm font-bold shadow-raft-sm"
            aria-hidden
          >
            <Trash2 className="size-3.5" aria-hidden />
            Remove Member
          </span>
        </SourceSection>
      </div>
    </section>
  );
}

function SourceSection({
  children,
  compactTitle = false,
  count,
  title,
}: {
  children: ReactNode;
  compactTitle?: boolean;
  count?: number;
  title: string;
}) {
  return (
    <section className="border-t border-black/10 px-5 py-4">
      <h3
        className={[
          "flex items-baseline gap-2 text-xs font-bold tracking-widest text-black/60 uppercase",
          compactTitle ? "mb-1" : "mb-3",
        ].join(" ")}
      >
        {title}
        {count === undefined ? null : <span className="font-mono text-black/40">{count}</span>}
      </h3>
      {children}
    </section>
  );
}
