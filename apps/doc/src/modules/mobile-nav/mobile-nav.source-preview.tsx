import { CheckSquare, Home, Settings, Users } from "lucide-react";

const ITEMS = [
  { icon: Home, label: "Home", selected: true },
  { icon: CheckSquare, label: "Tasks", selected: false },
  { icon: Users, label: "Members", selected: false },
  { icon: Settings, label: "Settings", selected: false },
] as const;

export function SourceMobileNavPreview() {
  return (
    <nav
      className="flex w-full border-t-2 border-black bg-white text-black"
      aria-label="Source mobile navigation"
    >
      {ITEMS.map(({ icon: Icon, label, selected }, index) => (
        <div
          key={label}
          className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold tracking-wider ${
            index < ITEMS.length - 1 ? "border-r-2 border-black" : ""
          } ${selected ? "bg-soft-signal" : "bg-white"}`}
        >
          <Icon size={18} aria-hidden />
          <span>{label}</span>
        </div>
      ))}
    </nav>
  );
}
