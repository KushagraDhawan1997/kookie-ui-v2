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
import { CodeSample } from "../../../blocks/code-sample";
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
