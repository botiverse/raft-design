import { ArrowLeft } from "lucide-react";

// MobileTopBar — placeholder skeleton.
//
// Will eventually own:
// - back button (wired to useMobileBack in useAppNavigate.ts)
// - active title (per master / detail)
// - server switcher dropdown (currently in the desktop sidebar header)
//
// In this scaffold it just renders a 56px-tall white bar with a back-arrow
// placeholder so the layout reserves real estate. Real wiring lands in
// follow-up PRs after the master/detail mobile components exist.

export interface MobileTopBarProps {
  title?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

export default function MobileTopBar({ title, onBack, rightSlot }: MobileTopBarProps) {
  return (
    <header className="flex h-14 items-center gap-3 border-b-2 border-black bg-white px-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="btn-brutal-sm bg-white p-1.5"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
      ) : (
        // Reserve symmetric space so the title stays centered visually
        // when there is no back action.
        <div className="size-8 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1 truncate text-base font-bold text-black">
        {title ?? ""}
      </div>
      <div className="shrink-0">{rightSlot}</div>
    </header>
  );
}
