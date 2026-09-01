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

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as Kookie from "@kookie-ui/react";

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

describe("every demo renders", () => {
  it("to real markup", async () => {
    // `demo()` resolves the async server component before anything renders, so the tree
    // renderToStaticMarkup sees is sync components only — the same reason the chapter law
    // substitutes `pre` cannot bite here.
    for (const block of BLOCKS) {
      const markup = renderToStaticMarkup(await block.demo());
      expect(markup.length, `${block.slug}: demo renders nothing`).toBeGreaterThan(100);
    }
  });

  it("the code sample tokenizes through the system's theme", async () => {
    // A ts string ALWAYS tokenizes to a coloured span, so this fixture can tell a wired
    // highlighter from a dead one — the bash demo alone could not be trusted to (the
    // degenerate-fixture rule: an input where right and wrong give different answers).
    const markup = renderToStaticMarkup(
      await CodeSample({ code: 'const greeting = "hello"\n', lang: "ts" }),
    );
    expect(markup).toContain("--kd-code-token-");
    expect(markup).toContain("Copy");
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
    expect(alone, "the unnamed sample still floats its copy button").toContain("kd-code-well");
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
      const cls = markup.indexOf("kd-code-well");
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
    expect(ids(numbered).replace(" kd-code kd-numbered", " kd-code")).toBe(ids(plain));
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
      lineNumbers: false,
      maxLines: undefined,
      bare: false,
      rest: "",
    });
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

describe("the stub is a stub, and the swap cannot be forgotten", () => {
  it("the package does not ship CodeBlock yet", () => {
    // THE SWAP LAW. The day this fails is the day the package exports the block-level code
    // element: change `code-sample.tsx` to import it from `@kookie-ui/react`, delete
    // `blocks/code-block.tsx`, remove it from the registry's files, and rewrite this law to
    // assert the import instead.
    // The calibration half: prove the namespace is the real package before trusting its
    // absence — an import resolving to an empty module would pass the line below vacuously.
    expect("Code" in Kookie).toBe(true);
    expect(
      "CodeBlock" in Kookie,
      "the package now exports CodeBlock — swap the stub (see this law's comment)",
    ).toBe(false);
  });

  it("the block consumes the stub through one import", () => {
    // Reading source, stated honestly: what this catches is the pairing being quietly
    // dropped — a chrome that stops using the element makes the swap a lie.
    expect(source("code-sample.tsx")).toContain('from "./code-block"');
  });

  it("the stub decides nothing — no hex, no raw px", () => {
    // The discipline that makes the swap free. A hex colour or a pixel literal in the stub is
    // a decision the package would not have made, and it would ship into the copied block.
    const stub = source("code-block.tsx");
    expect(stub).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    // Nonzero px only: `var(--kui-sf-p, 0px)` is the identity fallback for an unresolved
    // hook — the package's own spelling — not a length anybody chose.
    expect(stub).not.toMatch(/[1-9]\d*px/);
  });
});
