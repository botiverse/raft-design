import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuItemCount,
  DropdownMenuSeparator,
  DropdownMenuSurface,
  DropdownMenuTrigger,
  useTheme,
} from "@slock/ui";
import { Check } from "lucide-react";
import { IconPlusOutline18, IconUsersPlusOutline18 } from "nucleo-ui-outline-18";
import { useId } from "react";

function ServerSwitcherCheckSlot({ visible }: { visible: boolean }) {
  return (
    <span className="flex size-3.5 shrink-0 items-center justify-center">
      <Check
        size={14}
        className={visible ? "shrink-0" : "shrink-0 opacity-0"}
        aria-hidden={!visible}
      />
    </span>
  );
}

function ServerSwitcherMenuContent() {
  const theme = useTheme();

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <DropdownMenuItem data-selected className={theme === "brutal" ? "font-bold" : undefined}>
          <ServerSwitcherCheckSlot visible />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate">Slock</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem className="font-medium">
          <ServerSwitcherCheckSlot visible={false} />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate">Design Guild</div>
          </div>
          <DropdownMenuItemCount>4</DropdownMenuItemCount>
        </DropdownMenuItem>
        <DropdownMenuItem className="font-medium">
          <ServerSwitcherCheckSlot visible={false} />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate">Open Source</div>
          </div>
          <DropdownMenuItemCount>12</DropdownMenuItemCount>
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem>
        <IconUsersPlusOutline18 />
        <span className="min-w-0 flex-1 text-left">Join Community</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <IconPlusOutline18 />
        <span className="min-w-0 flex-1 text-left">Switch or Create Server</span>
      </DropdownMenuItem>
    </>
  );
}

export function ServerSwitcherMenuComposition({ className }: { className?: string }) {
  const triggerId = useId();

  return (
    <div
      className={["flex h-full min-h-56 w-full items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
        <DropdownMenuSurface className="flex w-64 flex-col">
          <ServerSwitcherMenuContent />
        </DropdownMenuSurface>
      </DropdownMenu>
    </div>
  );
}
