/**
 * The resting index, mounted for real (§4, §5, §28).
 *
 * Three layers — the caller, the unit, the app — and the whole mechanism is which one an
 * element three levels down actually resolves. That is a question no string test can ask,
 * and this file is deliberately separate from theme.browser.test.tsx and from field's: the
 * subject belongs to none of the three homes it spans, and the audits' own finding is that
 * every law building one DOM shape is one experiment rather than many.
 *
 * Each law here reads a PAINTED consequence — a height, a padding, a font size — never the
 * `data-size` attribute, which is written verbatim from the value under test and can
 * therefore never disagree with it.
 */
import { describe, expect, it } from "vitest";

import { computed, mounted, within } from "../test/browser.tsx";
import { Theme } from "../theme/theme.tsx";
import { Box } from "../components/box/box.tsx";
import { Button } from "../components/button/button.tsx";
import { Card } from "../components/card/card.tsx";
import { Field, FieldLabel } from "../components/field/field.tsx";
import { TextField } from "../components/text-field/text-field.tsx";
import { Text } from "../components/text/text.tsx";
import { Heading } from "../components/heading/heading.tsx";
import { Badge } from "../components/badge/badge.tsx";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../components/menu/menu.tsx";
import { Dialog, DialogContent, DialogTitle } from "../components/dialog/dialog.tsx";
import { Toolbar } from "../components/toolbar/toolbar.tsx";
import {
  Command,
  CommandContent,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/command/command.tsx";
import { BAND_STEP } from "./size.ts";

/** The one index the theme is driven to below. 4 is chosen because nothing rests there. */
const AWAY = "4" as const;

describe("the app's own index reaches every family on the 1-4 ladder (§4, 2026-09-05)", () => {
  it("one number moves a control, a pane and the control inside that pane", () => {
    const at = (size?: "1" | "2" | "3" | "4") =>
      mounted(
        <Card>
          <Button>Go</Button>
        </Card>,
        { theme: size ? { size } : {}, select: ".kui-surface" },
      );
    const rest = at();
    const app = at(AWAY);
    // The pane's own padding, and the control it holds — two families, one statement.
    expect(computed(app, "padding-top")).not.toBe(computed(rest, "padding-top"));
    expect(computed(within(app, ".kui-button"), "height")).not.toBe(
      computed(within(rest, ".kui-button"), "height"),
    );
    // …and each landed on the STATED index rather than merely somewhere else: an element that
    // says the number itself must compute the same box.
    const stated = mounted(
      <Card size={AWAY}>
        <Button size={AWAY}>Go</Button>
      </Card>,
      { theme: {}, select: ".kui-surface" },
    );
    expect(computed(app, "padding-top")).toBe(computed(stated, "padding-top"));
    expect(computed(within(app, ".kui-button"), "height")).toBe(
      computed(within(stated, ".kui-button"), "height"),
    );
  });

  it("a stated prop still wins — the app sets a REST, never a clamp", () => {
    const root = mounted(
      <Box>
        <Button>free</Button>
        <Button size="1">stated</Button>
      </Box>,
      { theme: { size: AWAY } },
    );
    const [free, stated] = [...root.querySelectorAll<HTMLElement>(".kui-button")];
    expect(free && stated).toBeTruthy();
    expect(computed(stated!, "height")).toBe(
      computed(mounted(<Button size="1">x</Button>, { theme: {} }), "height"),
    );
    // The guard that makes the assertion above mean something, and it has to name the app's
    // value rather than merely assert the two differ: under a `useSize` that ignored the theme
    // the free button would rest at 2 and still differ from a stated 1, so "they differ" is a
    // test this law passes while the mechanism is dead.
    expect(computed(free!, "height")).toBe(
      computed(mounted(<Button size={AWAY}>x</Button>, { theme: {} }), "height"),
    );
    expect(computed(stated!, "height")).not.toBe(computed(free!, "height"));
  });

  it("a UNIT beats the app for what it contains — nearer wins (§28)", () => {
    const root = mounted(
      <Field size="1">
        <FieldLabel>Email</FieldLabel>
        <TextField />
      </Field>,
      { theme: { size: AWAY } },
    );
    const field = within(root, ".kui-field");
    expect(computed(field, "height")).toBe(
      computed(mounted(<TextField size="1" />, { theme: {} }), "height"),
    );
    // And the app's value really reached the tree it is being beaten in — named, not merely
    // asserted to differ: an unwrapped control under the same theme must land ON the app's
    // index, or a dead mechanism resting at 2 would satisfy a "they differ" clause too.
    expect(computed(mounted(<TextField />, { theme: { size: AWAY } }), "height")).toBe(
      computed(mounted(<TextField size={AWAY} />, { theme: {} }), "height"),
    );
  });

  it("a nested Theme inherits what it does not state, and overrides what it does", () => {
    const inner = mounted(
      <Theme>
        <Button>a</Button>
      </Theme>,
      { theme: { size: AWAY }, select: ".kui-button" },
    );
    expect(computed(inner, "height")).toBe(
      computed(mounted(<Button size={AWAY}>a</Button>, { theme: {} }), "height"),
    );
    const overridden = mounted(
      <Theme size="1">
        <Button>a</Button>
      </Theme>,
      { theme: { size: AWAY }, select: ".kui-button" },
    );
    expect(computed(overridden, "height")).toBe(
      computed(mounted(<Button size="1">a</Button>, { theme: {} }), "height"),
    );
    expect(computed(inner, "height")).not.toBe(computed(overridden, "height"));
  });
  it("crosses the PORTAL — a popup and an overlay take it like anything in flow", () => {
    // The path most likely to lose it, and the one every earlier axis DID lose (§20, audit
    // 2026-08-09: the portal wrapper could not tell "nobody chose" from "someone chose light").
    // Nothing here re-stamps a size: the wrapper's bare <Theme> resolves `props ?? parent`, and
    // React context crosses a portal, so the popup inherits by construction — which is exactly
    // the sort of "by construction" that is worth one mounted reading.
    const menu = (theme: Record<string, string>) => {
      const root = mounted(
        <Menu defaultOpen>
          <MenuTrigger>open</MenuTrigger>
          <MenuContent>
            <MenuItem>row</MenuItem>
          </MenuContent>
        </Menu>,
        { theme },
      );
      void root;
      const rows = document.querySelectorAll<HTMLElement>(".kui-menu-item");
      return rows[rows.length - 1]!;
    };
    expect(computed(menu({ size: AWAY }), "height")).not.toBe(computed(menu({}), "height"));

    const dialog = (theme: Record<string, string>) => {
      mounted(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>t</DialogTitle>
          </DialogContent>
        </Dialog>,
        { theme },
      );
      const panels = document.querySelectorAll<HTMLElement>(".kui-dialog-popup");
      return panels[panels.length - 1]!;
    };
    expect(computed(dialog({ size: AWAY }), "max-inline-size")).not.toBe(
      computed(dialog({}), "max-inline-size"),
    );
  });
});

describe("an overlay that covers the screen answers to the APP, not the unit that opened it (2026-09-06)", () => {
  /* Found in the rendered DOM rather than by a law (Kushagra: "But it shows size 4"). The
     documentation site puts its search button in a `Toolbar`; a toolbar supplies its row's index
     one step above the app's; `SizeScopeContext` follows the REACT tree, not the DOM — so the
     palette opened from that button read the band's 3 and priced its rows a step above that,
     landing every row of a size-2 app at the top of the ladder.

     The FIXTURE is the whole law: an overlay rendered inside a real unit provider, with the app
     at a different index, so "the unit was skipped" and "the app was read" are two different
     answers rather than one. A `Toolbar` is the provider used because it is the one that
     produced the defect, and it is driven from the app's own rest so the band's value is a
     STEP rather than a literal — read against a twin outside the unit, never against a number.

     THE APP IS DRIVEN TO 1 AND NOT TO THIS FILE'S `AWAY`, and that is the fixture's load-bearing
     half: `BAND_STEP` ends level at 4, so at the top of the ladder the band and the app ARE the
     same index and every clause below compares a value with itself. Written with `AWAY` first,
     two of these passed for exactly that reason — the degenerate fixture caught by its own first
     run. At 1 the band is 2, and the two answers really are two. */
  const APP = "1" as const;
  const OUTSIDE = { theme: { size: APP } } as const;

  it("a Dialog inside a Toolbar is the app's size, not the band's", () => {
    const inUnit = mounted(
      <Toolbar>
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>t</DialogTitle>
          </DialogContent>
        </Dialog>
      </Toolbar>,
      OUTSIDE,
    );
    void inUnit;
    const inside = [...document.querySelectorAll<HTMLElement>(".kui-dialog-popup")].pop()!;
    const width = computed(inside, "max-inline-size");

    mounted(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>t</DialogTitle>
        </DialogContent>
      </Dialog>,
      OUTSIDE,
    );
    const alone = [...document.querySelectorAll<HTMLElement>(".kui-dialog-popup")].pop()!;
    expect(width, "the toolbar re-sized a dialog standing over the whole app").toBe(
      computed(alone, "max-inline-size"),
    );

    /* THE VACUITY HALF, and without it the law passes on a Dialog that answers no index at all:
       the band really does supply a different one, so a dialog that HAD read it would differ. */
    mounted(
      <Dialog defaultOpen size={BAND_STEP[APP]}>
        <DialogContent>
          <DialogTitle>t</DialogTitle>
        </DialogContent>
      </Dialog>,
      OUTSIDE,
    );
    const banded = [...document.querySelectorAll<HTMLElement>(".kui-dialog-popup")].pop()!;
    expect(
      computed(banded, "max-inline-size"),
      "the band's index is the app's here, so this law cannot tell them apart",
    ).not.toBe(width);
  });

  it("a Command inside a Toolbar prices its rows off the app, so two steps never stack", () => {
    /* The reported shape end to end: the palette steps its rows up by one (§44), and the only
       question this law asks is what that one step is measured FROM. */
    mounted(
      <Toolbar>
        <Command items={["a", "b"]} defaultOpen>
          <CommandContent aria-label="p">
            <CommandInput aria-label="q" />
            <CommandList>{(i: string) => <CommandItem key={i} value={i}>{i}</CommandItem>}</CommandList>
          </CommandContent>
        </Command>
      </Toolbar>,
      OUTSIDE,
    );
    const inside = [...document.querySelectorAll<HTMLElement>(".kui-command-item")].pop()!;
    mounted(
      <Command items={["a", "b"]} defaultOpen>
        <CommandContent aria-label="p">
          <CommandInput aria-label="q" />
          <CommandList>{(i: string) => <CommandItem key={i} value={i}>{i}</CommandItem>}</CommandList>
        </CommandContent>
      </Command>,
      OUTSIDE,
    );
    const alone = [...document.querySelectorAll<HTMLElement>(".kui-command-item")].pop()!;
    expect(
      inside.getAttribute("data-size"),
      "the band's index reached the palette and the row step landed on top of it",
    ).toBe(alone.getAttribute("data-size"));
  });

  it("but an ANCHORED panel keeps the unit's index — it belongs to the control that opened it", () => {
    /* The other side of the line, and the reason this is not "portals ignore units": a menu hangs
       off its trigger, so a band's menu is that band's menu. Without this clause the repair could
       have been made by cutting every portal off from the scope, which is a different rule. */
    mounted(
      <Toolbar>
        <Menu defaultOpen>
          <MenuTrigger>open</MenuTrigger>
          <MenuContent>
            <MenuItem>Row</MenuItem>
          </MenuContent>
        </Menu>
      </Toolbar>,
      OUTSIDE,
    );
    const inside = [...document.querySelectorAll<HTMLElement>(".kui-menu-item")].pop()!;
    mounted(
      <Menu defaultOpen>
        <MenuTrigger>open</MenuTrigger>
        <MenuContent>
          <MenuItem>Row</MenuItem>
        </MenuContent>
      </Menu>,
      OUTSIDE,
    );
    const alone = [...document.querySelectorAll<HTMLElement>(".kui-menu-item")].pop()!;
    expect(
      computed(inside, "height"),
      "an anchored panel stopped taking the index of the row it was opened from",
    ).not.toBe(computed(alone, "height"));
  });
});

describe("what the app's index deliberately does NOT reach", () => {
  it("the type family keeps its own scale — nine steps long, so it shares neither rest nor range", () => {
    const away = mounted(
      <Box>
        <Text>body</Text>
        <Heading>title</Heading>
      </Box>,
      { theme: { size: AWAY } },
    );
    const rest = mounted(
      <Box>
        <Text>body</Text>
        <Heading>title</Heading>
      </Box>,
      { theme: {} },
    );
    expect(computed(within(away, "span"), "font-size")).toBe(
      computed(within(rest, "span"), "font-size"),
    );
    expect(computed(within(away, "h2"), "font-size")).toBe(
      computed(within(rest, "h2"), "font-size"),
    );
    // The vacuity guard, and it is the whole fixture: a theme value that reached NOTHING would
    // satisfy both assertions above. A control in the same tree must have moved.
    const ctlAway = mounted(<Button>x</Button>, { theme: { size: AWAY }, select: ".kui-button" });
    const ctlRest = mounted(<Button>x</Button>, { theme: {}, select: ".kui-button" });
    expect(computed(ctlAway, "height")).not.toBe(computed(ctlRest, "height"));
  });

  it("an inert atom still rests at NOTHING and takes the line it sits in", () => {
    // Badge, Code, Kbd, Avatar and Chip are the one family whose `size` has no default at all
    // (§38): unset means the element states no step, so it belongs to the text around it. An
    // app-wide index reaching them would end that, silently — a badge in a caption would grow
    // to the app's rest while the caption did not.
    const inCaption = (theme: Record<string, string>) =>
      mounted(
        <Text size="1">
          n <Badge>3</Badge>
        </Text>,
        { theme, select: ".kui-badge" },
      );
    expect(computed(inCaption({ size: AWAY }), "font-size")).toBe(
      computed(inCaption({}), "font-size"),
    );
  });
});
