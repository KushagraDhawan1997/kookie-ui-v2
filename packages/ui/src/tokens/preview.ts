/**
 * Emits preview/density.html: the size-by-density matrix. Twelve control heights across
 * three levels cannot be judged by reading a config file, and the numbers are taste, so
 * the matrix is the gate on correcting them (§12, open questions).
 *
 * The density matrix draws boxes from the tokens directly — a token preview should not
 * depend on a component. The layout section goes one layer up: the real resolver against
 * the shipped stylesheet, since the runner cannot parse JSX to mount the components
 * themselves (those are covered in the browser suite).
 *
 * Run: node --experimental-strip-types src/tokens/preview.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { inkLc, tones, type Mode, type ToneName } from "./color-config.ts";
import { buildScale, buildScaleFor, solveInkFade, toneFromColor, type Scale } from "./color.ts";

import { density, fontSize, lineHeight, radiusLevels, type DensityLevel } from "./config.ts";
import { ROLES } from "./generate.ts";
import { SIZES } from "../system/axes.ts";
import { tiers } from "../system/props.ts";

/** The tier boundaries in px, for the readout script: the rem values are authored in
    system/props.ts and a preview page has no rem context of its own at build time. */
const remPx = (rem: string): number => parseFloat(rem) * 16;

/** Sentence case for headings and labels built from token values ("solid" → "Solid").
    The page speaks in sentences; raw lowercase identifiers read as unfinished. */
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
import { resolveBoxProps, type BoxStyleProps } from "../system/resolve.ts";

/**
 * A Box the way the components make one: the REAL resolver emits the inline custom
 * properties, the shipped stylesheet arbitrates them. Only React itself is absent from this
 * page (the runner cannot parse JSX), so what the layout section proves is the whole
 * mechanism minus the element wrapper the browser suite already covers.
 */
function kuiBox(
  props: BoxStyleProps,
  body: string,
  opts: { container?: boolean } = {},
): string {
  const { style } = resolveBoxProps(props);
  const inline = Object.entries(style)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
  // Containment is opt-in since 2026-08-08 (§2), and this page bypasses the React component
  // that stamps the attribute — so the rigs must stamp it themselves or they measure nothing.
  // They did not, and the whole responsive section rendered one column at every width while
  // its own caption printed a tier (audit 2026-08-08): the exact symptom §2 records as
  // closed in 2026-08-02, reintroduced by the reversal on the one surface it did not open.
  const flag = opts.container ? " data-container" : "";
  return `<div class="kui-box"${flag} style="${inline}">${body}</div>`;
}

/**
 * A sweep of arbitrary brand hues, none of them shipped tones. This is where the one-law
 * thesis is actually visible: if a single generator handles yellow and navy without either
 * being hand-placed, the sweep reads as one family. Bright hues are the ones to distrust.
 */
const SWEEP: Array<[string, { hue: number; vividness: number; pinL?: number }]> = [
  ["yellow", { hue: 100, vividness: 1 }],
  // Full-vividness amber stays in the sweep as the hostile case it always was: the SHIPPED
  // amber tone is this hue at vividness 0.9 (color-config.ts — the cusp finding, 2026-08-05),
  // and the shipped-tone sections below render it. This row is the one the laws refuse.
  ["amber (v1.0, refused)", { hue: 80, vividness: 1 }],
  ["lime", { hue: 130, vividness: 1 }],
  ["green", { hue: 150, vividness: 1 }],
  ["teal", { hue: 175, vividness: 1 }],
  ["cyan", { hue: 195, vividness: 1 }],
  ["sky", { hue: 230, vividness: 1 }],
  ["blue", { hue: 250, vividness: 1 }],
  ["indigo", { hue: 267, vividness: 1 }],
  ["violet", { hue: 290, vividness: 1 }],
  ["magenta", { hue: 340, vividness: 1 }],
  ["red", { hue: 25, vividness: 1 }],
];

const TONES = Object.keys(tones) as ToneName[];

const EMPHASES = ["loud", "medium", "quiet"] as const;

/** The Spinner's markup, mirroring the component (this file cannot parse JSX). */
function spinner(style = ""): string {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const opacity = (1 - (i / 8) * 0.85).toFixed(2);
    return `<rect x="11" y="2" width="2" height="5.5" rx="1" opacity="${opacity}" transform="rotate(${i * 45} 12 12)"/>`;
  }).join("");
  return `<span aria-hidden class="kui-spinner"${style ? ` style="${style}"` : ""}><svg viewBox="0 0 24 24" class="kui-spinner-svg">${spokes}</svg></span>`;
}

/**
 * A Button as the component renders it: same classes, same data attributes, same stylesheet.
 * Written by hand here only because this file cannot parse JSX — the mounted component is
 * covered by the browser suite, and what this page is for is the eye.
 */
function button(
  attrs: {
    size?: string;
    tone?: string;
    emphasis?: string;
    bordered?: boolean;
    material?: string;
    loading?: boolean;
  },
  label: string,
): string {
  const { size = "2", tone = "neutral", emphasis = "medium", bordered, material, loading } = attrs;
  return `<button class="kui-control kui-button" data-size="${size}" data-tone="${tone}" data-emphasis="${emphasis}"${
    bordered ? ' data-bordered="true"' : ""
  }${material ? ` data-material="${material}"` : ""}${
    loading ? ' data-loading="true" aria-busy="true"' : ""
  }>${loading ? `<span data-slot="leading">${spinner()}</span>` : ""}${label}</button>`;
}

/**
 * The axis model in one grid: every tone against every rung, plain and bordered, plus the two
 * states. `bordered` is orthogonal (§10) — containment, not loudness — so it has to be legible
 * on all three rungs rather than only on the one it used to be shown with.
 */
function buttonMatrix(
  mode: Mode,
  tones: readonly string[] = TONES,
  heading: string = cap(mode),
): string {
  // No loud + border column: judged useless by eye (2026-08-03) — a step-7 border against a
  // solid step-9 fill has no containment job, the fill already separates itself (§10).
  const columns = EMPHASES.flatMap((e) => [
    { label: cap(e), emphasis: e, bordered: false },
    ...(e === "loud" ? [] : [{ label: `${cap(e)} + border`, emphasis: e, bordered: true }]),
  ]);
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${heading}</h2>
    <table class="axis-table">
      <thead><tr><th></th>${columns.map((c) => `<th>${c.label}</th>`).join("")}<th>Disabled</th><th>Loading</th></tr></thead>
      <tbody>
      ${tones
        .map(
          (tone) => `<tr>
          <th>${cap(tone)}</th>
          ${columns
            .map(
              (c) =>
                `<td>${button({ tone, emphasis: c.emphasis, bordered: c.bordered }, "Label")}</td>`,
            )
            .join("")}
          <td><button class="kui-control kui-button" data-size="2" data-tone="${tone}" data-emphasis="medium" data-disabled disabled>Label</button></td>
          <td>${button({ tone, emphasis: "medium", loading: true }, "Saving")}</td>
        </tr>`,
        )
        .join("")}
      </tbody>
    </table>
  </section>`;
}

/**
 * The same grid under a different brand accent, to answer the question the token preview
 * cannot: does an arbitrary hue survive being a *control* — every rung, every state, both
 * modes — or only look right as a swatch?
 *
 * The accent family is overridden on a wrapper; because `[data-tone="accent"]` resolves
 * `--tone-*` at the button, which sits below, the buttons inside simply pick it up. That is
 * §7's rebindable-accent claim doing real work rather than being asserted.
 */
/** One role, one literal value off a built Scale — the swap's half of the generator's ROLES
 * contract. Exhaustive over the union: the hand-kept ten-name list this replaces had already
 * drifted (a swapped brand accent kept the theme's ink ladder and alpha fill), and a role
 * added to ROLES now fails compilation here until the swap can express it. */
function roleValue(s: Scale, role: (typeof ROLES)[number], mode: Mode): string {
  switch (role) {
    case "soft": return s.steps[2]!;
    case "soft-hover": return s.steps[3]!;
    case "soft-active": return s.steps[4]!;
    case "soft-solid": return s.steps[mode === "dark" ? 3 : 2]!;
    case "soft-hover-solid": return s.steps[mode === "dark" ? 4 : 3]!;
    case "soft-active-solid": return s.steps[mode === "dark" ? 5 : 4]!;
    case "solid": return s.solid;
    case "solid-hover": return s.solidHover;
    case "solid-active": return s.solidActive;
    case "border": return s.steps[6]!;
    case "text": return s.steps[10]!;
    case "label": return s.label;
    case "contrast": return s.contrast;
    // A chroma family's inks: the one designed text colour, then the fade (§7, §15) — the
    // mix spelled from the same config number the generator reads.
    case "ink": return s.steps[10]!;
    case "ink-muted": return `color-mix(in oklab, ${s.steps[10]!} ${solveInkFade(s.steps[10]!, mode, inkLc.muted)}%, transparent)`;
    case "ink-faint": return `color-mix(in oklab, ${s.steps[10]!} ${solveInkFade(s.steps[10]!, mode, inkLc.faint)}%, transparent)`;
    case "a3": return s.alpha[2]!;
    default: {
      const unmapped: never = role;
      throw new Error(`accentSwap cannot express role: ${String(unmapped)}`);
    }
  }
}

function accentSwap(name: string, hex: string, mode: Mode): string {
  const t = toneFromColor(hex);
  const vars = (s: Scale) => ROLES.map((r) => `--accent-${r}: ${roleValue(s, r, mode)}`).join("; ");
  // Class rules rather than an inline style: a baked inline value is unreachable by the
  // page-wide contrast toggle, which made these blocks the one place contrast="high"
  // silently did nothing. The high variant is baked beside the normal one instead.
  const cls = `swap-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${mode}`;
  // The second selector is load-bearing: custom properties resolve from the NEAREST ancestor,
  // and the dark section carries data-appearance="dark", where tokens.css re-declares the
  // whole theme accent family — closer than this wrapper, so a wrapper-only rule loses and
  // every dark block silently rendered theme violet. Re-asserting below the appearance
  // boundary is exactly what a nested Theme with its own accent would do.
  return `<style>
    .${cls}, .${cls} [data-appearance] { ${vars(buildScaleFor(t, mode))} }
    :root[data-contrast="high"] .${cls}, :root[data-contrast="high"] .${cls} [data-appearance] { ${vars(buildScaleFor(t, mode, "srgb", "high"))} }
  </style><div class="${cls}">${buttonMatrix(mode, ["accent"], `${name} — ${hex} — ${cap(mode)}`)}</div>`;
}

/** The static markup Text and Heading produce (§15) — the type layer resolves the rest. */
function text(size: number, body: string, weight = "regular", emphasis = "loud", tone = ""): string {
  return `<span class="kui-type kui-text" data-size="${size}" data-weight="${weight}" data-emphasis="${emphasis}"${tone ? ` data-tone="${tone}"` : ""}>${body}</span>`;
}

/**
 * The ramp worn by its consumers (§15): nine paired steps, four weights, and the invariance
 * that defines the axis — flip the density select above and every gap on this page moves
 * while the type holds its step.
 */
function typeSection(): string {
  const anno = `style="font-family: var(--font-mono); font-size: var(--font-size-1); color: var(--neutral-10); flex: none; width: 96px"`;
  const ramp = [9, 8, 7, 6, 5, 4, 3, 2, 1]
    .map((s) =>
      kuiBox(
        { display: "flex", gap: "4", align: "baseline" },
        `<span ${anno} data-ramp-step="${s}">${s} — ${fontSize[s - 1]}/${lineHeight[s - 1]}</span>${text(s, "The quick brown fox jumps over the lazy dog")}`,
      ),
    )
    .join("");
  const weights = kuiBox(
    { display: "flex", gap: "5", align: "baseline" },
    ["regular", "medium", "semibold", "bold"].map((w) => text(3, cap(w), w)).join(""),
  );
  // The composition a block would build: Heading and Text in one Card, sharing the ramp.
  const specimen = card(
    kuiBox(
      { display: "flex", direction: "column", gap: "4" },
      kuiBox(
        { display: "flex", direction: "column", gap: "2" },
        `<h2 class="kui-type kui-heading" data-size="6" data-weight="semibold" data-emphasis="loud">One ramp, two consumers</h2>${text(
          3,
          "Heading and Text share the size index and the paired scales; only the family slot and the resting weight differ. Neither carries a tone — this paragraph is reading the surface's foreground context.",
        )}${text(2, "The muted aside is emphasis, one rung down the same ladder.", "regular", "medium")}`,
      ) + kuiBox({ display: "flex", gap: "3" }, `${button({ tone: "accent", emphasis: "loud" }, "Continue")}${button({}, "Cancel")}`),
    ),
    "max-width: 560px",
  );
  const ladder = kuiBox(
    { display: "flex", direction: "column", gap: "2" },
    `${text(3, "Loud is the resting state: body copy reads at full contrast.")}${text(
      3,
      "Medium is the muted role — descriptions, asides, secondary lines.",
      "regular",
      "medium",
    )}${text(3, "Quiet is faint by design: a timestamp, a placeholder — never a paragraph.", "regular", "quiet")}`,
  );
  // The ink ladders (§7, §15): a chroma family's loud rung is its one designed text colour;
  // the lower rungs fade the ink. Neutral's are designed steps. Mix values are v0. Iterates
  // the config so a family added there shows up here without anyone remembering to add it.
  const inks = Object.keys(tones)
    .filter((t) => t !== "neutral")
    .map((tone) =>
      kuiBox(
        { display: "flex", gap: "5", align: "baseline" },
        ["loud", "medium", "quiet"]
          .map((e) => text(3, `${cap(tone)} ${e}`, "regular", e, tone))
          .join(""),
      ),
    )
    .join("");
  return (
    kuiBox({ display: "flex", direction: "column", gap: "6", align: "stretch" }, ramp) +
    `<p class="note">The four weights, at the anchor step — token names, never numbers (§15).</p>` +
    weights +
    `<p class="note">The emphasis ladder, resolved for type (§9, §15): the same axis controls resolve as fills and surfaces as dressing lands here as foreground roles — loud reads text, medium muted, quiet faint. Text rests loud, the inversion of the control default: full contrast is the accessible resting state for reading.</p>` +
    ladder +
    `<p class="note">Tone re-scopes the ladder onto the family's ink trio (§7): loud is the family's one designed text colour — an error reads red, not near-black — and the lower rungs fade the ink, since a chroma scale's steps below the text step are solid fills, more vivid rather than less. Mix values are v0, judged here.</p>` +
    kuiBox({ display: "flex", direction: "column", gap: "2" }, inks) +
    `<p class="note">The composition a block would build.</p>` +
    specimen
  );
}

/** The static markup Card produces (LOG 2026-08-04): a shell — identity, not options. */
/** The markup TextField renders (§4): the wrapper is the control, the input is bare. */
function field(
  attrs: {
    size?: string;
    material?: string;
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    invalid?: boolean;
    leading?: string;
    trailing?: string;
    style?: string;
  } = {},
): string {
  const { size = "2", material, placeholder = "", value, disabled, invalid, leading, trailing, style } = attrs;
  const slot = (content: string, which: string) =>
    `<span class="kui-field-slot" data-slot="${which}">${content}</span>`;
  return `<span class="kui-control kui-field" data-size="${size}" data-tone="neutral" data-bordered${
    material ? ` data-material="${material}"` : ""
  }${disabled ? " data-disabled" : ""}${style ? ` style="${style}"` : ""}>${
    leading ? slot(leading, "leading") : ""
  }<input class="kui-field-input" placeholder="${placeholder}"${value ? ` value="${value}"` : ""}${
    disabled ? " disabled" : ""
  }${invalid ? ' aria-invalid="true"' : ""}/>${trailing ? slot(trailing, "trailing") : ""}</span>`;
}

/** A magnifier, drawn inline: the preview has no icon set and the box is what matters. */
const GLYPH =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

function fieldSection(mode: Mode): string {
  const demo = (title: string, body: string) =>
    kuiBox({ display: "flex", direction: "column", gap: "4" }, `<h3>${title}</h3>${body}`);
  const row = (body: string) =>
    kuiBox({ display: "flex", gap: "5", align: "flex-start", wrap: "wrap" }, body);
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${cap(mode)}</h2>
    ${kuiBox(
      { display: "flex", direction: "column", gap: "7" },
      demo(
        "The size index — one join, shared with every control <code>\u00a74</code>",
        row(SIZES.map((n) => field({ size: n, placeholder: `Size ${n}` })).join("")),
      ) +
        demo(
          "States — the border carries them; the fill never moves <code>\u00a78</code>",
          row(
            [
              field({ placeholder: "Rest" }),
              field({ value: "Typed" }),
              field({ placeholder: "Invalid", invalid: true }),
              field({ placeholder: "Disabled", disabled: true }),
            ].join(""),
          ),
        ) +
        demo(
          "Slots — forced anatomy, because the border moved to the wrapper <code>\u00a710</code>",
          row(
            [
              field({ leading: GLYPH, placeholder: "Search" }),
              field({ leading: "<span>$</span>", placeholder: "0.00" }),
              field({ placeholder: "Password", trailing: button({ size: "1" }, "Show") }),
              field({ size: "3", leading: GLYPH, placeholder: "Search", trailing: button({ size: "2", emphasis: "quiet" }, "Clear") }),
            ].join(""),
          ),
        ) +
        demo(
          "Material — the same seal, made glass, with no CSS of its own <code>\u00a710</code>",
          `<div style="background: url('backdrop.jpg') center / cover no-repeat, linear-gradient(115deg, #841e57, #144e68 55%, #1db954); border-radius: var(--radius-surface-3);">${kuiBox(
            { display: "flex", gap: "5", wrap: "wrap", p: "7" },
            ["thin", "regular", "thick"]
              .map((m) => field({ material: m, leading: GLYPH, placeholder: cap(m) }))
              .join(""),
          )}</div>`,
        ),
    )}
  </section>`;
}

/** The markup TextArea renders (§4): ONE element — the field family without the wrapper. */
function textarea(
  attrs: {
    size?: string;
    material?: string;
    placeholder?: string;
    value?: string;
    rows?: number;
    disabled?: boolean;
    invalid?: boolean;
    readonly?: boolean;
    style?: string;
  } = {},
): string {
  const { size = "2", material, placeholder = "", value, rows, disabled, invalid, readonly, style } = attrs;
  return `<textarea class="kui-control kui-textarea" data-size="${size}" data-tone="neutral" data-bordered${
    material ? ` data-material="${material}"` : ""
  }${rows ? ` rows="${rows}"` : ""}${disabled ? " disabled" : ""}${readonly ? " readonly" : ""}${
    invalid ? ' aria-invalid="true"' : ""
  } placeholder="${placeholder}"${style ? ` style="${style}"` : ""}>${value ?? ""}</textarea>`;
}

function textAreaSection(mode: Mode): string {
  const demo = (title: string, body: string) =>
    kuiBox({ display: "flex", direction: "column", gap: "4" }, `<h3>${title}</h3>${body}`);
  const row = (body: string) =>
    kuiBox({ display: "flex", gap: "5", align: "flex-start", wrap: "wrap" }, body);
  const LOREM = "The quick brown fox jumps over the lazy dog, then does it again with feeling.";
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${cap(mode)}</h2>
    ${kuiBox(
      { display: "flex", direction: "column", gap: "7" },
      demo(
        "The size index — padding is the dimension, one inset on all four sides <code>§4</code>",
        row(
          SIZES.map((n) =>
            [
              field({ size: n, placeholder: `Field ${n}` }),
              textarea({ size: n, rows: 3, placeholder: `Size ${n}` }),
            ].join(""),
          ).join(""),
        ),
      ) +
        demo(
          "States — the same family, keyed on the one element there is <code>§8</code>",
          row(
            [
              textarea({ rows: 3, placeholder: "Rest" }),
              textarea({ rows: 3, value: LOREM }),
              textarea({ rows: 3, placeholder: "Invalid", invalid: true }),
              textarea({ rows: 3, placeholder: "Disabled", disabled: true }),
              textarea({ rows: 3, value: "Read-only — the well is gone", readonly: true }),
            ].join(""),
          ),
        ) +
        demo(
          "Material — the seal made glass, no CSS of its own <code>§10</code>",
          `<div style="background: url('backdrop.jpg') center / cover no-repeat, linear-gradient(115deg, #841e57, #144e68 55%, #1db954); border-radius: var(--radius-surface-3);">${kuiBox(
            { display: "flex", gap: "5", wrap: "wrap", p: "7" },
            ["thin", "regular", "thick"].map((m) => textarea({ material: m, rows: 3, placeholder: cap(m) })).join(""),
          )}</div>`,
        ),
    )}
  </section>`;
}

function checkbox(
  attrs: {
    size?: string;
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    label?: string;
  } = {},
): string {
  const { size = "2", checked, indeterminate, disabled, invalid, label } = attrs;
  const state = indeterminate ? " data-indeterminate" : checked ? " data-checked" : " data-unchecked";
  const glyph = `<svg viewBox="0 0 16 16" fill="none"${state} aria-hidden="true"><path class="kui-checkbox-check" d="M4 8.5 6.75 11.25 12 5.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path class="kui-checkbox-dash" d="M4.25 8h7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const box = `<span class="kui-control kui-mark kui-checkbox" data-size="${size}" data-tone="accent" data-bordered${
    indeterminate ? " data-indeterminate" : checked ? " data-checked" : ""
  }${disabled ? " data-disabled" : ""}${invalid ? ' aria-invalid="true"' : ""} role="checkbox">${glyph}</span>`;
  // The label is a SIBLING, never children: a mark sits beside its label, and the row that
  // owns them both is what spaces them (the non-negotiable). Judge the alignment here — the
  // mark is one line box, so its top edge should sit exactly on the label's.
  return label
    ? kuiBox(
        { display: "flex", gap: "3", align: "flex-start", flexShrink: "0" },
        `${box}${text(Number(size), label)}`,
      )
    : box;
}

function checkboxSection(mode: Mode): string {
  const demo = (title: string, body: string) =>
    kuiBox({ display: "flex", direction: "column", gap: "4" }, `<h3>${title}</h3>${body}`);
  // A GRID with definite tracks, not a flex row. This began as the workaround for the
  // blanket-containment defect (every .kui-box was a query container and collapsed to zero
  // as a flex-row item); containment went opt-in 2026-08-08 (§2, the `container` prop) and a
  // flex row would render fine now — the grid simply remains the better rig for a matrix.
  const row = (body: string) =>
    kuiBox({ display: "grid", columns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "5" }, body);
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${cap(mode)}</h2>
    ${kuiBox(
      { display: "flex", direction: "column", gap: "7" },
      demo(
        "The size index — one line of the label it sits beside, never the height ladder <code>\u00a74</code>",
        row(SIZES.map((n) => checkbox({ size: n, checked: true, label: `Size ${n}` })).join("")),
      ) +
        demo(
          "States — neutral off, accent on; indeterminate is a third meaning, not a faded tick <code>\u00a711</code>",
          row(
            [
              checkbox({ label: "Off" }),
              checkbox({ checked: true, label: "On" }),
              checkbox({ indeterminate: true, label: "Mixed" }),
              checkbox({ invalid: true, label: "Invalid" }),
              checkbox({ disabled: true, label: "Disabled" }),
              checkbox({ checked: true, disabled: true, label: "On + disabled" }),
            ].join(""),
          ),
        ) +
        demo(
          "Hosted in a field's slot — it stays square, and the field's rule owns the target <code>\u00a74</code>",
          row(
            field({ size: "2", placeholder: "Notify me", trailing: checkbox({ size: "2", checked: true }) }) +
              field({ size: "3", placeholder: "Remember", trailing: checkbox({ size: "3" }) }),
          ),
        ) +
        demo(
          "A stacked list — marks need 12px of air, and this gap holds it at every density <code>\u00a74</code>",
          kuiBox(
            // gap 5, not 4: the rule is 12 REAL pixels between stacked marks, and the compact
            // density resolves gap 4 to 8px. Step 5 is the smallest index that clears the rule
            // at all three densities (12 / 16 / 24).
            { display: "flex", direction: "column", gap: "5" },
            ["Ship it on Friday", "Notify the team", "Archive the old branch"]
              .map((l, i) => checkbox({ checked: i === 0, label: l }))
              .join(""),
          ),
        ),
    )}
  </section>`;
}

function radio(
  attrs: {
    size?: string;
    checked?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    label?: string;
  } = {},
): string {
  const { size = "2", checked, disabled, invalid, label } = attrs;
  const state = checked ? " data-checked" : " data-unchecked";
  const glyph = `<svg viewBox="0 0 16 16" fill="none"${state} aria-hidden="true"><circle cx="8" cy="8" r="3.5" fill="currentColor"/></svg>`;
  const box = `<span class="kui-control kui-mark kui-radio" data-size="${size}" data-tone="accent" data-bordered${
    checked ? " data-checked" : ""
  }${disabled ? " data-disabled" : ""}${invalid ? ' aria-invalid="true"' : ""} role="radio">${glyph}</span>`;
  return label
    ? kuiBox(
        { display: "flex", gap: "3", align: "flex-start", flexShrink: "0" },
        `${box}${text(Number(size), label)}`,
      )
    : box;
}

function radioSection(mode: Mode): string {
  const demo = (title: string, body: string) =>
    kuiBox({ display: "flex", direction: "column", gap: "4" }, `<h3>${title}</h3>${body}`);
  const row = (body: string) =>
    kuiBox({ display: "grid", columns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "5" }, body);
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${cap(mode)}</h2>
    ${kuiBox(
      { display: "flex", direction: "column", gap: "7" },
      demo(
        "The size index — the checkbox's box exactly, worn as a circle <code>§4 §6</code>",
        row(SIZES.map((n) => radio({ size: n, checked: true, label: `Size ${n}` })).join("")),
      ) +
        demo(
          "States — the family identity, resolved by the shared layer <code>§11</code>",
          row(
            [
              radio({ label: "Off" }),
              radio({ checked: true, label: "On" }),
              radio({ invalid: true, label: "Invalid" }),
              radio({ disabled: true, label: "Disabled" }),
              radio({ checked: true, disabled: true, label: "On + disabled" }),
            ].join(""),
          ),
        ) +
        demo(
          "A group — one value, and the circle holds at every radius level: flip the select",
          kuiBox(
            { display: "flex", direction: "column", gap: "5" },
            ["Starter", "Pro", "Enterprise"]
              .map((l, i) => radio({ checked: i === 1, label: l }))
              .join(""),
          ),
        ),
    )}
  </section>`;
}

function slider(
  attrs: { size?: string; value?: number; disabled?: boolean; width?: string } = {},
): string {
  const { size = "2", value = 40, disabled, width = "220px" } = attrs;
  // Static stand-in for Base UI's inline geometry (edge alignment: the handle's extremes sit
  // flush with the rail's ends), so the page judges the dress the shipped component wears.
  const thumb = `<div class="kui-mark kui-slider-thumb" style="position: absolute; inset-inline-start: calc(${value} * (100% - var(--kui-ct-mark)) / 100); top: 50%; translate: 0 -50%"></div>`;
  const fill = `<div class="kui-slider-fill" style="width: ${value}%"></div>`;
  return `<div class="kui-control kui-slider" data-size="${size}" data-tone="accent"${
    disabled ? " data-disabled" : ""
  } style="width: ${width}" role="slider" aria-valuenow="${value}"><div class="kui-slider-control"><div class="kui-slider-track">${fill}${thumb}</div></div></div>`;
}

function sliderSection(mode: Mode): string {
  const demo = (title: string, body: string) =>
    kuiBox({ display: "flex", direction: "column", gap: "4" }, `<h3>${title}</h3>${body}`);
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${cap(mode)}</h2>
    ${kuiBox(
      { display: "flex", direction: "column", gap: "7" },
      demo(
        "The size index — the root rides the height ladder, the thumb the mark ladder, the track its own <code>§4</code>",
        kuiBox(
          { display: "flex", direction: "column", gap: "5" },
          SIZES.map((n) => slider({ size: n, value: 25 + Number(n) * 12 })).join(""),
        ),
      ) +
        demo(
          "States — track low, fill accent; disabled greys through the one remap <code>§11</code>",
          kuiBox(
            { display: "flex", direction: "column", gap: "5" },
            [
              slider({ value: 15 }),
              slider({ value: 65 }),
              slider({ value: 95 }),
              slider({ value: 50, disabled: true }),
            ].join(""),
          ),
        ) +
        demo(
          "Beside its family — one weight class: the handle is the checkbox's box <code>§4</code>",
          kuiBox(
            { display: "flex", gap: "5", align: "center" },
            checkbox({ size: "2", checked: true }) + radio({ size: "2", checked: true }) + slider({ size: "2", value: 60 }),
          ),
        ),
    )}
  </section>`;
}

function kswitch(
  attrs: { size?: string; checked?: boolean; disabled?: boolean; invalid?: boolean; label?: string } = {},
): string {
  const { size = "2", checked, disabled, invalid, label } = attrs;
  const state = checked ? " data-checked" : " data-unchecked";
  const thumb = `<span class="kui-switch-thumb"${state}${disabled ? " data-disabled" : ""}></span>`;
  const box = `<span class="kui-control kui-mark kui-switch" data-size="${size}" data-tone="accent" data-bordered${state}${
    disabled ? " data-disabled" : ""
  }${invalid ? ' aria-invalid="true"' : ""} role="switch">${thumb}</span>`;
  return label
    ? kuiBox(
        { display: "flex", gap: "3", align: "flex-start", flexShrink: "0" },
        `${box}${text(Number(size), label)}`,
      )
    : box;
}

function switchSection(mode: Mode): string {
  const demo = (title: string, body: string) =>
    kuiBox({ display: "flex", direction: "column", gap: "4" }, `<h3>${title}</h3>${body}`);
  const row = (body: string) =>
    kuiBox({ display: "grid", columns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "5" }, body);
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${cap(mode)}</h2>
    ${kuiBox(
      { display: "flex", direction: "column", gap: "7" },
      demo(
        "The size index — the track is mark(n + 1); judge the width ladder here, it is v0 <code>§4</code>",
        row(SIZES.map((n) => kswitch({ size: n, checked: true, label: `Size ${n}` })).join("")),
      ) +
        demo(
          "States — off is the track well, on the accent identity; the grip never tints <code>§11</code>",
          row(
            [
              kswitch({ label: "Off" }),
              kswitch({ checked: true, label: "On" }),
              kswitch({ invalid: true, label: "Invalid" }),
              kswitch({ disabled: true, label: "Disabled" }),
              kswitch({ checked: true, disabled: true, label: "On + disabled" }),
            ].join(""),
          ),
        ) +
        demo(
          "Beside its family — one index up: switch(n) stands level with checkbox(n + 1), and the capsule holds at every radius level (flip the select; under coarse, size 4 stands level with its own checkbox — the band's collapse, §4)",
          kuiBox(
            { display: "flex", gap: "5", align: "center" },
            kswitch({ size: "1", checked: true }) + checkbox({ size: "2", checked: true }) + kswitch({ size: "2" }) + radio({ size: "2", checked: true }),
          ),
        ),
    )}
  </section>`;
}

function card(body: string, style = "", material?: string, size = "3"): string {
  return `<div class="kui-surface kui-card" data-size="${size}" data-tone="neutral" data-emphasis="quiet" data-bordered${
    material ? ` data-material="${material}"` : ""
  }${style ? ` style="${style}"` : ""}>${body}</div>`;
}

/**
 * The shell, one mode per block (\u00a710): the seal judged against the page, the padding
 * index, and the material recipes over a deliberately hostile backdrop. No variants to show,
 * which is the point - everything a Card can be is on this screen.
 */
function surfaceSection(mode: Mode): string {
  const muted = `style="color: var(--color-text-muted)"`;
  // Card content is a Stack, never margins: the same rule the system enforces on consumers
  // (components never own outer spacing) has to hold in its own demos — these ARE the docs.
  // Title + description are one text group, coupled tighter than the group sits to the
  // actions — two nested Stacks, the way a block would compose it. Never margins.
  const textGroup = (title: string, desc: string) =>
    kuiBox(
      { display: "flex", direction: "column", gap: "2" },
      `<strong>${title}</strong><div ${muted}>${desc}</div>`,
    );
  // Stacks stretch (the default), which is what fills the card. It is no longer load-bearing:
  // containment went opt-in 2026-08-08 (§2, the `container` prop), so a plain kui-box hugs its
  // content in a shrink-to-fit context instead of collapsing.
  const cardBody = (title: string, desc: string, buttons: string) =>
    kuiBox(
      { display: "flex", direction: "column", gap: "4" },
      `${textGroup(title, desc)}${kuiBox({ display: "flex", gap: "3" }, buttons)}`,
    );
  const shell = card(
    cardBody(
      "The shell",
      "Opaque --color-surface over the page; the border is the edge. Translucency is material's job alone.",
      `${button({ tone: "accent", emphasis: "loud" }, "Action")}${button({}, "Action")}`,
    ),
    "max-width: 420px",
  );
  const sizes = ["1", "2", "3", "4"]
    .map((n) => card(`Size ${n}`, "flex: 1", undefined, n))
    .join("");
  const materials = ["solid", "thin", "regular", "thick"]
    .map((m) =>
      card(
        cardBody(
          cap(m),
          "Does the label survive?",
          `${button({ tone: "accent", emphasis: "loud" }, "Label")}${button({}, "Label")}`,
        ),
        "flex: 1; min-width: 180px",
        m === "solid" ? undefined : m,
      ),
    )
    .join("");
  // A real photo (repo asset beside the emitted html, never published — only dist/ ships),
  // with the gradient collage as the fallback layer if the file is missing. The backdrop div
  // is a demo escape (background + radius via style); the cards inside sit in a real Box.
  const hostile =
    "background: url('backdrop.jpg') center / cover no-repeat," +
    " linear-gradient(115deg, #841e57, #144e68 55%, #1db954);" +
    " border-radius: var(--radius-surface-3);";
  const demo = (title: string, body: string) =>
    kuiBox({ display: "flex", direction: "column", gap: "4", align: "stretch" }, `<h3>${title}</h3>${body}`);
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${cap(mode)}</h2>
    ${kuiBox(
      { display: "flex", direction: "column", gap: "7" },
      demo("The seal — paper above the page <code>\u00a710</code>", shell) +
        demo(
          "The padding index, and the corner it carries <code>\u00a74 \u00a76</code>",
          kuiBox({ display: "flex", gap: "5", align: "flex-start" }, sizes),
        ) +
        demo(
          "Card as button — render a button, the surface notices <code>\u00a710</code>",
          `<button class="kui-surface kui-card" data-size="3" data-tone="neutral" data-emphasis="quiet" data-bordered style="max-width: 420px; width: 100%; display: block">${textGroup(
            "Open project",
            "The whole card is one button: hover washes the seal, press steps again, keyboard gets the one ring.",
          )}</button>`,
        ) +
        demo(
          "The dress — a plain card holding dressed fields and marks, the one resting state since the look axis died (surfaceLook 2026-08-20) <code>\u00a719</code>",
          card(
            kuiBox(
              { display: "flex", direction: "column", gap: "4" },
              `${field({ placeholder: "Email" })}${textarea({ placeholder: "Message" })}${kuiBox(
                // A GRID with definite tracks, not a flex row — a layout choice now, not a
                // workaround. It began as the blanket-containment workaround the checkbox
                // section records; containment went opt-in 2026-08-08 (§2, the `container`
                // prop), these boxes are plain, and a flex row would render fine. All three
                // mark members sit here on purpose: one shared rule dresses them, so a
                // divergence shows up in this row first.
                { display: "grid", columns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "3" },
                `${checkbox({ label: "Remember" })}${radio({ label: "Daily" })}${radio({ checked: true, label: "Weekly" })}`,
              )}${slider({ width: "100%" })}${kuiBox(
                { display: "grid", columns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "3" },
                `${button({ tone: "accent", emphasis: "loud" }, "Send")}${button({ bordered: true }, "Cancel")}`,
              )}`,
            ),
          ),
        ) +
        demo(
          "The shadow palette — a resource; only the elevated world and escapes reach it <code>\u00a713</code>",
          kuiBox(
            { display: "flex", gap: "6", align: "flex-start" },
            ["1", "2", "3", "4", "5"]
              .map(
                (n) =>
                  `<div style="flex: 1; background: var(--color-surface); border: 1px solid var(--neutral-4); border-radius: var(--radius-surface-3); padding: var(--space-6); box-shadow: var(--shadow-${n})">Shadow ${n}${n === "1" ? " — the well" : n === "2" ? " — the control" : n === "3" ? " — the card" : ""}</div>`,
              )
              .join(""),
          ),
        ) +
        demo(
          "Material over a hostile backdrop — v0 recipes <code>\u00a710</code>",
          `<div style="${hostile}">${kuiBox({ display: "flex", gap: "5", wrap: "wrap", p: "7" }, materials)}</div>`,
        ) +
        demo(
          "The same cards in an elevated world — the pane's own chrome wins on the element <code>\u00a710</code>",
          `<div data-depth="elevated"><div style="${hostile}">${kuiBox({ display: "flex", gap: "5", wrap: "wrap", p: "7" }, materials)}</div></div>`,
        ) +
        demo(
          "Material on a control — a fill modifier: tone and loudness survive the glass <code>\u00a710 \u00a711</code>",
          `<div style="${hostile}">${kuiBox(
            { display: "flex", direction: "column", gap: "4", align: "flex-start", p: "7" },
            kuiBox(
              { display: "flex", gap: "3", wrap: "wrap" },
              ["solid", "thin", "regular", "thick"]
                .map((m) => button(m === "solid" ? {} : { material: m }, cap(m)))
                .join(""),
            ) +
              kuiBox(
                { display: "flex", gap: "3", wrap: "wrap" },
                button({ material: "regular", tone: "accent", emphasis: "loud" }, "Loud accent") +
                  button({ material: "regular", tone: "destructive", emphasis: "loud" }, "Loud destructive") +
                  button({ material: "regular", tone: "accent" }, "Medium accent") +
                  button({ material: "regular", emphasis: "quiet" }, "Quiet — bare blur") +
                  button({ material: "regular", bordered: true }, "Bordered"),
              ),
          )}</div>`,
        ),
    )}
  </section>`;
}

const swatch = (bg: string, title: string, label = "") =>
  `<div class="sw" title="${title}" style="background:${bg}">${label}</div>`;

/** Steps and the roles that read them. Rendered twice per scale: normal, then contrast=high. */
function stepsAndRoles(tone: string, s: Scale, withAlpha: boolean): string {
  return `
      <div class="row">${s.steps.map((hex, i) => swatch(hex, `${tone}-${i + 1} ${hex}`, String(i + 1))).join("")}</div>
      ${withAlpha ? `<div class="row">${s.alpha.map((v, i) => swatch(v, `${tone}-a${i + 1}`)).join("")}</div>` : ""}
      <div class="row roles">
        ${[
          ["solid", s.solid],
          ["hover", s.solidHover],
          ["active", s.solidActive],
        ]
          .map(([n, hex]) => `<div class="role" style="background:${hex};color:${s.contrast}">${n}</div>`)
          .join("")}
        <div class="role" style="background:${s.steps[2]};color:${s.label}">label on 3</div>
        <div class="role" style="background:${s.steps[4]};color:${s.label}">label on 5</div>
        <div class="role" style="background:${s.steps[2]};color:${s.steps[10]}">text on 3</div>
      </div>`;
}

/**
 * One scale at full depth, with its high-contrast variant directly beneath it. The swatches
 * are generator output rather than `var()` references, so the two states have to be rendered
 * side by side — a page-wide toggle cannot reach a baked value.
 */
function scaleRow(tone: string, normal: Scale, high: Scale): string {
  return `
    <div class="scale">
      <h3>${tone}${normal.isLowChroma ? ' <em>Low chroma — solid takes step 12</em>' : ""}</h3>
      ${stepsAndRoles(tone, normal, true)}
      <div class="hc-label">contrast="high"</div>
      ${stepsAndRoles(tone, high, false)}
    </div>`;
}

function colorSection(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${cap(mode)}</h2>
    ${TONES.map((t) => scaleRow(cap(t), buildScale(t, mode), buildScale(t, mode, "srgb", "high"))).join("")}
  </section>`;
}

/**
 * The role layer written out: what each token resolves to and what consumes it. Components
 * only ever touch this column, never the numbered steps (§7). The rows DERIVE from the
 * generator's own ROLES list — the hand-kept copy this replaces was already lying (the ink
 * trio shipped 2026-08-04 and never appeared here). Annotating a role is still hand work;
 * FORGETTING one is now a type error, which is the difference that matters.
 */
const ROLE_NOTES: Record<(typeof ROLES)[number], [string, string]> = {
  soft: ["step 3", "medium emphasis, resting fill"],
  "soft-hover": ["step 4", "medium emphasis, hover (+1 step)"],
  "soft-active": ["step 5", "medium emphasis, pressed (+2 steps)"],
  "soft-solid": ["step 3, opaque", "the trio's opaque twin — glass re-points here (2026-08-19)"],
  "soft-hover-solid": ["step 4, opaque", "hover twin, glass only"],
  "soft-active-solid": ["step 5, opaque", "pressed twin, glass only"],
  border: ["step 7", "the bordered boolean, separators"],
  solid: ["step 9, or step 12 when low chroma", "loud emphasis, resting fill"],
  "solid-hover": ["generated, away from the label", "loud emphasis, hover"],
  "solid-active": ["generated, away from the label", "loud emphasis, pressed"],
  contrast: ["white or black, chosen by APCA", "the label ON a loud fill"],
  text: ["step 11", "links and prose on a tint"],
  label: ["generated between 11 and 12", "control labels — a label is not a link"],
  ink: ["step 12 (neutral) or step 11 (chroma)", "loud type — the rung's per-family text"],
  "ink-muted": ["step 11, or the ink faded to 74%", "medium type on a chosen tone"],
  "ink-faint": ["step 10, or the ink faded to 52%", "quiet type — timestamps, placeholders"],
  a3: ["step 3 as alpha over the page", "the tone-forward surface fill (Notice)"],
};

const ROLE_MAP: Array<[string, string, string]> = [
  ["--tone-1, -2", "steps 1-2", "page and app backgrounds"],
  ...ROLES.map(
    (r): [string, string, string] => [`--tone-${r}`, ...ROLE_NOTES[r]],
  ),
  ["--tone-a1 … -a12", "each step as alpha over the page", "nested surfaces, fills over media"],
];

/** What `contrast="high"` rewrites, and what it deliberately leaves alone (§7). */
const CONTRAST_MAP: Array<[string, string]> = [
  ["steps 6-8 (borders)", "pushed toward the extreme, so an edge separates harder"],
  ["steps 11-12 (text)", "pushed toward the extreme"],
  ["--tone-label", "follows the text band; must clear Lc 75, not 60"],
  ["--tone-solid-hover / -active", "spread widened 1.6x so states stay distinguishable"],
  ["--tone-solid (chromatic)", "untouched — that value is the brand colour"],
  ["--tone-solid (low chroma)", "deepens: it reads step 12, and a grey has no hue to protect"],
  ["steps 1-5, alpha ramp", "untouched"],
];

function roleMap(): string {
  const s = buildScale("accent", "light");
  const sample: Record<string, string> = {
    "--tone-soft": s.steps[2]!,
    "--tone-soft-hover": s.steps[3]!,
    "--tone-soft-active": s.steps[4]!,
    "--tone-border": s.steps[6]!,
    "--tone-solid": s.solid,
    "--tone-solid-hover": s.solidHover,
    "--tone-solid-active": s.solidActive,
    "--tone-contrast": s.contrast,
    "--tone-text": s.steps[10]!,
    "--tone-label": s.label,
  };
  return `<table class="roles-table">
    <thead><tr><th></th><th>Token</th><th>Resolves to</th><th>Consumed by</th></tr></thead>
    <tbody>${ROLE_MAP.map(
      ([token, resolves, used]) =>
        `<tr><td>${sample[token] ? `<span class="chip" style="background:${sample[token]}"></span>` : ""}</td>
          <td><code>${token}</code></td><td>${resolves}</td><td>${used}</td></tr>`,
    ).join("")}</tbody>
  </table>`;
}

/**
 * Real brand colours through the intake (§7). Each is a hex someone actually ships, and light
 * mode reproduces it exactly at step 9 — the swatch marked 9 IS the hex beside the name. Edit
 * `BRANDS` here, or set `tones.accent` in color-config.ts, then re-run `pnpm run preview`.
 */
const BRANDS: Array<[string, string]> = [
  ["Radix violet", "#6E56CF"],
  ["Vercel blue", "#0070F3"],
  ["Linear indigo", "#5E6AD2"],
  ["Stripe indigo", "#635BFF"],
  ["Spotify green", "#1DB954"],
  ["Radix yellow", "#FFE629"],
  ["Radix red", "#E5484D"],
  ["Teal", "#00C8B4"],
];

function brandSection(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${cap(mode)}</h2>
    ${BRANDS.map(([name, hex]) => {
      const s = buildScaleFor(toneFromColor(hex), mode);
      const pinned = s.steps[8]!.toLowerCase() === hex.toLowerCase();
      return scaleRow(
        `${name} <em>${hex}${mode === "light" ? (pinned ? " — pinned exactly at step 9" : " — snapped, out of band") : " — re-derived, no pin in dark"}</em>`,
        s,
        buildScaleFor(toneFromColor(hex), mode, "srgb", "high"),
      );
    }).join("")}
  </section>`;
}

/** The sweep at the depth the shipped tones get, for judging one hue rather than the family. */
function sweepFull(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${cap(mode)}</h2>
    ${SWEEP.map(([name, spec]) =>
      scaleRow(cap(name), buildScaleFor(spec, mode), buildScaleFor(spec, mode, "srgb", "high")),
    ).join("")}
  </section>`;
}

const LEVELS = Object.keys(density) as DensityLevel[];

/** A fake control: the real tokens, an icon square, a label at the size's own font step. */
const control = (size: string) => `
      <div class="control" data-size="${size}" style="
        height: var(--control-height-${size});
        padding-inline: var(--control-px-${size});
        gap: var(--control-gap-${size});
        border-radius: var(--radius-control-${size});
        font-size: var(--font-size-${size});
        line-height: 1;
      ">
        <span class="icon"></span>
        <span>Size ${size}</span>
      </div>
      <code class="readout" data-for="${size}"></code>`;

export function generatePreview(): string {
  return `<!doctype html>
<html lang="en" data-pointer="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KookieUI density x size</title>
<!-- The entry point, not a hand-kept list: it @imports every sheet the package ships, so a new
     component stylesheet reaches this page without anyone remembering to add it here. It did
     not, once, and the Button grid rendered as bare native buttons. -->
<link rel="stylesheet" href="../src/styles/index.css">
<style>
  /* The preview consumes the system it displays: every colour is a neutral or accent token,
     every distance a space step, every text style a (size, line-height, spacing) triple.
     The dark colour sections carry data-appearance="dark" and get their surface for free —
     the same rule, the tokens re-declared. Hard-coded values below are structural only. */
  * { box-sizing: border-box; }
  /* White chrome; only the mode blocks are app pages (neutral-1), so light blocks read as
     regions and the seal inside them still has the page colour to stand above. */
  body { margin: 0; background: #ffffff; color: var(--neutral-12);
         font: var(--font-weight-regular) var(--font-size-2)/var(--line-height-2) var(--font-body); }
  main { max-width: 1240px; margin: 0 auto; padding: clamp(16px, 4vw, 48px); }
  code { font-family: var(--font-mono); font-size: 0.92em; }

  /* chrome */
  header { position: sticky; top: 0; z-index: 10; background: var(--neutral-1);
           border-bottom: 1px solid var(--neutral-4); }
  .bar { max-width: 1240px; margin: 0 auto; padding: var(--space-4) clamp(16px, 4vw, 48px);
         display: flex; flex-wrap: wrap; gap: var(--space-4) var(--space-8); align-items: center; }
  .brand { font-weight: var(--font-weight-semibold); font-size: var(--font-size-2); }
  .brand em { font-style: normal; color: var(--neutral-10); font-weight: var(--font-weight-regular); }
  nav.toc { display: flex; flex-wrap: wrap; gap: var(--space-5); font-size: var(--font-size-1);
            margin-right: auto; }
  nav.toc a { color: var(--neutral-11); text-decoration: none; }
  nav.toc a:hover { color: var(--neutral-12); }
  .toggle { display: flex; flex-wrap: wrap; gap: var(--space-3) var(--space-6); align-items: center;
            font-size: var(--font-size-1); color: var(--neutral-11); }
  .toggle label { display: flex; gap: var(--space-2); align-items: center; }

  /* rhythm: one heading scale, one note style, one section gap. Nothing on this page is
     bold — semibold is the loudest weight, everywhere (Kushagra, 2026-08-07). */
  strong, b { font-weight: var(--font-weight-semibold); }
  h1 { font: var(--font-weight-semibold) var(--font-size-5)/var(--line-height-5) var(--font-body);
       letter-spacing: var(--letter-spacing-5); margin: var(--space-12) 0 var(--space-3);
       scroll-margin-top: 96px; }
  main > h1:first-child { margin-top: var(--space-8); }
  h2 { font: var(--font-weight-medium) var(--font-size-3)/var(--line-height-3) var(--font-body);
       margin: 0 0 var(--space-6); }
  h2 code { color: var(--neutral-11); font-weight: var(--font-weight-regular); }
  /* Demo titles: the UA's bold 1.17em default was doing the styling until now. Semibold at
     body size; the section reference hangs off the end muted, not shouted. */
  h3 { font: var(--font-weight-semibold) var(--font-size-2)/var(--line-height-2) var(--font-body);
       letter-spacing: var(--letter-spacing-2); margin: 0; }
  h3 code { color: var(--neutral-10); font-weight: var(--font-weight-regular); font-size: var(--font-size-1); }
  p.note { font-size: var(--font-size-2); color: var(--neutral-11); max-width: 64ch;
           margin: 0 0 var(--space-7); }

  /* the density matrix */
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, max-content));
          gap: var(--space-8) var(--space-10); margin-top: var(--space-9); }
  .stack { display: flex; flex-direction: column; align-items: start; gap: var(--space-4); }
  .control { display: inline-flex; align-items: center;
             background: var(--neutral-3); border: 1px solid var(--neutral-7);
             font-weight: var(--font-weight-medium); white-space: nowrap; }
  .icon { width: 1em; height: 1em; border-radius: 2px; background: var(--neutral-8); flex: none; }
  body:not(.icons) .icon { display: none; }
  .readout { font-family: var(--font-mono); font-size: 11px; color: var(--neutral-10); }
  .surfaces { display: flex; flex-wrap: wrap; gap: var(--space-6); margin-top: var(--space-10); }
  .surface { background: var(--neutral-2); border: 1px solid var(--neutral-6);
             padding: var(--space-6); font-size: var(--font-size-2); color: var(--neutral-11); }

  /* the layout rigs */
  .rig-meta { font-family: var(--font-mono); font-size: var(--font-size-1); color: var(--neutral-10);
              margin-top: var(--space-5); }
  .rig { resize: horizontal; overflow: auto; width: min(900px, 100%); min-width: 240px; max-width: 100%;
         border: 1px dashed var(--neutral-8); border-radius: var(--radius-surface-3);
         margin: var(--space-3) 0 var(--space-8); }
  .cell { padding: var(--space-4); background: var(--accent-3); border: 1px solid var(--accent-6);
          border-radius: var(--radius-control-2); color: var(--accent-text); text-align: center;
          font: var(--font-weight-medium) var(--font-size-2)/var(--line-height-2) var(--font-body); }

  /* the button axis grid */
  .axis-table { border-collapse: separate; border-spacing: var(--space-4) var(--space-3); }
  .axis-table th { font-size: var(--font-size-1); font-weight: var(--font-weight-medium);
                   color: var(--neutral-10); text-align: left; }
  .row-controls { display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: center;
                  margin-bottom: var(--space-9); }

  /* tables */
  .roles-table { border-collapse: collapse; font-size: var(--font-size-2); margin-bottom: var(--space-9);
                 display: block; overflow-x: auto; max-width: 100%; }
  .roles-table th { text-align: left; font-weight: var(--font-weight-medium); color: var(--neutral-10);
                    padding: var(--space-2) var(--space-5) var(--space-3) 0; font-size: var(--font-size-1); }
  .roles-table td { padding: var(--space-3) var(--space-5) var(--space-3) 0;
                    border-top: 1px solid var(--neutral-4); vertical-align: middle; }
  .roles-table code { font-size: var(--font-size-1); }
  .roles-table td:nth-child(3), .roles-table td:nth-child(4) { color: var(--neutral-11); }
  .chip { display: block; width: 22px; height: 22px; border-radius: var(--radius-2);
          border: 1px solid var(--neutral-a3); }
  .live { display: flex; gap: var(--space-3); flex-wrap: wrap; margin-bottom: var(--space-9); }
  .live > div { padding: var(--space-3) var(--space-5); border-radius: var(--radius-control-2);
                font-size: var(--font-size-2); font-weight: var(--font-weight-medium); }

  /* colour sections — the dark ones restyle themselves through their own data-appearance */
  /* Sections sit at the page level, both modes: their job is to stand in for an app page,
     which is neutral-1 (§7's role table). neutral-2 styled them as cards and judged every
     control against a backdrop one step grayer than the one it ships on. */
  .mode { margin-top: var(--space-9); padding: var(--space-7); border-radius: var(--radius-surface-3);
          overflow-x: auto; background: var(--neutral-1); color: var(--neutral-12);
          border: 1px solid var(--neutral-4); }
  .scale { margin-bottom: var(--space-7); }
  .scale h3 { font-size: var(--font-size-2); font-weight: var(--font-weight-medium); margin: 0 0 var(--space-3); }
  .scale h3 em { color: var(--neutral-10); font-weight: var(--font-weight-regular); font-style: normal; }
  .row { display: flex; gap: 2px; margin-bottom: 2px; }
  .sw { width: 56px; height: 36px; display: flex; align-items: end; justify-content: center;
        font-size: 10px; font-family: var(--font-mono); color: var(--neutral-a8); }
  .row.roles { margin-top: var(--space-3); gap: var(--space-2); }
  .role { padding: var(--space-3) var(--space-4); border-radius: var(--radius-control-2);
          font-size: var(--font-size-2); font-weight: var(--font-weight-medium); }
  .hc-label { font-size: var(--font-size-1); font-family: var(--font-mono); color: var(--neutral-10);
              margin: var(--space-4) 0 var(--space-2); }

</style>
</head>
<body>
<header><div class="bar">
  <span class="brand">KookieUI <em>tokens</em></span>
  <nav class="toc">
    <a href="#matrix">Matrix</a>
    <a href="#button">Button</a>
    <a href="#field">Field</a>
    <a href="#textarea">Text area</a>
    <a href="#checkbox">Checkbox</a>
    <a href="#radio">Radio</a>
    <a href="#slider">Slider</a>
    <a href="#switch">Switch</a>
    <a href="#type">Type</a>
    <a href="#layout">Layout</a>
    <a href="#roles">Roles</a>
    <a href="#colour">Colour</a>
    <a href="#hues">Hues</a>
    <a href="#brand">Brand</a>
  </nav>
  <div class="toggle">
    <label><input type="checkbox" id="icons"> Icons</label>
    <label><input type="checkbox" id="hc"> contrast="high"</label>\n  <label><input type="checkbox" id="sf"> depth="elevated"</label>
    <label>radius
      <select id="radius">${Object.keys(radiusLevels)
        .map((l) => `<option${l === "medium" ? " selected" : ""}>${l}</option>`)
        .join("")}</select>
    </label>
  <label>pointer
      <select id="pointer"><option selected>auto</option><option>fine</option><option>coarse</option></select>
    </label>
  <label>density
      <select id="density">${LEVELS.map((l) => `<option${l === "default" ? " selected" : ""}>${l}</option>`).join("")}</select>
    </label>
  </div>
</div></header>
<main>
<h1 id="matrix">Density × size</h1>
<p class="note">Every value here is a placed number, not a product. Type is held at the size's own step across all three levels, which is the whole point of the axis: a comfortable size 2 stands as tall as a default size 3 while its label stays size 2. Correct any single cell in <code>src/tokens/config.ts</code> without disturbing its neighbours.</p>

<div class="grid">
${LEVELS.map(
  (level) => `  <section data-pointer="auto"${level === "default" ? "" : ` data-density="${level}"`}>
    <h2>${cap(level)}${level === "default" ? " <code>(:root)</code>" : ""}</h2>
    <div class="stack">${SIZES.map(control).join("")}
    </div>
  </section>`,
).join("\n")}
</div>

<div class="surfaces">
  ${["1", "2", "3", "4"].map((n) => `<div class="surface" style="border-radius: var(--radius-surface-${n})">--radius-surface-${n}</div>`).join("\n  ")}
  ${["1", "2", "3", "4"].map((n) => `<div class="surface" style="border-radius: var(--radius-overlay-${n})">--radius-overlay-${n} (dialog)</div>`).join("\n  ")}
</div>

<h1 id="button">Button — the axis model</h1>
<p class="note">Every cell below is the same component: <code>tone</code> chooses a family, <code>emphasis</code> chooses a loudness, and neither knows about the other. The CSS behind it is one block per rung and one per size, shared by every control that will ever exist — which is what makes the cost additive rather than the product of the axes (§2, §9). Hover and press are stylesheet work; nothing here runs JavaScript. The toggles above drive it: change <em>radius</em>, <em>pointer</em> or <em>contrast</em> and the whole grid follows.</p>
${buttonMatrix("light")}
${buttonMatrix("dark")}

<h2 style="margin-top: var(--space-10)">The same button under other brand accents</h2>
<p class="note">Nothing below is configured or hand-tuned: each block overrides only the accent family, generated from the hex beside it, and the buttons inside pick it up because a rung reads <code>--tone-*</code> and never a colour. This is the question a swatch cannot answer — a hue can look fine in a scale and fail as a control, where its solid has to carry an APCA-chosen label through hover and press, its soft fill has to hold a legible label, and its border has to separate from the page. Yellow is the one to distrust.</p>
${BRANDS.slice(0, 5)
  .map(([name, hex]) => accentSwap(name, hex, "light"))
  .join("")}
${BRANDS.slice(0, 5)
  .map(([name, hex]) => accentSwap(name, hex, "dark"))
  .join("")}

<p class="note">The size index, at the default rung — five scales moving on one number (§4).</p>
<div class="row-controls">${SIZES.map((s) => button({ size: s }, `Size ${s}`)).join("")}</div>
<p class="note">Loading never hides the label: the spinner takes the icon's box when there is one, and joins the text when there is not (§8).</p>
<div class="row-controls">
  ${button({ emphasis: "loud", tone: "accent" }, "Save")}
  ${button({ emphasis: "loud", tone: "accent", loading: true }, "Save")}
  ${button({ size: "4", emphasis: "loud", tone: "accent", loading: true }, "Save")}
</div>

<h1 id="card">Card — the shell</h1>
<p class="note">A shell: one treatment, no variants, no anatomy — <code>size × material</code> and children, and Card ships not one line of its own CSS (§10). A surface without a material is opaque — translucency is material's job alone — and separation between nested surfaces is the border, not the fill. No call site chooses a shadow: the depth toggle above is the one sanctioned lift, an app identity (§5). Titled layouts are blocks, not components. Padding follows the size index and the page-wide <em>density</em> select above (§12) — a compact app's cards lose air with its controls. The glass values are v0, judged on this page; expect them to move.</p>
${surfaceSection("light")}
${surfaceSection("dark")}

<h1 id="field">TextField — the second control</h1>
<p class="note">The additivity claim's first real test (\u00a72): a whole second control for <strong>+247 bytes</strong> gzipped, because the size index, the states, the disabled and invalid remaps and material all arrived from the layer Button already paid for. What is genuinely new is the <em>wrapper</em> — a field that holds an icon inside its border cannot keep that border on the <code>&lt;input&gt;</code>, and once a wrapper owns the border it owes three things no consumer can compose from outside: clicking anywhere lands the caret, the input yields to the slots without breaking the placeholder, and an interactive trailing control keeps its own press. That is the anatomy criterion met, which is why this component has slots and Card does not. No emphasis and no tone: loudness ranks actions, and a form where one field is louder than the next names nothing. Validity is state (<code>aria-invalid</code>, or <code>data-invalid</code> from a Base UI Field), never a prop.</p>
${fieldSection("light")}
${fieldSection("dark")}

<h1 id="textarea">TextArea — the field family, one element</h1>
<p class="note">The first non-fixed-height control: §4's height ladder is for boxes that do not grow, so here <em>padding is the dimension</em> — and the dimension is ONE inset, all four sides (reversed 2026-08-05, LOG: the first cut derived the block padding from the height so one row matched a TextField, and the leftover read as an accident the moment there was a second line — 13px at the sides, 9px above, chosen by nobody). A paragraph is the only real job (a one-row box is TextField's; a composer is its own component), so the frame is the side padding, top and bottom included — and at <em>full</em> the pill bump stays horizontal-only, no exception for roundness: judge the top-left corner of a rounded textarea on this page. Height belongs to the content (<code>rows</code>, a vertical resize handle; horizontal would break the column that owns it), with the control height as a floor. No wrapper and no slots, by the same anatomy criterion that gave TextField both. The states arrive through the shared layer's third disabled spelling — the element that paints IS the disabled form element.</p>
${textAreaSection("light")}
${textAreaSection("dark")}

<h1 id="checkbox">Checkbox — the mark family</h1>
<p class="note">The first control whose painted box is <em>not</em> the height ladder (\u00a74). A checkbox does not contain a label, it sits <em>beside</em> one, so it takes the <strong>mark family</strong> — one ladder shared by checkbox, radio, switch track and slider thumb, because four separately designed ladders in one visual weight class drift apart. The ladder is the <em>line box</em>: a mark occupies exactly one line of its label, which is why it aligns with the text by construction and why it grows on a phone with nothing designed twice — flip the <em>pointer</em> select and the marks rise because \u00a717's handheld band raised the type. The invisible target is a control of its size, capped at the 44 floor, so a checkbox is exactly as large a thing to aim at as the Button beside it while staying a 20px square: click a few pixels above a box on this page and it still toggles. At <em>radius=full</em> the corner caps below a circle, because a circular checkbox is a radio and shape is role semantics (\u00a76) \u2014 flip the radius select and compare it with the pills. Every number here is v0 for the eye pass.</p>
${checkboxSection("light")}
${checkboxSection("dark")}

<h1 id="radio">Radio — the shape sibling</h1>
<p class="note">The mark family's second member, and the landing (with the slider's thumb) that promoted the family's rules into the shared layer — the box, the invisible target, the seal-and-edge resting identity and the accent ON state are now written once and worn by every mark (§4). What is Radio's own is the <strong>circle</strong>: shape is role semantics here (§6) — a circular checkbox reads as a radio and a square radio reads as a checkbox — so the radius axis never reaches it. Flip the radius select to <em>none</em>: every corner on this page squares except these. Selection belongs to the group (one name, one value); the label is a sibling, and a stacked group keeps the 12px rule with <code>gap="5"</code> like the checkbox list above.</p>
${radioSection("light")}
${radioSection("dark")}

<h1 id="slider">Slider — the control is the target</h1>
<p class="note">Track low, fill accent (§11). The ROOT is the control: it rides the height ladder, so the whole box is the thing you press — 44 tall on the coarse default path with <em>no new target mechanism</em> — flip the pointer select and the strip grows while the line holds. The <strong>thumb is the mark family's third member</strong>: the same circle a radio paints, one line of the label's type, resting as every mark rests (the seal wearing the mark edge). The <strong>track</strong> is the family's off part — neutral through the new <code>--color-track</code> role, which the switch's off-track and progress will share — at a designed thickness (~0.25 of the fine mark; the space palette has nothing between 4 and 8, the mark's own wall one part over). The fill is <code>--tone-solid</code> under the stamped accent, so disabled greys everything through the one shared remap. Geometry here is a static stand-in for Base UI's inline positioning; the dress is the shipped stylesheet. All v0 for the eye pass.</p>
${sliderSection("light")}
${sliderSection("dark")}

<h1 id="switch">Switch — the shifted member</h1>
<p class="note">The mark family's fourth member, one index UP: the track is <code>mark(n + 1)</code>, the identity every peer builds by hand (§4). The <strong>width is the one new designed ladder</strong> — indexed by the mark the track IS, priced per pointer world through the same band picks that price the marks, so a coarse switch widens one entry for the same reason it rises one step (1.67&ndash;1.71 of its height in every cell; iOS 1.65, Material 1.63, Radix 1.75). Off is the <code>--color-track</code> WELL with the edge melted into it — not the dressed seal, so the whole control sits <strong>outside the look axis</strong> like the slider (§19: an instrument, a channel and a grip). On is the family's accent identity through the shared ON rule, catching the elevated world's light like every loud rung. The <strong>thumb is the track minus one designed inset</strong> (2px), wears <code>--color-thumb</code>, and casts always — the grip exception, inherited with the role. The capsule and its circle are role semantics: flip the radius select to <code>none</code> and everything on this page squares while these two hold (§6). Width, inset and the well pairing are all v0 for the eye pass.</p>
${switchSection("light")}
${switchSection("dark")}

<p class="note">The Spinner alone, at each icon box and blown up — eight static spokes with a fading trail, rotated as a whole by a stepped tick. Judge it at 16px, which is where it actually lives; the large one is only here to show the shape.</p>
<div class="row-controls">
  ${SIZES.map((s) => spinner(`--kui-ct-icon: var(--icon-size-${s})`)).join("")}
  ${spinner("--kui-ct-icon: 96px")}
</div>

<h1 id="type">Text &amp; Heading — the ramp, worn (§15)</h1>
<p class="note">Nine steps, three paired scales joined at one index — font-size, line-height and letter-spacing are designed pairs, never derived ratios. Type never follows the density select above: flip it and every box and gap on this page moves while these lines hold, which is the whole point of the axis (§12). <strong>Two bands move it, and they are separate on purpose (§17, split 2026-08-05).</strong> The <em>pointer</em> select drives the <em>handheld</em> band — <code>coarse</code> raises the reading steps 1&ndash;4 toward the HIG's 17pt, because a touch-first screen is in a hand, close to the eye (there is no separate device switch: coarse means handheld, LOG 2026-08-05). The <em>narrow</em> band is not a select at all: <strong>drag this window under 768px</strong> and the display steps 8&ndash;9 come down, because a short line cannot hold 56px. A phone gets both; a tablet in landscape gets the first only; a squeezed desktop window gets the second only. Text and Heading ship no CSS of their own; the type layer is the whole of what they look like.</p>
${typeSection()}

<h1 id="layout">The responsive mechanism, live</h1>
<p class="note">Rendered through the real resolver against the shipped stylesheet — the exact markup Flex, Grid and Stack produce. Values ride on each element as inline custom properties; the stylesheet only arbitrates which tier's value wins. <strong>Drag a handle</strong>: tiers key on the slot's width (<code>sm</code> 30rem, <code>md</code> 48rem), never the window's — the same Grid is correct in a drawer and a main column (§2). Each demo sits inside a plain Box, because a tier reads the <em>nearest ancestor</em> Box — the slot — and a Box with no ancestor container stays at its base values. Token gaps resolve through <em>layout space</em> (§3): flip the density select above and every <code>gap</code> re-picks its step while raw-string values hold still.</p>

<p class="note">A Grid: <code>columns={{ initial: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}</code>, gap steps up at md.</p>
<div class="rig-meta">slot <span class="w">—</span></div>
<div class="rig">
${kuiBox(
  {},
  kuiBox(
    {
      display: "grid",
      columns: { initial: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
      gap: { initial: "3", md: "5" },
      p: "4",
    },
    Array.from({ length: 8 }, (_, i) => `<div class="cell">${i + 1}</div>`).join(""),
  ),
  { container: true },
)}
</div>

<p class="note">A Flex switching axis: <code>direction={{ initial: "column", md: "row" }}</code> — a structural keyword riding the same pipe as spacing, which is why this is not a spacing mechanism.</p>
<div class="rig-meta">slot <span class="w">—</span></div>
<div class="rig">
${kuiBox(
  {},
  kuiBox(
    { display: "flex", direction: { initial: "column", md: "row" }, gap: "3", p: "4" },
    ["nav", "content", "aside"].map((n) => `<div class="cell" style="flex: 1">${n}</div>`).join(""),
  ),
  { container: true },
)}
</div>

<h1 id="roles">The role layer</h1>
<p class="note">Components reference these, never the numbered steps and never the generator. <code>tone</code> stands for whichever of neutral, accent or destructive the component resolved to. Swatches show the accent scale in light mode.</p>
${roleMap()}

<h2 style="margin-top: var(--space-9)">contrast="high"</h2>
<p class="note">An accessibility setting, not a design knob: it shifts values, it never remaps which step a role reads. Applied by the Theme prop or by <code>prefers-contrast: more</code> unless explicitly opted out. Toggle it on the whole page below.</p>
<table class="roles-table">
  <thead><tr><th>What</th><th>Happens</th></tr></thead>
  <tbody>${CONTRAST_MAP.map(([a, b]) => `<tr><td><code>${a}</code></td><td>${b}</td></tr>`).join("")}</tbody>
</table>

<p class="note">Below is the only strip on this page reading the emitted CSS variables rather than generator output, so the toggle above proves the shipped stylesheet works end to end. Every other swatch is a baked value and shows its high-contrast variant inline instead.</p>
<div class="live">
  <div style="background: var(--accent-solid); color: var(--accent-contrast)">accent solid</div>
  <div style="background: var(--accent-3); color: var(--accent-label)">accent label on 3</div>
  <div style="background: var(--accent-3); color: var(--accent-text)">accent text on 3</div>
  <div style="background: var(--accent-1); color: var(--accent-label); border: 1px solid var(--accent-border)">accent border</div>
  <div style="background: var(--destructive-solid); color: var(--destructive-contrast)">destructive solid</div>
  <div style="background: var(--neutral-solid); color: var(--neutral-contrast)">neutral solid</div>
</div>

<h1 id="colour">Colour</h1>
<p class="note">Generated from a hue angle and a chroma peak per tone (§7). Steps 1-8 and 11-12 share one lightness ladder across every hue; the solid band leans toward each hue's own cusp, which is the fix for bright hues reading as mud. Every label pairing here is APCA-verified in the suite, not chosen by eye — but the eye is what decides whether it looks right.</p>
${colorSection("light")}
${colorSection("dark")}

<h1 id="hues">Every hue, full scale</h1>
<p class="note">The same twelve hues at the depth the shipped tones get: all twelve steps, the alpha ramp beneath them, then the roles a component actually consumes. Nothing here is hand-placed. Every row is one generator with a different hue angle.</p>
${sweepFull("light")}
${sweepFull("dark")}

<h1 id="brand">Brand colours through the intake</h1>
<p class="note">Somebody hands the system a hex; the system makes it correct. In light mode step 9 comes back identical to what went in — compare the swatch numbered 9 against the hex in the heading. Everything else is generated around it, and every one of these passes the same legibility laws the shipped tones do.</p>
${brandSection("light")}
${brandSection("dark")}

<script>
  // iOS Safari arms :active only while a touch listener exists somewhere on the page. Every
  // real app has one (a hydrated React root registers touch listeners at mount), so the
  // library ships nothing - but this page is otherwise JS-free static HTML, the one
  // environment where the press state would silently never fire on an iPhone.
  document.addEventListener("touchstart", () => {}, { passive: true });

  // The marks toggle, and on this page that is not a nicety: a checkbox's TARGET is invisible
  // (§4 — a control of its size, capped at 44, around a 16-26px box), so "does the hit area
  // feel right" cannot be judged by looking at it. Click a few pixels above or beside a box
  // and it should still take. The real component gets this from Base UI; this is the static
  // page standing in for it, and it moves the same attributes the stylesheet reads.
  document.addEventListener("click", (e) => {
    const mark = e.target.closest(".kui-checkbox, .kui-radio");
    if (!mark || mark.hasAttribute("data-disabled")) return;
    const on = !(mark.hasAttribute("data-checked") || mark.hasAttribute("data-indeterminate"));
    for (const el of [mark, mark.querySelector("svg")]) {
      el.toggleAttribute("data-checked", on);
      el.toggleAttribute("data-unchecked", !on);
      el.removeAttribute("data-indeterminate");
    }
    mark.setAttribute("aria-checked", String(on));
  });

  document.getElementById("sf").addEventListener("change", (e) => {
    // Theme stamps data-depth on its own node; the page's bare sections stand in for
    // nested Themes, same as the contrast toggle above.
    const v = e.target.checked ? "elevated" : "flat";
    document.documentElement.dataset.depth = v;
    for (const el of document.querySelectorAll("[data-appearance]")) el.dataset.depth = v;
  });

  document.getElementById("icons").addEventListener("change", (e) => {
    document.body.classList.toggle("icons", e.target.checked);
  });

  // The radius level prices the palette; density still picks which step each control pulls.
  document.getElementById("hc").addEventListener("change", (e) => {
    // A real Theme writes data-appearance and data-contrast on the SAME node, and the dark
    // high-contrast scope requires exactly that pairing. The page's bare dark sections stand
    // in for nested dark Themes, so the toggle has to stamp them too, not just the root.
    const v = e.target.checked ? "high" : "normal";
    document.documentElement.dataset.contrast = v;
    for (const el of document.querySelectorAll("[data-appearance]")) el.dataset.contrast = v;
  });

  document.getElementById("radius").addEventListener("change", (e) => {
    document.documentElement.dataset.radius = e.target.value;
    readout();
  });

  // Page-wide density, the way a real app Theme sets it — cards and buttons alike (§12).
  // The density x size matrix above keeps its own pinned sections: it IS the axis laid out,
  // and a section's own data-density outranks the root's.
  document.getElementById("density").addEventListener("change", (e) => {
    document.documentElement.dataset.density = e.target.value;
    readout();
  });

  // The coarse matrix (§16) — and, since 2026-08-05, the handheld type band with it (§17):
  // pinning coarse is how phone type is judged on a desktop, there is no separate device
  // switch. The attribute goes on the root AND on each density section: the (pointer x
  // density) cells select on both attributes on one element, which Theme guarantees in an
  // app and this page has to arrange by hand.
  document.getElementById("pointer").addEventListener("change", (e) => {
    for (const el of [document.documentElement, ...document.querySelectorAll(".grid > section")]) {
      el.dataset.pointer = e.target.value;
    }
    readout();
  });

  // Resolved pixels, so the matrix shows what actually renders rather than what was authored.
  function readout() {
    for (const el of document.querySelectorAll(".control")) {
      const s = getComputedStyle(el);
      const size = el.dataset.size;
      el.parentElement.querySelector('[data-for="' + size + '"]').textContent =
        [s.height, "pad " + s.paddingLeft, "gap " + s.columnGap, "r " + s.borderTopLeftRadius, s.fontSize]
          .map((v) => v.replace("px", ""))
          .join("  /  ");
    }
  }
  readout();

  // Live slot readout per rig: width and which tier is active, so "slot not window" is
  // visible rather than argued. Thresholds are the tiers, read from the same table the
  // resolver and the CSS generator walk (system/props.ts) — the preview restating them as
  // 480/768 literals was the exact hand-kept-second-list shape §4 built that table to end.
  // The ramp annotation reads the RENDERED text (2026-08-06): it used to print the base
  // palette pair baked at build time, so flipping the pointer select to coarse (the handheld
  // band) or squeezing under 768px (the narrow band) moved the text while the numbers lied.
  const syncRamp = () => {
    for (const anno of document.querySelectorAll("[data-ramp-step]")) {
      const sample = anno.parentElement.querySelector(".kui-text");
      const cs = getComputedStyle(sample);
      anno.textContent =
        anno.dataset.rampStep + " — " + parseFloat(cs.fontSize) + "/" + parseFloat(cs.lineHeight);
    }
  };
  syncRamp();
  window.addEventListener("resize", syncRamp);
  new MutationObserver(syncRamp).observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["data-pointer", "data-density"],
  });

  for (const rig of document.querySelectorAll(".rig")) {
    const label = rig.previousElementSibling.querySelector(".w");
    new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      const tier = w >= ${remPx(tiers.md)} ? "md" : w >= ${remPx(tiers.sm)} ? "sm" : "base";
      label.textContent = w + "px — tier " + tier + (tier === "md" ? " (drag narrower)" : "");
    }).observe(rig);
  }
</script>
</main>
</body>
</html>
`;
}

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "../../preview/density.html");

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, generatePreview());
  console.log(`preview: ${outPath}`);
}
