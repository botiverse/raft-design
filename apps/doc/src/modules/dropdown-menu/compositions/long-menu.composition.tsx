import { useCallback, useState } from "react";
import { Folder, FolderInput, FolderPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@botiverse/raft-ui";
import { DropdownMenuPinnedFooter } from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function LongMenuContent() {
  const [section, setSection] = useState("Launch");
  const [created, setCreated] = useState(false);
  const createSection = useCallback(() => setCreated(true), []);
  const sections = [
    "Launch",
    "Design reviews",
    "Agents",
    "Runtime",
    "Billing",
    "Docs",
    "Mobile",
    "Desktop",
    "Onboarding",
    "Growth",
    "Support",
    "Incidents",
    "Infrastructure",
    "Security",
    "Data",
    "Research",
    "Hiring",
    "Partners",
    "Marketplace",
    "Apps",
    "Integrations",
    "Localization",
    "Accessibility",
    "Archive 2025",
  ];
  return (
    <div className="flex flex-col items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <FolderInput />
          Move to
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-label="Move to section">
          <DropdownMenuRadioGroup value={section} onValueChange={setSection}>
            {sections.map((name) => (
              <DropdownMenuRadioItem key={name} value={name}>
                <Folder />
                <DropdownMenuItemLabel>{name}</DropdownMenuItemLabel>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuPinnedFooter>
            <DropdownMenuItem onClick={createSection}>
              <FolderPlus />
              <DropdownMenuItemLabel>New section</DropdownMenuItemLabel>
            </DropdownMenuItem>
          </DropdownMenuPinnedFooter>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="m-0 text-footnote text-foreground-muted" aria-live="polite">
        {created ? "New section created" : `#design-system is in ${section}`}
      </p>
    </div>
  );
}

// @docs-source-strip-start
export function LongMenuComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <LongMenuContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
