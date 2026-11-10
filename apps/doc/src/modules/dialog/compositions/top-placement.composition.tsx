import { Search } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  SearchTrigger,
  SearchTriggerLabel,
  SearchTriggerShortcut,
} from "@botiverse/raft-ui";

export function TopPlacementComposition() {
  const fieldRef = useRef<HTMLButtonElement>(null);
  // Measured as the dialog opens: the card's top edge sits on the field's top.
  const [anchor, setAnchor] = useState<CSSProperties>();
  const handleOpenChange = useCallback((open: boolean) => {
    const field = fieldRef.current;
    if (open && field) {
      setAnchor({ "--dialog-top": `${field.getBoundingClientRect().top}px` } as CSSProperties);
    }
  }, []);
  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger ref={fieldRef} render={<SearchTrigger />}>
        <Search />
        <SearchTriggerLabel>Search Raft</SearchTriggerLabel>
        <SearchTriggerShortcut>⌘K</SearchTriggerShortcut>
      </DialogTrigger>
      <DialogContent size="lg" placement="top" style={anchor}>
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Search aria-hidden />
            </InputGroupAddon>
            <InputGroupInput aria-label="Search" placeholder="Search Raft" />
          </InputGroup>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
