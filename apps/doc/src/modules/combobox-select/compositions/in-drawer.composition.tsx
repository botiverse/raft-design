import { useCallback, useId, useState } from "react";
import {
  Button,
  Drawer,
  DrawerActions,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Field,
  FieldLabel,
} from "@botiverse/raft-ui";
import { ComboboxSelect } from "@botiverse/raft-ui/wip";
import type { ComboboxSelectValue } from "@botiverse/raft-ui/wip";

const computers = [
  { value: "xxchan-linux", label: "xxchan-linux" },
  { value: "armbian-raft", label: "armbian-raft" },
  { value: "armbian-gx", label: "armbian-gx" },
  { value: "botiversemac-mini", label: "botiversemac-mini" },
  { value: "macmini-agent-1", label: "macmini-agent-1" },
  { value: "macmini-agent-2", label: "macmini-agent-2" },
  { value: "macmini-agent-3", label: "macmini-agent-3" },
  { value: "hetzner-ex63-1", label: "hetzner-ex63-1" },
  { value: "hetzner-ex63-2", label: "hetzner-ex63-2" },
  { value: "hetzner-ex63-3", label: "hetzner-ex63-3" },
  { value: "hetzner-ex63-4", label: "hetzner-ex63-4" },
  { value: "studio-m4", label: "studio-m4" },
  { value: "build-runner-1", label: "build-runner-1" },
  { value: "build-runner-2", label: "build-runner-2" },
];

export function InDrawerComposition() {
  const id = useId();
  const [computer, setComputer] = useState<ComboboxSelectValue | null>(null);
  const [movedTo, setMovedTo] = useState<ComboboxSelectValue | null>(null);
  const handleMove = useCallback(() => setMovedTo(computer), [computer]);

  return (
    <div className="flex flex-col items-start gap-3">
      <Drawer>
        <DrawerTrigger render={<Button variant="outline" />}>Move agent</DrawerTrigger>
        <DrawerContent className="min-h-[70lvh]">
          <DrawerHeader>
            <DrawerTitle>Move Bugen</DrawerTitle>
            <DrawerDescription>Bugen keeps its memory and its channels.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="w-full items-stretch text-left">
            <Field>
              <FieldLabel htmlFor={id}>Target computer</FieldLabel>
              <ComboboxSelect
                id={id}
                options={computers}
                value={computer}
                onValueChange={setComputer}
                listMaxHeight="20rem"
                placeholder="Search computers"
                emptyContent="No computers match"
              />
            </Field>
          </DrawerBody>
          <DrawerFooter>
            <DrawerActions>
              <DrawerClose
                render={<Button variant="primary" size="lg" />}
                disabled={computer === null}
                onClick={handleMove}
              >
                Move
              </DrawerClose>
              <DrawerClose render={<Button variant="outline" size="lg" />}>Cancel</DrawerClose>
            </DrawerActions>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {/* @docs-source-strip-start */}
      <output className="text-footnote text-foreground-muted" aria-live="polite">
        {movedTo === null ? "Bugen runs on xxchan-linux" : `Bugen moved to ${String(movedTo)}`}
      </output>
      {/* @docs-source-strip-end */}
    </div>
  );
}
