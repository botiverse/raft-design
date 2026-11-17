import "./origin-band.test.css";
/**
 * OriginBand (origin-band.md): a 28px band across the card's top; the
 * servers' names truncate and the relation word stays whole at the band's
 * end, 16px in from it. Real layout: only a browser computes it.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/origin-band`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarFallback } from "../avatar/avatar";
import { OriginBand, OriginBandName, OriginBandRelation, OriginBandSource } from "./origin-band";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

it("long names truncate and the relation word stays whole at the end", () => {
  render(
    <ThemeProvider>
      <div className="w-[300px]">
        <OriginBand data-testid="band">
          <OriginBandSource>
            <Avatar size="3xs" type="server">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Avatar size="3xs" type="server">
              <AvatarFallback>L</AvatarFallback>
            </Avatar>
            <OriginBandName data-testid="name">
              Acme Corp · Lumen Labs · Northwind Research · Contoso Systems
            </OriginBandName>
          </OriginBandSource>
          <OriginBandRelation data-testid="relation">External</OriginBandRelation>
        </OriginBand>
      </div>
    </ThemeProvider>,
  );
  const band = screen.getByTestId("band").getBoundingClientRect();
  expect(band.height).toBe(28);
  const name = screen.getByTestId("name");
  expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
  const relation = screen.getByTestId("relation");
  expect(relation.scrollWidth).toBeLessThanOrEqual(relation.clientWidth);
  expect(relation.getBoundingClientRect().right).toBe(band.right - 16);
  expect(name.getBoundingClientRect().right).toBeLessThanOrEqual(
    relation.getBoundingClientRect().left,
  );
});
