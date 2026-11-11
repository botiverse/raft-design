// Every entry installs the drag Escape guard on load, before any app code
// runs, so it precedes the app's own capture-phase Escape listeners even when
// the drag parts load later (lazily). Listed in package.json "sideEffects".
import "./lib/drag-escape";

export * from "./index-exports";
