/**
 * Markdown, resolved into KookieUI (2026-08-21).
 *
 * This file is the whole reason the docs can use a compiler without using a framework: MDX
 * hands over an element name, and every answer here is a component from the package. A `##`
 * is a `<Heading>` on the house ladder (§15: page 8, section 7, subsection 6), a paragraph is
 * `<Text>` at the reading step, a fence is the same `CodeBlock` the component pages use, a
 * rule is a `<Separator>`. Nothing in a chapter can paint a colour or invent a distance,
 * because a chapter has no vocabulary for either.
 *
 * VERTICAL RHYTHM IS THE CALLER'S, and it has to be: components never own outer spacing (the
 * non-negotiable). The chapter page puts the whole flow in a `<Stack>`, so the base distance
 * between blocks is that gap; a heading adds to it through `<Box mt>`, the sanctioned escape,
 * which is what makes a section break read as a section break instead of a slightly larger
 * paragraph gap. Differentiated rhythm is the composition brief's own rule (§15) — a flat
 * one is a finding the reviewer would raise against any screen we shipped.
 *
 * THREE ELEMENTS HAVE NO COMPONENT TO RESOLVE TO — lists, inline links and tables — and they
 * are handled here in the only honest way: the semantic element, kept for what it announces,
 * with its type coming from `<Text render>` and its remaining details from `prose.css` in
 * tokens. §11 plans `Link` and a table row and has shipped neither; nothing in the system has
 * ever named a list. Writing the docs is what turned that from an absence nobody had noticed
 * into three recorded gaps (LOG 2026-08-21), which is the pattern this repo keeps having:
 * /preview forced the composition rules, the builder forced `componentAxes`, and the canon
 * forces the prose primitives.
 */
import * as React from "react";
import type { MDXComponents } from "mdx/types";
import NextLink from "next/link";
import {
  Blockquote,
  Box,
  Code,
  Heading,
  Separator,
  Stack,
  Text,
} from "@kookie-ui/react";

import { CodeBlock } from "./app/(docs)/code-block";
import { Example } from "./app/(docs)/example";
import { ReviewRules } from "./app/(docs)/review-rules";
import { nodeText, slugify } from "./app/(docs)/slug";
import type { TypeSize } from "@kookie-ui/react";

/** A heading that carries its own anchor. The id is what the table of contents links to and
    what a URL fragment lands on, so it is computed from the rendered words through the one
    slug function both sides share (`slug.ts`). */
function anchored(level: 2 | 3 | 4, size: TypeSize, marginTop: "4" | "5" | "6") {
  const Component = ({ children }: { children?: React.ReactNode }) => {
    const id = slugify(nodeText(children));
    const element =
      level === 2 ? <h2 id={id} /> : level === 3 ? <h3 id={id} /> : <h4 id={id} />;
    return (
      <Box mt={marginTop}>
        <Heading size={size} render={element}>
          {children}
        </Heading>
      </Box>
    );
  };
  Component.displayName = `MdxH${level}`;
  return Component;
}

/**
 * Pull the fence apart. MDX gives `<pre>` exactly one child — a `<code>` carrying the source
 * as text and the language as `language-*` — so this reads both off that child and renders
 * `CodeBlock` instead of either element. The `code` mapping below therefore never sees a
 * fenced block: it is the INLINE case only, which is why it can be `<Code>` unconditionally.
 */
function fence(props: { children?: React.ReactNode }): React.ReactElement {
  const child = React.Children.only(props.children) as React.ReactElement<{
    className?: string;
    children?: string;
  }>;
  const className = child.props.className ?? "";
  const lang = className.replace(/^language-/, "") || "tsx";
  const code = typeof child.props.children === "string" ? child.props.children : "";
  return <CodeBlock code={code} lang={lang} />;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // A chapter never renders its own `h1` — the page does, from the registry, so the title
    // in the navigation and the title on the page are one fact. An `h1` inside a chapter is
    // a second one, and the docs law fails on it.
    h2: anchored(2, "7", "6"),
    h3: anchored(3, "6", "5"),
    h4: anchored(4, "5", "4"),

    p: ({ children }) => (
      <Text size="3" render={<p />}>
        {children}
      </Text>
    ),

    // Reading-length prose rests LOUD (§15: full contrast is the accessible resting state
    // for reading), so emphasis appears nowhere in this file's paragraphs. `strong` is a
    // weight step, never a colour or a rung.
    strong: ({ children }) => (
      <Text weight="medium" render={<strong />}>
        {children}
      </Text>
    ),
    em: ({ children }) => <em>{children}</em>,

    // `<Text render>` gives the list the ramp step and the ink; every `li` inherits both,
    // and a nested list re-wraps and inherits again. Indent and marker colour are the two
    // things left over, and they live in prose.css because the system has no list to ask.
    ul: ({ children }) => (
      <Text size="3" render={<ul className="kd-list" />}>
        {children}
      </Text>
    ),
    ol: ({ children }) => (
      <Text size="3" render={<ol className="kd-list" />}>
        {children}
      </Text>
    ),
    li: ({ children }) => <li>{children}</li>,

    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
    hr: () => (
      <Box my="5">
        <Separator />
      </Box>
    ),
    code: ({ children }) => <Code>{children}</Code>,
    pre: fence,

    /**
     * An internal link is `next/link`; an external one is a plain anchor that says where it
     * goes. Both are `<Text render>` for the ink and the underline arrives from prose.css —
     * §11 has planned `Link` (accent, with states) since the defaults table was written, and
     * until it ships this is the app drawing one link for itself rather than the system
     * shipping one for everybody.
     */
    a: ({ href, children }) => {
      const target = href ?? "";
      const external = /^https?:/.test(target);
      return (
        <Text
          tone="accent"
          render={
            external ? (
              <a href={target} rel="noreferrer noopener" target="_blank" className="kd-link" />
            ) : (
              <NextLink href={target} className="kd-link" />
            )
          }
        >
          {children}
        </Text>
      );
    },

    // Tables: the semantic element, kept because a table announces its own structure, with
    // type from Text and the grid lines from tokens in prose.css. §11 plans a table ROW (an
    // interactive surface); a static data table has never been specified.
    table: ({ children }) => (
      <Box className="kd-table-wrap">
        <Text size="2" render={<table className="kd-table" />}>
          {children}
        </Text>
      </Box>
    ),
    th: ({ children }) => (
      <th>
        <Text size="2" weight="medium">
          {children}
        </Text>
      </th>
    ),

    /**
     * Components a chapter may use by name, with no import line of its own.
     *
     * Deliberately a SHORT list. Every entry here is something a chapter cannot express in
     * markdown and the system genuinely owns — `Example` renders a real file from the example
     * registry, `ReviewRules` reads the linter's own rule set. The moment this list grows a
     * decorative member (a callout, a tip box, a coloured aside) the chapters stop being prose
     * and start being a second component library, which is exactly the drift these docs are
     * an argument against. Set-apart prose is a blockquote; the system ships one.
     */
    Example,
    ReviewRules,

    // Anything a chapter passes in at the call site wins over the defaults above.
    ...components,
  };
}

/** The wrapper a chapter's flow is rendered into. Exported so the chapter page and any law
    that mounts a chapter agree on the rhythm rather than each choosing one. */
export function ProseFlow({ children }: { children: React.ReactNode }) {
  return <Stack gap="4">{children}</Stack>;
}
