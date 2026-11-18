// raft-ui's own lint rule for the docs app's examples, loaded from source: the
// published plugin (`@botiverse/raft-ui/lint`) is the built package, which a
// lint run here doesn't require first.
import { preferScrollArea } from "../../packages/ui/src/lint/prefer-scroll-area.ts";

export default {
  meta: { name: "raft-ui" },
  rules: { "prefer-scroll-area": preferScrollArea },
};
