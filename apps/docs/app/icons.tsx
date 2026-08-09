/**
 * The docs' own glyphs. The package ships no icon dependency by design (§8 — icons are
 * ReactNode slots; the app installs its own set), and the docs hold themselves to the same
 * rule as everything else here: nothing third-party. Hand-drawn strokes on the 24 grid; the
 * icon box (--icon-size-N) does the sizing.
 *
 * The set grew past three the day the playground started showing real screens (2026-08-09):
 * a toolbar, a member row and a composer are made of glyphs, and drawing them with a plus
 * sign standing in for everything is the "forty cells all reading Button" mistake one layer
 * down — the composition stops being the thing under judgement.
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

export function CheckIcon() {
  return (
    <svg {...strokeProps}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg {...strokeProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg {...strokeProps}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M18 8a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
      <path d="M10.5 20a2 2 0 0 0 3 0" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg {...strokeProps}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );
}

export function ArrowUpIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M12 20V5M6 11l6-6 6 6" />
    </svg>
  );
}

export function PaperclipIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7.5-7.5" />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function FolderIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M3 7a1 1 0 0 1 1-1h5l2 2.5h8a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg {...strokeProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg {...strokeProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 7M17 15.5c2.5.5 4 2.1 4 4.5" />
    </svg>
  );
}
