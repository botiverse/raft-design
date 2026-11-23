import { useCallback, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  helperText,
  CardSubtitle,
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
        {signedOut ? (
          <CardSubtitle role="status">Signed out of this browser.</CardSubtitle>
        ) : (
          <CardDescription>
            {helperText("Your account and data stay; you can sign back in any time.", {
              why: "consequence",
              about: "session",
            })}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex justify-end">
        <Button
          type="button"
          variant="warning"
          size="md"
          disabled={signedOut}
          onClick={handleSignOut}
        >
          {signedOut ? "Signed out" : "Sign out"}
        </Button>
      </CardContent>
    </Card>
  );
}
