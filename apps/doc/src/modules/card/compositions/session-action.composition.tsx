import { useCallback, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@botiverse/raft-ui";

export function CardSessionActionComposition() {
  const [signedOut, setSignedOut] = useState(false);

  const handleSignOut = useCallback(() => {
    setSignedOut(true);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle render={<h3 />}>Sign out</CardTitle>
        <CardDescription aria-live="polite">
          {signedOut
            ? "Signed out of this browser."
            : "Sign out of this browser. Your account and data stay; you can sign back in any time."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-end">
        <Button
          type="button"
          variant="warning"
          size="sm"
          disabled={signedOut}
          onClick={handleSignOut}
        >
          {signedOut ? "Signed Out" : "Sign Out"}
        </Button>
      </CardContent>
    </Card>
  );
}
