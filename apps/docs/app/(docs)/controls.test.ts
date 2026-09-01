/**
 * The controls laws (2026-08-30).
 *
 * What can go wrong here is specific: a knob that moves the specimen while the code below it
 * says something else. The transform is the only thing standing between the two, so these laws
 * read its OUTPUT rather than its intent — the source a reader would copy, character for
 * character, with the placeholders resolved.
 */
import { describe, expect, it } from "vitest";

import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";
import { Theme } from "@kookie-ui/react";

import { CONTROLLED } from "./controlled-examples";
import { controlsFor, inlineControls, sentinel, slotNode, slotStates } from "./controls";
import { Example, readExampleSource, rootsOwnPane } from "./example";

const SLUGS = Object.keys(CONTROLLED);

/**
 * The reader's version: every control resolved, with the given ones overridden.
 *
 * EVERY control, because the page resolves every control — the first spelling substituted only
 * what a law passed and then a law caught a leftover placeholder in the button page, which was
 * the fixture's fault and not the transform's. A helper that reproduces the page badly makes
 * its laws about the helper.
 */
const shown = (slug: string, values: Record<string, string | boolean>) => {
  const source = readExampleSource(slug);
  const controls = controlsFor(slug, source);
  const resolved: Record<string, string | boolean> = {
    ...Object.fromEntries(controls.map((c) => [c.name, c.initial])),
    ...values,
  };
  // The slot half is decided at transform time, as the page decides it (one variant per state).
  const slots = Object.fromEntries(
    controls.filter((c) => c.kind === "slot").map((c) => [c.name, resolved[c.name] === true]),
  );
  let out = inlineControls(source, controls, slots);
  for (const [name, value] of Object.entries(resolved)) out = out.replaceAll(sentinel(name), String(value));
  return out;
};

/** Every slot state of a page, as values — one page has one slot, so two; most have one, `{}`. */
const slotValues = (slug: string) => slotStates(controlsFor(slug, readExampleSource(slug)));

describe("every page that offers controls can drive one", () => {
  it("the two tables agree", () => {
    // `controls.ts` decides which slugs offer knobs and `controlled-examples.ts` holds the
    // components those knobs move. A slug in one and not the other renders a page whose
    // controls move nothing — or throws. Both directions, because either alone passes with the
    // other half missing.
    for (const slug of SLUGS) {
      expect(controlsFor(slug, readExampleSource(slug)).length, `${slug} is controllable but offers no knobs`).toBeGreaterThan(0);
    }
  });

  it("found controls to walk", () => {
    // Vacuity: the laws below are a loop over this set, and an empty set passes all of them.
    expect(SLUGS.length).toBeGreaterThan(2);
  });
});

describe("the shown source is the source", () => {
  it("states every control's value, and mentions no parameter", () => {
    for (const slug of SLUGS) {
      const source = readExampleSource(slug);
      const controls = controlsFor(slug, source);
      const out = shown(slug, Object.fromEntries(controls.map((c) => [c.name, c.initial])));

      // The signature is gone: a reader copies a component, not a component with the docs'
      // knobs wired into it.
      expect(out, `${slug} still takes parameters`).toContain("export default function Example()");

      for (const control of controls) {
        // The value is written IN. `size={size}` surviving would be an identifier referring to
        // a parameter that no longer exists — code that does not compile in the reader's editor.
        expect(out, `${slug}: ${control.name} still refers to a parameter`).not.toContain(
          `${control.name}={${control.name}}`,
        );
        const written =
          control.kind === "slot"
            ? `${control.name}={${slotNode(source, control.name)}}`
            : control.kind === "boolean"
              ? `${control.name}={${control.initial}}`
              : `${control.name}="${control.initial}"`;
        if (control.kind === "slot" && !control.initial) {
          expect(out, `${slug}: ${control.name} is off and still written`).not.toContain(`${control.name}=`);
        } else {
          expect(out, `${slug}: ${control.name} is not written into the source`).toContain(written);
        }
      }
    }
  });

  /* A CONTROL APPLIED TWICE IS RESOLVED TWICE (2026-08-31).
     
     `inlineControls` replaced the FIRST `name={name}` only, which silently made "a controlled
     prop is applied to exactly one element" a rule of the mechanism — unwritten, unreasoned, and
     invisible until a specimen swept a ladder. This is a VACUITY GUARD on the law above rather
     than a second assertion: "no shown source still refers to a parameter" already catches the
     leftover, but it only catches it on an input that has one, and for as long as every example
     applied every control once, that law was about the special case wearing the general one's
     name. */
  it("some page applies one control to more than one element", () => {
    const multi = SLUGS.flatMap((slug) => {
      const source = readExampleSource(slug);
      return controlsFor(slug, source)
        .filter((control) => control.kind !== "slot")
        .filter((control) => (source.match(new RegExp(`\\b${control.name}=\\{${control.name}\\}`, "g")) ?? []).length > 1)
        .map((control) => `${slug}.${control.name}`);
    });
    expect(multi.length, "no example applies a control twice; the leftover law is untested").toBeGreaterThan(0);
  });

  it("a slot off leaves no trace: no attribute, no blank line, no import", () => {
    // The half a value knob never has. A `<Badge>` switched off is a line removed and an import
    // orphaned, and both are things a reader's editor flags in the copied file. The import half
    // is the same law as "leaves no import nothing refers to", run on the state that can fail it.
    let walked = 0;
    for (const slug of SLUGS) {
      const source = readExampleSource(slug);
      for (const control of controlsFor(slug, source)) {
        if (control.kind !== "slot") continue;
        walked++;
        const on = shown(slug, { [control.name]: true });
        const off = shown(slug, { [control.name]: false });
        expect(on, `${slug}: ${control.name} on does not place its node`).toContain(`${control.name}={${slotNode(source, control.name)}}`);
        expect(off, `${slug}: ${control.name} off still names the slot`).not.toContain(`${control.name}=`);
        expect(off, `${slug}: ${control.name} off leaves a hole`).not.toMatch(/\n[ \t]*\n[ \t]*\/?>/);
        expect(on.split("\n").length - off.split("\n").length, `${slug}: ${control.name} off removes one line`).toBe(1);
        // The ternary sits alone on its line; "off" removes a LINE, so anything sharing it would go too.
        const line = source.split("\n").find((l) => l.includes(`${control.name}={${control.name} ?`));
        expect(line?.trim(), `${slug}: ${control.name}'s ternary shares its line`).toBe(
          `${control.name}={${control.name} ? ${slotNode(source, control.name)} : undefined}`,
        );
      }
    }
    // Vacuity: a page with a slot knob must exist, or the arm above is never reached.
    expect(walked).toBeGreaterThan(0);
  });

  it("leaves no import nothing refers to", () => {
    // Dropping the parameter list takes its type annotation with it. An orphaned `import type
    // { Size }` is the one line in the shown file a reader's editor would flag, and it is the
    // failure this transform is most likely to produce.
    for (const slug of SLUGS) for (const slots of slotValues(slug)) {
      const out = shown(slug, slots);
      const [head] = out.split("\n\n");
      for (const match of head!.matchAll(/\{([^}]*)\}/g)) {
        for (const part of match[1]!.split(",")) {
          const identifier = part.replace(/^\s*type\s+/, "").trim();
          if (!identifier) continue;
          const body = out.slice(out.indexOf("\n\n"));
          expect(new RegExp(`\\b${identifier}\\b`).test(body), `${slug}: imports ${identifier}, uses it nowhere`).toBe(true);
        }
      }
    }
  });

  it("a control's value actually reaches the code", () => {
    // The law that would fail if the swap were a no-op — which is what shipped for one run: the
    // specimen resized and the code kept showing the placeholder, because the grammar tokenizes
    // a string literal WITH its quotes and the swap was matching on equality.
    for (const slug of SLUGS) {
      const source = readExampleSource(slug);
      const controls = controlsFor(slug, source);
      const first = controls.find((c) => c.kind === "options");
      if (!first || first.kind !== "options") continue;
      const other = first.values.find((v) => v !== first.initial)!;
      const out = shown(slug, { [first.name]: other });
      expect(out, `${slug}: ${first.name} does not reach the source`).toContain(`${first.name}="${other}"`);
      expect(out, `${slug}: a placeholder survived`).not.toContain("__KD_");
    }
  });

  it("the example's own default is what the control starts at", () => {
    // Two homes for one value is the shape this repo keeps being bitten by. The file states the
    // default because it has to render without a page around it; the control reads it rather
    // than restating it, and this is what catches a restatement.
    for (const slug of SLUGS) {
      const source = readExampleSource(slug);
      for (const control of controlsFor(slug, source)) {
        const written = control.kind === "options" ? `"${control.initial}"` : String(control.initial);
        expect(source, `${slug}: ${control.name} does not start at the file's own default`).toContain(
          `${control.name} = ${written}`,
        );
      }
    }
  });
});

describe("a controllable page renders the same arrangement as a static one", () => {
  /**
   * THE PATH THE OTHER LAW CANNOT SEE (2026-08-30).
   *
   * `example-frame.test.tsx` walks every example through the STATIC frame and asserts no card
   * lands inside a card. That is a law about one of two render paths: a page with controls goes
   * through the playground instead, and for one commit the playground never asked the question
   * — so the Card page shipped a card inside a card, the exact fault the figure had just been
   * rebuilt to remove, under a green suite. A LAW ABOUT ONE PATH OF A TWO-PATH MECHANISM IS
   * HALF A LAW.
   *
   * IT RENDERS `Example` ITSELF, and the first spelling did not. That one rebuilt the
   * arrangement out of `rootsOwnPane` and a Card — which is a law about the predicate, not
   * about the wiring — and its own sabotage run proved it: putting the regression back
   * (`pane={true}` at the call site) left the suite green. The wiring is the subject, so the
   * subject has to be mounted.
   */
  const paneCount = (html: string) => (html.match(/class="[^"]*\bkui-card\b/g) ?? []).length;

  const rendered = async (name: string) =>
    renderToStaticMarkup(
      React.createElement(Theme, null, (await Example({ name })) as React.ReactElement),
    );

  it("an example that roots its own paper is not wrapped in more", async () => {
    for (const slug of Object.keys(CONTROLLED)) {
      const alone = paneCount(
        renderToStaticMarkup(
          React.createElement(Theme, null, React.createElement(CONTROLLED[slug]!)),
        ),
      );
      const onThePage = paneCount(await rendered(slug));

      // Counted against what the example renders BY ITSELF, which is the only reading that
      // catches the fault from both sides: a card example must gain no paper from the figure,
      // and an example the figure DOES wrap must have had none of its own to nest inside.
      const bare = rootsOwnPane(readExampleSource(slug));
      expect(onThePage, `${slug}: the page renders ${onThePage} cards, not ${bare ? alone : alone + 1}`).toBe(
        bare ? alone : alone + 1,
      );
      if (!bare) expect(alone, `${slug}: is wrapped in paper while rooting some of its own`).toBe(0);
    }
  });

  it("at least one controllable example roots its own paper", () => {
    // Vacuity: with none, the law above only ever exercises the wrapping arm and the branch that
    // actually broke is never reached.
    expect(Object.keys(CONTROLLED).some((slug) => rootsOwnPane(readExampleSource(slug)))).toBe(true);
  });
});
