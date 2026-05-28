import { expect, test } from "@playwright/test";
import { loginViaApi } from "../../fixtures/auth";
import { waitForSeedState } from "../../fixtures/seedState";
import { dismissOwnerOnboarding } from "../../fixtures/session";

const TEST_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAGAAAAA2CAIAAAC3LQuFAAAAZ0lEQVR42u3QQQkAQAgAMKOZ6/rYyD5eCsHHYAkW03nLq1NCkCBBggQJEiRIkCBBggQJEiRIkCBBggQJEiRIkCBBggQJEiRIkCBBggQJEiRIkCBBggQJEiRIkCBBggQJEiRIkCBBuz50p3KXsCdByQAAAABJRU5ErkJggg==";

test("select screenshot renders protected attachment image and reaction chip", async ({ page, request }) => {
  const seedState = await waitForSeedState();
  const login = await loginViaApi(request, seedState);
  await dismissOwnerOnboarding(request, seedState, login.accessToken);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`/s/${seedState.server.slug}/channel/${seedState.channel.id}`);
  await page.waitForSelector('[data-testid="message-scroller"]');

  const result = await page.evaluate(async ({ imageBase64 }) => {
    const { captureSelectedMessages } = await import("/src/utils/selectScreenshot.ts");
    const originalFetch = window.fetch.bind(window);
    const requestedUrls: string[] = [];
    window.fetch = async (input, init) => {
      const url = String(input);
      requestedUrls.push(url);
      if (url.includes("/api/attachments/attachment-for-export?disposition=inline")) {
        const bytes = Uint8Array.from(atob(imageBase64), (char) => char.charCodeAt(0));
        return new Response(new Blob([bytes], { type: "image/png" }), {
          status: 200,
          headers: { "Content-Type": "image/png" },
        });
      }
      return originalFetch(input, init);
    };

    const host = document.createElement("div");
    host.style.width = "520px";
    host.style.background = "#fff";
    host.style.padding = "20px";
    host.style.fontFamily = getComputedStyle(document.body).fontFamily;
    host.innerHTML = `
      <div id="message-export-fixture" class="group relative flex gap-3 border-2 border-transparent bg-transparent p-2">
        <div class="size-8 shrink-0 rounded-full bg-brutal-yellow border-2 border-black"></div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-bold text-black">Developer</div>
          <div class="text-sm text-black">download-as-image image + reaction fixture</div>
          <div class="mt-1 space-y-2">
            <div class="max-w-[28rem] space-y-2">
              <div class="grid gap-2 grid-cols-1">
                <button type="button" class="group/img relative overflow-hidden border-2 border-black bg-transparent text-left inline-block w-fit max-w-[26rem] justify-self-start" title="fixture.png">
                  <img src="https://cdn.invalid/thumbnail-that-should-not-be-used.png" alt="fixture.png" data-select-screenshot-attachment-id="attachment-for-export" data-select-screenshot-attachment-width="96" data-select-screenshot-attachment-height="54" class="block max-h-72 w-auto max-w-full object-contain bg-white" loading="lazy" />
                  <span data-message-affordance="image-download">download affordance should be stripped</span>
                </button>
              </div>
            </div>
          </div>
          <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span class="inline-flex">
              <button type="button" class="inline-flex h-5 items-center gap-1 rounded bg-[#EEEDE6] px-1.5 text-[12px] font-bold leading-none text-black" aria-label="👀 reaction from Developer">
                <span class="inline-flex items-center leading-none">👀</span>
                <span class="font-mono tabular-nums">1</span>
              </button>
            </span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(host);

    const dataUrl = await captureSelectedMessages(["export-fixture"], {
      backgroundColor: "#FFFFFF",
      pixelRatio: 2,
    });
    const preview = new Image();
    await new Promise<void>((resolve, reject) => {
      preview.onload = () => resolve();
      preview.onerror = () => reject(new Error("export preview failed to load"));
      preview.src = dataUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = preview.naturalWidth;
    canvas.height = preview.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("missing canvas context");
    ctx.drawImage(preview, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let pinkPixels = 0;
    let grayChipPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      if (a > 220 && r > 230 && g >= 80 && g <= 170 && b >= 120 && b <= 210) pinkPixels += 1;
      if (a > 220 && r >= 220 && r <= 245 && g >= 220 && g <= 245 && b >= 210 && b <= 235) grayChipPixels += 1;
    }
    return {
      dataUrl,
      requestedUrls,
      pinkPixels,
      grayChipPixels,
    };
  }, { imageBase64: TEST_IMAGE_BASE64 });

  expect(result.requestedUrls).toContain("/api/attachments/attachment-for-export?disposition=inline&selectScreenshot=1");
  expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
  expect(result.pinkPixels).toBeGreaterThan(1_000);
  expect(result.grayChipPixels).toBeGreaterThan(20);
});
