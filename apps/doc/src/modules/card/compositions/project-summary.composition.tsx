import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Text,
} from "raft-ui";

export function CardProjectSummaryComposition() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle render={<h3 />}>Design system review</CardTitle>
        <CardDescription>Five members are reviewing the next release.</CardDescription>
        <CardAction>
          <Badge variant="success">On track</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Text.Sans size="small">
          Tokens, components, and migration notes are ready for final approval.
        </Text.Sans>
      </CardContent>
      <CardFooter>
        <Text.Mono size="meta">Updated 4 minutes ago</Text.Mono>
      </CardFooter>
    </Card>
  );
}
