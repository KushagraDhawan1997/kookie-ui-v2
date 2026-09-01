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
import { CODE_MAX_LINES, CodeSample } from "../../../blocks/code-sample";
import { isLang, parseMeta, plainText, tokenize } from "../../../blocks/highlight";

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

  /* THE BOUND'S OTHER HALF MOVED INTO THE PACKAGE (2026-09-01).

     A law lived here reading `code.css` for the flex column that makes a `max-block-size` on a
     ScrollArea root definite, and it said in its own comment that the real assertion is
     `clientHeight < scrollHeight` on a mounted well and belongs beside the ScrollArea's own
     laws. It does now: the root is a flex column and the viewport a flex item in the package,
     so the bound binds wherever a scroller sits, and `scroll-area.browser.test.tsx` mounts one
     inside a plain block box and measures it. Nothing is left here to read. */

  /* A BAND IS RESERVED FOR A ROW THAT REACHES TWO WALLS (2026-09-01, Kushagra: "the one with
     no filename... the top left just looks weird").

     The clearance under the chrome row exists because a name at one wall and a copy button at
     the other cover the whole of line 1. An unlabelled fence has only the button, and the same
     band then reserved a pane's width of nothing to clear a control in one corner of it.

     BOTH ARMS, and each one alone passes with the rule inverted: the named sample must reserve,
     the unnamed must not. Read off the RENDERED `<pre>` rather than off the flag that produces
     it — the padding is an inline style, so this is the emitted value and not a restatement of
     the branch. Falsified by putting `topbar` back as the condition, which turns the second
     assertion red. */
  it("a named row reserves a band and a lone copy button reserves none", async () => {
    const padding = (markup: string) => /<pre[^>]*style="[^"]*padding-block-start:([^;"]*)/.exec(markup)?.[1]?.trim() ?? null;

    const named = renderToStaticMarkup(
      await CodeSample({ code: FIVE_LINES, lang: "bash", title: "app/page.tsx" }),
    );
    expect(padding(named), "a named row must clear the first line").toContain("control-height");

    const alone = renderToStaticMarkup(await CodeSample({ code: FIVE_LINES, lang: "tsx" }));
    expect(alone, "the unnamed sample still floats its copy button").toContain("kui-code-block-float");
    expect(padding(alone), "a lone copy button reserves nothing").toBe(null);
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
