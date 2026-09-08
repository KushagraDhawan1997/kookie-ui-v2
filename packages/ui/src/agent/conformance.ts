/**
 * WHAT ANY SURFACE EXPOSING THIS CHECKER MUST ANSWER (2026-09-07, the audit).
 *
 * Not a test fixture — a conformance suite, and it ships for the same reason the rules do.
 * There are two "check this snippet" tools: the stdio MCP server binds `checkUsage` to a
 * snapshot, and the documentation site binds it to the live registry in a browser. Sharing the
 * RULES was supposed to end the era of one snippet getting two verdicts. It did not, because
 * the two surfaces inject the FACTS themselves and one of them was injecting half: measured,
 * `<Button asChild m="4" as="a" highContrast />` came back "No problems found" on the site and
 * with five findings on the server, and 2,100 laws were green over it — every law on each side
 * asked its own surface what it thought.
 *
 * A shared expectation is the only thing that catches that, and it has to be shared as DATA
 * rather than as a cross-package import: the server's entry starts a stdio process on import,
 * and the site's runs in a browser. So each suite runs these against its own binding and
 * asserts the same answers.
 *
 * EVERY CASE IS A MEASURED DEFECT OR THE INVARIANT THAT DEFECT BROKE. Nothing here is
 * hypothetical, and a case whose reason stops being real should be deleted rather than kept
 * passing.
 */

/** One snippet and every `tag.prop` its findings must name, sorted. */
export type ConformanceCase = {
  /** Why this case exists. Read it before deleting one. */
  why: string;
  code: string;
  /** `Tag.prop`, or bare `Tag` for a finding with no prop. Sorted, compared as a set. */
  findings: string[];
};

/** The cases every surface exposing this checker must answer identically. */
export const CONFORMANCE_CASES: readonly ConformanceCase[] = [
  {
    why: "The Radix Themes reflexes, which are the measured corpus risk. The site reported one of these five.",
    code: '<Button variant="solid" color="red" highContrast asChild as="a">Save</Button>',
    findings: ["Button.asChild", "Button.as", "Button.color", "Button.highContrast", "Button.variant"],
  },
  {
    why: "The margin row on a control: the system's oldest rule, and the site reported none of it.",
    code: '<Button m="4" mt="2">Save</Button>',
    findings: ["Button.m", "Button.mt"],
  },
  {
    why: "A refusal reaches a component whose registry prose does not happen to spell the prop in backticks.",
    code: '<Card variant="surface" />',
    findings: ["Card.variant"],
  },
  {
    why: "Radix Themes' Theme props, refused on ours. The site reported one of the four.",
    code: '<Theme accentColor="blue" grayColor="slate" scaling="95%" panelBackground="translucent" />',
    findings: ["Theme.accentColor", "Theme.grayColor", "Theme.panelBackground", "Theme.scaling"],
  },
  {
    why: "A part reads its parent's refusals — the registry's own shape, on both surfaces.",
    code: '<MenuItem variant="solid" />',
    findings: ["MenuItem.variant"],
  },
  {
    why: "A layout OWNS the margin row, so the same prop that is refused above is legal here.",
    code: '<Box m="4" p="3" gap="2" />',
    findings: [],
  },
  {
    why: "The documented raw-CSS escape out of the space scale. Both surfaces called it an illegal value.",
    code: '<Flex gap="16px"><Box position="absolute" inset="0" /></Flex>',
    findings: [],
  },
  {
    why: "A bare number outside the scale IS a dead index, and stays an error — the other half of the escape.",
    code: '<Flex gap="20" />',
    findings: ["Flex.gap"],
  },
  {
    why: "A closed axis, checked against the type that closes it rather than against the builder's narrower vocabulary.",
    code: '<Button size="9">x</Button>',
    findings: ["Button.size"],
  },
  {
    why: "A `data-` axis: TSX waves it through undeclared, so both surfaces report it from the lint rule's own sentence.",
    code: '<Card data-tone="destructive" />',
    findings: ["Card.data-tone"],
  },
  {
    why: "A TypeScript type argument is not a JSX tag. Read as one, `Item` was reported as a component that does not exist.",
    code: "const [rows] = useState<Item>([]);\n<Button>Go</Button>",
    findings: [],
  },
];
