import { Code } from "@kookie-ui/react";

/**
 * Render backticked spans in system prose as real `<Code>`.
 *
 * The component registry, the generated props table and the reviewer's rules are all plain
 * data, and four surfaces render their strings directly: a component page, the composition
 * chapter, the builder's inspector and its review panel. Writing a prop name in prose is
 * unavoidable in all four, and every author reaches for a backtick, which used to reach the
 * reader as a literal backtick.
 *
 * Deliberately not markdown. The only mark these strings ever carry is a code span, and pulling
 * in a parser to find one would make a component page render text through a second engine.
 *
 * An unterminated backtick is data, not a marker: an odd count leaves the tail as plain text
 * rather than swallowing the rest of the sentence into a code span.
 */
export function InlineCode({ text }: { text: string }) {
  const parts = text.split("`");
  if (parts.length < 3) return <>{text}</>;
  const complete = parts.length % 2 === 1;
  const last = complete ? parts.length : parts.length - 1;
  return (
    <>
      {parts.slice(0, last).map((part, i) =>
        i % 2 === 1 ? (
          <Code key={i}>{part}</Code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
      {complete ? null : <span key="tail">{"`" + parts[parts.length - 1]}</span>}
    </>
  );
}
