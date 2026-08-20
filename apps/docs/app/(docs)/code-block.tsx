/**
 * A code sample, in the composition this repo already settled (2026-08-21, Kushagra, on the
 * builder's export dialog): **a Surface, not a Card** — "the code is not an object sitting on
 * the page, it is a well recessed into it" — with a ScrollArea as the ground's ONLY child,
 * because the shared surface layer pulls a direct-child scroller out to the pane's edges and
 * re-states the padding on the viewport inside, so the bar sits ON the edge and the code
 * scrolls UNDER the padding. Wrapping the scroller, or giving the ground a second child,
 * reaches none of that rule. That is why the header row is a SIBLING of the ground rather
 * than a band inside it.
 *
 * Async, and therefore server-only: tokenizing is build-time work, so a code fence costs the
 * reader nothing but the markup it produces. The one client component in a code block is the
 * copy button.
 */
import * as React from "react";
import { Flex, ScrollArea, Stack, Surface, Text } from "@kookie-ui/react";

import { CopyButton } from "./copy-button";
import { isLang, tokenize, type Lang } from "./highlight";

/** What the header row calls each language. The grammar's id is a tool's name for it
    (`tsx`, `bash`); this is the reader's. */
const LANG_LABEL: Record<Lang, string> = {
  tsx: "TSX",
  ts: "TypeScript",
  jsx: "JSX",
  js: "JavaScript",
  css: "CSS",
  json: "JSON",
  bash: "Terminal",
  html: "HTML",
  mdx: "MDX",
};

export type CodeBlockProps = {
  code: string;
  lang: string;
  /** A file path, when the sample IS a file. Replaces the language label, because where the
      code lives is more use than what it is written in once you can see it. */
  title?: string;
  /** Suppress the header row. For the rare fence that is one word long, where a label and a
      copy button are more chrome than content. */
  bare?: boolean;
};

export async function CodeBlock({ code, lang, title, bare }: CodeBlockProps) {
  // An unlisted language would tokenize as plain text, which renders exactly like a fence
  // nobody got round to labelling — a silent downgrade. The docs law walks fences against
  // LANGS so this throw is a backstop rather than the enforcement, but a backstop that says
  // which fence and which language is worth the two lines.
  if (!isLang(lang)) {
    throw new Error(
      `Unknown code language "${lang}". Add it to LANGS in highlight.ts, or fix the fence.\n${code.slice(0, 80)}`,
    );
  }
  const lines = await tokenize(code, lang);
  const trimmed = code.replace(/\n+$/, "");

  return (
    <Stack gap="2">
      {bare ? null : (
        <Flex align="center" justify="space-between" gap="3">
          <Text size="2" emphasis="quiet">
            {title ?? LANG_LABEL[lang]}
          </Text>
          <CopyButton code={trimmed} />
        </Flex>
      )}
      <Surface size="2">
        <ScrollArea>
          {/* `render={<pre/>}` keeps the element the browser and every assistive technology
              already understand as preformatted code, and Text supplies the ramp step and
              the ink. The mono slot is the type layer's third family (§15) — reached here by
              `style` because the family is a token, not a Text prop: `Code` is the inline
              atom and a block is not one. */}
          <Text
            size="2"
            render={<pre />}
            className="kd-code"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <code>
              {lines.map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {line.map((token, tokenIndex) => (
                    <span
                      key={tokenIndex}
                      style={{
                        color: token.color,
                        ...(token.italic ? { fontStyle: "italic" } : null),
                      }}
                    >
                      {token.text}
                    </span>
                  ))}
                  {lineIndex < lines.length - 1 ? "\n" : null}
                </React.Fragment>
              ))}
            </code>
          </Text>
        </ScrollArea>
      </Surface>
    </Stack>
  );
}
