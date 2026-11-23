import { useCallback, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@botiverse/raft-ui";

export function ButtonRowActionContent() {
  const [status, setStatus] = useState("");
  const handleCopyLink = useCallback(() => setStatus("Link copied"), []);
  const handleResolve = useCallback(() => setStatus("Comment resolved"), []);

  return (
    <div className="flex w-80 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="min-w-0 truncate text-body font-bold">Wug</span>
        <span className="text-footnote text-foreground-muted">2m</span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" className="ml-auto" />}
            aria-label="More"
          >
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyLink}>Copy link</DropdownMenuItem>
            <DropdownMenuItem onClick={handleResolve}>Resolve</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-body">Shall we move the launch to Thursday?</p>
      <p role="status" className="text-footnote text-foreground-muted">
        {status}
      </p>
    </div>
  );
}
