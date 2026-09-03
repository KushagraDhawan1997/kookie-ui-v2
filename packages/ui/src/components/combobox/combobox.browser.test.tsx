/**
 * Combobox's mounted laws (§20, §21, §45) — the 2026-08-03 standard: computed values through
 * a mounted <Theme>, both appearances where colour is the question, and every claim that
 * depends on the size index read at ALL FOUR indexes (2026-08-23: two adjacent steps agree
 * under more than one wrong spelling).
 *
 * The component is almost entirely membership — the field family, the anchored pane, the row
 * family — so most laws here are AGREEMENTS with a mounted sibling (a TextField, a Select's
 * panel, a Menu's panel) rather than restated numbers, and the sabotage passes were run
 * against the membership (a class dropped, the promoted block deleted) as much as against the
 * component's own sheet.
 */
import * as React from "react";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./combobox.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select/select.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu/menu.tsx";
import { Button } from "../button/button.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Box } from "../box/box.tsx";
import { Theme, type ThemeProps } from "../../theme/theme.tsx";
import {
  APPEARANCES,
  DENSITIES,
  SIZES,
  renderSettled as render,
  settleAll,
  computed,
  probeIn,
  until,
  within,
} from "../../test/browser.tsx";

type Fruit = { value: string; label: string };
const FRUITS: Fruit[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "damson", label: "Damson" },
];

/** Every axis off its default — a dropped attribute is visible (the §20 constant, contrast
    included: ENGINEERING §2.1 names this law as enforcing the agreement high-contrast mode
    included). */
const HOSTILE: ThemeProps = {
  appearance: "dark",
  density: "compact",
  radius: "large",
  pointer: "coarse",
  depth: "elevated",
  contrast: "high",
};

const settled = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/** `render()` hands back the Theme's own div; the field under it is what a twin law reads. */
const fieldIn = (host: HTMLElement) => within(host, ".kui-field");
/** A lens map is minted per pane, so two correct panes differ by the id alone. */
const lensless = (filter: string) => filter.replace(/url\("#[^"]*"\)/, "url(#lens)");

type Size = "1" | "2" | "3" | "4";

/** Mount a combobox under a themed root; `open` mounts the panel too. LOUD when a part never
    mounts, so no law below asserts against a null. */
function combobox(
  opts: { theme?: ThemeProps; size?: Size; open?: boolean; value?: Fruit | null; name?: string; disabled?: boolean; width?: string } = {},
) {
  const host = render(
    <Theme {...(opts.theme ?? {})}>
      <form>
        <Combobox
          items={FRUITS}
          {...(opts.open ? { defaultOpen: true } : {})}
          {...(opts.value !== undefined ? { defaultValue: opts.value } : {})}
          {...(opts.size ? { size: opts.size } : {})}
          {...(opts.name ? { name: opts.name } : {})}
          {...(opts.disabled ? { disabled: true } : {})}
        >
          <ComboboxInput
            aria-label="Fruit"
            placeholder="Pick a fruit"
            {...(opts.width ? { style: { width: opts.width } } : {})}
          />
          <ComboboxContent>
            <ComboboxEmpty>No fruit matches.</ComboboxEmpty>
            <ComboboxList>
              {(fruit: Fruit) => (
                <ComboboxItem key={fruit.value} value={fruit}>
                  {fruit.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </form>
    </Theme>,
  );
  const fields = document.querySelectorAll<HTMLElement>(".kui-combobox");
  const field = fields[fields.length - 1];
  if (!field) throw new Error("the field never mounted");
  const input = within(field, ".kui-field-input") as HTMLInputElement;
  const popup = () => {
    const popups = document.querySelectorAll<HTMLElement>(".kui-combobox-popup");
    return popups[popups.length - 1] ?? null;
  };
  const rows = () => [...(popup()?.querySelectorAll<HTMLElement>(".kui-combobox-item") ?? [])];
  settleAll();
  return { host, field, input, popup, rows };
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

/** The wrapper's facts — everything a TextField's wrapper decides. */
function fieldFacts(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    bg: cs.backgroundColor,
    border: cs.borderTopColor,
    borderWidth: cs.borderTopWidth,
    radius: cs.borderTopLeftRadius,
    height: cs.height,
    padLeft: cs.paddingLeft,
    font: cs.fontSize,
    weight: cs.fontWeight,
    cursor: cs.cursor,
    shadow: cs.boxShadow,
  };
}

/* ── The §20 agreement law ────────────────────────────────────────────────────────────── */

describe("the agreement law: portalled ≡ in-flow (§20, §45)", () => {
  /** The popup's class list, READ OFF A REAL PANEL rather than restated (Select's own lesson,
      2026-08-23: the hand-written copy went stale the day a class joined the identity). */
  function identities(): { popup: string; row: string } {
    const { popup, rows } = combobox({ open: true });
    const panel = popup();
    if (!panel) throw new Error("the panel never mounted");
    return { popup: panel.className, row: rows()[0]!.className };
  }

  function twin(theme: ThemeProps) {
    const identity = identities();
    let popupTwin: HTMLElement | null = null;
    let itemTwin: HTMLElement | null = null;
    render(
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
            ref={(n: HTMLDivElement | null) => void (itemTwin = n)}
            className={identity.row}
            data-size="2"
            data-tone="neutral"
            data-emphasis="quiet"
          >
            Apple
          </div>
        </div>
      </Theme>,
    );
    if (!popupTwin || !itemTwin) throw new Error("twin never mounted");
    return { popupTwin: popupTwin as HTMLElement, itemTwin: itemTwin as HTMLElement };
  }

  it("computes identical under the hostile axis set — panel and row", async () => {
    const { popup, rows } = combobox({ theme: HOSTILE, open: true });
    await settled();
    const panel = popup()!;
    const { popupTwin, itemTwin } = twin(HOSTILE);
    expect(surfaceFacts(panel)).toEqual(surfaceFacts(popupTwin));
    expect(rowFacts(rows()[0]!)).toEqual(rowFacts(itemTwin));
    // The comparison can fail: the same twin under default axes disagrees.
    const bare = twin({});
    expect(surfaceFacts(bare.popupTwin)).not.toEqual(surfaceFacts(popupTwin));
  });

  it("agrees under RTL — the field is the measured node, and the panel mirrors with it (§20)", async () => {
    render(
      <div dir="rtl">
        <Theme>
          <Combobox items={FRUITS} defaultOpen>
            <ComboboxInput aria-label="Fruit" />
            <ComboboxContent>
              <ComboboxList>{(f: Fruit) => <ComboboxItem key={f.value} value={f}>{f.label}</ComboboxItem>}</ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Theme>
      </div>,
    );
    await settled();
    const popups = document.querySelectorAll<HTMLElement>(".kui-combobox-popup");
    const popup = popups[popups.length - 1]!;
    expect(computed(popup, "direction"), "the portalled panel takes the app's direction").toBe("rtl");
  });
});

/* ── The field is a TextField that opens (§4, §45) ────────────────────────────────────── */

describe("the field wears the TextField's identity — worn, not copied", () => {
  for (const appearance of APPEARANCES) {
    for (const size of SIZES) {
      it(`${appearance} × size ${size}: the wrapper computes what a TextField's wrapper computes`, () => {
        const { field } = combobox({ theme: { appearance }, size });
        const twin = render(
          <Theme appearance={appearance}>
            <TextField size={size} placeholder="p" trailing={<Button iconOnly aria-label="x">x</Button>} />
          </Theme>,
        );
        expect(fieldFacts(field)).toEqual(fieldFacts(fieldIn(twin)));
      });
    }
  }

  it("the ladder is a ladder: four indexes, four different heights", () => {
    const heights = SIZES.map((size) => parseFloat(computed(combobox({ size }).field, "height")));
    expect(new Set(heights).size, `heights ${heights.join("/")}`).toBe(4);
    expect([...heights].sort((a, b) => a - b)).toEqual(heights);
  });

  it("the ring is the FIELD's: it lights when the caret is in the input, exactly as a TextField's does", async () => {
    const { field, input } = combobox();
    const twinHost = fieldIn(
      render(
        <Theme>
          <TextField placeholder="p" />
        </Theme>,
      ),
    );
    const twinInput = within(twinHost, ".kui-field-input") as HTMLInputElement;
    expect(computed(field, "outline-style")).toBe(computed(twinHost, "outline-style"));
    input.focus();
    expect(await until(() => document.activeElement === input)).toBe(true);
    const lit = { style: computed(field, "outline-style"), width: computed(field, "outline-width"), color: computed(field, "outline-color") };
    input.blur();
    twinInput.focus();
    expect(await until(() => document.activeElement === twinInput)).toBe(true);
    expect(lit).toEqual({ style: computed(twinHost, "outline-style"), width: computed(twinHost, "outline-width"), color: computed(twinHost, "outline-color") });
    expect(lit.style, "the ring never lit").not.toBe("none");
  });

  it("the placeholder invites in the muted role — the TextField's own placeholder colour", () => {
    const { input } = combobox();
    const twin = within(render(<Theme><TextField placeholder="p" /></Theme>), ".kui-field-input");
    const placeholder = (el: Element) => getComputedStyle(el, "::placeholder").color;
    expect(placeholder(input)).toBe(placeholder(twin));
    expect(placeholder(input), "the placeholder is not distinguished from the value").not.toBe(computed(input, "color"));
  });

  it("the chevron and the clear are HOSTED controls at the slot's derived size, and neither is a tab stop (§4)", () => {
    const { field } = combobox({ value: FRUITS[1]! });
    const trigger = within(field, ".kui-combobox-trigger");
    const clear = within(field, ".kui-combobox-clear");
    const hostedTwin = within(
      render(
        <Theme>
          <TextField placeholder="p" trailing={<Button iconOnly aria-label="x">x</Button>} />
        </Theme>,
      ),
      "[data-slot='trailing'] > .kui-control",
    );
    expect(trigger.classList.contains("kui-button")).toBe(true);
    expect(clear.classList.contains("kui-button")).toBe(true);
    expect(computed(trigger, "height")).toBe(computed(hostedTwin, "height"));
    expect(computed(clear, "height")).toBe(computed(hostedTwin, "height"));
    // Not a bare Button's height: the slot's derived box is smaller than the field's own.
    expect(parseFloat(computed(trigger, "height"))).toBeLessThan(parseFloat(computed(field, "height")));
    expect(trigger.tabIndex).toBe(-1);
    expect(clear.tabIndex).toBe(-1);
    expect(trigger.getAttribute("aria-label")).toBe("Show options");
    expect(clear.getAttribute("aria-label")).toBe("Clear");
  });

  it("the clear exists only while something is chosen — an empty field has nothing to clear", () => {
    const empty = combobox();
    expect(empty.field.querySelector(".kui-combobox-clear")).toBeNull();
    const chosen = combobox({ value: FRUITS[0]! });
    expect(chosen.field.querySelector(".kui-combobox-clear")).not.toBeNull();
  });

  it("a disabled combobox's field takes the shared remap — the disabled TextField's own ink", () => {
    for (const appearance of APPEARANCES) {
      const { field, input } = combobox({ theme: { appearance }, disabled: true });
      const twin = fieldIn(render(<Theme appearance={appearance}><TextField placeholder="p" disabled /></Theme>));
      expect(field.hasAttribute("data-disabled")).toBe(true);
      expect(input.disabled).toBe(true);
      expect(computed(input, "color")).toBe(computed(within(twin, ".kui-field-input"), "color"));
      expect(computed(field, "background-color")).toBe(computed(twin, "background-color"));
      // It can fail: a live field's ink differs.
      expect(computed(input, "color")).not.toBe(computed(within(render(<Theme appearance={appearance}><TextField placeholder="p" /></Theme>), ".kui-field-input"), "color"));
    }
  });

  it("glass is askable, and a glass field reads as the glass TextField beside it (§10)", () => {
    for (const appearance of APPEARANCES) {
      const host = render(
        <Theme appearance={appearance} material="regular">
          <Box backdrop>
            <Combobox items={FRUITS}>
              <ComboboxInput aria-label="Fruit" placeholder="p" />
            </Combobox>
            <TextField placeholder="p" />
          </Box>
        </Theme>,
      );
      const field = within(host, ".kui-combobox");
      const twin = within(host, ".kui-field:not(.kui-combobox)");
      expect(field.getAttribute("data-material")).toBe("regular");
      expect(lensless(computed(field, "backdrop-filter"))).toBe(lensless(computed(twin, "backdrop-filter")));
      expect(computed(field, "backdrop-filter"), "no glass at all").not.toBe("none");
      expect(computed(field, "background-color")).toBe(computed(twin, "background-color"));
    }
  });
});

/* ── The panel is the anchored pane, promoted on this member (§22, §23, §45) ──────────── */

describe("the panel is the family's — padding floor, corner and anchor floor are the one shared block", () => {
  it("pads exactly what a Menu's and a Select's panel pad, in every density", async () => {
    // The padding floor was menu.css's, copied into select.css, and promoted to surfaces.css
    // on this member. A three-way agreement, at every density because compact is the one cell
    // where the floor binds (2px against a 4px reach), so a floor that vanished would only be
    // visible there.
    for (const density of DENSITIES) {
      const { popup } = combobox({ theme: { density }, open: true });
      await settled();
      const menuHost = render(
        <Theme density={density}>
          <Menu defaultOpen>
            <MenuTrigger render={<Button>Open</Button>} />
            <MenuContent><MenuItem>Alpha</MenuItem></MenuContent>
          </Menu>
          <Select defaultOpen defaultValue="a">
            <SelectTrigger placeholder="p" />
            <SelectContent><SelectItem value="a">Alpha</SelectItem></SelectContent>
          </Select>
        </Theme>,
      );
      void menuHost;
      await settled();
      const menus = document.querySelectorAll<HTMLElement>(".kui-menu-popup");
      const selects = document.querySelectorAll<HTMLElement>(".kui-select-popup");
      const menu = menus[menus.length - 1]!;
      const select = selects[selects.length - 1]!;
      const pad = (el: HTMLElement) => computed(el, "padding-top");
      expect(pad(popup()!), `${density}: combobox ≠ menu`).toBe(pad(menu));
      expect(pad(popup()!), `${density}: combobox ≠ select`).toBe(pad(select));
      /* THE ABSOLUTE HALF, because the agreement alone COULD NOT FAIL (its own sabotage pass,
         2026-09-03): with the promoted block deleted all three panes fall back to the surface
         band's padding together and still agree, and at compact size 2 that fallback clears the
         4px reach by itself. So the pad is also read against the floor's own expression,
         resolved through a probe inside the pane — the value the block declares, not a number a
         fixture chose. With the block gone the pane pads the surface pick and this fails. */
      const floor = probeIn(
        popup()!,
        (el) => (el.style.paddingTop = "max(var(--floating-p), calc(var(--focus-ring-width) + var(--focus-ring-offset)))"),
        (cs) => cs.paddingTop,
      );
      expect(pad(popup()!), `${density}: the pad is not the ring-floored designed padding`).toBe(floor);
    }
  });

  it("is never narrower than the FIELD that opened it — the group is the anchor, not the input", async () => {
    // Base UI anchors to the InputGroup when one exists and to the bare input otherwise. The
    // wrapper IS the group, so the floor is the box the person sees. A wide field makes the
    // claim falsifiable: the designed floor alone would leave the panel narrower than it.
    const { field, input, popup } = combobox({ open: true, width: "420px" });
    await settled();
    await until(() => (popup()?.getBoundingClientRect().width ?? 0) >= field.getBoundingClientRect().width - 0.5);
    const panel = popup()!;
    expect(panel.getBoundingClientRect().width).toBeGreaterThanOrEqual(field.getBoundingClientRect().width - 0.5);
    // ...and the input alone is narrower than the field, which is what makes the group the
    // load-bearing anchor rather than a nicety.
    expect(input.getBoundingClientRect().width).toBeLessThan(field.getBoundingClientRect().width - 20);
  });

  it("the corner is concentric — a Select's panel corner at every index, from the one join", async () => {
    // The derivation (row corner + padding, × the squircle knob) is Select's own law; what is
    // asserted here is MEMBERSHIP: the same join answers both panes, so they agree at every
    // index, and the panel stamps the size its rows answer.
    for (const size of SIZES) {
      const { popup, rows } = combobox({ open: true, size });
      await settled();
      const panel = popup()!;
      expect(panel.getAttribute("data-size")).toBe(size);
      expect(rows()[0]!.getAttribute("data-size")).toBe(size);
      render(
        <Theme>
          <Select defaultOpen defaultValue="a" size={size}>
            <SelectTrigger placeholder="p" />
            <SelectContent><SelectItem value="a">Alpha</SelectItem></SelectContent>
          </Select>
        </Theme>,
      );
      await settled();
      const selects = document.querySelectorAll<HTMLElement>(".kui-select-popup");
      const twin = selects[selects.length - 1]!;
      expect(computed(panel, "border-top-left-radius")).toBe(computed(twin, "border-top-left-radius"));
      expect(computed(panel, "padding-top")).toBe(computed(twin, "padding-top"));
    }
  });

  it("a row is a Select's row — same family, same cells, at every index", async () => {
    for (const size of SIZES) {
      const { rows } = combobox({ open: true, size });
      await settled();
      render(
        <Theme>
          <Select defaultOpen defaultValue="b" size={size}>
            <SelectTrigger placeholder="p" />
            <SelectContent><SelectItem value="a">Alpha</SelectItem><SelectItem value="b">Beta</SelectItem></SelectContent>
          </Select>
        </Theme>,
      );
      await settled();
      // The UNCHOSEN row — a chosen one wears the selected ink, which is state, not identity.
      const selects = document.querySelectorAll<HTMLElement>(".kui-select-item:not([data-selected])");
      const twin = selects[selects.length - 1]!;
      expect(rowFacts(rows()[0]!)).toEqual(rowFacts(twin));
    }
  });
});

/* ── Behaviour: roles, filtering, choosing, forms ─────────────────────────────────────── */

describe("behaviour: a value that is CHOSEN from a list but FOUND by typing (§45)", () => {
  it("input is the combobox, the list is a listbox, the rows are options", async () => {
    const { input, popup, rows } = combobox({ open: true });
    await settled();
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(within(popup()!, ".kui-combobox-list").getAttribute("role")).toBe("listbox");
    expect(rows().every((r) => r.getAttribute("role") === "option")).toBe(true);
  });

  it("typing narrows the list, and the rows that survive are the matching ones", async () => {
    const { input, rows } = combobox({ open: true });
    await settled();
    expect(rows()).toHaveLength(FRUITS.length);
    await userEvent.fill(input, "an");
    expect(await until(() => rows().length === 1)).toBe(true);
    // Base UI's matcher is CONTAINS, not starts-with: "an" is inside "Banana" and nowhere else.
    expect(rows().map((r) => r.textContent)).toEqual(["Banana"]);
  });

  it("nothing matching renders the app's own sentence", async () => {
    const { input, popup, rows } = combobox({ open: true });
    await settled();
    await userEvent.fill(input, "zzz");
    expect(await until(() => rows().length === 0)).toBe(true);
    expect(within(popup()!, ".kui-combobox-empty").textContent).toBe("No fruit matches.");
  });

  it("choosing a row puts its LABEL in the field, its VALUE in the form, and closes the panel", async () => {
    const { host, input, popup, rows } = combobox({ open: true, name: "fruit" });
    await settled();
    await userEvent.click(rows()[2]!);
    expect(await until(() => input.value === "Cherry")).toBe(true);
    expect(await until(() => popup() === null)).toBe(true);
    const hidden = host.querySelector<HTMLInputElement>('input[name="fruit"]');
    if (!hidden) throw new Error("hidden input missing — a combobox IS a form control");
    expect(hidden.value).toBe("cherry");
  });

  it("the keyboard chooses too: ArrowDown walks, Enter picks", async () => {
    const { input, rows } = combobox({ open: true });
    await settled();
    input.focus();
    expect(await until(() => document.activeElement === input)).toBe(true);
    await userEvent.keyboard("{ArrowDown}");
    expect(await until(() => rows().some((r) => r.hasAttribute("data-highlighted")))).toBe(true);
    await userEvent.keyboard("{Enter}");
    expect(await until(() => input.value === "Apple")).toBe(true);
  });

  it("the chosen row stays marked, and its tick is the accent's ink", async () => {
    const { rows } = combobox({ open: true, value: FRUITS[1]! });
    await settled();
    const chosen = rows().find((r) => r.hasAttribute("data-selected"));
    if (!chosen) throw new Error("no row is marked");
    expect(chosen.textContent).toBe("Banana");
    const tick = within(chosen, "[data-slot='leading']");
    const other = within(rows()[0]!, "[data-slot='leading']");
    expect(computed(tick, "visibility")).toBe("visible");
    expect(computed(other, "visibility"), "the unchosen gutter paints its tick").toBe("hidden");
    expect(computed(other, "display"), "the gutter collapsed — rows no longer align").not.toBe("none");
  });

  it("the clear button empties the field AND the form, and then leaves", async () => {
    const { host, field, input } = combobox({ value: FRUITS[0]!, name: "fruit" });
    expect(input.value).toBe("Apple");
    await userEvent.click(within(field, ".kui-combobox-clear"));
    expect(await until(() => input.value === "")).toBe(true);
    expect(host.querySelector<HTMLInputElement>('input[name="fruit"]')!.value).toBe("");
    expect(await until(() => field.querySelector(".kui-combobox-clear") === null)).toBe(true);
  });

  it("the chevron opens the panel for a pointer that would rather browse", async () => {
    const { field, popup } = combobox();
    expect(popup()).toBeNull();
    await userEvent.click(within(field, ".kui-combobox-trigger"));
    expect(await until(() => popup() !== null)).toBe(true);
  });

  it("Escape closes it, and a closed panel is gone rather than hidden", async () => {
    const { input, popup } = combobox({ open: true });
    await settled();
    input.focus();
    expect(await until(() => document.activeElement === input)).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(await until(() => popup() === null)).toBe(true);
  });

  it("a group disappears when nothing in it matches, and its label goes with it", async () => {
    const GROUPS = [
      { value: "Fruit", items: FRUITS.slice(0, 2) },
      { value: "Stone fruit", items: FRUITS.slice(2) },
    ];
    render(
      <Theme>
        <Combobox items={GROUPS} defaultOpen>
          <ComboboxInput aria-label="Fruit" />
          <ComboboxContent>
            <ComboboxList>
              {(group: { value: string; items: Fruit[] }) => (
                <ComboboxGroup key={group.value} items={group.items}>
                  <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
                  <ComboboxCollection>
                    {(f: Fruit) => <ComboboxItem key={f.value} value={f}>{f.label}</ComboboxItem>}
                  </ComboboxCollection>
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Theme>,
    );
    settleAll();
    await settled();
    const popups = document.querySelectorAll<HTMLElement>(".kui-combobox-popup");
    const popup = popups[popups.length - 1]!;
    const labels = () => [...popup.querySelectorAll(".kui-combobox-group-label")].map((l) => l.textContent);
    expect(labels()).toEqual(["Fruit", "Stone fruit"]);
    const fields = document.querySelectorAll<HTMLInputElement>(".kui-combobox .kui-field-input");
    await userEvent.fill(fields[fields.length - 1]!, "Cher");
    expect(await until(() => labels().length === 1)).toBe(true);
    expect(labels(), "a group with no surviving rows still drew its caption").toEqual(["Stone fruit"]);
  });
});

/* ── The API's closed edges (§3, §45) ─────────────────────────────────────────────────── */

describe("the refusals are pinned by the TYPE, not merely claimed", () => {
  it("refuses multiple, readOnly, modal, positioning, and the axes a form control never had", () => {
    // @ts-expect-error — deferred, not designed: a chip strip inside a field is a geometry
    // this system has not drawn (§45)
    void (<Combobox items={FRUITS} multiple />);
    // @ts-expect-error — Select's refusal: a value that cannot change is a disabled field
    void (<Combobox items={FRUITS} readOnly />);
    // @ts-expect-error — the page stays live behind a combobox; a modal list is a Dialog
    void (<Combobox items={FRUITS} modal />);
    void (
      <Combobox items={FRUITS}>
        {/* @ts-expect-error — the geometry is the system's, whole */}
        <ComboboxContent side="top" />
      </Combobox>
    );
    // @ts-expect-error — a form control does not rank (§11)
    void (<ComboboxInput aria-label="x" emphasis="loud" />);
    // @ts-expect-error — the field family has one tone as an identity
    void (<ComboboxInput aria-label="x" tone="destructive" />);
    // @ts-expect-error — no margin prop on any control (the first non-negotiable)
    void (<ComboboxInput aria-label="x" m="4" />);
    // @ts-expect-error — two elements, neither can move (TextField's sentence)
    void (<ComboboxInput aria-label="x" render={<div />} />);
    // @ts-expect-error — the input has no children; the value is the root's
    void (<ComboboxInput aria-label="x">x</ComboboxInput>);
    // @ts-expect-error — the ROOT owns the value; what is typed is onInputValueChange
    void (<ComboboxInput aria-label="x" value="x" />);
  });

  it("the ref names the INPUT — what .focus() wants; className dresses the wrapper", () => {
    const ref = React.createRef<HTMLInputElement>();
    const host = render(
      <Theme>
        <Combobox items={FRUITS}>
          <ComboboxInput ref={ref} aria-label="Fruit" className="mine" />
        </Combobox>
      </Theme>,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(within(host, ".kui-combobox").classList.contains("mine")).toBe(true);
    expect(ref.current!.classList.contains("mine")).toBe(false);
  });
});
