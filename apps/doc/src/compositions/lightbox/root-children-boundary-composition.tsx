// Generated source-comparison composition fixture.
export const compositionSource =
  "function Lightbox({ closeOnModW = true, children, ...props }) {\n  const dialogRef = useRef<Dialog.Root.Actions>(null);\n  const modWClose =\n    closeOnModW && effectiveOpen ? <LightboxModWClose dialogRef={dialogRef} /> : null;\n\n  return (\n    <Dialog.Root actionsRef={dialogRef} {...props}>\n      {modWClose}\n      {children}\n    </Dialog.Root>\n  );\n}";
