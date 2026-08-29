/**
 * A stand-in for `next/font/local` under Vitest (2026-08-28).
 *
 * `next/font/local` is not a runtime module. Next's SWC plugin REPLACES the call at build
 * time with the generated class names, so the published package exports a function that
 * throws by design — which is why `shell.test.tsx` began failing with "default is not a
 * function" the moment the layout loaded a face, in a law that had nothing to do with fonts
 * and was right to keep rendering the real layout.
 *
 * WHAT THIS MUST NOT DO is let the suite pass on a layout that would fail to build. It
 * returns the same SHAPE the transform produces — `className`, `variable`, `style.fontFamily`
 * — so a law can still assert that the variable reaches `<html>`, which is the half of the
 * mechanism a node test can see. What it cannot see is whether the file on disk exists, whether
 * a Google family name is real, or whether either parses; `next build` is what answers that, and it runs before lint in this repo's task
 * graph.
 *
 * The variable name is derived rather than fixed, so a law reading it is reading the value
 * the layout asked for and not a constant agreed in two places.
 */
export default function localFont(options: { variable?: string }) {
  return {
    className: "__stub_font",
    variable: options.variable ?? "__stub_font_variable",
    style: { fontFamily: options.variable ?? "__stub_font_family" },
  };
}
