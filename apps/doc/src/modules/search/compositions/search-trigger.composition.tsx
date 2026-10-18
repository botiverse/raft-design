import { Search } from "lucide-react";
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

export function SearchTriggerComposition() {
  return (
    <Dialog>
      <DialogTrigger render={<SearchTrigger />}>
        <Search />
        <SearchTriggerLabel>Search Raft</SearchTriggerLabel>
        <SearchTriggerShortcut>⌘K</SearchTriggerShortcut>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogClose aria-label="Close" />
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
