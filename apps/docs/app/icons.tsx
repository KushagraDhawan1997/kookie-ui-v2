/**
 * The docs' own glyphs. The package ships no icon dependency by design (§8 — icons are
 * ReactNode slots; the app installs its own set), and the docs hold themselves to the same
 * rule as everything else here: nothing third-party. Three hand-drawn strokes on the 24 grid
 * are all a judging surface needs; the icon box (--icon-size-N) does the sizing.
 */
const strokeProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function SearchIcon() {
  return (
    <svg {...strokeProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function XIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
