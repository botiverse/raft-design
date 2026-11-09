// Manual export of approved native source PNGs; not part of package installation/build.
// Pull the implementation Artifact sources/ folder, then:
// node packages/ui/scripts/export-ottie-art.mjs /absolute/path/to/sources
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
if (!process.argv[2]) throw new Error("Pass the folder containing wait/process/error/finish.png");
const output = fileURLToPath(new URL("../src/components/steps/ottie-assets", import.meta.url));
const sources = Object.fromEntries(
  ["wait", "process", "error", "finish"].map((state) => [
    state,
    path.resolve(process.argv[2], state + ".png"),
  ]),
);
const palettes = {
  wait: { gold: [252.9, 202.5, 102.5], brown: [170.4, 112.5, 64.7] },
  process: { gold: [253, 205.4, 103.8], brown: [165.8, 103.7, 48.7] },
  error: { gold: [252.7, 211.4, 118.4], brown: [164.8, 102.5, 44.7] },
  finish: { gold: [252.7, 200.1, 122.2], brown: [162.7, 107.9, 66.3] },
};
const b = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  const p = await b.newPage();
  let out = {};
  for (const [state, file] of Object.entries(sources)) {
    const buf = fs.readFileSync(file);
    const result = await p.evaluate(
      async ({ png, state, palette }) => {
        const target = { gold: [252.5, 200.5, 107.6], brown: [165.3, 107.4, 56.6] };
        let funcs = "";
        for (let c = 0; c < 3; c++) {
          let ps = [
            [0, 0],
            [palette.brown[c], target.brown[c]],
            [palette.gold[c], target.gold[c]],
            [255, 255],
          ].sort((a, b) => a[0] - b[0]);
          let vs = Array.from({ length: 129 }, (_, i) => {
            let x = (i / 128) * 255,
              j = 0;
            while (j < ps.length - 2 && x > ps[j + 1][0]) j++;
            let [x0, y0] = ps[j],
              [x1, y1] = ps[j + 1];
            return ((y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)) / 255).toFixed(5);
          });
          funcs += `<feFunc${["R", "G", "B"][c]} type="table" tableValues="${vs.join(" ")}"/>`;
        }
        let w = state === "wait" ? 256 : 768,
          h = state === "wait" ? 256 : 512;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><filter id="p" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feComponentTransfer>${funcs}</feComponentTransfer></filter></defs><image href="${png}" width="${w}" height="${h}" filter="url(#p)"/></svg>`;
        let i = new Image();
        i.src = "data:image/svg+xml;base64," + btoa(svg);
        await i.decode();
        let c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        let x = c.getContext("2d");
        x.drawImage(i, 0, 0);
        let alpha = Array.from(x.getImageData(0, 0, 1, 1).data);
        return { url: c.toDataURL("image/webp", 0.9), alpha, w, h };
      },
      { png: "data:image/png;base64," + buf.toString("base64"), state, palette: palettes[state] },
    );
    if (result.alpha[3] !== 0) throw Error(state + " not transparent");
    let asset = Buffer.from(result.url.split(",")[1], "base64");
    let dest = path.join(output, state + ".webp");
    fs.writeFileSync(dest, asset);
    out[state] = {
      sourceSha256: crypto.createHash("sha256").update(buf).digest("hex"),
      source: path.basename(file),
      bytes: asset.length,
      width: result.w,
      height: result.h,
      sha256: crypto.createHash("sha256").update(asset).digest("hex"),
      alpha: result.alpha,
    };
  }
  console.log(out);
} finally {
  await b.close();
}
