/**
 * The blocks laws (2026-08-26).
 *
 * A block is copied source, which changes what can go wrong: broken source gets PASTED into
 * someone's app before anyone notices, and a registry entry that says nothing satisfies a
 * coverage law for free. So the laws here are the registry's shape, both directions of the
 * file walk, a real render of every demo, and the two facts the whole arrangement stands on —
 * that the stub is still a stub, and that the block still consumes it.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as Kookie from "@kookie-ui/react";

import { Specimen, SpecimenView } from "../../../blocks/specimen";

import { BLOCK_BY_SLUG, BLOCKS } from "../../../blocks";
import { CODE_BOUND_SLACK, CODE_MAX_LINES, CodeSample } from "../../../blocks/code-sample";
import {
  isLang,
  leadingColumns,
  parseMeta,
  plainText,
  tokenize,
} from "../../../blocks/highlight";

const here = dirname(fileURLToPath(import.meta.url));
const blocksDir = join(here, "..", "..", "..", "blocks");

const source = (name: string) => readFileSync(join(blocksDir, name), "utf8");

describe("the registry's shape", () => {
  it("slugs are unique kebab-case", () => {
    const slugs = BLOCKS.map((block) => block.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(BLOCK_BY_SLUG.size).toBe(BLOCKS.length);
  });

  it("every blurb is real prose, not a stub", () => {
    // The anti-hollow clause the component reference already carries: the cheapest way to
    // satisfy a coverage law is an entry that says nothing.
    for (const block of BLOCKS) {
      expect(block.title.length, block.slug).toBeGreaterThan(2);
      expect(block.blurb.length, `${block.slug}: blurb is not a real sentence`).toBeGreaterThan(80);
      expect(block.blurb.trim().endsWith("."), `${block.slug}: blurb ends mid-thought`).toBe(true);
    }
  });
});

describe("the file walk, both directions", () => {
  it("every listed file exists and its kind can be shown", () => {
    for (const block of BLOCKS) {
      expect(block.files.length, `${block.slug} lists no files`).toBeGreaterThan(0);
      for (const file of block.files) {
        expect(existsSync(join(blocksDir, file)), `${block.slug}: blocks/${file} is missing`).toBe(
          true,
        );
        // The block page fences each file by extension; an extension that maps to no
        // supported language would 404 the page rather than fail loudly.
        const ext = file.slice(file.lastIndexOf(".") + 1);
        const lang = ext === "css" ? "css" : ext === "ts" ? "ts" : "tsx";
        expect(isLang(lang), `${block.slug}: no fence language for .${ext}`).toBe(true);
      }
    }
  });

  it("every source file in blocks/ is claimed by a block", () => {
    // The reverse direction, so a file can be neither orphaned nor forgotten. The registry
    // itself is the one exception: it is this site's data, not something a consumer copies.
    const claimed = new Set(BLOCKS.flatMap((block) => [...block.files]));
    const onDisk = readdirSync(blocksDir).filter(
      (name) => name !== "index.tsx" && /\.(tsx?|css)$/.test(name),
    );
    expect(onDisk.filter((name) => !claimed.has(name)).sort()).toEqual([]);
  });
});

/**
 * A BLOCK INVENTS NO VALUE (2026-09-01).
 *
 * This is the condition the whole arrangement rests on and it had no law: a block is copied
 * source, and copied source is only safe while every colour and distance in it resolves through
 * the package (THESIS §6 — the center stays in the dependency). One stylesheet was covered, by
 * a law about `code.css`'s syntax tokens specifically; nothing said the general thing, so the
 * second block's stylesheet could have shipped a hex and a 12px and no law would have moved.
 *
 * ABSOLUTE lengths only. `em`, `ch` and `%` are allowed and are not an exemption: a length
 * relative to the type is a property of the glyphs it sits with, which is the argument `Code`'s
 * padding, `Kbd`'s box and `Breadcrumb`'s underline offset all make inside the package. A `px`
 * is a decision about how big something is on a screen, and that decision is the system's.
 *
 * `0px` passes, because zero is the same length in every unit — it is a fallback for a var()
 * that has not been declared, not a size anybody chose.
 */
describe("no block stylesheet decides a value the package decides", () => {
  const stylesheets = readdirSync(blocksDir).filter((name) => name.endsWith(".css"));

  it("the walk found stylesheets — an empty walk audits nothing", () => {
    expect(stylesheets.length).toBeGreaterThan(1);
  });

  for (const name of stylesheets) {
    it(`${name} names no colour and no absolute length`, () => {
      // Comments are prose about the system and quote its values by name; the stripper is why
      // this law does not fire on its own documentation (the package's own laws learned this).
      const css = source(name).replace(/\/\*[\s\S]*?\*\//g, "");
      expect(css, `${name} writes a literal colour`).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(css, `${name} writes a colour function`).not.toMatch(
        /\b(rgba?|hsla?|oklch|oklab|color)\s*\(/,
      );
      const absolute = [...css.matchAll(/(?<![\w-])(\d*\.?\d+)(px|rem|pt|cm|mm|in)\b/g)].filter(
        (match) => Number(match[1]) !== 0,
      );
      expect(
        absolute.map((match) => match[0]),
        `${name} writes an absolute length — a distance is the system's`,
      ).toEqual([]);
    });
  }
});

/**
 * THE FOOTER'S TWO GUARANTEES (2026-09-01), which are the two things it owns beyond arrangement.
 *
 * Read off the RENDERED markup rather than the source, because both are claims about what a
 * screen reader is handed. The demo is the fixture on purpose: it is four groups plus a legal
 * row, so "every nav" and "the first nav" cannot agree by accident — a one-group fixture would
 * pass with the id built from a constant instead of from the index.
 */
describe("the footer names what it navigates", () => {
  const markup = async () => {
    const block = BLOCK_BY_SLUG.get("footer")!;
    // The FIRST demo, which is the full one — the others exist to show the axis and the small
    // case, and a law about naming wants the fixture with the most names in it.
    return renderToStaticMarkup(await block.demos[0]!.render());
  };

  it("every navigation region carries a name, and the names are the columns", async () => {
    const html = await markup();
    const navs = [...html.matchAll(/<nav\b[^>]*>/g)].map((match) => match[0]);
    expect(navs.length, "the fixture must have several regions or this proves nothing").toBeGreaterThan(3);
    for (const nav of navs) {
      const labelled = /aria-labelledby="([^"]+)"/.exec(nav);
      const label = /aria-label="([^"]+)"/.exec(nav);
      expect(
        Boolean(labelled ?? label),
        `a footer nav has no accessible name: ${nav}`,
      ).toBe(true);
      if (labelled) {
        // The id must resolve to an element that says something — a name pointing at nothing
        // is the failure this law exists for, and it looks identical in the markup.
        const target = new RegExp(`id="${labelled[1]}"[^>]*>([^<]+)`).exec(html);
        expect(target?.[1]?.trim(), `${labelled[1]} names nothing`).toBeTruthy();
      }
    }
  });

  it("a column of links is a list", async () => {
    const html = await markup();
    // The `<ul>` is why a screen reader can say "list of five items" before reading them, which
    // is the whole reason the element was chosen over a stack of divs.
    expect(html).toMatch(/<ul[^>]*class="[^"]*kb-footer-list/);
    expect((html.match(/<li>/g) ?? []).length).toBeGreaterThan(8);
  });

  it("the resting rank is the ink role, not a colour this file repaints", () => {
    /* The first spelling wrote `color: var(--color-text-muted)` here and it LOST — `Text` stamps
       `data-emphasis="loud"`, and `.kui-type[data-emphasis="loud"]` outranks a bare class, so
       the link painted full ink while the stylesheet said otherwise. The repair was to stop
       stating the colour twice: `emphasis="medium"` IS the muted role. This holds that, because
       the tempting fix is to paste the declaration back with more specificity.

       Falsified by restoring `color: var(--color-text-muted)` to the resting rule. */
    const css = source("footer.css").replace(/\/\*[\s\S]*?\*\//g, "");
    const resting = /\.kb-footer-link\s*\{([^}]*)\}/.exec(css);
    expect(resting, "the resting rule is gone — this law now reads nothing").toBeTruthy();
    expect(resting![1], "the resting colour has one home, and it is the ink role").not.toMatch(
      /(^|[^-])color:/,
    );
  });
});

describe("the empty state", () => {
  const demo = async (starts: string) => {
    const entry = BLOCK_BY_SLUG.get("empty-state")!.demos.find((d) => d.label.startsWith(starts));
    expect(entry, `no demo starting "${starts}" — this law now reads nothing`).toBeTruthy();
    return renderToStaticMarkup(await entry!.render());
  };

  it("the no-results demo does not offer the first-use action", async () => {
    /* THE MISTAKE THE BLOCK EXISTS TO PREVENT, held as a law on the demos rather than as a prop
       on the component — the three states differ in words and rank, so the taxonomy can only be
       taught by examples, and an example that teaches the wrong thing is worse than none.

       Offering "Create your first project" under a search that returned nothing is what most
       libraries ship. Both halves are asserted, and each fails on its own: the WORDS must not be
       the create action's, and the RANK must not be loud, because a filter-clearing action takes
       something away and a loud button says the opposite.

       Falsified by copying the first demo's `action` into the second. */
    const created = await demo("Nothing yet");
    const matched = await demo("Nothing matched");

    expect(created, "the first-use demo must offer creation, or this compares nothing").toContain(
      "New project",
    );
    expect(matched, "the no-results demo offers the create action").not.toContain("New project");
    /* SCOPED TO BUTTONS, and the first spelling was not — it counted `data-emphasis="loud"`
       anywhere and found two in the first-use demo, because the TITLE rests loud as well. A rank
       law that also reads the type's rank is measuring the wrong axis. */
    const loudButtons = (html: string) =>
      (html.match(/<button[^>]*data-emphasis="loud"[^>]*>/g) ?? []).length;
    expect(loudButtons(created), "the first-use action must be the loud one").toBe(1);
    expect(loudButtons(matched), "a filter-clearing action must not be loud").toBe(0);
  });

  it("the primary comes before the secondary", async () => {
    // Reading order and tab order at once, which is why it is DOM order and not a visual one.
    const html = await demo("Nothing yet");
    expect(html.indexOf("New project")).toBeLessThan(html.indexOf("Import from GitHub"));
  });

  it("it draws no pane", async () => {
    /* What it sits in is the caller's region, exactly as a footer's ground is the page's. Read
       off the rendered markup rather than off the stylesheet, because a pane could arrive from
       either — a `Card` in the tsx or a fill in the css — and this catches both. */
    const html = await demo("Nothing yet");
    expect(html).not.toMatch(/kui-card|kui-surface/);
    const css = source("empty-state.css").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css, "a pane's own properties").not.toMatch(/background|border|box-shadow|position/);
  });

  it("the mark is one line of the title, and the two files agree which line", async () => {
    /* AN AGREEMENT LAW, and it is the only kind that can hold this: the title's STEP lives in the
       tsx and the mark's LINE lives in the css, so moving one is a silent drift that renders a
       glyph sized to a heading the block no longer has. Neither file can see the other.

       Falsified by changing the title to `size="5"` and leaving the stylesheet, or the reverse. */
    const tsx = source("empty-state.tsx");
    const step = /<Heading size="(\d)" render=/.exec(tsx)?.[1];
    expect(step, "the title's step is gone — this law now reads nothing").toBeTruthy();
    expect(
      source("empty-state.css"),
      `the title is step ${step} and the mark is not one line of it`,
    ).toContain(`--line-height-${step}`);
  });

  it("two named slots, never a list", async () => {
    /* THE TYPE IS THE ONE-ACTION RULE, so the law reads the SOURCE — the fault is a widening of
       the props, and a widened prop that nobody passes renders identically to one that does not
       exist. The `liveFix` law in the builder reads source for the same reason: what is being
       guarded is a shape, and the shape has no runtime.

       Falsified by adding `actions?: React.ReactNode[]` to the props. */
    const tsx = source("empty-state.tsx").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    expect(tsx).toMatch(/\baction\?: React\.ReactNode;/);
    expect(tsx).toMatch(/\bsecondary\?: React\.ReactNode;/);
    expect(tsx, "an array is an invitation to put three buttons in an empty state").not.toMatch(
      /\bactions\??:/,
    );
  });
});

/**
 * THE TABLE OF CONTENTS (2026-09-04) — three guarantees, and each one is a decision that a
 * copied file could quietly undo.
 *
 * The FIXTURE is the two-level demo throughout, and that is deliberate: it carries five entries
 * at two levels with exactly one of them current, so "the current one" and "the first one"
 * cannot agree by accident, and a rule about level 3 has a level 2 beside it to differ from. A
 * three-entry flat list would pass most of these against a broken implementation.
 */
describe("the table of contents marks where you are without a fill", () => {
  const markup = async () => {
    const block = BLOCK_BY_SLUG.get("table-of-contents")!;
    const nested = block.demos.find((demo) => demo.label.startsWith("Two levels"));
    expect(nested, "no two-level demo — this law now reads nothing").toBeTruthy();
    return renderToStaticMarkup(await nested!.render());
  };
  const css = () => source("table-of-contents.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const rule = (selector: string) => {
    const found = new RegExp(`${selector.replace(/[.[\]"=]/g, "\\$&")}\\s*\\{([^}]*)\\}`).exec(
      css(),
    );
    expect(found, `${selector} is gone — this law now reads nothing`).toBeTruthy();
    return found![1]!;
  };

  it("the mark is ink and a rule, and there is no fill anywhere in the file", () => {
    /* THE DESIGN, AND THE WHOLE REASON THIS IS NOT A ROW (§26's sentence, `Accordion`'s cut).
       A fill under the current entry would make this the row family's vocabulary — a line you
       PICK from a list — and the sidebar on the other side of the page already speaks it, so
       the page would have two sidebars. The cheapest way to break this is also the most
       tempting one, which is why the assertion is over the whole stylesheet rather than over
       the current rule alone.

       Falsified by adding `background-color: var(--tone-soft)` to the `[data-current]` rule. */
    expect(css(), "a fill here makes this a row, and it is not one").not.toMatch(
      /background(-color)?\s*:/,
    );
    const current = rule('.kb-toc-item[data-current]');
    expect(current, "the current segment takes the family's glyph role").toMatch(
      /border-inline-start-color:\s*var\(--tone-glyph\)/,
    );
    expect(
      rule('.kb-toc-item[data-current] .kb-toc-link'),
      "and the label takes the full ink",
    ).toMatch(/color:\s*var\(--color-text\)/);
  });

  it("the rail is continuous — the entries carry it, so nothing may separate them", () => {
    /* The rail is drawn by the items themselves so that the lit segment is exactly the entry it
       marks, with nothing measured and nothing to keep in sync. That only holds while the items
       touch: a gap between them turns one rail into a column of dashes and the mark into a
       floating tick. The old inline version DID space its entries, which is why this is the
       first thing a reader porting it would put back.

       Falsified by restoring `gap: var(--layout-space-2)` to the list. */
    expect(rule(".kb-toc-list"), "a gap breaks the rail into dashes").not.toMatch(/gap\s*:/);
    expect(rule(".kb-toc-item"), "so does a margin").not.toMatch(/margin/);
    expect(rule(".kb-toc-item")).toMatch(/border-inline-start:.*var\(--color-border\)/);
  });

  it("a sub-heading is told by geometry, and takes no ink of its own", () => {
    /* `Tree`'s indent argument: one geometric step, so every entry at one level shares a left
       edge. Standing the ink down again would put a rung below muted on a line that is still a
       destination, which is §11's objection to a faded link — and the inline version this
       replaced did exactly that (level 3 rendered at `emphasis="quiet"`, the faint rung).

       BOTH HALVES, and each fails alone: the level-3 rule must state an indent GREATER than the
       level-2 one — a copy that set them equal would read as a flat list — and it must state no
       colour. The steps are compared as picks on the layout scale rather than as strings,
       because two different tokens is not the same claim as two different distances. */
    const base = /padding-inline-start:\s*var\(--layout-space-(\d+)\)/.exec(rule(".kb-toc-link"));
    const nested = /padding-inline-start:\s*var\(--layout-space-(\d+)\)/.exec(
      rule('.kb-toc-item[data-level="3"] .kb-toc-link'),
    );
    expect(base?.[1], "the entry states no indent — this law now reads nothing").toBeTruthy();
    expect(nested?.[1], "the sub-entry states no indent").toBeTruthy();
    expect(Number(nested![1]), "a sub-heading starts further in than its parent").toBeGreaterThan(
      Number(base![1]),
    );
    expect(
      rule('.kb-toc-item[data-level="3"] .kb-toc-link'),
      "and it is not a third ink",
    ).not.toMatch(/(^|[^-])color:/);
  });

  it("it is one named navigation, a real list, and exactly one place is current", async () => {
    /* Read off the RENDERED markup, because all four are claims about what a screen reader is
       handed. `location` and not `page`: this is the current place WITHIN a page, which is what
       ARIA defines the value for — the sidebar says `page` for the other question. Exactly one,
       which the five-entry fixture is what makes worth asserting. */
    const html = await markup();
    expect(html).toMatch(/<nav\b[^>]*aria-label="[^"]+"/);
    expect(html, "a list, so it is announced as one before it is read").toMatch(
      /<ul[^>]*class="[^"]*kb-toc-list/,
    );
    expect((html.match(/<li/g) ?? []).length).toBeGreaterThan(3);
    expect((html.match(/aria-current="location"/g) ?? []).length).toBe(1);
    expect(html, "and never the sidebar's question").not.toMatch(/aria-current="page"/);
  });
});

describe("a footer with no columns is a line", () => {
  /* THE ONE SHAPE THAT IS DERIVED (2026-09-02). The minimal footer — a mark, two or three
     destinations, a copyright, all on one row — is not a variant of this block, it is this block
     with nothing to stack: no `groups` means no columns, so the mark has nothing to stand over.
     The failure the derivation removes is a title drawn above an EMPTY region, which is exactly
     what a call site gets if the branch goes away.

     Falsified by deleting the `line ? null :` branch in `footer.tsx`: the columns element comes
     back empty and the first assertion fails. Falsified the other way by dropping
     `{line && brand}` from the sign-off row: the brand disappears and the second fails. */
  const markup = async (label: string) => {
    const block = BLOCK_BY_SLUG.get("footer")!;
    const demo = block.demos.find((entry) => entry.label === label);
    expect(demo, `no demo labelled "${label}" — this law now reads nothing`).toBeTruthy();
    return renderToStaticMarkup(await demo!.render());
  };

  it("draws no column region, and keeps the mark", async () => {
    const line = await markup("No columns at all: a mark and a line");
    expect(line, "a footer with no groups still drew a columns region").not.toMatch(
      /kb-footer-columns/,
    );
    /* THE MARK, NOT THE WORD. The first spelling matched the brand's text and SURVIVED its own
       sabotage: the copyright line names the same product, so dropping the brand entirely left
       the assertion satisfied by the note beside it. `kd-wordmark` is the mark's own element and
       the note is a plain `Text`, which is what tells the two apart. */
    expect(line, "the mark did not come down into the row").toMatch(/class="[^"]*kd-wordmark/);
    // And it is still a footer with a legal row, or this proves only that the demo is small.
    expect(line).toMatch(/aria-label="Legal"/);
  });

  it("and the columned demo beside it does draw one", async () => {
    /* THE CONTROL, without which the law above passes against a block that has stopped drawing
       columns at all — the degenerate fixture this repo keeps finding, where a right and a wrong
       implementation give the same answer. */
    const columned = await markup("A mark, the columns, and a sign-off");
    expect(columned).toMatch(/kb-footer-columns/);
    expect(columned).toMatch(/class="[^"]*kd-wordmark/);
  });
});

describe("a figure hands a region the whole measure", () => {
  /* THE STAGE CENTRES WHAT IT HOLDS, which is right for a control and wrong for anything whose
     own layout answers to the room it has (2026-09-02, Kushagra: "it can easily fit 3 cols, so
     why restrict at 2"). Measured on the footer block's page before `fill` existed: the demos
     came out 454px and 230px wide inside a 684px stage, because a centred flex item shrink-wraps
     — and multicol then counted its columns against the width the footer had just chosen for
     itself. Two columns in a figure with room for three, with nothing on the page to say why.

     This is a node law, so it reads the DECLARATIONS the stage emits rather than a painted
     width: `Flex` writes its axes as custom properties inline, and the fault this guards is a
     branch going missing rather than a value being wrong.

     Falsified by making the stage's arrangement unconditional in `specimen.tsx` — either
     spelling — which collapses the two renderings onto each other and fails the first
     assertion. */
  const stageOf = (html: string) => {
    const match = /<div class="kui-box" style="([^"]*min-block-size[^"]*)"/.exec(html);
    expect(match, "no stage in the figure — this law now reads nothing").toBeTruthy();
    return match![1]!;
  };

  const figure = async (fill: boolean) => {
    // The VIEW, not the async wrapper: `renderToStaticMarkup` cannot await a server component,
    // which is the same reason every demo on the page is resolved before it is rendered.
    const { lines, focused, diff } = await tokenize("const a = 1\n", "ts");
    return renderToStaticMarkup(
      <SpecimenView
        files={[{ lines, focused, diff, copyText: "const a = 1", lang: "ts" }]}
        {...(fill ? { fill: true } : {})}
      >
        <span>subject</span>
      </SpecimenView>,
    );
  };

  it("stretches a filled subject and centres an unfilled one", async () => {
    const plain = stageOf(await figure(false));
    const filled = stageOf(await figure(true));
    expect(plain, "fill changed nothing — the branch is gone").not.toBe(filled);
    // Centred on both axes: the arrangement a control wants.
    expect(plain).toMatch(/--kui-ai:center/);
    expect(plain).not.toMatch(/--kui-fd:column/);
    // One axis released: still centred on the block axis, stretched on the inline one.
    expect(filled).toMatch(/--kui-fd:column/);
    expect(filled).toMatch(/--kui-jc:center/);
    expect(filled).toMatch(/--kui-ai:stretch/);
  });

  it("and every footer demo asks for it", () => {
    /* The block whose whole subject is how it fills a page may not be shown shrink-wrapped.
       Named rather than inferred: this file cannot tell a region from a control, and neither can
       the figure — which is why the flag is the caller's in the first place. */
    for (const demo of BLOCK_BY_SLUG.get("footer")!.demos) {
      expect(demo.fill, `${demo.label} is shown shrink-wrapped`).toBe(true);
    }
  });
});

describe("every demo renders", () => {
  it("to real markup", async () => {
    // `demo()` resolves the async server component before anything renders, so the tree
    // renderToStaticMarkup sees is sync components only — the same reason the chapter law
    // substitutes `pre` cannot bite here.
    for (const block of BLOCKS) {
      expect(block.demos.length, `${block.slug} shows nothing`).toBeGreaterThan(0);
      for (const demo of block.demos) {
        // A LABEL IS A PHRASE (2026-09-01). Several demos are only worth several demos if the
        // reader is told what each one is showing; "Example 2" is what an unlabelled variant
        // becomes, and this is the same anti-hollow clause the blurb already carries.
        expect(demo.label.length, `${block.slug}: a demo label says nothing`).toBeGreaterThan(8);
        const markup = renderToStaticMarkup(await demo.render());
        expect(markup.length, `${block.slug}/${demo.label}: renders nothing`).toBeGreaterThan(100);
        /* AND NOT AS A LITERAL ESCAPE (2026-09-02). A JSX string ATTRIBUTE is not a JavaScript
           string, so `title="…\u201cinvoice\u201d"` reaches the page as those nine characters
           — which shipped here and which every law above was green over, because a demo full of
           backslashes renders, is long, and has a label. It looks like a typo and reads like a
           broken page. Falsified by putting the attribute form back. */
        expect(markup, `${block.slug}/${demo.label}: a \\u escape reached the page`).not.toMatch(
          /\\u[0-9a-fA-F]{4}/,
        );
      }
    }
  });

  it("the code sample tokenizes through the system's theme", async () => {
    // A ts string ALWAYS tokenizes to a coloured span, so this fixture can tell a wired
    // highlighter from a dead one — the bash demo alone could not be trusted to (the
    // degenerate-fixture rule: an input where right and wrong give different answers).
    const markup = renderToStaticMarkup(
      await CodeSample({ code: 'const greeting = "hello"\n', lang: "ts" }),
    );
    expect(markup).toContain("--code-token-");
    expect(markup).toContain("Copy");
  });
});

/**
 * THE CODE HALF TAKES A TAB PER FILE, AND ONLY WHEN THERE IS MORE THAN ONE (2026-09-01).
 *
 * A block is allowed to be several files, and until now a figure could show one of them — so a
 * block page had to choose between showing the thing and showing what to copy, and chose both
 * in two places. Both arms are the law, because either alone passes with the mechanism wrong: a
 * bar that never appears satisfies "one file has no bar", and a bar that always appears
 * satisfies "two files have one".
 *
 * Read off the RENDERED markup and by ROLE, not by class: what makes this a tab bar rather than
 * a row of buttons is `role="tab"`, and that is the thing a keyboard and a screen reader use.
 */
describe("a figure with several files", () => {
  const figure = async (sources: { name?: string; code: string; lang: string }[]) =>
    renderToStaticMarkup(
      await Specimen({ sources, children: React.createElement("p", null, "live") }),
    );

  it("shows a tab per file, labelled with its name", async () => {
    const html = await figure([
      { name: "footer.tsx", code: "export const a = 1\n", lang: "tsx" },
      { name: "footer.css", code: ".a { color: red }\n", lang: "css" },
    ]);
    expect((html.match(/role="tab"/g) ?? []).length, "one tab per file").toBe(2);
    expect(html).toContain("footer.tsx");
    expect(html).toContain("footer.css");
    // The FIRST file is what the figure opens on, and it is really rendered — a bar over an
    // empty well would carry both names and show nothing. Asserted on a token rather than on
    // the line, because the highlighter splits a line into one span per token and the source
    // text never appears contiguously in the markup (learned by reading the output, which is
    // the only way this fixture could have been right).
    expect(html).toContain("export");
    expect(html).toContain('class="kd-line"');
  });

  it("and the copy button is in exactly one place either way", async () => {
    /* It moves rather than multiplies. With one file it sits in the figure's chrome row; with
       several it travels down to the tab bar, because it has to hand over the file you are
       LOOKING at and which one that is is state. Both arms count, because the failure this
       catches is a button left behind in the row copying whichever file the server put first —
       two buttons, one of them lying. */
    const many = await figure([
      { name: "a.tsx", code: "const a = 1\n", lang: "tsx" },
      { name: "b.css", code: ".b { color: red }\n", lang: "css" },
    ]);
    const one = await figure([{ code: "const a = 1\n", lang: "tsx" }]);
    expect((many.match(/aria-label="Copy"/g) ?? []).length, "several files").toBe(1);
    expect((one.match(/aria-label="Copy"/g) ?? []).length, "one file").toBe(1);
  });

  it("numbers its lines, in both arms", async () => {
    /* NUMBERED BY DEFAULT IN A FIGURE (2026-09-02, Kushagra: "I need numbers on both, and I want
       them on"). A figure's source is a whole file or a whole example, which is the thing a
       reader points at.

       BOTH ARMS, and the arms are the point: one file renders a `CodeSampleView` directly and
       several render one per tab panel, so the prop is threaded through two call sites and a
       single-arm law would pass over a figure that numbers the file it shows and stops numbering
       the moment there are two. Falsified by dropping the prop from either call site in
       `specimen.tsx`, and by dropping it from `file-tabs.tsx` — each leaves exactly one of these
       assertions red. */
    const one = await figure([{ name: "a.tsx", code: "const a = 1\n", lang: "tsx" }]);
    expect(one, "a one-file figure does not number").toContain("kd-numbered");

    const two = await figure([
      { name: "a.tsx", code: "const a = 1\n", lang: "tsx" },
      { name: "b.css", code: ".a { color: red }\n", lang: "css" },
    ]);
    /* ONE, not two, and the reason is the instrument rather than the subject: Base UI renders
       only the ACTIVE panel on the server, so a static render of a two-file figure contains one
       well however many tabs the bar carries. Measured, not assumed — the first spelling asked
       for two and failed on correct code. What the assertion still catches is the whole fault:
       drop the prop from `file-tabs.tsx` and this is zero. */
    expect(two, "a tabbed figure does not number").toContain("kd-numbered");

    // AND IT IS A DECISION, not something the well does on its own — without which both
    // assertions above hold against a block that numbers everything unconditionally.
    const off = renderToStaticMarkup(
      await Specimen({
        sources: [{ name: "a.tsx", code: "const a = 1\n", lang: "tsx" }],
        lineNumbers: false,
        children: <span>x</span>,
      }),
    );
    expect(off, "the figure cannot be told to stop").not.toContain("kd-numbered");
  });

  it("and no bar at all when there is one", async () => {
    const html = await figure([{ code: "export const a = 1\n", lang: "tsx" }]);
    expect(html, "a bar with one tab is furniture that says nothing").not.toContain('role="tab"');
    // Calibration: the well still rendered, so the assertion above is not passing against an
    // empty figure. One token, for the reason the law above states.
    expect(html).toContain('class="kd-line"');
  });
});

describe("the author's annotations", () => {
  it("a notation comment flags the line and leaves the clipboard", async () => {
    // The copy-is-the-stripped-source law, from both sides: the flag arrives AND the
    // notation is gone from the text the copy button hands over.
    const { lines } = await tokenize('const a = 1 // [!code highlight]\nconst b = 2\n', "ts");
    expect(lines[0]?.highlight).toBe(true);
    expect(lines[1]?.highlight).toBe(false);
    expect(plainText(lines)).not.toContain("[!code");
    expect(plainText(lines)).toContain("const a = 1");
  });

  it("a diff flags add and remove, and the whole block knows it is one", async () => {
    const { lines, diff } = await tokenize(
      'const a = 1 // [!code --]\nconst a = 2 // [!code ++]\nconst b = 3\n',
      "ts",
    );
    expect(lines[0]?.remove).toBe(true);
    expect(lines[1]?.add).toBe(true);
    expect(lines[2]?.add).toBe(false);
    expect(diff).toBe(true);
    expect(plainText(lines)).not.toContain("[!code");
  });

  it("fence meta highlights by range and by word", async () => {
    const { lines } = await tokenize('const greeting = "hi"\nconst b = 2\n', "ts", "{2} /greeting/");
    expect(lines[1]?.highlight).toBe(true);
    expect(lines[0]?.highlight).toBe(false);
    expect(lines[0]?.tokens.some((token) => token.word && token.text.includes("greeting"))).toBe(
      true,
    );
  });

  it("focus flags the line and the block", async () => {
    const { lines, focused } = await tokenize(
      'const a = 1\nconst b = 2 // [!code focus]\n',
      "ts",
    );
    expect(lines[1]?.focus).toBe(true);
    expect(focused).toBe(true);
  });

  it("the rendered markup carries the flags as classes and hides the markers", async () => {
    const markup = renderToStaticMarkup(
      await CodeSample({
        code: 'const a = 1 // [!code --]\nconst a = 2 // [!code ++]\n',
        lang: "ts",
      }),
    );
    expect(markup).toContain("kd-line-add");
    expect(markup).toContain("kd-line-remove");
    // The marker is decoration: hidden from AT, and never part of the copy payload (which
    // the plainText laws above pin from the data side).
    expect(markup).toMatch(/kd-line-marker[^>]*aria-hidden/);
    expect(markup).not.toContain("[!code");
  });
});

describe("the bound and the numbers", () => {
  const FIVE_LINES = "a\nb\nc\nd\ne\n";

  it("the expand button appears only when the bound binds", async () => {
    const bounded = renderToStaticMarkup(
      await CodeSample({ code: FIVE_LINES, lang: "bash", maxLines: 2 }),
    );
    expect(bounded).toContain("Show all 5 lines");
    expect(bounded).toMatch(/aria-expanded="false"/);
    const roomy = renderToStaticMarkup(
      await CodeSample({ code: FIVE_LINES, lang: "bash", maxLines: 24 }),
    );
    expect(roomy).not.toContain("Show all");
  });

  /* The bound is a DEFAULT, and the default is the half that has no call site to fail at
     (2026-08-31). Every well on this site inherits it, so the guarantee is that a long sample
     bounds ITSELF with nobody asking — falsified by removing `= CODE_MAX_LINES` from the
     view's destructure, which leaves a 60-line fence unbounded and this red.

     Both arms, because either alone passes with the default wrong: a sample OVER the bound
     must bound, and one under it must not — a default of 0 satisfies the first on its own. */
  it("a long sample bounds itself, and a short one does not", async () => {
    const long = "x\n".repeat(CODE_MAX_LINES + 12);
    const bounded = renderToStaticMarkup(await CodeSample({ code: long, lang: "bash" }));
    expect(bounded).toContain(`Show all ${CODE_MAX_LINES + 12} lines`);

    const short = "x\n".repeat(CODE_MAX_LINES - 1);
    const roomy = renderToStaticMarkup(await CodeSample({ code: short, lang: "bash" }));
    expect(roomy).not.toContain("Show all");
  });

  /* WHAT THE BOUND HOLDS BACK MUST BE WORTH A PRESS (2026-09-05).

     It bound at one line over, so a 25-line sample against the 24-line default drew a button
     to hide a single line. Three arms, and each fails alone — which is the point, because the
     tempting spellings each satisfy two of them:

       - one line over the default shows WHOLE. Fails against the old `> maxLines`.
       - well past the slack still bounds. Fails against a slack so large the bound is dead,
         which is what "just raise CODE_MAX_LINES" would have been.
       - an explicit SMALL bound still binds on a small overflow. Fails against an absolute
         slack, which is the spelling this one exists to refuse: `maxLines={2}` is a deliberate
         statement, and three hidden lines there double what is on screen.

     The last arm is also why the slack is a share rather than a number, so the law reads the
     decision and not just its value at the default. */
  it("a trivial overflow draws no button, and a real one still does", async () => {
    const barely = "x\n".repeat(CODE_MAX_LINES + 1);
    expect(
      renderToStaticMarkup(await CodeSample({ code: barely, lang: "bash" })),
      "one line over the bound is not worth a control",
    ).not.toContain("Show all");

    const past = "x\n".repeat(CODE_MAX_LINES + CODE_BOUND_SLACK(CODE_MAX_LINES) + 1);
    expect(
      renderToStaticMarkup(await CodeSample({ code: past, lang: "bash" })),
      "past the slack the bound must still bind, or it is not a bound",
    ).toContain("Show all");

    const small = renderToStaticMarkup(
      await CodeSample({ code: "a\nb\nc\nd\ne\n", lang: "bash", maxLines: 2 }),
    );
    expect(small, "a stated small bound keeps its own slack").toContain("Show all 5 lines");
  });

  /* THE BOUND'S OTHER HALF MOVED INTO THE PACKAGE (2026-09-01).

     A law lived here reading `code.css` for the flex column that makes a `max-block-size` on a
     ScrollArea root definite, and it said in its own comment that the real assertion is
     `clientHeight < scrollHeight` on a mounted well and belongs beside the ScrollArea's own
     laws. It does now: the root is a flex column and the viewport a flex item in the package,
     so the bound binds wherever a scroller sits, and `scroll-area.browser.test.tsx` mounts one
     inside a plain block box and measures it. Nothing is left here to read. */

  /* CHROME THAT APPEARS ON HOVER RESERVES NOTHING — reversed twice in two days, and the record
     is the point.

     It was conditional on a name; then unconditional, on the argument that a safe area is about
     the band a pane says its chrome lives in rather than about the pixels the chrome covers.
     Both of those assumed the chrome is ALWAYS THERE. It is not: it is hidden at rest and fades
     in when a reader points at the figure, so a reserved band is a strip of nothing at the top
     of every code block on the site, permanently, to clear a control almost never on screen.

     What the row costs instead is an overlap while it is up, which the scroll-edge fade is for.
     A reader who is pointing at the chrome is not reading the line under it.

     BOTH ARMS: nothing is reserved, and the row still FLOATS — the second is what catches the
     repair that deletes the chrome instead of the band.

     AND THE FLOAT HAS TWO SPELLINGS, because the two arrangements are two different boxes. A
     NAMED sample is a figure — a Surface holding the label and a hosted well — so its row hangs
     from the figure as `.kd-figure-chrome`, this block's own. An UNNAMED one is a bare well, so
     its row takes the element's own floating slot, `.kui-code-block-float`. The law names which
     one each arrangement must use rather than accepting either: an OR would go green on a
     titled sample that quietly fell back to the well's slot, which is the arrangement that put
     the name over the first line it was naming. */
  it("a fence reserves no band, and its chrome floats over the code", async () => {
    const padding = (markup: string) => /<pre[^>]*style="[^"]*padding-block-start:([^;"]*)/.exec(markup)?.[1]?.trim() ?? null;

    for (const props of [
      { code: FIVE_LINES, lang: "bash", title: "app/page.tsx", floats: "kd-figure-chrome" },
      { code: FIVE_LINES, lang: "tsx", floats: "kui-code-block-float" },
    ]) {
      const { floats, ...rest } = props;
      const out = renderToStaticMarkup(await CodeSample(rest));
      expect(padding(out), `${rest.title ?? "unnamed"}: reserves nothing`).toBe(null);
      expect(out, `${rest.title ?? "unnamed"}: still floats its chrome`).toContain(floats);
    }

    const bare = renderToStaticMarkup(await CodeSample({ code: FIVE_LINES, lang: "tsx", bare: true }));
    expect(bare, "a bare fence draws no chrome at all").not.toContain("kui-code-block-float");
    expect(bare, "a bare fence draws no figure chrome either").not.toContain("kd-figure-chrome");
  });

  /* BOTH CHROME ROWS FLOAT AGAINST THE SAME BOX (2026-09-01, Kushagra: "why isnt it touching?",
     then "the button still has more padding than code sample").

     One arrangement produced two faults. The expand control hung from a positioned wrapper
     AROUND the well while the topbar hung from the well itself, and in a hosted well those two
     boxes have different bottoms: the bleed's negative bottom margin collapses out of the well
     onto the wrapper (measured — wrapper 1374, well 1398, pane wall 1399). So the button sat
     41px off the pane wall against a standalone twin's 16, and the wrapper being a DOM sibling
     of the well also turned the block-end bleed off, leaving the scroller and both bars an inset
     short of the wall while the inline edges reached it.

     The fix is the containing block, not a number: the row goes to the element as `footer` and
     hangs from the well. A compensating inset was written first and measured 8px BELOW the wall
     — the same double-counting a third time — which is why this law is about WHERE the row is
     rather than about what its inset says.

     The distance itself is a mounted measurement and the docs app has one node project by
     decision, so it is not claimed here. Falsified by rendering the row outside the well again. */
  it("the expand control floats from the well itself, not from a box around it", async () => {
    /* THE FIRST SPELLING OF THIS LAW COULD NOT FAIL, and its own sabotage caught it: it
       compared the INDEX of the well's class against the index of the button's text, and the
       well opens before the button in both arrangements. Rebuilding the pre-fix version — a
       relative `<div>` holding the CodeBlock and the row as siblings — left it green. The
       question is containment, so the law has to find the well's CLOSING tag. */
    const closesAfter = (markup: string, openIndex: number, needle: number) => {
      let depth = 0;
      for (const tag of markup.slice(openIndex).matchAll(/<(\/?)([a-zA-Z][^\s/>]*)([^>]*)>/g)) {
        const [whole, slash, , rest] = tag;
        if (rest!.endsWith("/") || /^(br|img|input|hr|meta|link|path|source)$/i.test(tag[2]!)) continue;
        depth += slash ? -1 : 1;
        if (depth === 0) return openIndex + tag.index! + whole.length > needle;
      }
      return false;
    };

    const long = "x\n".repeat(CODE_MAX_LINES + 12);
    for (const hosted of [false, true]) {
      const markup = renderToStaticMarkup(
        await CodeSample({ code: long, lang: "bash", ...(hosted ? { hosted } : {}) }),
      );
      const button = markup.indexOf("Show all");
      expect(button, `hosted=${hosted}: no expand control rendered`).toBeGreaterThan(-1);
      // The well's own element: back up from its class to the `<` that opens the tag.
      const cls = markup.indexOf("kui-code-block");
      expect(cls, `hosted=${hosted}: no well rendered`).toBeGreaterThan(-1);
      const open = markup.lastIndexOf("<", cls);
      expect(
        closesAfter(markup, open, button),
        `hosted=${hosted}: the expand control renders outside the well`,
      ).toBe(true);
    }
  });

  it("Infinity is the way out, and it is the only one", async () => {
    // Stated as a law because it is the escape the prop's own doc promises, and an escape
    // nothing exercises is an escape that stops working quietly.
    const long = "x\n".repeat(CODE_MAX_LINES + 12);
    const free = renderToStaticMarkup(
      await CodeSample({ code: long, lang: "bash", maxLines: Infinity }),
    );
    expect(free).not.toContain("Show all");
  });

  it("line numbers are a class, never markup", async () => {
    // The strong form: the two renders differ ONLY by the class hook. Digits reaching the
    // markup would fail this without any assertion having to guess where they would land.
    // `useId` values differ between consecutive renders in one process (the builder's
    // round-trip law met the same fact), so ids are normalized before comparing.
    const ids = (markup: string) => markup.replace(/«[^»]*»|:r[0-9a-z]+:/g, "«id»");
    const numbered = renderToStaticMarkup(
      await CodeSample({ code: FIVE_LINES, lang: "bash", lineNumbers: true }),
    );
    const plain = renderToStaticMarkup(await CodeSample({ code: FIVE_LINES, lang: "bash" }));
    expect(numbered).toContain("kd-numbered");
    expect(ids(numbered).replace("kui-code-block-code kd-numbered", "kui-code-block-code")).toBe(ids(plain));
  });
});

describe("the fence meta vocabulary", () => {
  it("parseMeta takes the chrome facts and leaves Shiki's directives", () => {
    const meta = parseMeta('title="x.ts" lineNumbers maxLines=20 bare {1,3} /word/');
    expect(meta).toEqual({
      title: "x.ts",
      lineNumbers: true,
      maxLines: 20,
      bare: true,
      rest: "{1,3} /word/",
    });
    expect(parseMeta(undefined)).toEqual({
      title: undefined,
      // SILENCE IS NOT A REFUSAL (2026-09-02). `undefined` is what lets the consumer's own
      // default stand — the docs number every fence — while `lineNumbers=false` is a fence
      // saying no. A two-state flag had nothing to say no with once the default flipped.
      lineNumbers: undefined,
      maxLines: undefined,
      bare: false,
      rest: "",
    });
  });

  it("and a fence can refuse the numbers it would otherwise get", () => {
    /* The third state, which is the whole reason the flag stopped being a boolean. Falsified by
       putting the presence-only regex back: `lineNumbers=false` then leaves `=false` in `rest`
       and reads as an ASK, so a one-line command gets the numbering it asked not to have. */
    expect(parseMeta("lineNumbers=false").lineNumbers).toBe(false);
    expect(parseMeta("lineNumbers=false").rest, "the directive must not reach Shiki").toBe("");
    expect(parseMeta("lineNumbers=true").lineNumbers).toBe(true);
    expect(parseMeta("lineNumbers").lineNumbers).toBe(true);
  });

  it("both compilers load the meta plugin", () => {
    // MDX drops fence meta unless the remark plugin restores it, and the plugin is wired in
    // two configs that cannot import each other — the "two implementations of one mechanism
    // owe an agreement law" clause, honestly limited: this reads source, and what it catches
    // is one config dropping the plugin while the other keeps it.
    const configs = join(here, "..", "..", "..");
    expect(readFileSync(join(configs, "next.config.ts"), "utf8")).toContain(
      "mdx-plugins/remark-fence-meta.mjs",
    );
    expect(readFileSync(join(configs, "vitest.config.ts"), "utf8")).toContain(
      "mdx-plugins/remark-fence-meta.mjs",
    );
  });
});

describe("the well is the package's, and the block owns none of it", () => {
  it("the block reaches CodeBlock through the package", () => {
    /* THE SWAP LAW, THE OTHER WAY ROUND (2026-09-01). It used to assert the package did NOT
       export `CodeBlock`, so that the day the element shipped the suite failed and named the
       one-import swap. The element has shipped, the stub is deleted, and the law now asserts
       what replaced it: the block imports the well from the dependency, and there is no local
       module for it to fall back to.

       Both halves matter. The import alone would still pass if somebody re-created the stub
       and shadowed the name, so the export is read off the real package too — the calibration
       the old spelling already carried, kept for the same reason. */
    expect("CodeBlock" in Kookie, "the package must export the block-level code element").toBe(
      true,
    );
    for (const file of ["code-sample.tsx", "expandable.tsx"]) {
      expect(source(file), `${file} must take the well from the package`).toMatch(
        /import \{[^}]*\bCodeBlock\b[^}]*\} from "@kookie-ui\/react"/s,
      );
      expect(source(file), `${file} must not re-grow a local well`).not.toContain(
        'from "./code-block"',
      );
    }
  });

  it("every class a block paints is dressed by a stylesheet something imports", () => {
    /* THE ORPHANED STYLESHEET (2026-09-01, Kushagra: "why is it inline now, the code").

       `code.css` was imported at the top of the local `code-block.tsx`. Deleting that stub for
       the package's own element took the import with it, so nothing pulled the stylesheet in:
       `.kd-line` stopped being a block, and every line of every fence on the site ran together
       onto one line. 891 docs laws and 2372 package laws were green throughout, because a
       stylesheet's classes are strings in one file and its rules are strings in another, and
       nothing had ever asked whether the two meet.

       So the law pairs them by NAME rather than by any one file's import list: for each class
       a block's source paints, some source file in `blocks/` must both define it in CSS and
       import that CSS. Reading membership on both sides is what makes it survive the rename —
       the fault was not a missing rule and not a missing class, it was the join between them.

       Falsified by removing the import line from `code-sample.tsx`, which is the defect. */
    const files = readdirSync(blocksDir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
    const sheets = readdirSync(blocksDir).filter((f) => f.endsWith(".css"));
    expect(sheets.length, "no block stylesheets found — this law stopped reading").toBeGreaterThan(0);

    // Which stylesheets are actually pulled into the bundle, and by whom.
    const imported = new Set<string>();
    for (const file of files) {
      for (const m of source(file).matchAll(/import "\.\/([^"]+\.css)"/g)) imported.add(m[1]!);
    }

    for (const sheet of sheets) {
      expect(
        imported.has(sheet),
        `${sheet} is never imported — its rules do not reach the page, and nothing else here would say so`,
      ).toBe(true);
    }

    // And the other direction: a class a block paints must be defined in one of them. Scoped
    // to the `kd-` prefix, which is this app's own namespace — `kui-` classes are the
    // package's and are dressed by the package's stylesheet.
    const rules = sheets.map((s) => source(s)).join("\n");
    const painted = new Set<string>();
    for (const file of files) {
      for (const m of source(file).matchAll(/["'`\s](kd-[a-z0-9-]+)/g)) painted.add(m[1]!);
    }
    expect(painted.size, "no kd- classes found in any block — this law stopped reading").toBeGreaterThan(3);
    for (const cls of painted) {
      expect(rules, `.${cls} is painted by a block and defined by no block stylesheet`).toContain(
        `.${cls}`,
      );
    }
  });

  it("the block's stylesheet decides no colour the package already decides", () => {
    /* The theme moved WITH the element — Shiki is pointed at `--kui-code-token-` and the
       package resolves those names against the solved ink ladder. A copy of them here would be
       the same decision in two homes, and it would win, because this file loads after the
       package's stylesheet. What is left in `code.css` is the block's own markup: line washes,
       the diff gutter, line numbers.

       Falsified by pasting one `--kd-code-token-*` declaration back. */
    const css = source("code.css");
    expect(css, "the token contract belongs to the element").not.toMatch(/--kd-code-token-/);
    expect(css, "and so does the mono family and the fence's own measure").not.toMatch(
      /font-family|white-space/,
    );
    // The calibration half: prove this file still says something, so the assertions above are
    // not passing against an empty stylesheet.
    expect(css).toContain(".kd-line");
  });

  /**
   * A WRAP CONTINUES UNDER THE LINE'S OWN INDENT, which is three distances and not one.
   *
   * The shipped spelling hung every continuation a fixed 4ch from the pane's wall, and that
   * number was also the line-number gutter — so a numbered fence spent the whole hang on its
   * digits and every continuation landed flush at the code's own left wall. Measured on
   * `/components/page`: a line indented seven columns began at x=525 and continued at 467, a
   * dedent of 58px, reading as a SHALLOWER nesting level than the line it belongs to.
   *
   * The old law asserted that coupling as a guarantee — "the wrap indent and the line-number
   * gutter are one number" — which is the defect written down as a requirement. It is replaced
   * rather than deleted: what it was reaching for (the two cannot drift) is real, and the way
   * to have it is one NAME for the sum, not one value for two facts.
   *
   * READ OFF THE SOURCE, and the limit is stated rather than hidden: every distance here is
   * `ch` and this project renders in node, so no law in this file can read a painted column.
   * What it can hold is that the three distances exist separately, that the sum has ONE home,
   * and that the renderer writes the one value CSS cannot derive. The pixel claim was made by
   * hand in a browser and is recorded in LOG.
   *
   * COMMENTS ARE STRIPPED, and the first run of the old law is why: its negative assertion
   * fired on this file's own prose, where the paragraph explaining that `inline-size:
   * max-content` is gone contains those very words.
   */
  it("the hang, the gutter and the line's own indent are three distances", () => {
    const css = source("code.css").replace(/\/\*[\s\S]*?\*\//g, " ");

    /* Three names, and the gutter's default is what makes an unnumbered fence reserve nothing
       — a gutter that defaulted to the digit column would indent every bare fence by four
       columns of nothing. */
    expect(css, "the hang is gone").toMatch(/--kd-line-hang:\s*\dch/);
    expect(css, "the line's own indent has no default to fall back on").toMatch(
      /--kd-indent:\s*0ch/,
    );
    expect(css, "an unnumbered fence must reserve no gutter").toMatch(/--kd-gutter:\s*0ch/);

    /* The gutter is spent ONLY under the numbered scope. Written on the line rather than the
       block, because a custom property is substituted where it is DECLARED (§6) — set on an
       ancestor, the line's own padding resolves the 0ch default and reserves nothing for
       digits that paint anyway. */
    const numbered = css.slice(css.indexOf(".kd-numbered .kd-line"));
    expect(numbered, "the digit column is not declared on the line").toMatch(
      /--kd-gutter:\s*\dch/,
    );

    /* ONE NAME FOR THE SUM. The box arithmetic holds only while the padding, the first row's
       negative indent and the width bound agree to the pixel, and three hand-written sums are
       three chances to disagree — which is the shape the old law was right to be afraid of. */
    expect(css, "the run is not derived from its parts").toMatch(
      /--kd-run:\s*calc\(\s*var\(--kd-gutter\)\s*\+\s*var\(--kd-indent\)\s*\+\s*var\(--kd-line-hang\)\s*\)/,
    );
    for (const property of ["padding-inline-start", "text-indent", "min-inline-size"]) {
      const rule = new RegExp(`${property}:[^;]*var\\(--kd-run\\)`);
      expect(css, `${property} restates the sum instead of reading it`).toMatch(rule);
    }

    expect(css, "a max-content line cannot wrap").not.toContain("inline-size: max-content");
  });

  /**
   * AND THE RENDERER WRITES THE ONE VALUE CSS CANNOT DERIVE.
   *
   * A line's leading whitespace is inside its own text, so a stylesheet can only ever hang
   * from the pane's wall. `leadingColumns` reads it off the tokens at build time — the same
   * derivation `plainText` makes, for the same reason.
   *
   * THE FIXTURE IS THE LAW'S LOAD-BEARING HALF. One indented line cannot tell a correct
   * implementation from one that writes a constant; a fixture of only indented lines cannot
   * tell it from one that writes the attribute unconditionally; and a fixture whose flush
   * line comes first cannot tell "unindented" from "the first line". So it runs flush,
   * shallow, flush, deep, and every one of those three mistakes fails it.
   */
  it("a line carries its own indent, and only where it has one", async () => {
    const code = ["const a = 1;", "  const b = 2;", "const c = 3;", "      const d = 4;"].join(
      "\n",
    );
    const { lines } = await tokenize(code, "ts");
    expect(lines.map(leadingColumns)).toEqual([0, 2, 0, 6]);

    const markup = renderToStaticMarkup(
      (await CodeSample({ code, lang: "ts", lineNumbers: true })) as never,
    );
    const written = [...markup.matchAll(/--kd-indent:\s*(\d+)ch/g)].map((m) => Number(m[1]));
    expect(written, "the indents in the markup are not the indents in the code").toEqual([2, 6]);
    /* And nothing is written for a flush line: half of these have no indent, so a renderer
       that wrote `0ch` would put an attribute on every line in every fence on the site for a
       value the stylesheet already states. */
    expect(markup.match(/--kd-indent/g)).toHaveLength(2);
  });

  it("the block writes no geometry the well already owns", () => {
    /* The chrome rows are the ELEMENT's children now, placed by it, and that is what lets the
       surface layer's own edge-bleed arms ignore them (`data-float`). A call site that
       positions its own row is the arrangement the promotion removed: two rows hanging from
       two different boxes, which in a hosted well have different bottoms.

       Read off the block's source, because the fault is a call site writing `position:
       absolute` again — the rendered markup would look plausible either way. */
    for (const file of ["code-sample.tsx", "expandable.tsx"]) {
      expect(source(file), `${file} must not place its own chrome`).not.toMatch(
        /position:\s*"absolute"/,
      );
      expect(source(file), `${file} must not reach for the well's private inset`).not.toContain(
        "--kui-cb-host-p",
      );
    }
  });
});

/**
 * PUBLISHED SOURCE CARRIES NO DECISION HISTORY.
 *
 * Every file below is READ OFF DISK AND SHOWN — a block's files by `blocks/[slug]/page.tsx`,
 * an example's by `readExampleSource` — so a comment in one is not a note to the next person
 * editing this repo, it is a paragraph on the documentation site inside code a reader is meant
 * to copy. A dated, attributed account of why a value moved is `LOG.md`'s genus and belongs
 * there; what may stay is what teaches a reader about the code in front of them.
 *
 * The distinction is WHEN and WHO, not depth: "the row floats, so content passes behind it"
 * teaches; "the row floated, then went into flow for an hour, then came back (date, name)" is
 * a log entry that escaped. A rule and its own strongest objection is teaching too — the
 * objection is why the rule survives — as long as it is written in the present tense about the
 * code rather than as an account of what its author did.
 *
 * A law rather than a convention, because the drift is not a one-off: two of these were written
 * INTO these files while the rest were being cleaned out of them. Anything the pattern removes
 * that is worth keeping is worth a LOG entry, which is where it was always supposed to go.
 */
/**
 * A LIVE SPECIMEN IN A CHAPTER TAKES A FIGURE'S AIR.
 *
 * `mdx-components.tsx` states four intervals for a chapter, and a figure's is the widest of
 * them: a block that is not prose gets 32px on both sides where a sibling paragraph gets 16.
 * A fence got that because the renderer wraps it; `<Example>` did not, because it went into
 * the flow as an ordinary child — measured on `/concepts/principles`, 16px above and below
 * against a fence's 32 on the same page.
 *
 * Read off the SOURCE, because this project renders in node and no law here can measure a
 * margin. What it can hold is that both blocks reach the same wrapper, which is the fact that
 * was wrong: one of the two was wrapped and the other was not.
 */
describe("a chapter's figures take one rhythm", () => {
  const mdx = readFileSync(join(here, "..", "..", "..", "mdx-components.tsx"), "utf8");

  it("a live specimen is wrapped like a fence", () => {
    // Both must reach `Figure`, which is the one place the figure margin is stated.
    expect(mdx, "the figure wrapper is gone").toMatch(/function Figure\(/);
    expect(mdx, "a live specimen is not wrapped as a figure").toMatch(
      /Example: \([^)]*\) => \(\s*<Figure>/,
    );
    // And the vacuity guard: `Figure` must still be what carries the margin, or the assertion
    // above is about a wrapper that means nothing.
    expect(mdx, "the figure wrapper states no margin").toMatch(
      /<Box my=\{FIGURE_MARGIN\}/,
    );
  });
});

describe("published source is not a log", () => {
  const examplesDir = join(here, "..", "..", "..", "examples");
  const shown = [
    ...new Set(BLOCKS.flatMap((block) => block.files.map((file) => join(blocksDir, file)))),
    ...readdirSync(examplesDir)
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => join(examplesDir, file)),
  ];

  /* The fixture is what makes this a law rather than a spellchecker: it has to name files that
     are genuinely PUBLISHED, so a clean run means the shown files are clean and not that the
     walk found nothing. `index.ts` is excluded by construction — a registry is never handed to
     a reader — and the count guard is what says so out loud. */
  it("walks the files a reader is actually shown", () => {
    expect(shown.length).toBeGreaterThan(50);
    expect(shown.every((file) => existsSync(file))).toBe(true);
    expect(shown.some((file) => file.endsWith("specimen.tsx"))).toBe(true);
    expect(shown.some((file) => file.endsWith("accordion.tsx"))).toBe(true);
    expect(shown.some((file) => file.includes("index.ts"))).toBe(false);
  });

  it("no shown file dates a decision or attributes one to a person", () => {
    for (const file of shown) {
      const text = readFileSync(file, "utf8");
      /* An ISO date is the tell that survives every rewording — a comment that has to say WHEN
         is recording a change rather than explaining the code. */
      expect(text, `${file} carries a dated decision; it belongs in LOG.md`).not.toMatch(
        /\d{4}-\d{2}-\d{2}/,
      );
      /* And the second tell is a name. `aria-label` is the one legitimate place a person's name
         appears in a specimen — it is the demo's content, an account holder in an app frame —
         so the check is scoped to comment text rather than to the file. */
      const comments = text.match(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g) ?? [];
      for (const comment of comments) {
        expect(comment, `${file} attributes a decision to a person`).not.toMatch(/Kushagra/);
      }
    }
  });
});

/**
 * A CHROME ROW IS A TOOLBAR, NOT A `Flex`.
 *
 * Three blocks drew the same row — the figure's chrome, the code sample's chrome, the file tab
 * bar — and each one wrote `align="center" justify="space-between" gap="3"` by hand. That is
 * the alignment, the split and the air, which is exactly the set of facts `Toolbar` exists to
 * state once; the site's own header had already been converted for the same reason, and these
 * were what was left.
 *
 * The rows differ in what they BUY, and the laws below say which is which rather than claiming
 * one story for all three. Where a row holds two plain buttons, the toolbar is one tab stop
 * with arrow keys inside it, and that is a keyboard fix. Where it holds a tab bar, it is not:
 * a `TabsList` is a roving composite already, so nested it keeps its own arrow keys and they
 * never reach the button beside it — measured, and asserted below as the thing it is rather
 * than left as an assumption.
 */
describe("a chrome row is a toolbar", () => {
  const CHROME = ["specimen.tsx", "code-sample.tsx", "file-tabs.tsx"] as const;

  it("no block hand-writes a row's alignment, split and air", () => {
    // Keyed on the SPLIT, which only a row states — a block may still group with a `Flex`, and
    // the air inside a cluster is a cluster's business.
    //
    // COMMENTS ARE STRIPPED FIRST, and that is not tidiness: this law's own subject is worth
    // naming in the code it replaced, so `specimen.tsx` explains itself by quoting the very
    // string being banned. A law that reads its own documentation fails on the explanation
    // rather than on the defect — the same repair `stylesheets.ts` made for two package laws.
    const code = (file: string) =>
      source(file).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    for (const file of CHROME) {
      expect(code(file), `${file} states a row's split itself`).not.toContain(
        'justify="space-between"',
      );
    }
  });

  /** A figure with a props control beside its copy button — the arrangement on every page. */
  const chrome = async () =>
    renderToStaticMarkup(
      await Specimen({
        sources: [{ name: "a.tsx", code: "const a = 1\n", lang: "tsx" }],
        controls: <Kookie.ToolbarButton iconOnly aria-label="Props" />,
        children: <p>live</p>,
      }),
    );

  it("the figure's chrome announces itself, and its controls are IN it", async () => {
    const out = await chrome();
    expect(out, "the row announces itself").toContain('role="toolbar"');
    const row = out.slice(out.indexOf('role="toolbar"'));
    expect(row, "the props trigger is in it").toContain('aria-label="Props"');
  });

  it("a toolbar's controls are ONE tab stop, not one each", async () => {
    // What the conversion actually buys here. Base UI's composite parks every item but one at
    // `tabindex="-1"`; two plain buttons in a Flex are two stops with nothing grouping them.
    const out = await chrome();
    const row = out.slice(out.indexOf('role="toolbar"'));
    expect(row.match(/tabindex="-1"/g)?.length ?? 0, "controls are parked").toBeGreaterThan(0);
  });

  it("and the tab bar's row is a toolbar for its LAYOUT, its keyboard being its own", () => {
    /**
     * Stated rather than assumed, because it was measured and it surprised me: a `TabsList`
     * nested in a `Toolbar` keeps its own arrow keys, and from the last tab ArrowRight wraps to
     * the first tab rather than moving to the button beside it — identical to the same bar with
     * no toolbar around it. Two roving composites, and the inner one wins.
     *
     * So this row takes the toolbar for the three layout facts and announces itself honestly;
     * the copy button beside the bar is reachable by Tab, which is what it was before. A law
     * claiming a keyboard win here would be a law about something that does not happen.
     */
    expect(source("file-tabs.tsx"), "the row is a Toolbar").toContain("<Toolbar");
    expect(source("file-tabs.tsx"), "and it says what it does not buy").toMatch(
      /NOT BUY HERE IS THE KEYBOARD/,
    );
  });

  it("and the figure's chrome rests at the same inset the code well's does", () => {
    /* THE AGREEMENT, and the reason it exists is that nothing could see the disagreement.
     *
     * The figure's row padded a picked `4` — 12px — while the code well inside it padded the
     * pane's own inset, 24. Two chrome insets on one page, one in a block and one in the
     * package, invisible from inside either file: the block's laws never looked at the well
     * and the package's never looked at the block.
     *
     * READ AS THE KEYWORD, not as a number. `p="bleed"` is the surface padding re-applied
     * (§3), which is the same expression the well's rows read, so the two follow the index
     * together by construction rather than by two authors picking the same value. A law
     * asserting `24` would pass at one size and lie at every other. */
    // ONE HOME ON EACH SIDE, AND THEY AGREE. The docs state it once in `code.css`; the package
    // states it once in `code-block.css`. The two are visible together — a figure holds a well —
    // and they disagreed once already at 12 against 24, because each side picked a value nobody
    // could compare. So the law is that they name the SAME TOKEN, which is the only thing that
    // makes them follow each other when it changes.
    const docs = /--kd-chrome-p:\s*([^;]+);/.exec(source("code.css"))?.[1]?.trim();
    const pkg = /--kui-cb-chrome-p:\s*([^;]+);/.exec(
      readFileSync(
        join(here, "..", "..", "..", "..", "..", "packages", "ui", "src", "components", "code-block", "code-block.css"),
        "utf8",
      ),
    )?.[1]?.trim();
    expect(docs, "the docs state a chrome inset").toBeTruthy();
    expect(docs, "and it is the package's own").toBe(pkg);

    // …and no block states one of its own beside it.
    for (const file of ["specimen.tsx", "file-tabs.tsx"]) {
      expect(source(file), `${file} pads its chrome by hand`).not.toMatch(
        /className="kd-figure-chrome"[^>]*\bp=/,
      );
    }
  });

  it("every control in these rows can enrol in one", () => {
    // `ToolbarButton` throws outside a toolbar, which is what makes the contract loud. The
    // shared copy button is the one every chrome row places, so it is the one that must be one.
    expect(source("copy-button.tsx")).toContain("<ToolbarButton");
    expect(source("copy-button.tsx"), "and not a plain Button beside it").not.toMatch(
      /<Button[\s>]/,
    );
  });
});

/**
 * THE CHROME APPEARS ON HOVER, and every law here exists because a defect shipped past the
 * ones that did not.
 *
 * Three things this arrangement gets wrong if nothing holds it: a row keyed on the wrong
 * ancestor is invisible at every moment, a row with nothing in it still draws its track, and a
 * tabbed figure's copy button ends up somewhere different from every other figure's.
 */
describe("the figure's chrome is hidden until a reader points at the figure", () => {
  const css = () => source("code.css");

  it("it rests hidden and the FIGURE is what reveals it", () => {
    /* KEYED ON THE FIGURE, NEVER ON THE WELL, and this is the law for a defect that shipped:
       the tab bar's copy button sits OUTSIDE the code block, so a `.kui-code-block:hover` rule
       could never match it and it was invisible at every moment, on every tabbed figure. The
       well may reveal its own rows; the figure must reveal all of them. */
    expect(css(), "hidden at rest").toMatch(/\.kd-code-chrome\s*\{[^}]*opacity:\s*0/);
    expect(css(), "the figure reveals it").toMatch(/\.kd-figure:hover\s+\.kd-code-chrome/);
    expect(css(), "and the keyboard does too").toMatch(/\.kd-figure:focus-within\s+\.kd-code-chrome/);
  });

  it("and it reserves no space, so nothing moves when it appears", () => {
    // The whole reason the band went. A row that fades in must not push the code down with it.
    expect(css(), "the floating chrome is out of flow").toMatch(
      /\.kd-figure-chrome\s*\{[^}]*position:\s*absolute/,
    );
  });

  it("a row with nothing in it does not draw at all", async () => {
    /* AN EMPTY `ToolbarGroup` STILL DRAWS ITS TRACK — that is the part's own contract (§45: a
       group that drew nothing would be a Flex wearing a part's name) — so a figure with no
       props control and several files rendered a 4x40 sliver in its corner, which reads as a
       stray scrollbar. Found by eye. The row is what must not render, not the track. */
    const out = renderToStaticMarkup(
      await Specimen({
        sources: [
          { name: "a.tsx", code: "const a = 1\n", lang: "tsx" },
          { name: "b.css", code: ".a { color: red }\n", lang: "css" },
        ],
        children: <p>live</p>,
      }),
    );
    expect(out, "the row holds the active file's copy").toContain("kd-figure-chrome");
    /* AND EXACTLY ONE, which is the half that can fail. The first spelling asserted that a
       figure with NO sources draws no chrome — and that fixture cannot distinguish anything,
       because the row is gated on `files.length === 1` and a figure with no files fails that
       whichever way the guard is written. Its sabotage survived, which is how it was caught.
       The case that matters is SEVERAL files: the figure must not draw a row of its own beside
       the one `FileTabs` draws, or the corner holds two boxes and the empty one is a sliver. */
    // ONE, not two. `FileTabs` draws the figure's chrome for a tabbed figure — it is the client
    // component that knows the active file — so the figure must not draw a second beside it, or
    // the corner holds two boxes and the one with nothing in it is a 4x40 sliver.
    expect(out.match(/kd-figure-chrome/g)?.length ?? 0, "exactly one").toBe(1);
  });

  it("a tabbed figure's copy sits in the SAME corner as a single file's", () => {
    /* It used to live in the tab row, because the copy has to hand over the file you are
       LOOKING AT and the tab bar is what holds that. The result was one control in two places
       depending on how many files a figure had, which is what a reader notices. `FileTabs`
       renders the figure's chrome itself now — it is the client component that knows the
       active file, and the figure is a server component that cannot. */
    // SCOPED TO THE TAB ROW, which is the Toolbar holding the `TabsList`. The first spelling
    // asked whether ANY Toolbar in the file contains a CopyButton, and the figure's own chrome
    // is a Toolbar containing exactly that — so it matched the correct arrangement.
    const tabRow = /<Toolbar[^>]*>\s*<TabsList[\s\S]*?<\/Toolbar>/.exec(source("file-tabs.tsx"))?.[0];
    expect(tabRow, "the tab row is a toolbar holding the tabs").toBeTruthy();
    expect(tabRow, "and nothing else").not.toContain("CopyButton");
    expect(source("file-tabs.tsx"), "it is in the figure's chrome").toMatch(
      /kd-figure-chrome[\s\S]*?<CopyButton/,
    );
    expect(source("specimen.tsx"), "and the figure draws its own only for one file").toMatch(
      /files\.length === 1 \?/,
    );
  });
});
