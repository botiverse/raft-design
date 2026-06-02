/**
 * Element props without `children` — for leaf components (dots, markers) that
 * render no caller content. React ships `ComponentPropsWithoutRef` but no
 * equivalent that subtracts children, so this names the one-off `Omit`.
 */
export type WithoutChildren<P> = Omit<P, "children">;
