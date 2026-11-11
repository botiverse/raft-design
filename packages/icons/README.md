# ricons

The icons the Raft Design System draws itself, for meanings no Lucide icon carries, as React components. Every other icon in Raft comes from [Lucide](https://lucide.dev).

```tsx
import { ThreadIcon } from "@botiverse/ricons";

<ThreadIcon className="size-4" />;
```

Load the stylesheet once, unless the app already loads raft-ui's `styles.css`, which imports it. It holds the rule that draws `UnfollowArtifactIcon`'s minus heavier at 16px; without it the icon keeps the plain minus at every size.

```css
@import "@botiverse/ricons/styles.css";
```

Each icon is an `svg` drawn in `currentColor` that takes the `svg` element's own props. It is hidden from assistive technology, so name the control around it. The package depends only on React.

[`@botiverse/raft-ui`](https://www.npmjs.com/package/@botiverse/raft-ui) re-exports every icon under the same name; import them from `@botiverse/ricons` in new code.

When to use each icon, how they are drawn and the rules: [Icons](https://raft-design.botiverse.build/components/icons/).
