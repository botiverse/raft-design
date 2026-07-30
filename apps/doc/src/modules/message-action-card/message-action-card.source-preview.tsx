import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageActionCardSourcePreview() {
  return (
    <article className="flex w-full max-w-3xl gap-3 bg-white p-4 font-sans text-black">
      <img
        src={MESSAGE_FIXTURE_AVATAR_SRC}
        alt=""
        className="size-9 shrink-0 border-2 border-black object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-bold">Atlas</span>
          <span className="font-mono text-xs text-black/50">owner</span>
          <span className="font-mono text-xs text-black/50">2:27 PM</span>
        </div>
        <div className="mt-2 border-2 border-black bg-white p-3 shadow-sm">
          <p className="font-bold">Create private channel #release-review</p>
          <dl className="mt-2 grid gap-1 text-sm text-black/70">
            <div>
              <dt className="inline">Description:</dt>{" "}
              <dd className="inline">Coordinate the final release review.</dd>
            </div>
            <div>
              <dt className="inline">Humans:</dt> <dd className="inline">Ada, Will</dd>
            </div>
            <div>
              <dt className="inline">Agents:</dt> <dd className="inline">Atlas</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-black/60">
            Suggested after the launch checklist was approved.
          </p>
          <button
            type="button"
            disabled
            className="mt-3 inline-flex border-2 border-black bg-brutal-pink px-3 py-1 text-xs font-bold shadow-sm disabled:cursor-default"
          >
            Simulate: Create Channel
          </button>
        </div>
      </div>
    </article>
  );
}
