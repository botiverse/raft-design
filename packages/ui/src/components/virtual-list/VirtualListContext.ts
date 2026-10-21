/* The list's imperative API, provided to its items. */
import { createContext } from "react";

import type { VirtualListApi } from "./public-types";

export const VirtualListContext = createContext<VirtualListApi | null>(null);
