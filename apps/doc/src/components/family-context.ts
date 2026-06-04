import { createContext } from "react";
import type { Theme } from "@slock/ui";

export interface FamilyContextValue {
  family: Theme;
  setFamily: (family: Theme) => void;
}

/** Drives the documented `data-theme` family axis from the docs UI. */
export const FamilyContext = createContext<FamilyContextValue | null>(null);
