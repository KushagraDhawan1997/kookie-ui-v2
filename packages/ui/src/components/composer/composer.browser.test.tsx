/**
 * Composer's laws, mounted (§30).
 *
 * The five load-bearing ones were named in the spec BEFORE any code existed, and each is a
 * shape this repo has already been bitten by. Every fixture here is built so that a working
 * mechanism and a missing one give DIFFERENT answers — the degenerate-fixture rule (LOG
 * 2026-08-20), which Notice broke twice in one day the week this was written.
 */
import type { CSSProperties, ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { computed, mounted, within } from "../../test/browser.tsx";
import { Box } from "../box/box.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { Text } from "../text/text.tsx";
import { TextArea } from "../text-area/text-area.tsx";
import { TextField } from "../text-field/text-field.tsx";
import {
  COMPOSER_STATUSES,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  type ComposerStatus,
} from "./composer.tsx";

describe("it is a form, and a surface (§30)", () => {
  it("the root is a <form> — which is what Enter and requestSubmit() need", () => {
    const el = mounted(
      <Composer>
        <ComposerInput aria-label="Message" />
      </Composer>,
      { theme: {} },
    );
    const composer = within(el, ".kui-composer");
    expect(composer.tagName).toBe("FORM");
  });

  it("it wears the surface identity, so the corner is a Card's at the same index", () => {
    const el = mounted(
      <Box>
        <Composer size="3">
          <ComposerInput aria-label="Message" />
        </Composer>
        <Card size="3">card</Card>
      </Box>,
      { theme: {} },
    );
    const composer = within(el, ".kui-composer");
    const card = within(el, ".kui-card");
    expect(composer.classList.contains("kui-surface")).toBe(true);
    // The claim is the BAND, not a literal: a pinned number agrees with a Card at exactly one
    // index and would pass for the wrong reason (the shell's own 2026-08-21 lesson).
    expect(computed(composer, "border-radius")).toBe(computed(card, "border-radius"));
  });
});

describe("the index reaches everything, and an explicit size still wins (§28, §30)", () => {
  /**
   * This block has been wrong twice and the second spelling is the interesting one.
   *
   * It shipped with four elements showing THREE behaviours — the pane moved, a TextField in the
   * row moved, a Button did not, the composer's own text did not — and nobody had chosen the
   * third. That was closed by making the index stop at the row, on Dialog's ownership argument
   * (§24 against §25), and the laws below were written to hold it there.
   *
   * REVERSED 2026-08-23 (Kushagra, off the preview page: "everything scales, explicit sizes
   * still win"). Read as a ladder, that answer did not hold: across four indexes the padding
   * moved four times, the text moved ONCE (`OWNED_BODY_STEP` is 14/14/16/16), and no control
   * moved at all — so three of the four steps did nothing but pad the box. A composer is a unit
   * you size as one thing, which is what `ControlSizeContext` is for; it now supplies it, Button
   * reads it, and a stated `size` beats both.
   */
  const at = (size: "1" | "2" | "3" | "4") =>
    mounted(
      <Composer size={size}>
        <ComposerInput aria-label="Message" />
        <ComposerRow>
          <Button>Model</Button>
          <TextField aria-label="Search" />
        </ComposerRow>
      </Composer>,
      { theme: {} },
    );

  it("the air inside equals the air at the edge, at every index", () => {
    // The gap shipped at half the inset (2026-08-23) and read as no gap. The claim is the
    // EQUALITY rather than a number, so it holds at every index instead of being a literal
    // that agrees at one of them — the shell's own lesson about pinned values.
    for (const size of ["1", "4"] as const) {
      const composer = within(at(size), ".kui-composer");
      expect(computed(composer, "row-gap")).toBe(computed(composer, "padding-top"));
    }
    // Vacuity guard: the two indexes must actually differ, or the equality above could hold
    // because nothing moves.
    expect(computed(within(at("1"), ".kui-composer"), "row-gap")).not.toBe(
      computed(within(at("4"), ".kui-composer"), "row-gap"),
    );
  });

  it("its own text moves at EVERY index — four sizes, four steps", () => {
    // It rode `OWNED_BODY_STEP` until 2026-08-23, which is 14/14/16/16: sizes 1 and 2 identical,
    // 3 and 4 identical, so the index moved the text exactly once across four steps. Reading two
    // indexes could not see that — 1 against 4 differ under BOTH ladders — so this walks all
    // four and asserts every step is its own, which is the claim the old law could not make.
    const steps = (["1", "2", "3", "4"] as const).map((size) =>
      parseFloat(computed(within(at(size), ".kui-composer-input"), "font-size")),
    );
    expect(new Set(steps).size, `the ladder repeats a step: ${steps.join("/")}`).toBe(4);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]!, `step ${i + 1} is not above step ${i}`).toBeGreaterThan(steps[i - 1]!);
    }
  });

  it("the box is the same number of LINES at every index, not the same height", () => {
    // The ceiling is stated in `lh`, so it tracks whatever step the index resolved. A length
    // pinned to one step would make a size-4 composer shallower in lines than a size-1 one.
    for (const size of ["1", "4"] as const) {
      const input = within(at(size), ".kui-composer-input");
      const line = parseFloat(computed(input, "line-height"));
      expect(parseFloat(computed(input, "max-block-size")) / line).toBeCloseTo(8, 1);
    }
  });

  it("the row moves with it — a Button and a field alike, in step", () => {
    // BOTH are read, and that is the half the first spelling got right: a field that tracked
    // the composer while the Button beside it did not is the original defect, so a law that
    // reads one of them cannot tell "the row follows" from "half the row follows".
    for (const selector of ["button", ".kui-field"]) {
      const small = within(at("1"), selector);
      const large = within(at("4"), selector);
      expect(small.getAttribute("data-size"), `${selector} ignores the composer's index`).toBe("1");
      expect(large.getAttribute("data-size"), `${selector} ignores the composer's index`).toBe("4");
    }
  });

  it("and a control that states its own size keeps it, at every index", () => {
    // The second bound of the mechanism (§28), and the reason widening Button to read a context
    // is safe at all. Without this the change is not "the row follows the box", it is "the box
    // overrules you" — which is what makes silent inheritance this project's most-repeated
    // defect. Read at BOTH extremes: a pinned control that happened to match at one index would
    // pass a single-index check by coincidence.
    const pinned = (size: "1" | "4") =>
      within(
        mounted(
          <Composer size={size}>
            <ComposerInput aria-label="Message" />
            <ComposerRow>
              <Button size="2">Model</Button>
            </ComposerRow>
          </Composer>,
          { theme: {} },
        ),
        "button",
      );
    expect(pinned("1").getAttribute("data-size")).toBe("2");
    expect(pinned("4").getAttribute("data-size")).toBe("2");
  });

  it("the composer does not reach past itself — a Button outside is untouched", () => {
    // The reach is one wrapper deep and visible in the markup (§28's first bound). React context
    // gives this by construction, so the law exists to catch a future spelling that does not —
    // a document-level provider, a portal that re-supplies, a Theme that starts carrying it.
    const page = mounted(
      <div>
        <Composer size="4">
          <ComposerInput aria-label="Message" />
          <ComposerRow><Button>Inside</Button></ComposerRow>
        </Composer>
        <Button>Outside</Button>
      </div>,
      { theme: {} },
    );
    const buttons = page.querySelectorAll("button");
    const outside = buttons[buttons.length - 1]!;
    expect(outside.textContent).toBe("Outside");
    expect(outside.getAttribute("data-size"), "the composer's index escaped its own subtree").toBe("2");
  });
});

describe("the ring watches the input, never the pane (§30)", () => {
  /**
   * THE fixture decision: the composer holds a REAL Button. Without one, "the pane does not
   * ring when a child has focus" is a claim about a pane with no children to focus, and a
   * plain `:focus-within` would satisfy it. This is TextField's 2026-08-05 repair — a hosted
   * control lit two rings — restated one layer up.
   */
  const fixture = (
    <Composer>
      <ComposerInput aria-label="Message" />
      <ComposerRow>
        <Button iconOnly aria-label="Attach">
          +
        </Button>
        <ComposerSend />
      </ComposerRow>
    </Composer>
  );

  it("the caret in the text lights the pane", () => {
    const el = mounted(fixture, { theme: {} });
    const composer = within(el, ".kui-composer");
    const input = within(el, ".kui-composer-input");
    expect(computed(composer, "outline-style")).toBe("none");
    (input as HTMLTextAreaElement).focus();
    expect(computed(composer, "outline-style")).toBe("solid");
    expect(parseFloat(computed(composer, "outline-width"))).toBeGreaterThan(0);
  });

  it("a button INSIDE the composer does not light the pane", () => {
    const el = mounted(fixture, { theme: {} });
    const composer = within(el, ".kui-composer");
    const attach = within(el, 'button[aria-label="Attach"]');
    attach.focus();
    // The button really does have focus — without this the law passes because nothing was
    // focused at all, which is the vacuity the Select round caught three times.
    expect(document.activeElement).toBe(attach);
    expect(computed(composer, "outline-style")).toBe("none");
  });
});

describe("the text grows without JavaScript (§30)", () => {
  /** A composer holding `lines` lines of text, and the box that holds them. */
  const box = (lines: number, style?: CSSProperties) =>
    within(
      mounted(
        <Composer>
          <ComposerInput
            aria-label="Message"
            defaultValue={Array.from({ length: lines }, (_, i) => `line ${i + 1}`).join("\n")}
            {...(style ? { style } : {})}
          />
        </Composer>,
        { theme: {} },
      ),
      ".kui-composer-input",
    );

  it("four lines of text make a box three line boxes taller — MEASURED, not declared", () => {
    // This law used to read `expect(["content", "fixed", ""]).toContain(...)`, which is the
    // property's entire value space: `fixed` is what you get with the declaration deleted and
    // `""` is what an engine without the property returns, so §30's headline mechanism could
    // be removed with every composer law green (audit 2026-08-26). The growth is a LENGTH, so
    // the law is a length.
    const one = box(1);
    const four = box(4);
    const line = parseFloat(computed(one, "line-height"));
    const grew = four.getBoundingClientRect().height - one.getBoundingClientRect().height;
    expect(grew / line, `four lines grew ${grew}px against a ${line}px line box`).toBeCloseTo(
      3,
      0,
    );
  });

  it("and with `field-sizing` off the SAME content does not grow — the negative control", () => {
    // The other half, and the reason the law above can be trusted: a box that grew for some
    // other reason (a bare textarea's own `rows` heuristics, a flex stretch) would satisfy it.
    // `fixed` is the property's initial value, so this is the shipped component with the one
    // declaration under test switched off, in the same tree, at the same content.
    const off = { ["fieldSizing" as string]: "fixed" } as CSSProperties;
    const one = box(1, off);
    const four = box(4, off);
    expect(four.getBoundingClientRect().height).toBeCloseTo(
      one.getBoundingClientRect().height,
      0,
    );
  });

  it("the ceiling holds on both growth paths", () => {
    const el = mounted(
      <Composer>
        <ComposerInput aria-label="Message" />
      </Composer>,
      { theme: {} },
    );
    const input = within(el, ".kui-composer-input");
    const ceiling = parseFloat(computed(input, "max-block-size"));
    const floor = parseFloat(computed(input, "min-block-size"));
    expect(ceiling).toBeGreaterThan(floor);
    // `overflow-y` is deliberately NOT asserted: the HTML rendering spec gives a <textarea>
    // `overflow: auto`, so the check passes whether the stylesheet says anything or not — the
    // sabotage pass proved it by deleting the declaration and seeing 15 of 15 still green.
    // The ceiling above is the real guarantee and it fails when broken.
    //
    // `resize` IS the stylesheet's: the UA default is `both`, so this one can fail.
    expect(computed(input, "resize")).toBe("none");
  });

  it("a long value stops at the ceiling instead of running down the page", () => {
    const el = mounted(
      <Composer>
        <ComposerInput aria-label="Message" defaultValue={"line\n".repeat(60)} />
      </Composer>,
      { theme: {} },
    );
    const input = within(el, ".kui-composer-input") as HTMLTextAreaElement;
    const ceiling = parseFloat(computed(input, "max-block-size"));
    expect(input.getBoundingClientRect().height).toBeLessThanOrEqual(ceiling + 1);
    // The pane clips (2026-08-20), so the SCROLL has to live on the text or the overflow is
    // simply unreachable — the shape that made a select slide its own contents.
    expect(input.scrollHeight).toBeGreaterThan(input.clientHeight);
  });
});

describe("the send button says what it will do (§30)", () => {
  /**
   * What each of the four states owes, WRITTEN OUT rather than read back off `DEFAULT_LABELS`
   * — a law that compared the component against its own constant would agree with any value
   * at all, including the empty string.
   */
  const EXPECTED: Record<ComposerStatus, { label: string; type: string; busy: boolean }> = {
    ready: { label: "Send", type: "submit", busy: false },
    submitted: { label: "Sending", type: "submit", busy: true },
    streaming: { label: "Stop", type: "button", busy: false },
    error: { label: "Retry", type: "submit", busy: false },
  };

  it("the walk covers the axis — every status, not the three somebody typed out", () => {
    // The loop used to be a hand-written tuple of three, and `submitted` was the one it left
    // out (audit 2026-08-26): its label and its `loading` branch were read by no law, so both
    // could be deleted with the suite green. Derived from the axis's one home, so widening the
    // status fails here first (CLAUDE.md 2026-08-16, "axis value lists have one home each").
    expect(Object.keys(EXPECTED).sort()).toEqual([...COMPOSER_STATUSES].sort());
  });

  for (const status of COMPOSER_STATUSES) {
    it(`${status}: its own accessible name, its own element, its own busy state`, () => {
      const { label, type, busy } = EXPECTED[status];
      const el = mounted(
        <Composer>
          <ComposerInput aria-label="Message" />
          <ComposerSend status={status} />
        </Composer>,
        { theme: {} },
      );
      const send = within(el, ".kui-composer-send") as HTMLButtonElement;
      expect(send.getAttribute("aria-label")).toBe(label);
      // Stopping a generation is an action on the request; submitting it again is not what a
      // person means. v1's sendMode decides VISIBILITY and never this.
      expect(send.type).toBe(type);
      // `submitted` is the one genuinely busy state, and `loading` is what says so: it puts a
      // Spinner in the leading slot, stamps `aria-busy` and sends Base UI down the
      // aria-disabled branch, so the control keeps its place in the tab order and stops
      // activating. Nothing read that branch before.
      expect(send.getAttribute("aria-busy")).toBe(busy ? "true" : null);
      expect(send.getAttribute("aria-disabled")).toBe(busy ? "true" : null);
    });
  }

  it("a submitted send does not send again when it is pressed", () => {
    // The busy state has to be busy, not merely dressed as busy.
    let submitted = 0;
    const el = mounted(
      <Composer onSubmit={() => (submitted += 1)}>
        <ComposerInput aria-label="Message" />
        <ComposerSend status="submitted" />
      </Composer>,
      { theme: {} },
    );
    (within(el, ".kui-composer-send") as HTMLButtonElement).click();
    expect(submitted).toBe(0);
  });

  it("streaming calls onStop and does not submit", () => {
    let stopped = 0;
    let submitted = 0;
    const el = mounted(
      <Composer onSubmit={() => (submitted += 1)}>
        <ComposerInput aria-label="Message" />
        <ComposerSend status="streaming" onStop={() => (stopped += 1)} />
      </Composer>,
      { theme: {} },
    );
    (within(el, ".kui-composer-send") as HTMLButtonElement).click();
    expect(stopped).toBe(1);
    expect(submitted).toBe(0);
  });
});

describe("Enter sends, and never interrupts a composition (§30)", () => {
  const press = (input: HTMLTextAreaElement, init: KeyboardEventInit) => {
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, ...init }));
  };

  it("a plain Enter submits", () => {
    let submitted = 0;
    const el = mounted(
      <Composer onSubmit={() => (submitted += 1)}>
        <ComposerInput aria-label="Message" defaultValue="hello" />
      </Composer>,
      { theme: {} },
    );
    press(within(el, ".kui-composer-input") as HTMLTextAreaElement, {});
    expect(submitted).toBe(1);
  });

  it("Shift+Enter does not", () => {
    let submitted = 0;
    const el = mounted(
      <Composer onSubmit={() => (submitted += 1)}>
        <ComposerInput aria-label="Message" defaultValue="hello" />
      </Composer>,
      { theme: {} },
    );
    press(within(el, ".kui-composer-input") as HTMLTextAreaElement, { shiftKey: true });
    expect(submitted).toBe(0);
  });

  /**
   * §30's claim is that the key and the button take ONE route. They did not: the button
   * refused correctly while a request ran, and `form.requestSubmit()` with no submitter
   * ignores the submit button entirely, so Enter sent a second message while the control in
   * front of the person read "Stop" (audit 2026-08-26).
   *
   * Every status is walked, from the axis's own home, because the two that must refuse and
   * the two that must send are the whole claim — a law over one of them cannot tell "a busy
   * composer refuses" from "the composer stopped sending".
   */
  for (const status of COMPOSER_STATUSES) {
    const sends = status === "ready" || status === "error";
    it(`Enter ${sends ? "sends" : "does NOT send"} while the request is ${status}`, () => {
      let submitted = 0;
      const el = mounted(
        <Composer onSubmit={() => (submitted += 1)}>
          <ComposerInput aria-label="Message" defaultValue="hello" />
          <ComposerRow>
            <ComposerSend status={status} />
          </ComposerRow>
        </Composer>,
        { theme: {} },
      );
      press(within(el, ".kui-composer-input") as HTMLTextAreaElement, {});
      expect(submitted, `status=${status}`).toBe(sends ? 1 : 0);
    });
  }

  it("a composer with no send button still sends — the guard is a refusal, not a gate", () => {
    // The bound. Reading the send button's state means a composer that places none must not
    // be silently un-sendable, and that is the shape a guard written the other way round
    // (default to busy, opt out) would ship.
    let submitted = 0;
    const el = mounted(
      <Composer onSubmit={() => (submitted += 1)}>
        <ComposerInput aria-label="Message" defaultValue="hello" />
      </Composer>,
      { theme: {} },
    );
    press(within(el, ".kui-composer-input") as HTMLTextAreaElement, {});
    expect(submitted).toBe(1);
  });

  it("an Enter that closes an IME composition does not send", () => {
    // Sending mid-composition is silent data loss for anyone typing Japanese, Chinese or
    // Korean: the word being chosen is committed as a message. Both references guard it.
    let submitted = 0;
    const el = mounted(
      <Composer onSubmit={() => (submitted += 1)}>
        <ComposerInput aria-label="Message" defaultValue="に" />
      </Composer>,
      { theme: {} },
    );
    press(within(el, ".kui-composer-input") as HTMLTextAreaElement, { isComposing: true });
    expect(submitted).toBe(0);
  });
});

describe("a phone never zooms the page to read the text (§4, §30)", () => {
  /**
   * Safari zooms the viewport when a focused control's text is under 16px and does not zoom
   * back out — the defect §4 closed 2026-08-05 for every other text input in the library. The
   * composer shipped without the floor because it could not borrow the spelling: its step
   * arrives from the type ramp rather than from `--kui-ct-font` (audit 2026-08-26).
   *
   * The claim is stated against a MOUNTED TextArea rather than against 16, because "the
   * library's answer for a text box at this cell" is the thing under test and a literal would
   * agree with a floor somebody invented here.
   */
  const step = (pointer: "fine" | "coarse") => {
    const composer = computed(
      within(
        mounted(
          <Composer size="1">
            <ComposerInput aria-label="Message" />
          </Composer>,
          { theme: { pointer } },
        ),
        ".kui-composer-input",
      ),
      "font-size",
    );
    const area = computed(
      mounted(<TextArea aria-label="t" size="1" />, { theme: { pointer }, select: "textarea" }),
      "font-size",
    );
    const ramp = computed(
      mounted(<Text size="1">ramp</Text>, { theme: { pointer }, select: ".kui-text" }),
      "font-size",
    );
    return { composer, area, ramp };
  };

  it("on a coarse pointer the text is floored, exactly as every other input is", () => {
    const { composer, area, ramp } = step("coarse");
    // The vacuity guard, and it is the whole law: at size 1 the coarse ramp is 14px, so a
    // composer that simply took its step would equal `ramp` here and read as fine until an
    // iPhone found it. The floor is what makes the two differ.
    expect(parseFloat(composer), `the coarse step is not floored (ramp ${ramp})`).toBeGreaterThan(
      parseFloat(ramp),
    );
    expect(composer, "a composer floors its text to a number of its own").toBe(area);
  });

  it("on a fine pointer the floor is inert — a desktop keeps its designed step", () => {
    // The other half. A floor that raised a desktop's size-1 composer to 16px would be a
    // second type ladder, and this is the law that would say so.
    const { composer, area, ramp } = step("fine");
    expect(composer).toBe(ramp);
    expect(composer).toBe(area);
  });
});

describe("glass stops at the pane (§10, §30)", () => {
  /**
   * THE fixture decision, and Notice got this exact one wrong twice. A button with no
   * `backdrop` and no region around it resolves solid whether the scope exists or not, so the
   * law would pass with the scope deleted. Both buttons here sit inside a marked region and
   * BOTH ask for the backdrop — the only difference is that one of them is inside the
   * composer. That is the one thing the law is about.
   */
  it("a control inside a glass composer is solid; the same control beside it is not", () => {
    const el = mounted(
      <Box backdrop>
        <Composer backdrop>
          <ComposerInput aria-label="Message" />
          <ComposerRow>
            <Button backdrop>Inside</Button>
          </ComposerRow>
        </Composer>
        <Button backdrop>Beside</Button>
      </Box>,
      { theme: { material: "regular" } },
    );
    const inside = within(within(el, ".kui-composer"), "button");
    const beside = Array.from(el.querySelectorAll("button")).find((b) => b !== inside)!;
    const composer = within(el, ".kui-composer");

    // The pane is the glass.
    expect(composer.getAttribute("data-material")).toBe("regular");
    // Its subtree is not — one glass per stack, structurally rather than by call-site care.
    expect(inside.getAttribute("data-material")).not.toBe("regular");
    // And the vacuity guard: an identical button outside the pane DOES take the material, so
    // the fixture can tell a working scope from a deleted one.
    expect(beside.getAttribute("data-material")).toBe("regular");
  });
});

describe("the row states the rhythm, not the grouping (§30)", () => {
  it("it centres, splits and spaces without a caller writing any of it", () => {
    const el = mounted(
      <Composer>
        <ComposerInput aria-label="Message" />
        <ComposerRow>
          <Button>Left</Button>
          <ComposerSend />
        </ComposerRow>
      </Composer>,
      { theme: {} },
    );
    const row = within(el, ".kui-composer-row");
    expect(computed(row, "display")).toBe("flex");
    expect(computed(row, "align-items")).toBe("center");
    expect(computed(row, "justify-content")).toBe("space-between");
    expect(parseFloat(computed(row, "column-gap"))).toBeGreaterThan(0);
  });
});

describe("files arrive by the two routes that land on our own elements (§30)", () => {
  it("a paste of files reaches onFiles and never writes a filename into the text", () => {
    const seen: File[][] = [];
    const el = mounted(
      <Composer onFiles={(f) => seen.push(f)}>
        <ComposerInput aria-label="Message" />
      </Composer>,
      { theme: {} },
    );
    const input = within(el, ".kui-composer-input") as HTMLTextAreaElement;
    const data = new DataTransfer();
    data.items.add(new File(["x"], "shot.png", { type: "image/png" }));
    const event = new ClipboardEvent("paste", {
      clipboardData: data,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    expect(seen).toHaveLength(1);
    expect(seen[0]![0]!.name).toBe("shot.png");
    // Prevented, or the browser also pastes the file's name as text.
    expect(event.defaultPrevented).toBe(true);
  });

  it("a paste with no files is left completely alone", () => {
    // The guard's other side: preventing every paste would break typing's most-used gesture.
    const seen: File[][] = [];
    const el = mounted(
      <Composer onFiles={(f) => seen.push(f)}>
        <ComposerInput aria-label="Message" />
      </Composer>,
      { theme: {} },
    );
    const input = within(el, ".kui-composer-input") as HTMLTextAreaElement;
    const data = new DataTransfer();
    data.setData("text/plain", "hello");
    const event = new ClipboardEvent("paste", {
      clipboardData: data,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    expect(seen).toHaveLength(0);
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("the send button is the composer's one loud thing (§11, §30)", () => {
  /** A send button as the component places it, plus two Buttons to rank it against. */
  const fillOf = (ui: ReactElement) =>
    computed(mounted(ui, { theme: {} }), "background-color");

  const sendFill = () =>
    computed(
      within(
        mounted(
          <Composer>
            <ComposerInput aria-label="Message" />
            <ComposerRow>
              <ComposerSend />
            </ComposerRow>
          </Composer>,
          { theme: {} },
        ),
        ".kui-composer-send",
      ),
      "background-color",
    );

  it("it rests at the loud rung, not the default one", () => {
    // The FIXTURE is the point (2026-08-21): comparing the send button against itself, or
    // against another ComposerSend, cannot tell a default of `loud` from a default of
    // `medium`. Both neighbours are mounted, so the law names which rung it landed on.
    expect(sendFill(), "a send button that ranks no higher than the model picker beside it")
      .toBe(fillOf(<Button emphasis="loud">Send</Button>));
  });

  it("and the two rungs it is ranked against are actually different", () => {
    // Vacuity: if loud and medium painted the same fill, the law above would hold under any
    // default at all. It is the one arrangement in which this cannot be checked by itself.
    expect(fillOf(<Button emphasis="loud">Send</Button>)).not.toBe(
      fillOf(<Button emphasis="medium">Send</Button>),
    );
  });

  it("the caller can still stand it down", () => {
    // A default, not an identity. AlertDialogAction pins its Buttons because the component
    // owns that whole layout; a composer's row is the caller's, so the one control the system
    // does place there stays theirs to re-rank.
    const quiet = computed(
      within(
        mounted(
          <Composer>
            <ComposerInput aria-label="Message" />
            <ComposerRow>
              <ComposerSend emphasis="quiet" />
            </ComposerRow>
          </Composer>,
          { theme: {} },
        ),
        ".kui-composer-send",
      ),
      "background-color",
    );
    expect(quiet).not.toBe(sendFill());
  });
});

describe("a dead composer greys its words (§10, §30)", () => {
  const text = (props: { disabled?: boolean; value?: string } = {}) =>
    within(
      mounted(
        <Composer>
          <ComposerInput
            aria-label="Message"
            placeholder="Reply…"
            defaultValue={props.value ?? "Words"}
            {...(props.disabled ? { disabled: true } : {})}
          />
        </Composer>,
        { theme: {} },
      ),
      ".kui-composer-input",
    );

  it("the value dims, and it dims to the same ink a disabled TextArea uses", () => {
    // The FIXTURE is the load-bearing half. Comparing a dead composer against itself proves
    // nothing, and comparing it against "some lighter colour" would pass on any value at all —
    // so the reference is the control the system already answers this question for. A composer
    // that dimmed to its own invented grey would be a second answer to one question.
    const live = computed(text(), "color");
    const dead = computed(text({ disabled: true }), "color");
    expect(dead, "a disabled composer paints its words exactly as a live one does").not.toBe(live);

    const areaLive = computed(mounted(<TextArea aria-label="t" defaultValue="Words" />, { theme: {}, select: "textarea" }), "color");
    const areaDead = computed(mounted(<TextArea aria-label="t" defaultValue="Words" disabled />, { theme: {}, select: "textarea" }), "color");
    expect(areaDead, "the reference control does not dim either — this law is measuring nothing").not.toBe(areaLive);
    expect(dead, "a composer invents its own dead ink instead of the system's").toBe(areaDead);
  });

  it("the placeholder dims with it — an empty dead composer is still dead", () => {
    // Read through the pseudo-element, which is the only place this colour exists.
    const ph = (disabled: boolean) =>
      getComputedStyle(text({ disabled, value: "" }), "::placeholder").color;
    expect(ph(true), "the placeholder still reads at live weight on a dead pane").not.toBe(ph(false));
  });

  it("the pane itself does NOT dim, which is TextArea's answer and not an oversight", () => {
    // The negative half, and it is a decision rather than a leftover: a disabled TextArea's
    // background is byte-identical to a live one, so the library's rule for a text box that is
    // off is grey the words and leave the box. Without this, a later change could quietly dim
    // the pane and no law would object.
    const pane = (disabled: boolean) =>
      mounted(
        <Composer>
          <ComposerInput aria-label="Message" defaultValue="Words" {...(disabled ? { disabled: true } : {})} />
        </Composer>,
        { theme: {} },
      );
    expect(computed(pane(true), "background-color")).toBe(computed(pane(false), "background-color"));
  });
});
