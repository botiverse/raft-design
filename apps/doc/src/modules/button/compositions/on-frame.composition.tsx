import { useCallback, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, History } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "raft-ui";

const LAST_PAGE = 2;

export function ButtonOnFrameComposition() {
  const [page, setPage] = useState(LAST_PAGE);
  const [workspace, setWorkspace] = useState("Acme");
  const handleBack = useCallback(() => setPage((current) => Math.max(0, current - 1)), []);
  const handleForward = useCallback(
    () => setPage((current) => Math.min(LAST_PAGE, current + 1)),
    [],
  );
  const handleHistory = useCallback((value: string) => setPage(Number(value)), []);

  return (
    <div className="flex items-center gap-1 rounded-control bg-layer-frame p-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="on-frame" />}>
          {workspace}
          <ChevronDown data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={workspace} onValueChange={setWorkspace}>
            <DropdownMenuRadioItem value="Acme">Acme</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Botiverse">Botiverse</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="on-frame"
        size="icon-md"
        aria-label="Back"
        disabled={page === 0}
        onClick={handleBack}
      >
        <ArrowLeft />
      </Button>
      <Button
        variant="on-frame"
        size="icon-md"
        aria-label="Forward"
        disabled={page === LAST_PAGE}
        onClick={handleForward}
      >
        <ArrowRight />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="on-frame" size="icon-md" />}
          aria-label="History"
        >
          <History />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={String(page)} onValueChange={handleHistory}>
            <DropdownMenuRadioItem value="2">Wug</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="1">#release-review</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="0">#launch-week</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
