import { use } from "react";
import { FamilyContext, type FamilyContextValue } from "#/components/family-context.ts";

export function useFamily(): FamilyContextValue {
  const value = use(FamilyContext);
  if (!value) {
    throw new Error("useFamily must be used within the docs FamilyContext provider");
  }
  return value;
}
