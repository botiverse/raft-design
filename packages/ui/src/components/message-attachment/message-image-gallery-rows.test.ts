import { expect, test } from "vite-plus/test";
import {
  SINGLE_IMAGE_MAX_HEIGHT,
  SINGLE_IMAGE_MAX_WIDTH,
  buildMessageImageGalleryRows,
  classifyMessageImageAspect,
} from "./message-image-gallery-rows";

const image = (width: number | null, height: number | null) => ({ width, height });

test("empty input has no rows", () => {
  expect(buildMessageImageGalleryRows([])).toEqual([]);
});

test("aspect thresholds match the slock message gallery", () => {
  // The two numbers are a contract carried over from slock; do not re-estimate.
  expect(classifyMessageImageAspect(image(220, 100))).toBe("wide");
  expect(classifyMessageImageAspect(image(219, 100))).toBe("normal");
  expect(classifyMessageImageAspect(image(56, 100))).toBe("normal");
  expect(classifyMessageImageAspect(image(55, 100))).toBe("tall");
  expect(classifyMessageImageAspect(image(null, 100))).toBe("normal");
  expect(classifyMessageImageAspect(image(100, null))).toBe("normal");
  expect(classifyMessageImageAspect(image(0, 100))).toBe("normal");
  expect(classifyMessageImageAspect(image(-10, 100))).toBe("normal");
});

test("a single image reserves its own proportions and never crops", () => {
  expect(buildMessageImageGalleryRows([image(800, 600)])).toEqual([
    {
      items: [
        {
          index: 0,
          fit: "contain",
          reserved: { width: "min(384px, 100%)", aspectRatio: "800 / 600" },
        },
      ],
    },
  ]);
});

test("a single wide image is capped to the 416x288 box", () => {
  expect(SINGLE_IMAGE_MAX_WIDTH).toBe(416);
  expect(SINGLE_IMAGE_MAX_HEIGHT).toBe(288);
  expect(buildMessageImageGalleryRows([image(1000, 200)])).toEqual([
    {
      items: [
        {
          index: 0,
          fit: "contain",
          reserved: { width: "min(416px, 100%)", aspectRatio: "1000 / 200" },
        },
      ],
    },
  ]);
});

test("a single tall image is capped to the height box", () => {
  expect(buildMessageImageGalleryRows([image(200, 1000)])).toEqual([
    {
      items: [
        {
          index: 0,
          fit: "contain",
          reserved: { width: "min(58px, 100%)", aspectRatio: "200 / 1000" },
        },
      ],
    },
  ]);
});

test("a single small image is not upscaled", () => {
  expect(buildMessageImageGalleryRows([image(100, 75)])).toEqual([
    {
      items: [
        {
          index: 0,
          fit: "contain",
          reserved: { width: "min(100px, 100%)", aspectRatio: "100 / 75" },
        },
      ],
    },
  ]);
});

test("a single image without dimensions reserves the 4/3 fallback box", () => {
  const fallback = {
    items: [
      { index: 0, fit: "contain", reserved: { width: "min(11rem, 100%)", aspectRatio: "4 / 3" } },
    ],
  };
  expect(buildMessageImageGalleryRows([image(null, null)])).toEqual([fallback]);
  expect(buildMessageImageGalleryRows([image(0, 0)])).toEqual([fallback]);
});

test("two to three normal images share a row and crop", () => {
  expect(buildMessageImageGalleryRows([image(800, 600), image(400, 400)])).toEqual([
    {
      items: [
        { index: 0, fit: "cover" },
        { index: 1, fit: "cover" },
      ],
    },
  ]);
  expect(buildMessageImageGalleryRows([image(800, 600), image(400, 400), image(120, 90)])).toEqual([
    {
      items: [
        { index: 0, fit: "cover" },
        { index: 1, fit: "cover" },
        { index: 2, fit: "cover" },
      ],
    },
  ]);
});

test("rows of three continue across more than one row", () => {
  const five = [image(800, 600), image(400, 400), image(120, 90), image(800, 600), image(400, 400)];
  expect(buildMessageImageGalleryRows(five)).toEqual([
    {
      items: [
        { index: 0, fit: "cover" },
        { index: 1, fit: "cover" },
        { index: 2, fit: "cover" },
      ],
    },
    {
      items: [
        { index: 3, fit: "cover" },
        { index: 4, fit: "cover" },
      ],
    },
  ]);

  const seven = [...five, image(120, 90), image(400, 400)];
  expect(buildMessageImageGalleryRows(seven)).toEqual([
    {
      items: [
        { index: 0, fit: "cover" },
        { index: 1, fit: "cover" },
        { index: 2, fit: "cover" },
      ],
    },
    {
      items: [
        { index: 3, fit: "cover" },
        { index: 4, fit: "cover" },
        { index: 5, fit: "cover" },
      ],
    },
    { items: [{ index: 6, fit: "cover" }] },
  ]);
});

test("a lone buffer of exactly four splits two and two", () => {
  expect(
    buildMessageImageGalleryRows([
      image(800, 600),
      image(400, 400),
      image(120, 90),
      image(400, 400),
    ]),
  ).toEqual([
    {
      items: [
        { index: 0, fit: "cover" },
        { index: 1, fit: "cover" },
      ],
    },
    {
      items: [
        { index: 2, fit: "cover" },
        { index: 3, fit: "cover" },
      ],
    },
  ]);
});

test("a wide image takes its own row and flushes the buffer", () => {
  expect(
    buildMessageImageGalleryRows([image(800, 600), image(1000, 200), image(400, 400)]),
  ).toEqual([
    { items: [{ index: 0, fit: "cover" }] },
    { items: [{ index: 1, fit: "contain" }] },
    { items: [{ index: 2, fit: "cover" }] },
  ]);

  expect(
    buildMessageImageGalleryRows([
      image(800, 600),
      image(400, 400),
      image(1000, 200),
      image(400, 400),
      image(120, 90),
      image(400, 400),
    ]),
  ).toEqual([
    {
      items: [
        { index: 0, fit: "cover" },
        { index: 1, fit: "cover" },
      ],
    },
    { items: [{ index: 2, fit: "contain" }] },
    {
      items: [
        { index: 3, fit: "cover" },
        { index: 4, fit: "cover" },
        { index: 5, fit: "cover" },
      ],
    },
  ]);

  expect(buildMessageImageGalleryRows([image(1000, 200), image(1200, 200)])).toEqual([
    { items: [{ index: 0, fit: "contain" }] },
    { items: [{ index: 1, fit: "contain" }] },
  ]);
});

test("a tall image stays in the buffer and only changes how it fills its cell", () => {
  expect(buildMessageImageGalleryRows([image(300, 600), image(800, 600)])).toEqual([
    {
      items: [
        { index: 0, fit: "contain" },
        { index: 1, fit: "cover" },
      ],
    },
  ]);
  // Four buffered items (including the tall one) still split two and two.
  expect(
    buildMessageImageGalleryRows([
      image(800, 600),
      image(300, 600),
      image(120, 90),
      image(400, 400),
    ]),
  ).toEqual([
    {
      items: [
        { index: 0, fit: "cover" },
        { index: 1, fit: "contain" },
      ],
    },
    {
      items: [
        { index: 2, fit: "cover" },
        { index: 3, fit: "cover" },
      ],
    },
  ]);
});

test("images without dimensions crop like normal ones", () => {
  expect(buildMessageImageGalleryRows([image(null, null), image(0, 0)])).toEqual([
    {
      items: [
        { index: 0, fit: "cover" },
        { index: 1, fit: "cover" },
      ],
    },
  ]);
});

test("matches the slock message gallery layout for the same inputs", () => {
  // Comparison run carried over with the migration: the same mixed input must
  // produce the same rows the slock builder produced before the port.
  const input = [
    image(800, 600), // normal
    image(300, 600), // tall
    image(1000, 200), // wide
    image(120, 90), // normal
    image(null, null), // unknown
    image(400, 400), // normal
  ];
  expect(buildMessageImageGalleryRows(input)).toEqual([
    {
      items: [
        { index: 0, fit: "cover" },
        { index: 1, fit: "contain" },
      ],
    },
    { items: [{ index: 2, fit: "contain" }] },
    {
      items: [
        { index: 3, fit: "cover" },
        { index: 4, fit: "cover" },
        { index: 5, fit: "cover" },
      ],
    },
  ]);
});
