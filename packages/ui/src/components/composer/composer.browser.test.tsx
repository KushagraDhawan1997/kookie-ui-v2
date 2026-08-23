/**
 * Composer's laws, mounted (§30).
 *
 * The five load-bearing ones were named in the spec BEFORE any code existed, and each is a
 * shape this repo has already been bitten by. Every fixture here is built so that a working
 * mechanism and a missing one give DIFFERENT answers — the degenerate-fixture rule (LOG
 * 2026-08-20), which Notice broke twice in one day the week this was written.
 */
import { describe, expect, it } from "vitest";

import { computed, mounted, within } from "../../test/browser.tsx";
import { Box } from "../box/box.tsx";
import { Button } from "../button/button.tsx";
import { Card } from "../card/card.tsx";
import { TextField } from "../text-field/text-field.tsx";
import { Composer, ComposerInput, ComposerRow, ComposerSend } from "./composer.tsx";

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

describe("the index prices what the composer OWNS, and stops (§30)", () => {
  /**
   * Both halves shipped WRONG on 2026-08-23 and neither had a law, which is why both are here.
   * The pane's padding moved with the index, a TextField dropped in the row moved with it, a
   * Button did not, and the composer's own text did not — four elements, three behaviours,
   * and nobody chose the third. The rule is ownership (§24 against §25): a composer owns its
   * pane and its text, and whatever you compose into the row is yours.
   */
  const at = (size: "1" | "4") =>
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

  it("its own text moves with the index", () => {
    // The step map is shared with the alert and the notice, so this also pins that a composer
    // and a notice at one index are one typography.
    const small = within(at("1"), ".kui-composer-input");
    const large = within(at("4"), ".kui-composer-input");
    expect(parseFloat(computed(large, "font-size"))).toBeGreaterThan(
      parseFloat(computed(small, "font-size")),
    );
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

  it("nothing you put in the row moves with it — a Button and a field alike", () => {
    // The consistency is the claim. A field that tracked the composer while the Button beside
    // it did not is the defect this replaces, so BOTH are read: one of them silently opting
    // into the pane's index is what the law is for.
    for (const selector of ["button", ".kui-field"]) {
      const small = within(at("1"), selector);
      const large = within(at("4"), selector);
      expect(small.getAttribute("data-size")).toBe(large.getAttribute("data-size"));
    }
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
  it("it declares field-sizing, and the ceiling holds either way", () => {
    const el = mounted(
      <Composer>
        <ComposerInput aria-label="Message" />
      </Composer>,
      { theme: {} },
    );
    const input = within(el, ".kui-composer-input");
    // Where the engine has it this IS the growth. Where it does not, the declaration is inert
    // and `rows` opens the box — so the ceiling below is what bounds both paths, and it is
    // asserted separately for that reason.
    expect(["content", "fixed", ""]).toContain(computed(input, "field-sizing"));
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
  it("each status carries its own accessible name, and streaming is not a submit", () => {
    for (const [status, label, type] of [
      ["ready", "Send", "submit"],
      ["streaming", "Stop", "button"],
      ["error", "Retry", "submit"],
    ] as const) {
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
    }
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
