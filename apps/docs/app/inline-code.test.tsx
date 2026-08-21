/**
 * Reference prose reaches the reader with its code spans rendered (2026-08-21).
 *
 * The registry and the generated props table are plain data, and the page rendered their
 * strings directly, so a backtick around a prop name arrived on screen as a backtick. Every
 * author writes them, because writing `size` unmarked in a sentence about `size` is worse.
 *
 * Two halves, because the defect has two halves. The first reads the RENDERED markup: a code
 * span becomes a `<code>` and no backtick survives. The second reads the page's SOURCE, and it
 * has to: the staleness this guards against lives at a call site, where a new prose field is
 * added and rendered bare, and no amount of testing the function catches that.
 */
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { Theme } from "@kookie-ui/react";

import { InlineCode } from "./inline-code";
import { API } from "./(docs)/components/api.generated";
import { ENTRIES } from "./(docs)/components/registry";
import { RULES } from "./builder/review";

const render = (text: string) =>
  renderToStaticMarkup(React.createElement(Theme, null, React.createElement(InlineCode, { text })));

describe("code spans in reference prose", () => {
  it("a backticked span becomes a code element, and the backticks do not survive", () => {
    const html = render("Use `size` on the root.");
    expect(html).toContain("kui-code");
    expect(html).toContain(">size<");
    expect(html).not.toContain("`");
  });

  it("prose with no span is left exactly as it was", () => {
    const html = render("A component never sets outer spacing.");
    expect(html).toContain("A component never sets outer spacing.");
    expect(html).not.toContain("kui-code");
  });

  it("several spans in one sentence all render", () => {
    const html = render("`tone` says the meaning and `emphasis` says the loudness.");
    expect(html).toContain(">tone<");
    expect(html).toContain(">emphasis<");
    expect(html).not.toContain("`");
  });

  // An odd count is a typo, and a typo must not swallow the sentence after it. The failure this
  // guards is the tempting spelling: split, wrap every odd index, and the tail silently becomes
  // code running to the end of the paragraph.
  //
  // The fixture carries a CLOSED span before the stray one, and that is the law rather than a
  // detail. Written with the stray backtick alone the string splits into two parts, which the
  // component short-circuits before any wrapping decision is reached — so the naive spelling
  // passed it, and the law was about the short-circuit rather than about the rule. Caught by
  // this file's own sabotage pass.
  it("an unterminated backtick stays text, and so does the rest of the sentence after it", () => {
    const html = render("Set `size` on the root and the `corner follows.");
    expect(html).toContain(">size<");
    expect(html).toContain("`corner follows.");
    expect(html.match(/kui-code/g)).toHaveLength(1);
  });

  // Both sources, because the defect was reported against the generated table and the registry
  // is where the next one will be. A floor on the table alone would go green on the day the
  // registry started writing spans and the page stopped rendering them.
  it("both prose sources really do contain spans, so the laws above are not about a case that never occurs", () => {
    const generated = Object.values(API).flatMap((entry) => entry.props.map((prop) => prop.doc));
    expect(generated.filter((doc) => doc.includes("`")).length).toBeGreaterThan(50);

    const written = ENTRIES.flatMap((entry) => [
      entry.blurb,
      ...entry.axes.map((axis) => axis.note),
      ...entry.refusals.map((refusal) => refusal.why),
      ...(entry.parts ?? []).map((part) => part.blurb),
    ]);
    expect(written.filter((text) => text.includes("`")).length).toBeGreaterThan(0);
  });

  // The call site is where this rots. A new prose field rendered bare type-checks, reads fine in
  // review, and ships literal backticks. That is how the defect arrived, and how it arrived a
  // second time: main made a refusal and a review finding into prose in the builder, and the
  // two new surfaces rendered the same strings bare.
  it("every surface that renders system prose renders it through InlineCode", () => {
    // `within` narrows the bare-render scan to one renderer. The inspector needs it and the
    // need is the point: its Refusal takes props called `name` and `why`, and `{name}` appears
    // ten times elsewhere in that file for a property row's own label. A file-wide scan called
    // all ten a defect, which is a law failing on correct code.
    const surfaces: { file: string; fields: string[]; within?: string }[] = [
      {
        file: "(docs)/components/[slug]/page.tsx",
        fields: ["entry.blurb", "axis.note", "part.blurb", "refusal.why", "propDescription(prop)"],
      },
      { file: "(docs)/review-rules.tsx", fields: ["rule.title", "rule.why"] },
      { file: "builder/inspector.tsx", fields: ["name", "why"], within: "function Refusal(" },
      { file: "builder/review-panel.tsx", fields: ["finding.title", "finding.why"] },
    ];
    for (const { file, fields, within } of surfaces) {
      const whole = readFileSync(join(__dirname, file), "utf8");
      const from = within ? whole.indexOf(within) : 0;
      expect(from, `${file}: ${within} is gone`).toBeGreaterThanOrEqual(0);
      const source = within ? whole.slice(from, whole.indexOf("\n}", from) + 2) : whole;
      // Strip the wrappers first. `text={entry.blurb}` contains `{entry.blurb}`, so a naive scan
      // for a bare render matches the correct code — the first spelling of this law failed on
      // the very file it was written to bless.
      const bare = source.replaceAll(/<InlineCode text=\{[^}]*\}[^/]*\/>/g, "");
      for (const field of fields) {
        expect(source, `${file}: ${field} is rendered without InlineCode`).toContain(
          `<InlineCode text={${field}} />`,
        );
        expect(bare, `${file}: ${field} is also rendered bare somewhere`).not.toMatch(
          new RegExp(`\\{\\s*${field.replace(/[.()]/g, "\\$&")}\\s*\\}`),
        );
      }
    }
  });

  // Both bodies the builder renders really do carry spans, so the surfaces above are not being
  // guarded against a case that never occurs there.
  it("the reviewer's own sentences carry spans too", () => {
    const withSpans = RULES.filter((rule) => rule.why.includes("`") || rule.title.includes("`"));
    expect(withSpans.length).toBeGreaterThan(0);
  });
});
