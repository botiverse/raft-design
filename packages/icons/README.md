# ricons

The icons the Raft Design System draws itself, for meanings no Lucide icon carries, as React components. Every other icon in Raft comes from [Lucide](https://lucide.dev).

```tsx
import { ThreadIcon } from "@botiverse/ricons";

<ThreadIcon className="size-4" />;
```

Each icon is an `svg` drawn in `currentColor` that takes the `svg` element's own props. It is hidden from assistive technology, so name the control around it. The package depends only on React and needs no stylesheet.

[`@botiverse/raft-ui`](https://www.npmjs.com/package/@botiverse/raft-ui) re-exports every icon under the same name; import them from `@botiverse/ricons` in new code.

When to use each icon, how they are drawn and the rules: [Icons](https://raft-design.botiverse.build/components/icons/).
