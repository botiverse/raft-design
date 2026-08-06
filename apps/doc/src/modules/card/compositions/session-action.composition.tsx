import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "raft-ui";

export function CardSessionActionComposition() {
  const [loggedOut, setLoggedOut] = useState(false);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle render={<h3 />}>Log out</CardTitle>
        <CardDescription aria-live="polite">
          {loggedOut
            ? "Logged out of this browser."
            : "Log out of this browser. Your account and data stay; you can log back in any time."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-end">
        <Button
          type="button"
          variant="warning"
          size="sm"
          disabled={loggedOut}
          onClick={() => setLoggedOut(true)}
        >
          {loggedOut ? "Logged out" : "Log out"}
        </Button>
      </CardContent>
    </Card>
  );
}
