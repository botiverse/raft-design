import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { DESKTOP_MEDIA_QUERY } from "./desktop-media";

const read = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

test("the JavaScript desktop query is the one the stylesheets use", () => {
  for (const file of ["../styles.css", "../foundation.css", "../../scripts/build-tokens.mjs"]) {
    expect(read(file), file).toContain(`@media ${DESKTOP_MEDIA_QUERY} {`);
  }
});
