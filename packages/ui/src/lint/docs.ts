/**
 * Where a report sends its reader (Kushagra, 2026-11-26: every message says what is wrong, what
 * to use instead, and links the page).
 *
 * One home for the address, so a message never carries a link of its own spelling. A law in
 * lint.test.ts checks that every path here is a page the package ships as Markdown, because a
 * report that links a page that is not there is worse than one that links nothing.
 */

/** The public documentation site. */
export const DOCS_ORIGIN = "https://ui.kookie.design";

/** Every page a rule links, by the job the page does for the report. */
export const DOCS_PAGES = {
  linter: "/build/linter",
  layout: "/foundations/layout",
  color: "/foundations/color",
  depth: "/foundations/depth",
  typography: "/foundations/typography",
  forms: "/patterns/forms",
  box: "/components/box",
  button: "/components/button",
  dialog: "/components/dialog",
  field: "/components/field",
  navigator: "/components/navigator",
  toolbar: "/components/toolbar",
} as const;

export type DocsPage = keyof typeof DOCS_PAGES;

/** The full address of a page, as a report prints it. */
export const docs = (page: DocsPage): string => `${DOCS_ORIGIN}${DOCS_PAGES[page]}`;
