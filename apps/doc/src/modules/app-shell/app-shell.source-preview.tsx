export function SourceAppShellPreview() {
  return (
    <div className="flex h-[420px] w-full overflow-hidden border-2 border-black bg-white font-sans text-black">
      <aside className="flex w-16 shrink-0 items-center justify-center border-r-2 border-black bg-soft-signal text-xs font-bold uppercase">
        Rail
      </aside>
      <aside className="flex w-60 shrink-0 items-center justify-center border-r-2 border-black bg-brutal-cream text-xs font-bold uppercase">
        Sidebar
      </aside>
      <main className="flex min-w-0 flex-1 items-center justify-center bg-white text-xs font-bold uppercase">
        Main
      </main>
    </div>
  );
}
