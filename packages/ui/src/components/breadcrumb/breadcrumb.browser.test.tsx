/**
 * Breadcrumb's laws, mounted (§11, §39).
 *
 * Three of them carry the component's real weight, and each is a claim a reader would simply
 * assume. The SEPARATOR is the system's and stops before the end — the part shadcn hands to a
 * call site, so if the rule is wrong nothing else in the package will notice. The chevron is
 * priced off the LINE, so it has to move when the step does, which a pinned length would not.
 * And there are three ranks of ink, not two: the place you are, the places you can go back
 * to, and the punctuation between them.
 *
 * Every fixture below has FOUR items on purpose. "All but the last" and "only the first" give
 * the same answer on two, and the same answer on three for half the arms — the degenerate
 * fixture is what eight builder laws died of (2026-08-20), and the separator's whole rule is
 * a claim about which member of a list is special.
 */
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import {
  APPEARANCES,
  colorOn,
  computed,
  mounted,
  numberOn,
  settleAll,
  until,
  tokenOn,
  within,
} from "../../test/browser.tsx";
import type { TypeSize } from "../text/text.tsx";
import { Box } from "../box/box.tsx";
import { Button } from "../button/button.tsx";
import { Link } from "../link/link.tsx";
import { Text } from "../text/text.tsx";
import * as breadcrumb from "./breadcrumb.tsx";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "./breadcrumb.tsx";

const DROPPED = [
  { label: "Docs", href: "/docs" },
  { label: "Foundations", href: "/foundations" },
  { label: "Patterns", href: "/patterns" },
];

function Fixture(props: { size?: TypeSize; ellipsis?: boolean }) {
  return (
    <Breadcrumb {...(props.size ? { size: props.size } : {})}>
      <BreadcrumbItem>
        <BreadcrumbLink href="#home">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        {props.ellipsis ? (
          <BreadcrumbEllipsis items={DROPPED} />
        ) : (
          <BreadcrumbLink href="#docs">Docs</BreadcrumbLink>
        )}
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="#components">Components</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}

const itemsOf = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLElement>("li"));
const sepOf = (li: HTMLElement) => within(li, ".kui-breadcrumb-separator");

/**
 * Where the chevron's APEX sits against the middle of its own box, in screen coordinates —
 * the tree's instrument (§33), borrowed because the question is the same one.
 *
 * The bbox centre is NOT the measurement: `M6 4l4 4-4 4` spans x 6..10 of a 16 viewBox, so its
 * box is centred whichever way the glyph is facing and a law reading it compares 0 with 0. It
 * was written that way first and its own run caught it.
 */
function apexOffset(glyph: Element): number {
  const path = glyph.querySelector("path") as SVGPathElement | null;
  if (!path) throw new Error("no glyph path — the law would compare nothing");
  const apex = path.getPointAtLength(path.getTotalLength() / 2);
  const ctm = (glyph as unknown as SVGGraphicsElement).getScreenCTM();
  if (!ctm) throw new Error("no screen CTM — the law would compare nothing");
  const at = (x: number, y: number) => ctm.a * x + ctm.c * y + ctm.e;
  return at(apex.x, apex.y) - at(8, 8);
}

describe("it announces a path, and the announcement is what forced every part (§10, §39)", () => {
  it("a named landmark, one ordered list, one item per place, aria-current on the end", () => {
    const el = mounted(<Fixture />, { theme: {} });
    expect(el.tagName).toBe("NAV");
    expect(el.getAttribute("aria-label")).toBe("Breadcrumb");
    const list = within(el, "ol");
    expect(list.parentElement).toBe(el);
    expect(el.querySelectorAll("ol").length, "more than one list in one path").toBe(1);
    const items = itemsOf(el);
    expect(items.length).toBe(4);
    for (const li of items) expect(li.parentElement).toBe(list);

    // The one thing on the whole component a reader cannot see, on the one item that has it.
    const current = el.querySelectorAll("[aria-current]");
    expect(current.length, "aria-current is not on exactly one crumb").toBe(1);
    expect(current[0]!.textContent).toBe("Breadcrumb");
    expect(current[0]!.getAttribute("aria-current")).toBe("page");
    // ...and it is NOT announced as a switched-off link, which is shadcn's spelling and a
    // sentence with two false halves: there is nothing to follow, and nothing was disabled.
    expect(current[0]!.getAttribute("role")).toBeNull();
    expect(current[0]!.hasAttribute("aria-disabled")).toBe(false);
    expect(current[0]!.tagName).not.toBe("A");
  });

  it("the landmark's name is a word an app can state", () => {
    const el = mounted(<Breadcrumb label="Fil d'Ariane" />, { theme: {} });
    expect(el.getAttribute("aria-label")).toBe("Fil d'Ariane");
  });

  it("the hidden stretch is a real control, and its dots are decoration", () => {
    // Three dots are an affordance: they say there is more here. An ellipsis that opens
    // nothing is a control promising something it does not have, which is what a reader
    // presses first (reported 2026-09-01) — so the trigger IS the component, `items` is
    // required, and a dead ellipsis is not expressible.
    const el = mounted(<Fixture ellipsis />, { theme: {} });
    const trigger = within(el, ".kui-breadcrumb-ellipsis");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-label")).toBe("More levels");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    // ONE named node, not two: the button carries the name and the glyph inside is hidden.
    expect(within(trigger, "svg").getAttribute("aria-hidden")).toBe("true");
    expect(trigger.querySelectorAll("[aria-label]").length).toBe(0);
    // A Button by MEMBERSHIP, so the box, the light and the ring are not this component's to
    // re-decide — read as the classes the skeleton keys on.
    expect(trigger.classList.contains("kui-control")).toBe(true);
    expect(trigger.classList.contains("kui-button")).toBe(true);
  });

  it("it is not expressible without somewhere to go", () => {
    // The refusal in the TYPE, which is the half no mount can assert (ENGINEERING §1.3).
    // @ts-expect-error — `items` is required: a dead ellipsis cannot be written
    void (<BreadcrumbEllipsis />);
    expect(true).toBe(true);
  });

  it("pressing it opens the levels that were dropped, as LINKS", async () => {
    // DRIVEN, not read. The defect this replaces shipped green against laws that only ever
    // read the marker's attributes, and it took a person pressing it to find that pressing it
    // did nothing.
    const el = mounted(<Fixture ellipsis />, { theme: {} });
    const trigger = within(el, ".kui-breadcrumb-ellipsis");
    await userEvent.click(trigger);
    settleAll();
    const items = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    expect(items.map((i) => i.textContent)).toEqual(["Docs", "Foundations", "Patterns"]);
    // A menu of PLACES, so every row is an anchor a reader can open in a new tab — which is
    // what `render` on MenuItem was opened for. A row that only answers a click is not a link.
    expect(items.map((i) => i.tagName)).toEqual(["A", "A", "A"]);
    expect(items.map((i) => i.getAttribute("href"))).toEqual([
      "/docs",
      "/foundations",
      "/patterns",
    ]);
    await userEvent.keyboard("{Escape}");
  });

  it("the name is a word an app can state, on the thing that carries it", () => {
    const el = mounted(<BreadcrumbEllipsis items={DROPPED} label="Niveaux masqués" />, {
      theme: {},
    });
    expect(el.getAttribute("aria-label")).toBe("Niveaux masqués");
  });

  it("the chevron is punctuation and says nothing", () => {
    const el = mounted(<Fixture />, { theme: {} });
    for (const li of itemsOf(el)) expect(sepOf(li).getAttribute("aria-hidden")).toBe("true");
  });
});

describe("the SYSTEM draws the separator, and it stops before the end (§39)", () => {
  it("every item carries one, and only the last one's is not drawn", () => {
    // The rule shadcn asks a call site to keep by hand. Read as PAINT, not as a class or a
    // count: a chevron that is present and invisible and one that is absent look identical to
    // a `querySelectorAll`, and the failure being guarded against is a drawn glyph after the
    // last crumb.
    const el = mounted(<Fixture />, { theme: {} });
    const items = itemsOf(el);
    const area = (li: HTMLElement) => {
      const r = sepOf(li).getBoundingClientRect();
      return r.width * r.height;
    };
    for (const li of items.slice(0, -1)) {
      expect(computed(sepOf(li), "display"), "a middle crumb drew no chevron").not.toBe("none");
      expect(area(li), "a middle crumb's chevron has no area").toBeGreaterThan(0);
    }
    expect(computed(sepOf(items.at(-1)!), "display")).toBe("none");
    expect(area(items.at(-1)!), "the path ends in a chevron pointing at nothing").toBe(0);
  });

  it("no separator is a part, and none can be placed by hand", () => {
    // The refusal read off the module's own surface rather than as a `@ts-expect-error`: a
    // type error on an identifier that does not exist is a ReferenceError at run time, so that
    // spelling fails for the wrong reason and passes the day somebody adds the export back.
    // A value left reachable is a value every call site can re-introduce (ENGINEERING §1.3).
    expect(Object.keys(breadcrumb)).not.toContain("BreadcrumbSeparator");
    // ...and the vacuity guard: the namespace is genuinely the component's.
    expect(Object.keys(breadcrumb)).toContain("BreadcrumbItem");
  });

  it("it is a real glyph at the system's stroke, not a character from the line's own face", () => {
    // A `content: "\203A"` on a pseudo-element paints at whatever weight the resolved face
    // draws that codepoint, beside a Select's chevron drawn at `glyphStroke` — the 2026-08-23
    // two-grids defect arriving by a different road.
    const el = mounted(<Fixture />, { theme: {} });
    const sep = sepOf(itemsOf(el)[0]!);
    expect(sep.tagName.toLowerCase()).toBe("svg");
    expect(within(sep, "path").getAttribute("stroke")).toBe("currentColor");
    for (const li of itemsOf(el)) {
      expect(getComputedStyle(li, "::after").content, "an item grew a pseudo separator").toBe(
        "none",
      );
    }
  });

  it("it sits on the words' own middle, and stays square when the room runs out", () => {
    /* TWO DECLARATIONS WITH NO READER (ultracode audit 2026-09-01): deleting `align-items:
       center` or `flex: none` from `.kui-breadcrumb-item` / `.kui-breadcrumb-separator` left
       all 29 laws green. Measured without the first, the chevron's mid-point sits 2.00 / 3.00 /
       4.00 / 7.75px above the text's at steps 1/3/6/9 — its block-size is definite, so
       `stretch` degrades to flex-start. Without the second, a breakable label squeezes it out
       of square: 13.14 x 15.00 in a 150px column, 10.44 x 15.00 in a 120px column.

       Shape (e) — every other law in this file reads the chevron on the INLINE axis only
       (`apexOffset` returns screen X; the rhythm law reads left and right edges) — and shape
       (d): the squareness fixture was never squeezed. The label here is BREAKABLE on purpose,
       because an unbreakable one is floored by the `<li>`'s own `min-width: auto` and the
       sabotage cannot reach it. */
    for (const size of ["1", "3", "9"] as const) {
      const el = mounted(<Fixture size={size} />, { theme: {} });
      const li = itemsOf(el)[0]!;
      const text = within(li, "a").getBoundingClientRect();
      const sep = sepOf(li).getBoundingClientRect();
      expect(
        sep.top + sep.height / 2,
        `step ${size}: the chevron rides off the words' middle`,
      ).toBeCloseTo(text.top + text.height / 2, 0);
    }

    const squeezed = mounted(
      <Box width="120px">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Design system foundations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Colour</BreadcrumbPage>
          </BreadcrumbItem>
        </Breadcrumb>
      </Box>,
      { theme: {}, select: ".kui-breadcrumb" },
    );
    const box = sepOf(itemsOf(squeezed)[0]!).getBoundingClientRect();
    expect(box.width, "the chevron was squeezed out of square").toBeCloseTo(box.height, 1);
    // Vacuity: the room must really be short, or nothing was squeezed.
    expect(within(squeezed, "a").getBoundingClientRect().height).toBeGreaterThan(box.height);
  });

  it("it mirrors, because a chevron points along the reading direction", () => {
    const rtl = mounted(
      <div dir="rtl">
        <Fixture />
      </div>,
      { theme: {}, select: ".kui-breadcrumb" },
    );
    const ltr = mounted(<Fixture />, { theme: {} });
    // The apex of `M6 4l4 4-4 4` sits toward the end of the box; mirrored, it sits toward the
    // start. Read in SCREEN coordinates, so a `scale` that stopped matching fails here rather
    // than passing on a declaration nobody applied.
    const lean = (root: HTMLElement) => apexOffset(sepOf(itemsOf(root)[0]!));
    expect(Math.abs(lean(ltr)), "the chevron does not lean at all").toBeGreaterThan(0.5);
    expect(lean(ltr), "the chevron points against the reading direction").toBeGreaterThan(0);
    expect(lean(rtl), "the chevron did not mirror").toBeLessThan(0);
  });
});

describe("the glyph is priced off the LINE, because a breadcrumb has no control box (§4, §39)", () => {
  // Four steps, not two. The ramp's line-height ratio falls up the ladder, so a pinned length
  // and a share of the line agree at whichever step somebody happened to judge — which is how
  // Composer shipped 14/14/16/16 twice and passed every two-index law both times (2026-08-23).
  for (const size of ["1", "3", "6", "9"] as const) {
    it(`step ${size}: the chevron is its share of the line the crumbs set`, () => {
      const el = mounted(<Fixture size={size} />, { theme: {} });
      const text = mounted(<Text size={size}>x</Text>, { theme: {} });
      const line = parseFloat(computed(text, "line-height"));
      // `numberOn`, not `tokenOn`: the width probe rejects a unitless value as invalid and
      // answers 0px for a perfectly healthy token — which is how this law first read every
      // step as "close to zero" against a chevron that was already the right size.
      const share = numberOn(el, "--breadcrumb-glyph");
      const box = sepOf(itemsOf(el)[0]!).getBoundingClientRect();
      expect(box.height).toBeCloseTo(line * share, 1);
      expect(box.width).toBeCloseTo(box.height, 1);
      // The ellipsis is deliberately NOT read here: since it became a control its glyph rides
      // `--kui-ct-icon` like every other glyph inside one, which is the right ladder for a
      // thing that now HAS a control box — where the chevron still does not.
    });
  }

  it("so it grows with the step, rather than sitting at one designed length", () => {
    const small = mounted(<Fixture size="1" />, { theme: {} });
    const large = mounted(<Fixture size="9" />, { theme: {} });
    const h = (el: HTMLElement) => sepOf(itemsOf(el)[0]!).getBoundingClientRect().height;
    expect(h(large)).toBeGreaterThan(h(small) * 2);
  });

  it("the step reaches every crumb from the nav, and no crumb states one", () => {
    const el = mounted(<Fixture size="6" />, { theme: {} });
    const text = mounted(<Text size="6">x</Text>, { theme: {} });
    for (const crumb of el.querySelectorAll<HTMLElement>("a, [aria-current]")) {
      expect(crumb.hasAttribute("data-size"), "a crumb stamped a step of its own").toBe(false);
      expect(computed(crumb, "font-size")).toBe(computed(text, "font-size"));
      expect(computed(crumb, "line-height")).toBe(computed(text, "line-height"));
    }
  });
});

describe("one rhythm, read twice (§12, §39)", () => {
  it("a crumb sits as far from its chevron as the chevron sits from the next crumb", () => {
    // The list and the item read the same token, and this measures the CONSEQUENCE: two
    // tokens here would be two numbers for one rhythm, and the chevron would sit closer to one
    // neighbour than the other — visible, and invisible to a law that read the token names.
    const el = mounted(<Fixture />, { theme: {} });
    const items = itemsOf(el);
    const before = sepOf(items[0]!).getBoundingClientRect().left - within(items[0]!, "a").getBoundingClientRect().right;
    const after = within(items[1]!, "a").getBoundingClientRect().left - sepOf(items[0]!).getBoundingClientRect().right;
    expect(before).toBeGreaterThan(0);
    expect(after).toBeCloseTo(before, 1);
  });

  it("and it tightens with density, because it is layout space", () => {
    const gap = (density: "compact" | "comfortable") => {
      const el = mounted(<Fixture />, { theme: { density } });
      const li = itemsOf(el)[0]!;
      return sepOf(li).getBoundingClientRect().left - within(li, "a").getBoundingClientRect().right;
    };
    expect(gap("compact")).toBeLessThan(gap("comfortable"));
  });

  it("a deep path wraps rather than pushing the room wide", () => {
    // The alternative to wrapping is a component deciding what to hide, which §3 forbids.
    const el = mounted(<Fixture />, { theme: {} });
    expect(computed(within(el, "ol"), "flex-wrap")).toBe("wrap");
    // ...and the browser's own list dress is gone, or it would draw a second, wrong separator.
    expect(computed(within(el, "ol"), "list-style-type")).toBe("none");
    for (const side of ["top", "bottom", "left", "right"]) {
      expect(parseFloat(computed(within(el, "ol"), `margin-${side}`))).toBe(0);
      expect(parseFloat(computed(within(el, "ol"), `padding-${side}`))).toBe(0);
    }
  });
});

describe("three ranks of ink, in both appearances (§7, §15, §39)", () => {
  for (const appearance of APPEARANCES) {
    it(`${appearance}: where you are, where you can go back to, and the punctuation`, () => {
      const el = mounted(<Fixture />, { theme: { appearance } });
      const page = within(el, ".kui-breadcrumb-page");
      const link = within(el, ".kui-breadcrumb-link");
      const sep = sepOf(itemsOf(el)[0]!);

      expect(computed(page, "color")).toBe(colorOn(el, "var(--color-text)"));
      expect(computed(link, "color")).toBe(colorOn(el, "var(--color-text-muted)"));
      expect(computed(sep, "color")).toBe(colorOn(el, "var(--color-text-faint)"));
      // Three, and they are genuinely three: a ladder whose rungs resolve alike is one rung.
      expect(computed(page, "color")).not.toBe(computed(link, "color"));
      expect(computed(link, "color")).not.toBe(computed(sep, "color"));
    });

    it(`${appearance}: a stamped ANCESTOR re-scopes it, and the three ranks survive`, () => {
      /* THE INHERITANCE CASE, which had no reader at all (ultracode audit 2026-09-01's
         completeness critic — shape (b), this repo's most-repeated defect, and the §11 row's
         own argument is an inheritance claim nobody had measured).

         Measured: inside a `<Text tone="destructive">` every rank moves onto that family —
         the page from near-black to `display-p3 0.6733 0.2143 0.2213`, the crumb and the
         chevron to the family's ink at their own alphas. That is CORRECT and it is not this
         component's doing: `.kui-type[data-tone]` re-declares `--color-text`, `-muted` and
         `-faint` on the ancestor, those roles inherit, and Tabs, Text and Heading all behave
         the same way. Refusing `tone` is a refusal of the PROP, never immunity from a region.

         So the law pins the RELATIONSHIP rather than the greyness: three ranks, still three,
         still ordered, and genuinely moved by the ancestor. A law that asserted "a crumb stays
         grey" would be pinning a behaviour the system does not have. */
      const plain = mounted(<Fixture />, { theme: { appearance } });
      const toned = mounted(
        <Text tone="destructive">
          <Fixture />
        </Text>,
        { theme: { appearance }, select: ".kui-breadcrumb" },
      );
      const ranks = (root: HTMLElement) => [
        computed(within(root, ".kui-breadcrumb-page"), "color"),
        computed(within(root, ".kui-breadcrumb-link"), "color"),
        computed(sepOf(itemsOf(root)[0]!), "color"),
      ];
      const [pageT, linkT, sepT] = ranks(toned);
      // It really moved — or the law below is comparing a breadcrumb with itself.
      expect(ranks(toned)).not.toEqual(ranks(plain));
      // ...and the ladder is still a ladder inside the region.
      expect(new Set([pageT, linkT, sepT]).size, "the three ranks collapsed under a tone").toBe(3);
      // The component still stamps no family of its own: the colour is the REGION's.
      expect(within(toned, ".kui-breadcrumb-link").hasAttribute("data-tone")).toBe(false);
      expect(toned.hasAttribute("data-tone")).toBe(false);
    });

    it(`${appearance}: a crumb is NOT a Link — it reads the tone-less roles`, () => {
      // The negative control for the whole decision. `Link` rests on `accent` and always
      // stamps it, and stamping a family re-scopes all three foreground roles onto that
      // family's ink trio (type.css) — so a crumb built out of `Link` could read a family's
      // greys and never the system's. Read as colour AND as the absent stamp, because either
      // one alone passes against half of the mistake.
      const el = mounted(<Fixture />, { theme: { appearance } });
      const link = within(el, ".kui-breadcrumb-link");
      const real = mounted(<Link href="#x">a</Link>, { theme: { appearance } });
      expect(link.hasAttribute("data-tone"), "a crumb stamped a family").toBe(false);
      expect(computed(link, "color")).not.toBe(computed(real, "color"));
      expect(link.classList.contains("kui-link")).toBe(false);
    });

    it(`${appearance}: the underline rests invisible and paints under the pointer`, async () => {
      // A carve-out from Link's unconditional underline, so the law reads BOTH halves: that
      // the line exists at rest (its metrics never move) and that it is not painted, then that
      // the pointer brings it and the ink together. "The ink moved, the line stayed" is the
      // half-fix that ships, which is Code's own tone law one family over.
      const el = mounted(<Fixture />, { theme: { appearance } });
      const link = within(el, ".kui-breadcrumb-link");
      expect(computed(link, "text-decoration-line")).toBe("underline");
      expect(computed(link, "text-decoration-color")).toBe(colorOn(el, "transparent"));
      const rest = computed(link, "color");

      await userEvent.hover(link);
      expect(computed(link, "color"), "a hovered crumb did not come forward").not.toBe(rest);
      expect(computed(link, "color")).toBe(colorOn(el, "var(--color-text)"));
      expect(computed(link, "text-decoration-color"), "the line stayed invisible").toBe(
        computed(link, "color"),
      );
    });
  }
});

describe("the refusals hold as computed values, not as absent props (§39)", () => {
  it("it is not a control: no skeleton, no height, no target", () => {
    const el = mounted(<Fixture />, { theme: {} });
    const link = within(el, ".kui-breadcrumb-link");
    const button = mounted(<Button size="2">a</Button>, { theme: {} });
    expect(link.classList.contains("kui-control")).toBe(false);
    expect(parseFloat(computed(link, "min-height")) || 0).toBe(0);
    expect(parseFloat(computed(button, "min-height"))).toBeGreaterThan(0);
    // §16's expansion is a `::before` larger than the paint. A crumb's container is the line,
    // and SC 2.5.8 exempts a target in text — Link's citation, inherited.
    expect(getComputedStyle(link, "::before").content, "a crumb grew a target").toBe("none");
  });

  it("the ring answers a KEY, not a press — and a mouse click draws none", async () => {
    /* THE HALF THE RING LAW BELOW COULD NOT SEE (ultracode audit 2026-09-01). Swapping
       `:focus-visible` for `:focus` in the stylesheet left every law in this file green, and a
       real `userEvent.click` then computed a 2px ring where a Button and a Link under the same
       click compute `none` — a mouse press drawing a ring nothing else in the system draws.
       The directory-walked ring law in recipes.test.ts asserts the ring's VALUE and matches a
       bare `:focus` as happily as `:focus-visible`, so nothing anywhere read the modality.

       Both arms in one law, because either alone passes against half the mistake. The pointer
       is parked off the subject afterwards: a law that hovers hands the next file a control
       that is already `:hover` (test/browser.tsx, the 2026-08-10 finding). */
    const el = mounted(<Fixture />, { theme: {} });
    const link = within(el, ".kui-breadcrumb-link");
    const button = mounted(<Button size="2">a</Button>, { theme: {} });

    await userEvent.click(link);
    // WAITED FOR, not read in the next statement: a driver gesture resolving is not the
    // browser having settled (test/settling.test.ts, which caught this law on its first run).
    expect(await until(() => document.activeElement === link), "the click did not land on the crumb").toBe(true);
    expect(computed(link, "outline-style"), "a mouse press drew a ring").toBe("none");
    // The control family under the same gesture, so the claim is a comparison rather than a
    // restatement of what this sheet happens to declare.
    await userEvent.click(button);
    expect(computed(button, "outline-style")).toBe("none");

    // And the keyboard DOES ring it.
    link.focus();
    await userEvent.keyboard("{Escape}");
    expect(await until(() => link.matches(":focus-visible")), "the ring must be live to read it").toBe(true);
    expect(computed(link, "outline-style")).toBe("solid");
  });

  it("the ring is the system's, drawn by this sheet because no skeleton reaches it", () => {
    const el = mounted(<Fixture />, { theme: {} });
    const link = within(el, ".kui-breadcrumb-link");
    link.focus();
    expect(document.activeElement).toBe(link);
    expect(computed(link, "outline-style")).toBe("solid");
    expect(computed(link, "outline-width")).toBe(tokenOn(el, "--focus-ring-width"));
    expect(computed(link, "outline-color")).toBe(colorOn(el, "var(--focus-ring)"));
    expect(computed(link, "outline-offset")).toBe(tokenOn(el, "--focus-ring-offset"));
  });

  it("a level with nowhere to go is not expressible", () => {
    // The union, held where no mount can reach: a row that opens nothing is the defect this
    // whole component was reversed for, one level down (ultracode audit 2026-09-01).
    // @ts-expect-error — a label alone is a dead row
    void (<BreadcrumbEllipsis items={[{ label: "Docs" }]} />);
    // ...and each of the three real shapes still type-checks, or the refusal is a wall.
    void (<BreadcrumbEllipsis items={[{ label: "a", href: "/a" }]} />);
    void (<BreadcrumbEllipsis items={[{ label: "b", render: <a href="/b" /> }]} />);
    void (<BreadcrumbEllipsis items={[{ label: "c", onClick: () => {} }]} />);
    expect(true).toBe(true);
  });

  it("the type refuses what a path is not", () => {
    // @ts-expect-error — no margin prop on any component (first non-negotiable)
    void (<Breadcrumb m="4" />);
    // @ts-expect-error — a location carries no meaning to colour (§39)
    void (<Breadcrumb tone="accent" />);
    // @ts-expect-error — emphasis is the ink ladder, and the ranks here are the design
    void (<BreadcrumbLink emphasis="quiet" />);
    // @ts-expect-error — which levels to drop is the app's, never a count the component keeps
    void (<Breadcrumb maxItems={3} />);
    // @ts-expect-error — no crumb states a step; the nav does, once
    void (<BreadcrumbPage size="4" />);
    expect(true).toBe(true);
  });
});
