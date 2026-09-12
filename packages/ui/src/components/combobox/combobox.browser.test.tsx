/**
 * Combobox's mounted laws (§20, §21, §22, §23, §28, §44) — the 2026-08-03 standard: computed
 * values through a mounted <Theme>, both appearances where colour is the question, and real
 * keyboard and pointer input where behaviour is.
 *
 * The component is assembled out of two families it does not own — the FIELD is TextField's
 * wrapper and the PANEL is Select's, hanging below the field rather than item-aligned over it —
 * so most of what could break here is MEMBERSHIP rather than a value of its own. Those laws are
 * written as AGREEMENTS with a mounted sibling (a TextField, a Select, a Menu) rather than as
 * pinned numbers: a pinned number goes stale the day the family moves and then fails on correct
 * code, which is this repo's own recorded fixture defect (2026-08-23). What is Combobox's own —
 * the filter, the empty message, the value-keyed comparator, the zero-height seed, the panel that
 * follows its list while it flies — is read directly.
 *
 * It also carries the §20 AGREEMENT LAW every portalling component owes (ENGINEERING §2.1).
 */
import * as React from "react";
import { describe, expect, it, onTestFinished } from "vitest";
import { userEvent } from "vitest/browser";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "./combobox.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select/select.tsx";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "../menu/menu.tsx";
import { Button } from "../button/button.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Field, FieldLabel } from "../field/field.tsx";
import { Text } from "../text/text.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  render as mount,
  renderSettled as render,
  asksForStillness,
  computed,
  colorOn,
  inMotion,
  probeIn,
  settleAll,
  tokenOn,
  until,
  SIZES,
  APPEARANCES,
} from "../../test/browser.tsx";

/** Every axis off its default — a dropped attribute is visible (§20's constant, Select's set
    including `contrast`, which that file's own audit found missing). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  depth: "elevated",
  contrast: "high",
};

const REGIONS = ["Frankfurt", "Amsterdam", "London", "Paris", "Tokyo"] as const;

const settled = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/** The LAST panel in the document — mounts accumulate within one test, and an index here is the
    stale-subject bug the menu and select suites have each been caught by. */
function lastPopup(): HTMLElement {
  const popups = document.querySelectorAll<HTMLElement>(".kui-combobox-popup");
  const popup = popups[popups.length - 1];
  if (!popup) throw new Error("the panel never mounted — every law below would assert nothing");
  return popup;
}

/** An OPEN combobox under a themed root, landed. */
function openCombobox(
  theme: ThemeProps = {},
  opts: { size?: "1" | "2" | "3" | "4"; items?: readonly string[]; label?: string } = {},
) {
  const items = opts.items ?? REGIONS;
  const host = render(
    <Theme {...theme}>
      <Combobox items={items} defaultOpen {...(opts.size ? { size: opts.size } : {})}>
        <ComboboxInput aria-label={opts.label ?? "Region"} placeholder="Search regions" />
        <ComboboxContent>
          <ComboboxEmpty>
            <Text size="2">No region matches.</Text>
          </ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Theme>,
  );
  const popup = lastPopup();
  settleAll();
  return {
    host,
    popup,
    field: host.querySelector<HTMLElement>(".kui-combobox-field")!,
    input: host.querySelector<HTMLInputElement>(".kui-field-input")!,
    items: () => [...popup.querySelectorAll<HTMLElement>(".kui-combobox-item")],
  };
}

function surfaceFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    border: cs.borderTopColor,
    radius: cs.borderTopLeftRadius,
    padding: cs.paddingTop,
    shadow: cs.boxShadow,
    direction: cs.direction,
  };
}

function rowFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    minHeight: cs.minHeight,
    padLeft: cs.paddingLeft,
    gap: cs.gap,
    font: cs.fontSize,
    radius: cs.borderTopLeftRadius,
    color: cs.color,
    bg: cs.backgroundColor,
    direction: cs.direction,
  };
}

/* ── The §20 agreement law ────────────────────────────────────────────────────────────── */

describe("the agreement law: portalled ≡ in-flow (§20, §23)", () => {
  /** The popup's and row's class lists READ OFF A REAL PANEL, never restated: a hand-copied
      identity is the 2026-08-23 fixture defect and goes stale the day a class is renamed —
      which is exactly what the C10 promotion just did to `kui-menu-anchored`. */
  function identities(): { popup: string; row: string } {
    const { popup, items } = openCombobox();
    return { popup: popup.className, row: items()[0]!.className };
  }

  function twin(theme: ThemeProps) {
    const identity = identities();
    let popupTwin: HTMLElement | null = null;
    let rowTwin: HTMLElement | null = null;
    mount(
      <Theme {...theme}>
        <div
          ref={(n: HTMLDivElement | null) => void (popupTwin = n)}
          className={identity.popup}
          data-size="2"
          data-tone="neutral"
          data-emphasis="quiet"
          data-bordered="true"
          style={{ "--anchor-width": "0px" } as React.CSSProperties}
        >
          <div
            ref={(n: HTMLDivElement | null) => void (rowTwin = n)}
            className={identity.row}
            data-size="2"
            data-tone="neutral"
            data-emphasis="quiet"
          >
            Frankfurt
          </div>
        </div>
      </Theme>,
    );
    if (!popupTwin || !rowTwin) throw new Error("twin never mounted");
    return { popupTwin: popupTwin as HTMLElement, rowTwin: rowTwin as HTMLElement };
  }

  it("computes identical under the hostile axis set — panel and row", async () => {
    const { popup, items } = openCombobox(HOSTILE);
    await settled();
    const { popupTwin, rowTwin } = twin(HOSTILE);
    expect(surfaceFacts(popup)).toEqual(surfaceFacts(popupTwin));
    expect(rowFacts(items()[0]!)).toEqual(rowFacts(rowTwin));
    // The comparison CAN fail: the same twin under default axes disagrees. Without this the
    // law passes on a wrapper that stamps nothing, because both sides would be the default.
    const bare = twin({});
    expect(surfaceFacts(bare.popupTwin)).not.toEqual(surfaceFacts(popupTwin));
  });

  it("agrees under RTL — the wrapper carries dir, and the panel mirrors with the app (§20)", async () => {
    mount(
      <div dir="rtl">
        <Theme>
          <Combobox items={REGIONS} defaultOpen>
            <ComboboxInput aria-label="Region" />
            <ComboboxContent>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Theme>
      </div>,
    );
    await settled();
    expect(computed(lastPopup(), "direction"), "the portalled panel takes the app's direction").toBe(
      "rtl",
    );
  });
});

/* ── The field: TextField's wrapper, entered rather than pressed (§4, §23) ─────────────── */

describe("the field IS the field family — a Combobox beside a TextField reads as one control", () => {
  /** Both mounted in ONE Theme, so the only difference between the two sides is the component.
      A law whose two sides differ in more than the one thing it is about is measuring the
      difference it did not mean (the Field suite's own 2026-08-21 lesson). */
  function pair(theme: ThemeProps, size?: "1" | "2" | "3" | "4") {
    const host = render(
      <Theme {...theme}>
        <Combobox items={REGIONS} {...(size ? { size } : {})}>
          <ComboboxInput aria-label="Region" placeholder="Search regions" />
        </Combobox>
        <TextField {...(size ? { size } : {})} aria-label="Free text" placeholder="Type here" />
      </Theme>,
    );
    const combobox = host.querySelector<HTMLElement>(".kui-combobox-field")!;
    const textfield = host.querySelector<HTMLElement>(".kui-field:not(.kui-combobox-field)")!;
    return { host, combobox, textfield };
  }

  for (const appearance of APPEARANCES) {
    it(`${appearance}: seal, edge, height, corner and weight agree with the TextField beside it`, () => {
      const { combobox, textfield } = pair({ appearance });
      expect(computed(combobox, "background-color")).toBe(computed(textfield, "background-color"));
      expect(computed(combobox, "border-top-color")).toBe(computed(textfield, "border-top-color"));
      expect(computed(combobox, "min-height")).toBe(computed(textfield, "min-height"));
      expect(computed(combobox, "border-top-left-radius")).toBe(
        computed(textfield, "border-top-left-radius"),
      );
      // The value wears CONTENT weight, which is the field family's own 2026-08-05 decision and
      // reaches this input through `font: inherit` exactly as it reaches TextField's.
      expect(computed(combobox, "font-weight")).toBe(computed(textfield, "font-weight"));
      // And it is a caret, not a hand: a field is entered, never pressed.
      expect(computed(combobox, "cursor")).toBe(computed(textfield, "cursor"));
    });
  }

  it("agrees at EVERY index — one size join, not two that happen to match at the default", () => {
    // Read across all four, because two adjacent steps agree under more than one wrong
    // spelling: the composer's own 2026-08-23 finding, where a law reading two indexes could
    // not tell 12/14/16/18 from 14/14/16/16.
    const heights: string[] = [];
    for (const size of SIZES) {
      const { combobox, textfield } = pair({}, size);
      expect(computed(combobox, "min-height"), `size ${size}`).toBe(computed(textfield, "min-height"));
      expect(computed(combobox, "font-size"), `size ${size}`).toBe(computed(textfield, "font-size"));
      heights.push(computed(combobox, "min-height"));
    }
    // The ladder must actually be a ladder, or the agreement above is four equalities between
    // two constants.
    expect(new Set(heights).size, `the index moved nothing: ${heights.join(",")}`).toBe(SIZES.length);
  });

  it("the ring is the FIELD's and the chevron takes none of its own (§8)", async () => {
    const { host } = pair({});
    const input = host.querySelector<HTMLInputElement>(".kui-field-input")!;
    const field = host.querySelector<HTMLElement>(".kui-combobox-field")!;
    const trigger = host.querySelector<HTMLElement>(".kui-combobox-trigger")!;
    expect(computed(field, "outline-style"), "at rest there is no ring").toBe("none");
    input.focus();
    await until(() => computed(field, "outline-style") !== "none");
    // A field's focus is a MODE: it rings however the caret arrived, which is why this is read
    // off a programmatic focus rather than a keyboard one.
    expect(computed(field, "outline-style"), "the caret is in it and it says so").toBe("solid");
    expect(computed(field, "outline-color")).toBe(colorOn(field, "var(--focus-ring)"));
    // The chevron is inside the field's ring and must not paint a second one.
    expect(computed(trigger, "outline-style")).toBe("none");
  });

  it("a READ-ONLY chevron promises nothing, and pressing it opens nothing (audit C8)", async () => {
    const host = render(
      <Theme>
        <Combobox items={REGIONS} readOnly defaultValue="Frankfurt">
          <ComboboxInput aria-label="Region" />
          <ComboboxContent>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {/* The live control beside it, so "the cursor stood down" is a DIFFERENCE rather than
            a claim about one element — without it the law passes on a package where no
            combobox chevron ever had a hand. */}
        <Combobox items={REGIONS}>
          <ComboboxInput aria-label="Live" />
        </Combobox>
      </Theme>,
    );
    const [dead, live] = [...host.querySelectorAll<HTMLElement>(".kui-combobox-trigger")];
    if (!dead || !live) throw new Error("triggers missing");
    // Resolved through a CURSOR probe, never `tokenOn`: that helper probes through `width`, so a
    // keyword-valued token comes back `0px` and the assertion compares a cursor with a length
    // (the harness records this trap, and this law's first run walked straight into it).
    expect(computed(live, "cursor"), "a live chevron promises a press").toBe(
      probeIn(live, (el) => (el.style.cursor = "var(--cursor-button)"), (cs) => cs.cursor),
    );
    expect(computed(dead, "cursor"), "a dead affordance is the defect").not.toBe(
      computed(live, "cursor"),
    );
    await userEvent.click(dead);
    await settled();
    expect(document.querySelectorAll(".kui-combobox-popup").length, "it opened a panel").toBe(0);
  });
});

/* ── The panel: membership in the floating family, and the C10 promotion ──────────────── */

describe("the panel is the floating-rows family's (§22, §23)", () => {
  it("wears the family's identity, including the promoted anchor floor (audit C10)", () => {
    const { popup } = openCombobox();
    for (const cls of [
      "kui-surface",
      "kui-floating",
      "kui-floating-rows",
      "kui-floating-anchored",
    ]) {
      expect(popup.classList.contains(cls), `the panel is missing ${cls}`).toBe(true);
    }
  });

  it("resolves the SAME panel facts a Select's does — one family, one surface", async () => {
    // The membership claim, read as computed values on both panels rather than as a class
    // list: "combobox.css restates nothing" is exactly the kind of sentence that stays true in
    // the stylesheet while a component quietly re-points a token.
    const { popup } = openCombobox({}, { size: "3" });
    await settled();
    mount(
      <Theme>
        <Select defaultOpen size="3">
          <SelectTrigger placeholder="Pick one" />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </Theme>,
    );
    settleAll();
    await settled();
    const select = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop()!;
    expect(popup.getAttribute("data-size"), "the panel stamps the index its rows answer").toBe("3");
    const facts = (el: HTMLElement) => {
      const cs = getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        border: cs.borderTopColor,
        radius: cs.borderTopLeftRadius,
        padding: cs.paddingTop,
        shadow: cs.boxShadow,
      };
    };
    expect(facts(popup)).toEqual(facts(select));
  });

  /**
   * THE PROMOTION CHANGED NOTHING (audit C10, 2026-09-12).
   *
   * The width floor, the room clamp and the `outline: none` were written out byte-identically
   * in menu.css, select.css and combobox.css, and menu.css carried the expiry beside its own
   * copy: the third member is the one that moves it. Combobox is the third, so all three now
   * read one declaration in surfaces.css on `.kui-surface.kui-floating-anchored`.
   *
   * A promotion's whole claim is that nothing moved, and the only way to say that is to read
   * the three panels against each other under one set of inputs. The floor is a `min()` over
   * `--kui-anchor-w` and `--available-width`, so the inputs are written onto each panel and the
   * resolved `min-width` compared — which also exercises the CAP, the half that had no law at
   * all until Select's 2026-08-26 audit (in CSS a minimum beats a maximum, so a trigger wider
   * than the room used to win outright).
   */
  it("menu, select and combobox resolve ONE floor — and a submenu still takes none", async () => {
    const { popup: combobox } = openCombobox();
    mount(
      <Theme>
        <Select defaultOpen>
          <SelectTrigger placeholder="Pick one" />
          <SelectContent>
            <SelectItem value="a">Alpha</SelectItem>
          </SelectContent>
        </Select>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuSub defaultOpen>
              <MenuSubTrigger>More</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>Deep</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    settleAll();
    await settled();
    const select = [...document.querySelectorAll<HTMLElement>(".kui-select-popup")].pop()!;
    const menus = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")];
    const parent = menus.find((el) => el.classList.contains("kui-floating-anchored"));
    const sub = menus.find((el) => !el.classList.contains("kui-floating-anchored"));
    if (!parent || !sub) throw new Error("the submenu never mounted — by anatomy, not by index");

    const floorOf = (el: HTMLElement, anchor: string, room: string) => {
      el.style.setProperty("--kui-anchor-w", anchor);
      el.style.setProperty("--available-width", room);
      return computed(el, "min-width");
    };
    // A wide trigger inside a wide room: the anchor term wins, and all three must agree.
    const wide = [combobox, select, parent].map((el) => floorOf(el, "420px", "1200px"));
    expect(new Set(wide).size, `the three panels disagree: ${wide.join(" / ")}`).toBe(1);
    expect(parseFloat(wide[0]!), "the floor must actually be the trigger's width").toBeCloseTo(420, 0);

    // …and the ROOM outranks the anchor, which is the clamp inside the `min()`.
    const capped = [combobox, select, parent].map((el) => floorOf(el, "900px", "300px"));
    expect(new Set(capped).size, `the cap disagrees: ${capped.join(" / ")}`).toBe(1);
    expect(parseFloat(capped[0]!), "a minimum beat the maximum again").toBeCloseTo(300, 0);

    // The submenu is the one panel the floor is WRONG for: its anchor is a row at 100% of the
    // panel it sits in, so the same declaration would read "never narrower than where you came
    // from" and compound across levels (measured 446 → 437 → 427, audit 2026-08-09).
    const subFloor = floorOf(sub, "420px", "1200px");
    expect(subFloor, "a submenu inherited the panel-width floor").not.toBe(wide[0]);
    expect(parseFloat(subFloor)).toBeCloseTo(parseFloat(tokenOn(sub, "--floating-min-w")), 0);
  });

  it("the rows are the row family, and the panel is a listbox holding only options", async () => {
    const { popup, items } = openCombobox();
    await settled();
    for (const row of items()) {
      expect(row.classList.contains("kui-control")).toBe(true);
      expect(row.classList.contains("kui-row")).toBe(true);
      expect(row.getAttribute("role")).toBe("option");
    }
    const list = popup.querySelector<HTMLElement>(".kui-combobox-list")!;
    expect(list.getAttribute("role")).toBe("listbox");
    /** The list's children AS THE ACCESSIBILITY TREE SEES THEM: a `presentation` wrapper
        contributes its children in its place. Select's own walk, which could not fail until
        2026-08-26 because it stopped at the floating body. */
    const owned = (el: Element): Element[] =>
      [...el.children].flatMap((child) => {
        if (child.hasAttribute("aria-hidden")) return [];
        const role = child.getAttribute("role");
        return role === "presentation" || role === "none" ? owned(child) : [child];
      });
    const illegal = (root: Element) =>
      owned(root)
        .filter((c) => {
          const role = c.getAttribute("role");
          return role !== "option" && role !== "group";
        })
        .map((el) => el.getAttribute("role") ?? el.tagName);
    expect(illegal(list)).toEqual([]);
    // The calibration: the walk really reaches past the wrappers, without which an empty list
    // is indistinguishable from a walk that measured nothing.
    const intruder = document.createElement("div");
    list.append(intruder);
    expect(illegal(list), "an illegal child must be reported").toEqual(["DIV"]);
    intruder.remove();
  });
});

/* ── Filtering, the empty message, and choosing (§44's mechanism, §23's member) ────────── */

describe("the letters narrow the list and never become the value", () => {
  it("typing filters the rows, and clearing brings them back whole", async () => {
    const { input, items } = openCombobox();
    expect(items().length, "the fixture must start whole").toBe(REGIONS.length);
    input.focus();
    await userEvent.keyboard("ams");
    await until(() => items().length < REGIONS.length);
    expect(items().map((r) => r.textContent)).toEqual(["Amsterdam"]);
    await userEvent.keyboard("{Backspace}{Backspace}{Backspace}");
    await until(() => items().length === REGIONS.length);
    expect(items().length, "clearing restores the list").toBe(REGIONS.length);
  });

  it("nonsense shows the empty message instead of closing on you", async () => {
    const { input, popup, items } = openCombobox();
    const empty = popup.querySelector<HTMLElement>(".kui-combobox-empty")!;
    // It exists on every state — it is a live region, so it must be there BEFORE the message
    // arrives or the message is never announced — and takes room only when it speaks.
    expect(computed(empty, "display"), "display:none would take the announcement with it").not.toBe(
      "none",
    );
    expect(parseFloat(computed(empty, "padding-top")), "silent, it takes no room").toBe(0);
    input.focus();
    await userEvent.keyboard("zzz");
    await until(() => items().length === 0);
    expect(popup.checkVisibility(), "the panel stays open to say so").toBe(true);
    expect(empty.textContent).toContain("No region matches");
    expect(parseFloat(computed(empty, "padding-top")), "speaking, it takes a row's band").toBeGreaterThan(0);
  });

  it("the empty part DRESSES NOTHING — a string child and a <Text> child read alike (audit C11)", async () => {
    const host = render(
      <Theme>
        <Combobox items={REGIONS} defaultOpen>
          <ComboboxInput aria-label="Region" />
          <ComboboxContent>
            <ComboboxEmpty>
              <Text size="2">No region matches.</Text>
            </ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    settleAll();
    const input = host.querySelector<HTMLInputElement>(".kui-field-input")!;
    input.focus();
    await userEvent.keyboard("zzz");
    const popup = lastPopup();
    const empty = popup.querySelector<HTMLElement>(".kui-combobox-empty")!;
    await until(() => empty.textContent !== "");
    const text = empty.querySelector<HTMLElement>(".kui-type")!;
    // The part places the sentence; the caller's <Text> says it. Before the fix the element set
    // the muted ink, which reached a BARE STRING only — so the same message read muted or loud
    // depending on which of two equivalent spellings the caller used.
    expect(computed(empty, "color"), "the part paints a colour the <Text> then overrides").toBe(
      computed(text, "color"),
    );
  });

  it("ITS INSET IS THE BARE ROW'S, which is where an option's LABEL is not (audit C12)", async () => {
    const { popup, input, items } = openCombobox();
    const empty = popup.querySelector<HTMLElement>(".kui-combobox-empty")!;

    // MEASURED INTO NUMBERS BEFORE THE FILTER EMPTIES THE LIST, and the distinction is the whole
    // instrument: the rows UNMOUNT when nothing matches, so an element reference captured up
    // here is detached by the time the assertions run and every box it reports is zero. This law
    // made that mistake twice — first by reading the row after the filter (`expected 14 to be
    // less than NaN`), then by keeping a live reference to the gutter and asserting on it below
    // (`expected 0 to be greater than 0`) while the arithmetic above was already correct. The
    // gutter is real and reserved: measured 16.00px, `visibility: hidden`, in every row, with a
    // value and without one.
    const row = items()[0]!;
    const rowCS = getComputedStyle(row);
    const gutterWidth = row
      .querySelector<HTMLElement>('[data-slot="leading"]')!
      .getBoundingClientRect().width;
    const optionLabelStart =
      parseFloat(rowCS.paddingLeft) + gutterWidth + (parseFloat(rowCS.gap) || 0);

    input.focus();
    await userEvent.keyboard("zzz");
    await until(() => empty.textContent !== "");

    // The value is `--kui-sf-row-px`, §21's own anchor: the inset a BARE-edged row takes, which
    // is what a group label takes and what a separator's rule spans.
    expect(computed(empty, "padding-left")).toBe(tokenOn(popup, "--kui-sf-row-px"));
    // The block inset is the same number as the inline one, so the message sits in a row-sized
    // band rather than a dialog-sized one.
    expect(computed(empty, "padding-top")).toBe(computed(empty, "padding-left"));
    // And the sentence the old comment made — "it starts where an option's label would have" —
    // is the one thing that is NOT true: an option's label sits one reserved tick gutter further
    // in by design (measured at size 2: empty text x=57, option text x=78). Read as a real
    // difference, so the corrected claim cannot quietly become the old one again.
    expect(gutterWidth, "no reserved gutter — this law is about nothing").toBeGreaterThan(0);
    expect(
      parseFloat(computed(empty, "padding-left")),
      "the empty message was indented to where an option's LABEL starts, which is the claim C12 refuted",
    ).toBeLessThan(optionLabelStart);
  });

  it("the keyboard picks: ArrowDown then Enter commits the option, not the letters", async () => {
    const picked: (string | null)[] = [];
    const host = render(
      <Theme>
        <Combobox items={REGIONS} onValueChange={(v) => picked.push(v as string | null)}>
          <ComboboxInput aria-label="Region" />
          <ComboboxContent>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    const input = host.querySelector<HTMLInputElement>(".kui-field-input")!;
    input.focus();
    await userEvent.keyboard("lon");
    await until(() => document.querySelectorAll(".kui-combobox-item").length === 1);
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await until(() => picked.length > 0);
    expect(picked, "the chosen OPTION, never the three letters typed").toEqual(["London"]);
    await until(() => input.value === "London");
    expect(input.value, "the field shows the option's own label").toBe("London");
  });

  for (const appearance of APPEARANCES) {
    it(`${appearance}: the chosen row's tick is the accent GLYPH, and the gutter is reserved`, async () => {
      render(
        <Theme appearance={appearance}>
          <Combobox items={REGIONS} defaultOpen defaultValue="London">
            <ComboboxInput aria-label="Region" />
            <ComboboxContent>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Theme>,
      );
      settleAll();
      await settled();
      const popup = lastPopup();
      const rows = [...popup.querySelectorAll<HTMLElement>(".kui-combobox-item")];
      const chosen = rows.find((r) => r.textContent === "London")!;
      const other = rows.find((r) => r.textContent === "Paris")!;
      expect(chosen.getAttribute("data-selected"), "defaultValue marks the row").not.toBeNull();
      const tick = chosen.querySelector<HTMLElement>('[data-slot="leading"]')!;
      expect(computed(tick, "color")).toBe(colorOn(popup, "var(--accent-glyph)"));
      // Two facts, and only the colour was read in Select's law until its 2026-08-09 audit:
      // the tick is accent AND it is the only one painted.
      expect(computed(tick, "visibility"), "the chosen tick is painted").toBe("visible");
      const ghost = other.querySelector<HTMLElement>('[data-slot="leading"]')!;
      expect(computed(ghost, "visibility")).toBe("hidden");
      expect(ghost.getBoundingClientRect().width, "the gutter stays reserved").toBeGreaterThan(0);
      expect(computed(chosen, "color"), "the label stays the row's ink").toBe(computed(other, "color"));
    });
  }

  it("a group empties and disappears rather than leaving a heading over nothing", async () => {
    const host = render(
      <Theme>
        <Combobox
          items={[
            { value: "Europe", items: ["Frankfurt", "London"] },
            { value: "Asia Pacific", items: ["Tokyo"] },
          ]}
          defaultOpen
        >
          <ComboboxInput aria-label="Region" />
          <ComboboxContent>
            <ComboboxList>
              {(group: { value: string; items: readonly string[] }) => (
                <ComboboxGroup key={group.value} items={group.items}>
                  <ComboboxLabel>{group.value}</ComboboxLabel>
                  <ComboboxCollection>
                    {(item: string) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    settleAll();
    const popup = lastPopup();
    const labels = () =>
      [...popup.querySelectorAll<HTMLElement>(".kui-combobox-label")].map((l) => l.textContent);
    expect(labels(), "the fixture must start with both sections").toEqual(["Europe", "Asia Pacific"]);
    const input = host.querySelector<HTMLInputElement>(".kui-field-input")!;
    input.focus();
    await userEvent.keyboard("tok");
    await until(() => labels().length === 1);
    expect(labels(), "the emptied section left its heading behind").toEqual(["Asia Pacific"]);
  });
});

/* ── The accessibility tree ───────────────────────────────────────────────────────────── */

describe("what a screen reader is told", () => {
  it("the input is the combobox, and it says whether the list is open", async () => {
    const host = render(
      <Theme>
        <Combobox items={REGIONS}>
          <ComboboxInput aria-label="Region" />
          <ComboboxContent>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    const input = host.querySelector<HTMLInputElement>(".kui-field-input")!;
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-expanded"), "closed").toBe("false");
    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await until(() => input.getAttribute("aria-expanded") === "true");
    expect(input.getAttribute("aria-expanded"), "open").toBe("true");

    /**
     * THE CHEVRON, AND WHICH HALF OF THIS IS OURS — stated because the sabotage pass measured it
     * (2026-09-12).
     *
     * The chevron is deliberately outside the accessibility tree: an unreachable, unnamed button
     * is noise, and the input's own `role="combobox"` already announces that a list is there.
     * `aria-hidden` and `tabIndex={-1}` are BASE UI's, not ours — `AriaCombobox.js:1128` spreads
     * `"aria-hidden": true` into the trigger's props — which was found by deleting our own
     * `aria-hidden` and watching this law stay green. So those two assertions pin an UPSTREAM
     * guarantee: they are a regression guard on the dependency (the day Base UI stops hiding it,
     * a combobox grows a second unnamed control in its tree), and they prove nothing about this
     * package's own code. Our explicit `aria-hidden` is redundant with it.
     *
     * What this component DOES own on that element is below, and it is what a sabotage of this
     * file can actually break: the chevron is rendered AS the trailing slot, so it takes the
     * slot's muted role and the shared icon box rather than being an icon inside one.
     */
    const trigger = host.querySelector<HTMLElement>(".kui-combobox-trigger")!;
    expect(trigger.getAttribute("aria-hidden"), "Base UI's guarantee, pinned").toBe("true");
    expect(trigger.getAttribute("tabindex"), "and it is out of the tab order").toBe("-1");
    expect(trigger.getAttribute("data-slot"), "the chevron IS the trailing slot").toBe("trailing");
    expect(computed(trigger, "color"), "and it rests in the slot's muted role").toBe(
      colorOn(trigger, "var(--color-text-muted)"),
    );
    const glyph = trigger.querySelector("svg")!;
    expect(
      computed(glyph as unknown as HTMLElement, "width"),
      "the glyph takes the control family's icon box, not a size of its own",
    ).toBe(tokenOn(trigger, "--icon-size-2"));
  });

  /**
   * THE LISTBOX IS NAMED BY THE FIELD'S OWN LABEL (audit C4, and the repair of 2026-09-12).
   *
   * C4 found the listbox with no accessible name and no prop that could give it one, and its
   * repair — accepting the two aria props on `ComboboxList` — made a name POSSIBLE while leaving
   * the ordinary call site exactly as nameless: measured on /preview/combobox afterwards,
   * `aria-label=null, aria-labelledby=null` on every open listbox, including the two demos
   * written specifically to name one. A repair nobody invokes is not a repair.
   *
   * Three routes, because they resolve through three different mechanisms and only one of them
   * is ours: `aria-label` on the input is a prop we forward, `aria-labelledby` is Base UI's own
   * resolution of a `<Field>`'s label id, and a name stated on the list itself must still win
   * over both. A law reading one route would pass while the other two were dead.
   */
  it("takes its name from the field's aria-label", async () => {
    const { popup } = openCombobox({}, { label: "Deploy region" });
    await settled();
    const list = popup.querySelector<HTMLElement>(".kui-combobox-list")!;
    expect(list.getAttribute("role")).toBe("listbox");
    expect(
      list.getAttribute("aria-label") ?? list.getAttribute("aria-labelledby"),
      "the listbox is announced as a listbox and nothing else",
    ).not.toBeNull();
    expect(list.getAttribute("aria-label")).toBe("Deploy region");
  });

  it("…and from a Field's label, which is Base UI's own aria-labelledby", async () => {
    const host = render(
      <Theme>
        <Field>
          <FieldLabel>Region</FieldLabel>
          <Combobox items={REGIONS} defaultOpen>
            <ComboboxInput />
            <ComboboxContent>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
      </Theme>,
    );
    settleAll();
    await settled();
    const input = host.querySelector<HTMLInputElement>(".kui-field-input")!;
    const list = lastPopup().querySelector<HTMLElement>(".kui-combobox-list")!;
    const by = input.getAttribute("aria-labelledby");
    // The premise, stated: if Base UI ever stops resolving the field's label onto the input
    // there is nothing for the list to borrow, and this law would otherwise report the wrong
    // thing as broken.
    expect(by, "the field's own label never reached the input").not.toBeNull();
    expect(list.getAttribute("aria-labelledby"), "the list borrows the field's label").toBe(by);
    // …and it points at words that are really on screen.
    const label = document.getElementById(by!.split(" ")[0]!);
    expect(label?.textContent).toBe("Region");
  });

  it("…and a name stated on the list itself wins over the field's", async () => {
    const host = render(
      <Theme>
        <Combobox items={REGIONS} defaultOpen>
          <ComboboxInput aria-label="Region" />
          <ComboboxContent>
            <ComboboxList aria-label="Matching regions">
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    settleAll();
    await settled();
    const list = lastPopup().querySelector<HTMLElement>(".kui-combobox-list")!;
    expect(list.getAttribute("aria-label")).toBe("Matching regions");
    expect(host).toBeDefined();
  });

  it("selection is announced on the rows, not only painted", async () => {
    const host = render(
      <Theme>
        <Combobox items={REGIONS} defaultOpen defaultValue="Tokyo">
          <ComboboxInput aria-label="Region" />
          <ComboboxContent>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    settleAll();
    await settled();
    const rows = [...lastPopup().querySelectorAll<HTMLElement>(".kui-combobox-item")];
    const chosen = rows.filter((r) => r.getAttribute("aria-selected") === "true");
    expect(chosen.map((r) => r.textContent), "exactly one row is the chosen one").toEqual(["Tokyo"]);
    expect(host).toBeDefined();
  });
});

/* ── The value machinery: the ROOT owns the state and the form (audit C1, C2) ──────────── */

describe("the root is the only home for the state and the form", () => {
  it("refuses the five props that reach an element the fact does not live on (C1, C2)", () => {
    // Measured before the refusal: `<ComboboxInput disabled>` painted the field dead while the
    // chevron still opened the list and a pick still submitted; `name` on the input submitted
    // the LETTERS ("zzz"), and with object options a correct pick of London submitted "London"
    // instead of "eu-west" — the exact thing the component's header promises never happens.
    // @ts-expect-error — the state is the root's
    void (<ComboboxInput disabled />);
    // @ts-expect-error — the state is the root's
    void (<ComboboxInput readOnly />);
    // @ts-expect-error — the value lives in the hidden input, so the name does too
    void (<ComboboxInput name="region" />);
    // @ts-expect-error — required must validate the CHOICE, not that something was typed
    void (<ComboboxInput required />);
    // @ts-expect-error — `form` on the visible input enrols the letters and leaves the value out
    void (<ComboboxInput form="deploy" />);
    // …and the refusals every control carries.
    // @ts-expect-error — no margin prop on any control
    void (<ComboboxInput m="4" />);
  });

  it("submits the chosen option's VALUE — never the letters, and never the label", async () => {
    let sent: FormData | null = null;
    const host = render(
      <Theme>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sent = new FormData(e.currentTarget);
          }}
        >
          <Combobox
            items={[
              { value: "eu-west", label: "London" },
              { value: "us-east", label: "Washington DC" },
            ]}
            name="region"
          >
            <ComboboxInput aria-label="Region" />
            <ComboboxContent>
              <ComboboxList>
                {(o: { value: string; label: string }) => (
                  <ComboboxItem key={o.value} value={o}>
                    {o.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <button type="submit">Go</button>
        </form>
      </Theme>,
    );
    const input = host.querySelector<HTMLInputElement>(".kui-field-input")!;
    input.focus();
    // Typed text that is NOT the value and NOT the whole label — so a form that submitted the
    // letters, or the label, or the value are three distinguishable answers. A fixture where
    // they coincide cannot tell a correct implementation from either defect.
    await userEvent.keyboard("lond");
    await until(() => document.querySelectorAll(".kui-combobox-item").length === 1);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await until(() => input.value === "London");
    host.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await until(() => sent !== null);
    expect(sent!.get("region"), "the chosen option's value, not the letters or the label").toBe(
      "eu-west",
    );
  });

  it("`required` on the root validates the CHOICE, and `disabled` really disables", async () => {
    const host = render(
      <Theme>
        <form>
          <Combobox items={REGIONS} name="a" required>
            <ComboboxInput aria-label="Required" />
          </Combobox>
        </form>
        <Combobox items={REGIONS} disabled>
          <ComboboxInput aria-label="Dead" />
          <ComboboxContent>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    const form = host.querySelector<HTMLFormElement>("form")!;
    expect(form.checkValidity(), "nothing is chosen, so the form must not validate").toBe(false);

    const dead = host.querySelector<HTMLElement>('[aria-label="Dead"]') as HTMLInputElement;
    expect(dead.disabled, "the root's disabled reaches the real input").toBe(true);
    // The chevron is disabled too, which is the half that made `<ComboboxInput disabled>` a
    // defect: there the field painted dead while this button still opened the list.
    const chevron = [...host.querySelectorAll<HTMLButtonElement>(".kui-combobox-trigger")].pop()!;
    expect(chevron.disabled, "the chevron still offers to open a dead control").toBe(true);
    // Pressed NATIVELY rather than through the driver: Playwright refuses to click a disabled
    // element and times out, which reports the fixture rather than the claim. A native `.click()`
    // dispatches the event the platform would, and a disabled button swallows it — so this asks
    // the real question, "does pressing it open anything".
    chevron.click();
    await settled();
    expect(document.querySelectorAll(".kui-combobox-popup").length, "a dead control opened").toBe(0);
  });

  /**
   * TWO OPTIONS ARE THE SAME OPTION WHEN THEY NAME THE SAME VALUE (audit C6).
   *
   * Base UI compares the selected value against each item with `Object.is`, so an object option
   * equal by content but built fresh — an inline `defaultValue`, a controlled value rebuilt from
   * a fetch — matched nothing: every row `aria-selected=false`, no tick, and ArrowDown starting
   * at the first row, while the field displayed the label and the form submitted it correctly.
   *
   * The fixture's whole job is that the two objects are NOT the same object: written as the same
   * reference, `Object.is` answers correctly and the comparator is invisible.
   */
  it("a value equal by CONTENT is the chosen option, not merely a matching label (C6)", async () => {
    const OPTIONS = [
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Europe/London", label: "London" },
    ];
    const host = render(
      <Theme>
        <Combobox
          items={OPTIONS}
          defaultOpen
          // A FRESH object, equal by content to OPTIONS[0] and a different reference.
          defaultValue={{ value: "Asia/Tokyo", label: "Tokyo" }}
        >
          <ComboboxInput aria-label="Zone" />
          <ComboboxContent>
            <ComboboxList>
              {(o: { value: string; label: string }) => (
                <ComboboxItem key={o.value} value={o}>
                  {o.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    settleAll();
    await settled();
    const rows = [...lastPopup().querySelectorAll<HTMLElement>(".kui-combobox-item")];
    const selected = rows.filter((r) => r.getAttribute("aria-selected") === "true");
    expect(selected.map((r) => r.textContent), "the row equal by value is the chosen one").toEqual([
      "Tokyo",
    ]);
    const tick = selected[0]!.querySelector<HTMLElement>('[data-slot="leading"]')!;
    expect(computed(tick, "visibility"), "and the tick says so").toBe("visible");
    expect(host).toBeDefined();
  });
});

/* ── The entry (§8, §22, §23) ─────────────────────────────────────────────────────────── */

describe("the entry: a panel that hangs below the field you are typing into", () => {
  /**
   * THE SEED IS A LINE AT THE FIELD'S BOTTOM EDGE, not the field's own body (audit C7).
   *
   * §22's silhouette is the trigger's opaque box lifting, which is honest wherever the panel
   * LANDS on the thing it came out of. A combobox's field is the one trigger you are still USING
   * while its panel opens, so the family's seed covered it for 60-100ms of every open — measured,
   * `elementFromPoint` at the input's text midline returning the popup while `input.value` became
   * "L", a blank capsule over the caret and the letter just typed.
   *
   * READ OFF THE SHIPPED RULE ON A REAL PANEL, by stamping the two attributes the runner stamps,
   * rather than by hunting the real first frame. The pose lasts about two frames and the repo has
   * been bitten repeatedly by laws that raced it (a premise that is a window is seized or
   * edge-anchored, never raced — 2026-08-20). Stamping is the seizure: the element, the cascade
   * and the tokens are all real, and the only thing the instrument supplies is the moment.
   *
   * The MENU beside it is the negative control, and it is what makes this a law about Combobox:
   * the family's seed is the trigger's own height, so a rule that leaked to the family would
   * zero a menu's seed too and this would still pass on the combobox alone.
   */
  it("poses as a zero-height line, where the family poses as its trigger's box (C7)", async () => {
    const { popup, field } = openCombobox();
    mount(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    settleAll();
    const menu = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop()!;

    /** Pose a panel the way the runner does — its two stamps, plus the seed height the runner
        measures off the trigger — and read what the shipped rule renders. */
    const pose = (el: HTMLElement, seedHeight: string) => {
      el.style.setProperty("--kui-seed-h", seedHeight);
      el.setAttribute("data-unfurling", "");
      el.setAttribute("data-seed", "");
      const read = {
        height: el.getBoundingClientRect().height,
        opacity: computed(el, "opacity"),
        dy: computed(el, "--kui-seed-dy").trim(),
      };
      el.removeAttribute("data-unfurling");
      el.removeAttribute("data-seed");
      el.style.removeProperty("--kui-seed-h");
      return read;
    };

    /**
     * READ AS A RESPONSE TO THE TRIGGER'S HEIGHT, not as a pinned number — which is both the
     * sharper claim and the one that survives the box model. `block-size: 0` is a CONTENT
     * height, so a posed panel still paints its own padding and border and measures ~26px
     * rather than 0; this law's first spelling asserted 0 and failed on a correct package,
     * which is a law reading one indirection to the side of the thing it is about.
     *
     * What the two families actually differ in is whether the seed's height IS the trigger's:
     * the family's is `block-size: var(--kui-seed-h)`, so doubling the trigger doubles the seed,
     * and a combobox's is the line, so nothing the trigger does can change it.
     */
    const short = pose(popup, "40px");
    const tall = pose(popup, "200px");
    expect(
      tall.height,
      `the panel's seed grew with the field (${short.height} → ${tall.height}) — it is photographing the box the caret is in`,
    ).toBeCloseTo(short.height, 1);
    // …and what is left is only the panel's own padding and border: no content height at all.
    const chrome =
      parseFloat(computed(popup, "padding-top")) +
      parseFloat(computed(popup, "padding-bottom")) +
      parseFloat(computed(popup, "border-top-width")) +
      parseFloat(computed(popup, "border-bottom-width"));
    expect(short.height, "the seed is a LINE — it holds nothing").toBeCloseTo(chrome, 1);
    // It starts AT the field's bottom edge, and the offset is the runner's own measurement of
    // the trigger rather than a number stated anywhere.
    expect(short.dy).toBe("40px");
    // …and it fades, where the family's seed is opaque from frame one — that rule's reason is
    // that it covers the trigger exactly, and a line with no height covers nothing.
    expect(parseFloat(short.opacity)).toBe(0);

    // THE NEGATIVE CONTROL, and it is what makes this a law about Combobox: the family's seed
    // IS the trigger's box, so a rule that leaked would zero a menu's seed too and everything
    // above would still pass on the combobox alone.
    const menuShort = pose(menu, "40px");
    const menuTall = pose(menu, "200px");
    expect(
      menuTall.height - menuShort.height,
      "the zero-height seed leaked to the family — a menu must still fly from its trigger's box",
    ).toBeCloseTo(160, 0);
    expect(field).toBeDefined();
  });

  /**
   * THE PANEL FOLLOWS ITS LIST WHILE IT FLIES (audit C3).
   *
   * The flight animates to a MEASURED length, because CSS cannot interpolate to `auto` outside
   * Chromium — correct for every member that existed, since a menu, a select, a popover and a
   * dialog all hold whatever they were rendered with. A combobox is opened BY TYPING into it, so
   * its list narrows under a box travelling toward a height that describes a list that is no
   * longer there: measured at 130ms per key, typing "par" left one row inside an 86px box which
   * then snapped 86 → 56 when the flight released, and backspacing left NINE rows inside a 146px
   * box whose viewport reported `clientHeight === scrollHeight`, so the extra rows could not be
   * reached at all until the entry ended.
   *
   * THE WINDOW IS MADE, NOT RACED. The claim is about a state that exists only while the panel
   * is flying, and the flight's release is a `setTimeout` read off the computed transition list
   * at departure — so the law lengthens the family's own clocks to six seconds before opening.
   * That is an instrument rather than a bound: it changes WHEN the flight ends and nothing about
   * the mechanism under test, and six seconds is past any stall this suite has ever recorded, so
   * the law does not depend on the machine and does not need the `watchesFrames` exclusion. The
   * tokens are restored by `onTestFinished`.
   */
  it("re-aims its measured height when the list narrows mid-flight (C3)", async () => {
    const root = document.documentElement;
    const CLOCKS = ["--floating-fall", "--floating-spread", "--floating-corner", "--floating-paint", "--floating-reveal"];
    const held = CLOCKS.map((name) => root.style.getPropertyValue(name));
    for (const name of CLOCKS) root.style.setProperty(name, "6s");
    onTestFinished(() => {
      CLOCKS.forEach((name, i) => {
        if (held[i]) root.style.setProperty(name, held[i]!);
        else root.style.removeProperty(name);
      });
    });

    inMotion();
    const host = mount(
      <Theme>
        <Combobox items={REGIONS} defaultOpen>
          <ComboboxInput aria-label="Region" />
          <ComboboxContent>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    const popup = lastPopup();
    // Departed: the pose is off and the flight is running, which is the only window in which a
    // flight var exists at all.
    expect(
      await until(() => popup.hasAttribute("data-unfurling") && !popup.hasAttribute("data-seed")),
      "the entry never departed — there is no flight for the list to move under",
    ).toBe(true);
    const before = parseFloat(popup.style.getPropertyValue("--kui-fly-h"));
    expect(before, "the flight published no measured height").toBeGreaterThan(0);

    const input = host.querySelector<HTMLInputElement>(".kui-field-input")!;
    input.focus();
    await userEvent.keyboard("par");
    await until(() => document.querySelectorAll(".kui-combobox-item").length === 1);
    // THE PREMISE: the panel is still flying. Without it a released flight (which strips the
    // var) would be reported as a failure of the mechanism rather than of the fixture.
    expect(popup.hasAttribute("data-unfurling"), "the flight ended before the list moved").toBe(true);

    const after = await until(() => {
      const now = parseFloat(popup.style.getPropertyValue("--kui-fly-h"));
      return Number.isFinite(now) && Math.abs(now - before) > 1;
    });
    const now = parseFloat(popup.style.getPropertyValue("--kui-fly-h"));
    expect(
      after,
      `the flight is still aimed at ${before}px for a list that is now one row — the box lands on a height describing a list that is not there, then snaps when it releases (now ${now}px)`,
    ).toBe(true);
    expect(now, "a narrower list means a shorter panel").toBeLessThan(before);
    // And the box really is following: the panel's own target is within a row of the content it
    // now holds, rather than merely having moved.
    const body = popup.querySelector<HTMLElement>(".kui-floating-body")!;
    const pad = 2 * parseFloat(computed(popup, "padding-top"));
    expect(Math.abs(now - (body.getBoundingClientRect().height + pad))).toBeLessThan(8);
  });

  it("a SETTLED panel animates the same change rather than snapping (C9)", () => {
    // The flight's half is the runner's; this is the same claim for the panel after it lands,
    // and it rides the family's own `block-size` transition, which is already declared. The
    // channel is only reachable because the pane opts into `interpolate-size`, which INHERITS —
    // hence scoped to this pane rather than declared wider.
    const { popup } = openCombobox();
    expect(computed(popup, "interpolate-size")).toBe("allow-keywords");
    // The negative control: the family does not opt in, so this is Combobox's own fact and not
    // something every floating pane happens to have.
    mount(
      <Theme>
        <Menu defaultOpen>
          <MenuTrigger render={<Button>Open</Button>} />
          <MenuContent>
            <MenuItem>Alpha</MenuItem>
          </MenuContent>
        </Menu>
      </Theme>,
    );
    settleAll();
    const menu = [...document.querySelectorAll<HTMLElement>(".kui-menu-popup")].pop()!;
    expect(computed(menu, "interpolate-size")).not.toBe("allow-keywords");
  });

  it("under REDUCED MOTION the panel is simply there (§8)", async () => {
    await asksForStillness();
    inMotion();
    mount(
      <Theme>
        <Combobox items={REGIONS} defaultOpen>
          <ComboboxInput aria-label="Region" />
          <ComboboxContent>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    const popup = lastPopup();
    await settled();
    // Suppression is TOTAL: the pose is not stamped and the measurement that only serves the
    // animation is not taken either, so the guard owes "nothing moves, nothing is measured"
    // rather than an inverse of every pose (the 2026-08-16 reshaping of this guarantee).
    expect(popup.hasAttribute("data-seed"), "a posed panel under reduced motion").toBe(false);
    expect(popup.hasAttribute("data-unfurling"), "a flying panel under reduced motion").toBe(false);
    expect(popup.style.getPropertyValue("--kui-fly-h"), "a measurement taken for an animation that is not running").toBe("");
    expect(popup.getBoundingClientRect().height, "and it is a real panel").toBeGreaterThan(20);
  });
});
