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

import { tones, type Mode, type ToneName } from "./color-config.ts";
import { buildScale, buildScaleFor, toneFromColor, type Scale } from "./color.ts";

import { density, fontSize, lineHeight, radiusLevels, type DensityLevel } from "./config.ts";
import { resolveBoxProps, type BoxStyleProps } from "../system/resolve.ts";

/**
 * A Box the way the components make one: the REAL resolver emits the inline custom
 * properties, the shipped stylesheet arbitrates them. Only React itself is absent from this
 * page (the runner cannot parse JSX), so what the layout section proves is the whole
 * mechanism minus the element wrapper the browser suite already covers.
 */
function kuiBox(props: BoxStyleProps, body: string): string {
  const { style } = resolveBoxProps(props);
  const inline = Object.entries(style)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
  return `<div class="kui-box" style="${inline}">${body}</div>`;
}

/**
 * A sweep of arbitrary brand hues, none of them shipped tones. This is where the one-law
 * thesis is actually visible: if a single generator handles yellow and navy without either
 * being hand-placed, the sweep reads as one family. Bright hues are the ones to distrust.
 */
const SWEEP: Array<[string, number, number]> = [
  ["yellow", 100, 1],
  ["amber", 80, 1],
  ["lime", 130, 1],
  ["green", 150, 1],
  ["teal", 175, 1],
  ["cyan", 195, 1],
  ["sky", 230, 1],
  ["blue", 250, 1],
  ["indigo", 267, 1],
  ["violet", 290, 1],
  ["magenta", 340, 1],
  ["red", 25, 1],
];

function hueSweep(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>hue sweep — ${mode}</h2>
    ${SWEEP.map(([name, hue, vividness]) => {
      const s = buildScaleFor({ hue, vividness }, mode);
      return `<div class="sweep">
        <span class="sweep-name">${name}<br><span class="sweep-hex">${s.steps[8]}</span></span>
        <div class="row">${s.steps.map((hex, i) => `<div class="sw sm" title="${name}-${i + 1} ${hex}" style="background:${hex}"></div>`).join("")}</div>
        <div class="role" style="background:${s.solid};color:${s.contrast}">solid</div>
        <div class="role" style="background:${s.solidActive};color:${s.contrast}">active</div>
        <div class="role" style="background:${s.steps[2]};color:${s.label}">label</div>
      </div>`;
    }).join("")}
  </section>`;
}

const TONES = Object.keys(tones) as ToneName[];

const EMPHASES = ["loud", "medium", "quiet"] as const;

/** The Spinner's markup, mirroring the component (this file cannot parse JSX). */
function spinner(style = ""): string {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const opacity = (1 - (i / 8) * 0.85).toFixed(2);
    return `<rect x="11" y="2" width="2" height="5.5" rx="1" opacity="${opacity}" transform="rotate(${i * 45} 12 12)"/>`;
  }).join("");
  return `<svg viewBox="0 0 24 24" aria-hidden class="kui-spinner"${style ? ` style="${style}"` : ""}>${spokes}</svg>`;
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
  }>${loading ? spinner() : ""}${label}</button>`;
}

/**
 * The axis model in one grid: every tone against every rung, plain and bordered, plus the two
 * states. `bordered` is orthogonal (§10) — containment, not loudness — so it has to be legible
 * on all three rungs rather than only on the one it used to be shown with.
 */
function buttonMatrix(
  mode: Mode,
  tones: readonly string[] = TONES,
  heading: string = mode,
): string {
  // No loud + border column: judged useless by eye (2026-08-03) — a step-7 border against a
  // solid step-9 fill has no containment job, the fill already separates itself (§10).
  const columns = EMPHASES.flatMap((e) => [
    { label: e, emphasis: e, bordered: false },
    ...(e === "loud" ? [] : [{ label: `${e} + border`, emphasis: e, bordered: true }]),
  ]);
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${heading}</h2>
    <table class="axis-table">
      <thead><tr><th></th>${columns.map((c) => `<th>${c.label}</th>`).join("")}<th>disabled</th><th>loading</th></tr></thead>
      <tbody>
      ${tones
        .map(
          (tone) => `<tr>
          <th>${tone}</th>
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
function accentSwap(name: string, hex: string, mode: Mode): string {
  const t = toneFromColor(hex);
  const vars = (s: Scale) =>
    [
      `--accent-soft: ${s.steps[2]}`,
      `--accent-soft-hover: ${s.steps[3]}`,
      `--accent-soft-active: ${s.steps[4]}`,
      `--accent-solid: ${s.solid}`,
      `--accent-solid-hover: ${s.solidHover}`,
      `--accent-solid-active: ${s.solidActive}`,
      `--accent-border: ${s.steps[6]}`,
      `--accent-text: ${s.steps[10]}`,
      `--accent-label: ${s.label}`,
      `--accent-contrast: ${s.contrast}`,
    ].join("; ");
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
  </style><div class="${cls}">${buttonMatrix(mode, ["accent"], `${name} — ${hex} — ${mode}`)}</div>`;
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
        `<span ${anno}>${s} — ${fontSize[s - 1]}/${lineHeight[s - 1]}</span>${text(s, "The quick brown fox jumps over the lazy dog")}`,
      ),
    )
    .join("");
  const weights = kuiBox(
    { display: "flex", gap: "5", align: "baseline" },
    ["regular", "medium", "semibold", "bold"].map((w) => text(3, w, w)).join(""),
  );
  // The composition a block would build: Heading and Text in one Card, sharing the ramp.
  const specimen = card(
    kuiBox(
      { display: "flex", direction: "column", gap: "4" },
      kuiBox(
        { display: "flex", direction: "column", gap: "2" },
        `<h2 class="kui-type kui-heading" data-size="6" data-weight="bold" data-emphasis="loud">One ramp, two consumers</h2>${text(
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
          .map((e) => text(3, `${tone} ${e}`, "regular", e, tone))
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
    <h2>${mode}</h2>
    ${kuiBox(
      { display: "flex", direction: "column", gap: "7" },
      demo(
        "the size index - one join, shared with every control (\u00a74)",
        row(SIZES.map((n) => field({ size: String(n), placeholder: `size ${n}` })).join("")),
      ) +
        demo(
          "states - the border carries them; the fill never moves (\u00a78)",
          row(
            [
              field({ placeholder: "rest" }),
              field({ value: "typed" }),
              field({ placeholder: "invalid", invalid: true }),
              field({ placeholder: "disabled", disabled: true }),
            ].join(""),
          ),
        ) +
        demo(
          "slots - forced anatomy, because the border moved to the wrapper (\u00a710)",
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
          "material - the same seal, made glass, with no CSS of its own (\u00a710)",
          `<div style="background: url('backdrop.jpg') center / cover no-repeat, linear-gradient(115deg, #841e57, #144e68 55%, #1db954); border-radius: var(--radius-surface-3);">${kuiBox(
            { display: "flex", gap: "5", wrap: "wrap", p: "7" },
            ["thin", "regular", "thick"]
              .map((m) => field({ material: m, leading: GLYPH, placeholder: m }))
              .join(""),
          )}</div>`,
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
  // Stacks stretch (the default): a kui-box is an inline-size container, so in a
  // shrink-to-fit context its width cannot come from its contents and it collapses.
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
    .map((n) => card(`size ${n}`, "flex: 1", undefined, n))
    .join("");
  const materials = ["solid", "thin", "regular", "thick"]
    .map((m) =>
      card(
        cardBody(
          m,
          "does the label survive?",
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
    <h2>${mode}</h2>
    ${kuiBox(
      { display: "flex", direction: "column", gap: "7" },
      demo("the seal - paper above the page (\u00a710)", shell) +
        demo(
          "the padding index, and the corner it carries (\u00a74, \u00a76)",
          kuiBox({ display: "flex", gap: "5", align: "flex-start" }, sizes),
        ) +
        demo(
          "card-as-button - render a button, the surface notices (\u00a710)",
          `<button class="kui-surface kui-card" data-size="3" data-tone="neutral" data-emphasis="quiet" data-bordered style="max-width: 420px; width: 100%; display: block">${textGroup(
            "Open project",
            "The whole card is one button: hover washes the seal, press steps again, keyboard gets the one ring.",
          )}</button>`,
        ) +
        demo(
          "the shadow palette - a resource; only the elevated world and escapes reach it (\u00a713)",
          kuiBox(
            { display: "flex", gap: "6", align: "flex-start" },
            ["1", "2", "3", "4"]
              .map(
                (n) =>
                  `<div style="flex: 1; background: var(--color-surface); border: 1px solid var(--neutral-4); border-radius: var(--radius-surface-3); padding: var(--space-6); box-shadow: var(--shadow-${n})">shadow ${n}${n === "1" ? " - the well" : ""}</div>`,
              )
              .join(""),
          ),
        ) +
        demo(
          "material over a hostile backdrop - v0 recipes (\u00a710)",
          `<div style="${hostile}">${kuiBox({ display: "flex", gap: "5", wrap: "wrap", p: "7" }, materials)}</div>`,
        ) +
        demo(
          "material on a control - a fill modifier: tone and loudness survive the glass (\u00a710, \u00a711)",
          `<div style="${hostile}">${kuiBox(
            { display: "flex", direction: "column", gap: "4", align: "flex-start", p: "7" },
            kuiBox(
              { display: "flex", gap: "3", wrap: "wrap" },
              ["solid", "thin", "regular", "thick"]
                .map((m) => button(m === "solid" ? {} : { material: m }, m))
                .join(""),
            ) +
              kuiBox(
                { display: "flex", gap: "3", wrap: "wrap" },
                button({ material: "regular", tone: "accent", emphasis: "loud" }, "loud accent") +
                  button({ material: "regular", tone: "destructive", emphasis: "loud" }, "loud destructive") +
                  button({ material: "regular", tone: "accent" }, "medium accent") +
                  button({ material: "regular", emphasis: "quiet" }, "quiet = bare blur") +
                  button({ material: "regular", bordered: true }, "bordered"),
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
      <h3>${tone}${normal.isLowChroma ? ' <em>low chroma: solid takes step 12</em>' : ""}</h3>
      ${stepsAndRoles(tone, normal, true)}
      <div class="hc-label">contrast="high"</div>
      ${stepsAndRoles(tone, high, false)}
    </div>`;
}

function colorSection(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>${mode}</h2>
    ${TONES.map((t) => scaleRow(t, buildScale(t, mode), buildScale(t, mode, "srgb", "high"))).join("")}
  </section>`;
}

/**
 * The role layer written out: what each token resolves to and what consumes it. Components
 * only ever touch this column, never the numbered steps (§7).
 */
const ROLE_MAP: Array<[string, string, string]> = [
  ["--tone-1, -2", "steps 1-2", "page and app backgrounds"],
  ["--tone-soft", "step 3", "medium emphasis, resting fill"],
  ["--tone-soft-hover", "step 4", "medium emphasis, hover (+1 step)"],
  ["--tone-soft-active", "step 5", "medium emphasis, pressed (+2 steps)"],
  ["--tone-border", "step 7", "the bordered boolean, separators"],
  ["--tone-solid", "step 9, or step 12 when low chroma", "loud emphasis, resting fill"],
  ["--tone-solid-hover", "generated, away from the label", "loud emphasis, hover"],
  ["--tone-solid-active", "generated, away from the label", "loud emphasis, pressed"],
  ["--tone-contrast", "white or black, chosen by APCA", "the label ON a loud fill"],
  ["--tone-text", "step 11", "links and prose on a tint"],
  ["--tone-label", "generated between 11 and 12", "control labels — a label is not a link"],
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
    <thead><tr><th></th><th>token</th><th>resolves to</th><th>consumed by</th></tr></thead>
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
  ["teal", "#00C8B4"],
];

function brandSection(mode: Mode): string {
  return `<section class="mode ${mode}"${mode === "dark" ? ' data-appearance="dark"' : ""}>
    <h2>brand colours — ${mode}</h2>
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
    <h2>every hue — ${mode}</h2>
    ${SWEEP.map(([name, hue, vividness]) =>
      scaleRow(
        name,
        buildScaleFor({ hue, vividness }, mode),
        buildScaleFor({ hue, vividness }, mode, "srgb", "high"),
      ),
    ).join("")}
  </section>`;
}

const LEVELS = Object.keys(density) as DensityLevel[];
const SIZES = [1, 2, 3, 4] as const;

/** A fake control: the real tokens, an icon square, a label at the size's own font step. */
const control = (size: number) => `
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
<html lang="en" data-pointer="auto" data-device="auto">
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

  /* rhythm: one heading scale, one note style, one section gap */
  h1 { font: var(--font-weight-semibold) var(--font-size-5)/var(--line-height-5) var(--font-body);
       letter-spacing: var(--letter-spacing-5); margin: var(--space-12) 0 var(--space-3);
       scroll-margin-top: 96px; }
  main > h1:first-child { margin-top: var(--space-8); }
  h2 { font: var(--font-weight-medium) var(--font-size-3)/var(--line-height-3) var(--font-body);
       margin: 0 0 var(--space-6); text-transform: lowercase; }
  h2 code { color: var(--neutral-11); font-weight: var(--font-weight-regular); }
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
  .mode > .kui-box h3, .mode .kui-box h3 { margin: 0; }
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
                   color: var(--neutral-10); text-align: left; text-transform: lowercase; }
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
  .sweep { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
  .sweep-name { width: 78px; font-size: var(--font-size-1); font-family: var(--font-mono); line-height: 1.4; }
  .sweep-hex { color: var(--neutral-10); font-size: 10px; }
  .sw.sm { width: 34px; height: 26px; }
  .sweep .role { padding: var(--space-2) var(--space-3); font-size: var(--font-size-1); }
  .hc-label { font-size: var(--font-size-1); font-family: var(--font-mono); color: var(--neutral-10);
              margin: var(--space-4) 0 var(--space-2); }
</style>
</head>
<body>
<header><div class="bar">
  <span class="brand">KookieUI <em>tokens</em></span>
  <nav class="toc">
    <a href="#matrix">matrix</a>
    <a href="#button">button</a>
    <a href="#field">field</a>
    <a href="#type">type</a>
    <a href="#layout">layout</a>
    <a href="#roles">roles</a>
    <a href="#colour">colour</a>
    <a href="#hues">hues</a>
    <a href="#brand">brand</a>
  </nav>
  <div class="toggle">
    <label><input type="checkbox" id="icons"> icons</label>
    <label><input type="checkbox" id="hc"> contrast="high"</label>\n  <label><input type="checkbox" id="sf"> surfaces="elevated"</label>
    <label>radius
      <select id="radius">${Object.keys(radiusLevels)
        .map((l) => `<option${l === "medium" ? " selected" : ""}>${l}</option>`)
        .join("")}</select>
    </label>
  <label>pointer
      <select id="pointer"><option selected>auto</option><option>fine</option><option>coarse</option></select>
    </label>
  <label>device
      <select id="device"><option selected>auto</option><option>desktop</option><option>handheld</option></select>
    </label>
  <label>density
      <select id="density">${LEVELS.map((l) => `<option${l === "default" ? " selected" : ""}>${l}</option>`).join("")}</select>
    </label>
  </div>
</div></header>
<main>
<h1 id="matrix">density x size</h1>
<p class="note">Every value here is a placed number, not a product. Type is held at the size's own step across all three levels, which is the whole point of the axis: a comfortable size 2 stands as tall as a default size 3 while its label stays size 2. Correct any single cell in <code>src/tokens/config.ts</code> without disturbing its neighbours.</p>

<div class="grid">
${LEVELS.map(
  (level) => `  <section data-pointer="auto"${level === "default" ? "" : ` data-density="${level}"`}>
    <h2>${level}${level === "default" ? " <code>(:root)</code>" : ""}</h2>
    <div class="stack">${SIZES.map(control).join("")}
    </div>
  </section>`,
).join("\n")}
</div>

<div class="surfaces">
  ${["1", "2", "3", "4"].map((n) => `<div class="surface" style="border-radius: var(--radius-surface-${n})">--radius-surface-${n}</div>`).join("\n  ")}
  <div class="surface" style="border-radius: var(--radius-overlay)">--radius-overlay (dialog, sheet)</div>
</div>

<h1 id="button">Button — the axis model</h1>
<p class="note">Every cell below is the same component: <code>tone</code> chooses a family, <code>emphasis</code> chooses a loudness, and neither knows about the other. The CSS behind it is one block per rung and one per size, shared by every control that will ever exist — which is what makes the cost additive rather than the product of the axes (§2, §9). Hover and press are stylesheet work; nothing here runs JavaScript. The toggles above drive it: change <em>radius</em>, <em>pointer</em> or <em>contrast</em> and the whole grid follows.</p>
${buttonMatrix("light")}
${buttonMatrix("dark")}

<h2 style="margin-top: var(--space-10)">the same button under other brand accents</h2>
<p class="note">Nothing below is configured or hand-tuned: each block overrides only the accent family, generated from the hex beside it, and the buttons inside pick it up because a rung reads <code>--tone-*</code> and never a colour. This is the question a swatch cannot answer — a hue can look fine in a scale and fail as a control, where its solid has to carry an APCA-chosen label through hover and press, its soft fill has to hold a legible label, and its border has to separate from the page. Yellow is the one to distrust.</p>
${BRANDS.slice(0, 5)
  .map(([name, hex]) => accentSwap(name, hex, "light"))
  .join("")}
${BRANDS.slice(0, 5)
  .map(([name, hex]) => accentSwap(name, hex, "dark"))
  .join("")}

<p class="note">The size index, at the default rung — five scales moving on one number (§4).</p>
<div class="row-controls">${SIZES.map((s) => button({ size: String(s) }, `Size ${s}`)).join("")}</div>
<p class="note">Loading never hides the label: the spinner takes the icon's box when there is one, and joins the text when there is not (§8).</p>
<div class="row-controls">
  ${button({ emphasis: "loud", tone: "accent" }, "Save")}
  ${button({ emphasis: "loud", tone: "accent", loading: true }, "Save")}
  ${button({ size: "4", emphasis: "loud", tone: "accent", loading: true }, "Save")}
</div>

<h1 id="card">Card — the shell</h1>
<p class="note">A shell: one treatment, no variants, no anatomy — <code>size × material</code> and children, and Card ships not one line of its own CSS (§10). A surface without a material is opaque — translucency is material's job alone — and separation between nested surfaces is the border, not the fill. No call site chooses a shadow: the surfaces=\"elevated\" toggle above is the one sanctioned depth, an app identity (§5). Titled layouts are blocks, not components. Padding follows the size index and the page-wide <em>density</em> select above (§12) — a compact app's cards lose air with its controls. The glass values are v0, judged on this page; expect them to move.</p>
${surfaceSection("light")}
${surfaceSection("dark")}

<h1 id="field">TextField — the second control</h1>
<p class="note">The additivity claim's first real test (\u00a72): a whole second control for <strong>+247 bytes</strong> gzipped, because the size index, the states, the disabled and invalid remaps and material all arrived from the layer Button already paid for. What is genuinely new is the <em>wrapper</em> — a field that holds an icon inside its border cannot keep that border on the <code>&lt;input&gt;</code>, and once a wrapper owns the border it owes three things no consumer can compose from outside: clicking anywhere lands the caret, the input yields to the slots without breaking the placeholder, and an interactive trailing control keeps its own press. That is the anatomy criterion met, which is why this component has slots and Card does not. No emphasis and no tone: loudness ranks actions, and a form where one field is louder than the next names nothing. Validity is state (<code>aria-invalid</code>, or <code>data-invalid</code> from a Base UI Field), never a prop.</p>
${fieldSection("light")}
${fieldSection("dark")}

<p class="note">The Spinner alone, at each icon box and blown up — eight static spokes with a fading trail, rotated as a whole by a stepped tick. Judge it at 16px, which is where it actually lives; the large one is only here to show the shape.</p>
<div class="row-controls">
  ${[1, 2, 3, 4].map((s) => spinner(`--kui-icon: var(--icon-size-${s})`)).join("")}
  ${spinner("--kui-icon: 96px")}
</div>

<h1 id="type">Text &amp; Heading — the ramp, worn (§15)</h1>
<p class="note">Nine steps, three paired scales joined at one index — font-size, line-height and letter-spacing are designed pairs, never derived ratios. Type never follows the density or pointer selects above: flip either and every box and gap on this page moves while these lines hold, which is the whole point of the axis (§12). <strong>Two bands move it, and they are separate on purpose (§17, split 2026-08-05).</strong> The <em>device</em> select drives the <em>held</em> band — <code>handheld</code> raises the reading steps 1&ndash;4 toward the HIG's 17pt, because a screen in a hand is close to the eye. The <em>narrow</em> band is not a select at all: <strong>drag this window under 768px</strong> and the display steps 8&ndash;9 come down, because a short line cannot hold 56px. A phone gets both; a tablet in landscape gets the first only; a squeezed desktop window gets the second only. Text and Heading ship no CSS of their own; the type layer is the whole of what they look like.</p>
${typeSection()}

<h1 id="layout">the responsive mechanism, live</h1>
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
)}
</div>

<h1 id="roles">the role layer</h1>
<p class="note">Components reference these, never the numbered steps and never the generator. <code>tone</code> stands for whichever of neutral, accent or destructive the component resolved to. Swatches show the accent scale in light mode.</p>
${roleMap()}

<h2 style="margin-top: var(--space-9)">contrast="high"</h2>
<p class="note">An accessibility setting, not a design knob: it shifts values, it never remaps which step a role reads. Applied by the Theme prop or by <code>prefers-contrast: more</code> unless explicitly opted out. Toggle it on the whole page below.</p>
<table class="roles-table">
  <thead><tr><th>what</th><th>happens</th></tr></thead>
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

<h1 id="colour">colour</h1>
<p class="note">Generated from a hue angle and a chroma peak per tone (§7). Steps 1-8 and 11-12 share one lightness ladder across every hue; the solid band leans toward each hue's own cusp, which is the fix for bright hues reading as mud. Every label pairing here is APCA-verified in the suite, not chosen by eye — but the eye is what decides whether it looks right.</p>
${colorSection("light")}
${colorSection("dark")}
${hueSweep("light")}
${hueSweep("dark")}

<h1 id="hues">every hue, full scale</h1>
<p class="note">The same twelve hues at the depth the shipped tones get: all twelve steps, the alpha ramp beneath them, then the roles a component actually consumes. Nothing here is hand-placed. Every row is one generator with a different hue angle.</p>
${sweepFull("light")}
${sweepFull("dark")}

<h1 id="brand">brand colours through the intake</h1>
<p class="note">Somebody hands the system a hex; the system makes it correct. In light mode step 9 comes back identical to what went in — compare the swatch numbered 9 against the hex in the heading. Everything else is generated around it, and every one of these passes the same legibility laws the shipped tones do.</p>
${brandSection("light")}
${brandSection("dark")}

<script>
  // iOS Safari arms :active only while a touch listener exists somewhere on the page. Every
  // real app has one (a hydrated React root registers touch listeners at mount), so the
  // library ships nothing - but this page is otherwise JS-free static HTML, the one
  // environment where the press state would silently never fire on an iPhone.
  document.addEventListener("touchstart", () => {}, { passive: true });

  document.getElementById("sf").addEventListener("change", (e) => {
    // Theme stamps data-surfaces on its own node; the page's bare sections stand in for
    // nested Themes, same as the contrast toggle above.
    const v = e.target.checked ? "elevated" : "flat";
    document.documentElement.dataset.surfaces = v;
    for (const el of document.querySelectorAll("[data-appearance]")) el.dataset.surfaces = v;
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

  // The device band (§17) — pin handheld to judge phone type on a desktop, the same move
  // as pinning coarse. Root only: nothing else on the page re-declares a type token, so no
  // per-section stamping is needed.
  document.getElementById("device").addEventListener("change", (e) => {
    document.documentElement.dataset.device = e.target.value;
    readout();
  });

  // The coarse matrix (§16). The attribute goes on the root AND on each density section:
  // the (pointer x density) cells select on both attributes on one element, which Theme
  // guarantees in an app and this page has to arrange by hand.
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
  // visible rather than argued. Thresholds are the tiers: sm 30rem = 480px, md 48rem = 768px.
  for (const rig of document.querySelectorAll(".rig")) {
    const label = rig.previousElementSibling.querySelector(".w");
    new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      const tier = w >= 768 ? "md" : w >= 480 ? "sm" : "base";
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
