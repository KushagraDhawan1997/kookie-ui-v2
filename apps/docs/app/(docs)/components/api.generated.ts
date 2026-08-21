/**
 * GENERATED — do not edit. Source: packages/ui/src/**, via apps/docs/scripts/generate-api.ts.
 *
 * Regenerate with `pnpm --filter docs run api`. A law regenerates and compares, so a hand
 * edit fails CI for everyone rather than only the session that made it.
 *
 * Only the props the package DECLARES are here. Every component also takes its native
 * element's props; `element` names which one.
 */
export type ApiProp = { name: string; type: string; optional: boolean; doc: string };
export type ApiEntry = { element: string | null; props: ApiProp[] };

export const API: Record<string, ApiEntry> = {
  "AlertDialogAction": {
    "element": "button",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The committing choice, in words — the VERB. \"OK\" makes the user re-read the title to remember what they are agreeing to; \"Delete\" answers the question where it is pressed."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands the committing action down — for a confirmation that is not satisfied yet (a typed-name gate, a pending check). Cancel stays live, so this is never a trap."
      },
      {
        "name": "onClick",
        "type": "React.MouseEventHandler<HTMLButtonElement>",
        "optional": true,
        "doc": "Where the work starts. The alert closes on the same press, because its job ends when a choice is made — an action that must await a result and report back belongs to a Dialog whose `open` the caller controls."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "tone",
        "type": "Tone",
        "optional": true,
        "doc": "The one meaning an action may carry beyond proceeding — `destructive` for the deletes this component mostly exists for. Neutral (the accent identity) otherwise."
      }
    ]
  },
  "AlertDialogCancel": {
    "element": "button",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The retreat, in words. \"Cancel\" always reads; naming what staying means often reads better (\"Keep editing\"), and the pair is judged together — two named sides is what makes the alert a choice rather than a warning with a dismiss button."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands the safe way out down. Rarely right: it leaves Escape as the only retreat from a panel that refuses outside presses (§25)."
      },
      {
        "name": "onClick",
        "type": "React.MouseEventHandler<HTMLButtonElement>",
        "optional": true,
        "doc": "Runs on the press, before the alert closes. Cancel ALWAYS closes, so this is for the tidying — never for deciding whether to."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "AlertDialogContent": {
    "element": "div",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The alert's parts, in reading order: `AlertDialogTitle`, `AlertDialogDescription`, then `AlertDialogCancel` and `AlertDialogAction`. A LIST of parts, never a Flex — Content owns the layout (§25), which is what lets the entry animate the content and what makes Cancel-first mean reading order, start side and initial focus at once. Anything beyond those four makes the thing a Dialog."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Your classes, appended rather than replacing the component's own. They land on the panel, not on the scrim and not on the scrollable viewport between them."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the panel, not on the scrim and not on the scrollable viewport between them."
      }
    ]
  },
  "AlertDialogDescription": {
    "element": "p",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "What proceeding COSTS — the consequence the title could not fit, said once. It is announced together with the title, so it adds (what is lost, whether it comes back) rather than restating the question in longer words."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "AlertDialog": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The trigger and the content. AlertDialog renders no DOM of its own — state and wiring only — so this is `<AlertDialogTrigger>` and `<AlertDialogContent>`."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Uncontrolled starting state. Mutually exclusive with `open`."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean, details: OverlayOpenChangeDetails) => void",
        "optional": true,
        "doc": "Fires on every open and close. It carries no dismissal details, and that is the role rather than an omission: an alert refuses outside presses (§25), so the only ways out are the two buttons and Escape, and Escape IS the Cancel action by another route."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state, paired with `onOpenChange` — Dialog's pattern, which the whole library shares."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4, §25 — prices the whole alert: box, corner, padding, title and description steps, and the two buttons. It can reach the type where Dialog's cannot, because the content here is the system's own."
      }
    ]
  },
  "AlertDialogTitle": {
    "element": "h2",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The question, phrased as one. It is the alert's accessible name as well as its heading, so it should say what is about to happen and to what — \"Delete three files?\" — where a title naming the widget leaves the buttons underneath meaningless."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "AlertDialogTrigger": {
    "element": "button",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The button's words, and they name what is about to be RISKED rather than the alert: \"Delete…\" opens the confirmation, and the ellipsis is the platform's own promise that a question is coming. They land on the `render` target, so a Kookie Button plus children is one button."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Your classes, appended rather than replacing the component's own. They land on the trigger, and with `render` on the element you rendered into."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands the trigger down — the alert cannot be raised from here."
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the rendered element really is a `<button>` — inferred from `render` (§5)."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Usually a Kookie Button: `<AlertDialogTrigger render={<Button/>}>Delete…</AlertDialogTrigger>`."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the trigger, and with `render` on the element you rendered into."
      }
    ]
  },
  "Blockquote": {
    "element": "blockquote",
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "emphasis",
        "type": "Emphasis",
        "optional": true,
        "doc": "§9, §15 — the foreground roles. Rests loud, as all type does: a pulled quote is reading-length copy, and quiet is below body-copy contrast by design."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into the element the document needs — a `<figure>`'s child, an `<aside>`."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "§15 — a step on the shared ramp. Anchors at 3 like Text, and unlike Code: a quote is a BLOCK, so it states its own step rather than taking the line it sits in."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "tone",
        "type": "Tone",
        "optional": true,
        "doc": "§7, §15 — re-scopes the ink trio onto the family. It does NOT tint the rule; see the stylesheet for why the rule stays tone-less."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "§15 — token names, never numbers; the shared three-rung set, topping out at semibold because `bold` is refused system-wide. Rests regular like Text, because a quote is copy: the rule and the indent are what set it apart, and a heavier face would make it a heading in quotation marks."
      }
    ]
  },
  "Box": {
    "element": "div",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "§10 — marks a REGION where content passes behind the components inside it (2026-08-17): a toolbar floating over a canvas, a panel over a hero image. Every material-expressing component within (buttons, fields, cards, selects) resolves the theme's material here instead of solid — placement is a fact about the place, stated once, not a prop sprinkled per control. `backdrop={false}` re-marks a sub-region as calm. Layout is untouched: the mark is a React context, not a style."
      },
      {
        "name": "container",
        "type": "boolean",
        "optional": true,
        "doc": "Make this Box measurable: responsive values (`{ initial, sm, md, lg }`) on anything inside resolve against THIS Box's width instead of the nearest measurable ancestor (the Theme root, absent a nearer one). The trade, imposed by CSS itself: a measurable box can never size itself around its contents — its width must come from outside. Put `container` on things layout already sizes (a sidebar with a width, a main column that grows, a grid cell), or state `width` / `flexGrow` / `flexBasis` yourself. A container Box left to shrink-wrap (e.g. as a plain flex-row item) renders ZERO pixels wide; dev builds warn when that happens (§2)."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into an element you already have, instead of adding a wrapper (§5)."
      }
    ]
  },
  "Button": {
    "element": "button",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "§10 — a placement fact (2026-08-17): content passes behind this button, so the theme's material may express. Unset, reads the ambient `<Box backdrop>` region. Cannot choose a material — only state that there is something to bend."
      },
      {
        "name": "bordered",
        "type": "boolean",
        "optional": true,
        "doc": "§10 — containment, orthogonal to loudness: `quiet + bordered` is the old outline."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "emphasis",
        "type": "Emphasis",
        "optional": true,
        "doc": "§9 — loudness, and the only ranking axis in the system: there is no `variant`, and the deletion is load-bearing — one axis cannot mean colour and prominence at once. Resolved for a CONTROL as fills (surfaces take the same ladder as dressing, type as foreground roles): loud is the tone's solid, medium its soft wash, quiet bare. So the rung ranks this button against the ones beside it, and a row of actions is read in the order the fills state. Rests `medium` (§11): a screen earns one loud button by asking."
      },
      {
        "name": "focusableWhenDisabled",
        "type": "boolean",
        "optional": true,
        "doc": "Keep focus when the button becomes disabled mid-interaction."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Leading slot. Swapped for the Spinner while loading, so nothing shifts (§8). Named `leading`/`trailing` rather than `icon`/`iconEnd` (renamed 2026-08-04): ENGINEERING §3 forbids two spellings for one axis, and TextField had already shipped the better pair. It is better on the merits too — the names are RTL-correct where `End` is not, and a trailing slot frequently holds a button rather than an icon, which `iconEnd` misdescribes."
      },
      {
        "name": "loading",
        "type": "boolean",
        "optional": true,
        "doc": "Blocks interaction and shows a Spinner, without ever hiding the label (§8)."
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the rendered element really is a `<button>`. Inferred from `render` and almost never worth passing: it exists because Base UI branches its whole a11y contract on it, and getting it wrong is silent. See the note on the `render` escape below."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into an element you already have — a link, a `<summary>` (§5). The dress and the behaviour stay this component's; only the tag changes. Base UI branches its whole a11y contract on whether the result is a real `<button>`, which is inferred from what is passed here — see `nativeButton` for the case that cannot be inspected."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4 — an index into the control family, never a measurement. One number joins five independent scales at once — the height ladder, the inline padding, the corner, the icon box and the label's type step — so every control at the same index stands level with every other, and re-pricing a step is one config line rather than a sweep of call sites. `2` is the baseline. Density and the pointer world re-price what the index resolves to; they never change what it means."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "tone",
        "type": "Tone",
        "optional": true,
        "doc": "§7 — the semantic family, and a MEANING rather than a colour: `destructive` says what the press does and the theme decides the pigment, which is what lets a palette move without a single call site being edited. Rests `neutral` (§11), so nothing is accent by accident — an accent button is always something somebody asked for."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Trailing slot — a chevron, a count, a control. Never replaced by the Spinner."
      }
    ]
  },
  "Card": {
    "element": "div",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "§10 — a PLACEMENT fact, not a material choice (selectivity, 2026-08-17; renamed from `overContent` the same day — the name now says what glass actually needs): does this card have a backdrop — a hero image, a canvas, a scrolling feed passing behind it? An in-flow card sits on the page's own calm ground, where glass blurs nothing and still pays a full backdrop readback, so by default it renders the solid look at every theme material (the §10 convergence guarantees the two are identical there). Unset, it reads the ambient `<Box backdrop>` region; floating panes (menus, dialogs) are over content by construction and never need it. The material itself is still the theme's — this prop cannot choose one."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into an element you already have — an `<article>`, a link (§5)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4 — pads from the surface family; a surface has no height to own."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "Checkbox": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the mark. Outer spacing is the caller's Box, never this (the non-negotiable)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4 — an index into the MARK ladder, which is the one ladder every control that IS its own mark shares. It leaves the height ladder (that is the geometry of a box that CONTAINS a label; this one sits beside one) and keeps the index, so a checkbox, a radio and a switch at the same step read as the same size of thing rather than as three ladders that drift. The rungs ARE the line box — `--mark-N` resolves to `--line-height-N` — so the square is exactly one line of the label beside it: it aligns by construction, never disturbs the text rhythm, and grows on a phone because §17's handheld band raises the type and the mark rides it, with nothing designed twice. What the index still buys from the control family is the TARGET (§16): the invisible hit area is a control of this size capped at the touch floor, so a checkbox is exactly as large a thing to aim at as the Button beside it. Density never touches a mark — it is content, and a mark that grew while its label held would stop matching its line."
      }
    ]
  },
  "Code": {
    "element": "code",
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "emphasis",
        "type": "Emphasis",
        "optional": true,
        "doc": "§9, §15 — resolved for type as foreground roles, the same three the surrounding copy reads. Unset rests loud: code is a literal, and a literal that has faded is a legibility loss with nothing gained."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into the element the document needs."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "§15 — a step on the shared ramp. **Optional with no default**, which is the one thing this component does differently from Text: an inline atom has no size of its own. Unset, it takes the font-size, line height and letter spacing of the line it sits in, so `<Text size=\"2\">the <Code>value</Code></Text>` matches by construction rather than by the call site remembering to repeat the index. Set it only when the chip stands alone."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "tone",
        "type": "Tone",
        "optional": true,
        "doc": "§7, §15 — re-scopes both the ink trio AND the chip's own fill onto the family, because an atom that carries a fill has a second thing to tint. Defaults to `neutral`, stamped rather than omitted (ENGINEERING §2.1: an identity a component fixes is still stamped — and here it must be, since the tone indirection is declared per family, never at :root)."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "§15 — token names, never numbers, topping out at semibold (`bold` is refused system-wide). Unset with no default, for `size`'s reason: a literal quoted inside a sentence keeps that sentence's face, and the mono family is already what sets it apart. Set it when the chip stands alone."
      }
    ]
  },
  "DialogClose": {
    "element": "button",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The button's words. They land on the `render` target when there is one, so `<DialogClose render={<Button/>}>Cancel</DialogClose>` is a single button carrying a single label — not a Button nested inside a second one."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the rendered element really is a `<button>` — inferred from `render` (§5)."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Usually a Kookie Button: `<DialogTrigger render={<Button/>}>Delete…</DialogTrigger>`."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "DialogContent": {
    "element": "div",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The panel's whole content, and it belongs to the CONSUMER — which is the line between this component and AlertDialog, whose content is the system's (§25). Nothing here is arranged for you, so write the layout the screen needs. Two parts are worth reaching for: a `DialogTitle`, without which the panel has no accessible name at all, and a `DialogClose`, because a trapped screen-reader user needs a reachable way out."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Your classes, appended rather than replacing the component's own. They land on the panel, not on the scrim and not on the scrollable viewport between them."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the panel, not on the scrim and not on the scrollable viewport between them."
      }
    ]
  },
  "DialogDescription": {
    "element": "p",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The supporting line: what the panel is asking for, said once. It is announced together with the title, so a description that restates it is heard twice — and a panel with nothing to add is a panel with no description, not one with a padded sentence."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "Dialog": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The trigger and the content. Dialog renders no DOM of its own — it is state and wiring — so this is `<DialogTrigger>` and `<DialogContent>`, in either order."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Uncontrolled starting state, for a dialog whose openness nothing else needs to know about. Mutually exclusive with `open`."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean, details: OverlayOpenChangeDetails) => void",
        "optional": true,
        "doc": "Fires on every open and close, controlled or not. The second argument is what makes a guard writable: `reason` names what did it (an outside press, Escape, a close button, the trigger), `event` is the native event behind it, and `cancel()` refuses that one dismissal — so \"you have unsaved changes\" is a real answer rather than a race."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state. Pass it with `onOpenChange` — this trio is the library's ONE controlled-state pattern, and every floating component and every Shell pane repeats it unchanged."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4, §24 — prices the popup's max width, its padding and its corner."
      }
    ]
  },
  "DialogTitle": {
    "element": "h2",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The panel's name, in words. It is the visible heading AND the string a screen reader announces the dialog by, which is one obligation rather than two: name the task (\"Rename project\"), never the widget (\"Dialog\")."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "DialogTrigger": {
    "element": "button",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The button's words. They land on the `render` target when there is one, so `<DialogClose render={<Button/>}>Cancel</DialogClose>` is a single button carrying a single label — not a Button nested inside a second one."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the rendered element really is a `<button>` — inferred from `render` (§5)."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Usually a Kookie Button: `<DialogTrigger render={<Button/>}>Delete…</DialogTrigger>`."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "FieldDescription": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "FieldError": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "FieldLabel": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "Field": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the column. Outer spacing is the caller's Box, never this (the non-negotiable)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§28 — the control family's index, priced once for the whole unit: the label, the description, the error AND the control inside it. The type steps are the IDENTITY of the control's own — a field at size 2 sets its label at the step its value is set in, because the control size join is itself the identity map (`--kui-ct-font: var(--font-size-N)`). So nothing is designed twice and a law reads the label's computed size against a mounted control's rather than against a number. It reaches the control by context and an explicit prop on the control wins — see `system/control-size.ts` for the three bounds on that mechanism and why it needs them."
      }
    ]
  },
  "Flex": {
    "element": null,
    "props": [
      {
        "name": "display",
        "type": "\"flex\" | \"inline-flex\"",
        "optional": true,
        "doc": "Flex participates in text flow as `inline-flex`; the tier-switching `display` lives on Box."
      }
    ]
  },
  "Grid": {
    "element": null,
    "props": [
      {
        "name": "display",
        "type": "\"grid\" | \"inline-grid\"",
        "optional": true,
        "doc": "Grid participates in text flow as `inline-grid`; the tier-switching `display` lives on Box."
      }
    ]
  },
  "Heading": {
    "element": "h2",
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "emphasis",
        "type": "Emphasis",
        "optional": true,
        "doc": "§9, §15 — the type ladder: a muted eyebrow or section label without leaving the axis."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Name the real outline level — `render={<h1/>}`, `<h3/>` — without moving the ramp (§5)."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "§15 — a step on the SAME ramp Text reads; one type system, not two, so the index means the same thing on both. It prices the TYPE and nothing else — the document's outline level is `render`'s job — which is what lets a sidebar's `h2` sit at 4 while the hero's sits at 8. Anchors at 6, §15's card-title step."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "tone",
        "type": "Tone",
        "optional": true,
        "doc": "§7, §15 — a semantic family for the ink, never a colour name (see Text)."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "§15 — token names, never numbers. Rests semibold, which is also the top of the ladder — `bold` is refused system-wide — so a heading takes its weight from the step it stands on and the ink role it wears, never from a heavier face."
      }
    ]
  },
  "Kbd": {
    "element": "kbd",
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "emphasis",
        "type": "Emphasis",
        "optional": true,
        "doc": "§9, §15 — the foreground roles, as for all type."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into the element the document needs."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "§15 — a step on the shared ramp. Optional with no default, for Code's reason: a key cap quoted inside a sentence takes that sentence's step."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "tone",
        "type": "Tone",
        "optional": true,
        "doc": "§7, §15 — re-scopes the ink trio, the fill and the edge onto the family. Defaults to `neutral`, stamped rather than omitted (the tone indirection has no :root default)."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "§15 — token names, never numbers, topping out at semibold (`bold` is refused system-wide). Unset with no default, as `size` is: a cap quoted inside a sentence takes that sentence's face. The box, the edge and the cast are what say \"key\" — the weight was never carrying it."
      }
    ]
  },
  "Link": {
    "element": "a",
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into the element the document needs — a framework's own link component, or an `<a>` carrying `target` and `rel`. Link states the type treatment; the element and where it goes are the caller's."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "§15 — a step on the shared ramp. **Optional with no default**, Code's rule verbatim: an inline atom has no size of its own. Unset, a link takes the font-size, line height and letter spacing of the sentence it sits in, so a link inside `<Text size=\"2\">` matches by construction rather than by the call site repeating the index. Set it only when the link stands alone."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "tone",
        "type": "Tone",
        "optional": true,
        "doc": "§7, §11, §15 — a semantic family, never a colour name. Re-scopes the ink onto that family's ladder, so a destructive link is red words with a red underline. Defaults to `accent`, and this is one of §11's four named exceptions to \"tone is neutral for everything\": a link is the one run of text whose job is to be found in a paragraph. The exception is about the FAMILY, not about loudness — nothing here defaults to the loud rung, so §11's one-focal-action guarantee is untouched."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "§15 — token names, never numbers, topping out at semibold. Unset with no default, for `size`'s reason: a link inside a sentence keeps that sentence's face, and the colour and the underline are already what set it apart."
      }
    ]
  },
  "MenuCheckboxItem": {
    "element": null,
    "props": [
      {
        "name": "checked",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled ticked state, paired with `onCheckedChange`. Ticked is the accent on the INDICATOR and nothing else — §21 makes rows peers, so a chosen row is marked rather than made louder, which is also what keeps a menu of ten filters from looking like a ranking."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The row's words — the thing being toggled, phrased so the ticked state reads as true."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "closeOnClick",
        "type": "boolean",
        "optional": true,
        "doc": "Checkable rows stay open by default — toggling several filters is one visit."
      },
      {
        "name": "defaultChecked",
        "type": "boolean",
        "optional": true,
        "doc": "Uncontrolled starting state. Mutually exclusive with `checked`."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands the row down — the toggle cannot move. Its current state still shows, which is the point: \"on, and you may not change it\" is information."
      },
      {
        "name": "label",
        "type": "string",
        "optional": true,
        "doc": "Typeahead text when children aren't plain text."
      },
      {
        "name": "onCheckedChange",
        "type": "(checked: boolean) => void",
        "optional": true,
        "doc": "Fires with the row's new state on every toggle, controlled or not."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The tail of the row — a shortcut hint or a count. The head is spoken for: the tick's gutter is this row's leading slot and stays mounted in both states, so a list of filters keeps its labels aligned whatever is ticked."
      }
    ]
  },
  "MenuContent": {
    "element": null,
    "props": [
      {
        "name": "align",
        "type": "\"start\" | \"center\" | \"end\"",
        "optional": true,
        "doc": "Which edge it aligns to along that side."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The panel's rows — `MenuItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuGroup`, `MenuLabel`, `MenuSub`. A divider is the ordinary `<Separator>`: a menu-specific part would rename a component that already exists (§22's refusal), and menu.css supplies only the rhythm around it. Everything here mounts inside the portal, where the panel's bare `<Theme>` re-applies the axes of the spot it landed in rather than the ones it was written under (§20)."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Your classes, appended rather than replacing the component's own. They land on the popup, not on the positioner around it, so a width or a max-height you set is the panel's."
      },
      {
        "name": "side",
        "type": "\"top\" | \"bottom\" | \"left\" | \"right\"",
        "optional": true,
        "doc": "Which edge of the trigger the menu opens from."
      },
      {
        "name": "sideOffset",
        "type": "number",
        "optional": true,
        "doc": "Distance from the trigger, px. Designed default; override sparingly."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the popup, not on the positioner around it, so a width or a max-height you set is the panel's."
      }
    ]
  },
  "MenuGroup": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The rows the group holds, and at most one `MenuLabel` naming them. Placing the label INSIDE is what earns the association: Base UI points the group's `aria-labelledby` at it, so the name is announced rather than merely printed above the rows."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "MenuItem": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The row's words — the verb. Plain text keeps typeahead working; anything richer owes a `label`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "closeOnClick",
        "type": "boolean",
        "optional": true,
        "doc": "Close the menu when this item is chosen. On by default — a menu is a verb list."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands the row down — it cannot be chosen. It stays in the list on purpose: a greyed row still says the action exists and where it lives, where removing it says nothing."
      },
      {
        "name": "label",
        "type": "string",
        "optional": true,
        "doc": "Typeahead text when children aren't plain text."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Artwork at the head of the row, usually an icon. It is the same slot a checkable row's indicator occupies, so an icon here and a tick one row down sit in one column — which is also why there is no `inset` prop: a checkable row keeps its indicator mounted whether or not it is ticked, so the gutter holds by geometry rather than by a flag (§22)."
      },
      {
        "name": "onClick",
        "type": "React.MouseEventHandler<HTMLElement>",
        "optional": true,
        "doc": "What choosing the row does. The menu closes around it (`closeOnClick`), so this is where work STARTS — anything that has to report back needs a surface that outlives the panel."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "tone",
        "type": "\"destructive\"",
        "optional": true,
        "doc": "§21 — the one meaning a row may carry. Not a palette: the union stays this narrow on purpose, and a wider vocabulary is a future decision, never a default."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The tail of the row: a `<Kbd>` shortcut hint, a count, a state glyph. Not a second action — a row is one target, and a control inside it would be a second one."
      }
    ]
  },
  "MenuLabel": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The heading's words — what the rows beneath have in common. Nothing here is pressable; a label that names an action is a `MenuItem` that was written in the wrong part."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "Menu": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The trigger and the content. Menu renders no DOM of its own — state and wiring only — so this is `<MenuTrigger>` and `<MenuContent>`."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Uncontrolled starting state. Mutually exclusive with `open`."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fires on every open and close, controlled or not — including the dismissals the menu handles itself (Escape, an outside press, choosing a row)."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state, paired with `onOpenChange` — Dialog's pattern, which the whole library shares. A menu rarely needs it: opening is the trigger's job."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4 — the same index the trigger wears; rows, glyphs and type all price from it."
      }
    ]
  },
  "MenuRadioGroup": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The `MenuRadioItem` rows, and at most one `MenuLabel` naming the question. A radio group IS a group, so the label is wired to it exactly as `MenuGroup`'s is."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "defaultValue",
        "type": "string",
        "optional": true,
        "doc": "Uncontrolled starting choice. Mutually exclusive with `value`."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands every row in the group down at once — one statement rather than the same prop repeated per row, so a group that is momentarily unavailable cannot be half-disabled."
      },
      {
        "name": "onValueChange",
        "type": "(value: string) => void",
        "optional": true,
        "doc": "Fires with the newly chosen value. There is no un-choosing: a radio group answers a question, and the answer for \"none of these\" is a row of its own."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "value",
        "type": "string",
        "optional": true,
        "doc": "Controlled chosen value, paired with `onValueChange`. The GROUP holds the choice and the rows only report it, which is why exclusivity needs no bookkeeping at the call site."
      }
    ]
  },
  "MenuRadioItem": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The row's words — the option itself, not a sentence about it."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "closeOnClick",
        "type": "boolean",
        "optional": true,
        "doc": "Close the menu when this row is chosen. OFF by default, like the checkbox row's — a checkable row reports state, and staying open is what lets you watch the dot land where you put it. Turn it on where choosing IS the whole visit."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands the row down — it cannot be chosen. It still shows whether it currently IS the choice, which is the case this matters for: the answer you are stuck with."
      },
      {
        "name": "label",
        "type": "string",
        "optional": true,
        "doc": "Typeahead text when children aren't plain text."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The tail of the row — a shortcut hint or a count. The head is the dot's reserved gutter, mounted whether or not this is the chosen row."
      },
      {
        "name": "value",
        "type": "string",
        "optional": false,
        "doc": "What this row answers with. The group compares it against its own value to decide which row is marked, so it must be unique inside the group — two rows sharing a value are one choice drawn twice."
      }
    ]
  },
  "MenuSubContent": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The child panel's rows, written exactly as a top-level panel's are — a further `MenuSub` included, which nests without a depth limit. What differs is not the content but the geometry, and that is the system's (§22): the panel takes its width from what is in it rather than from the panel it came out of."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Your classes, appended rather than replacing the component's own. They land on the popup, not on the positioner around it."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the popup, not on the positioner around it."
      }
    ]
  },
  "MenuSub": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The `MenuSubTrigger` row and the `MenuSubContent` panel it opens. MenuSub renders no DOM of its own — state and wiring only, exactly like the root."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Uncontrolled starting state. Mutually exclusive with `open`."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fires on every open and close of this submenu, including the ones it handles itself (the pointer leaving its row, Escape, choosing a row inside it)."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state of THIS submenu, paired with `onOpenChange` — Dialog's pattern, which the whole library shares. It is independent of the menu the row sits in: a submenu opens and closes on its own row, and closing it leaves the parent panel standing. Rarely needed — opening is the sub-trigger's job."
      }
    ]
  },
  "MenuSubTrigger": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The row's words — the name of the group of actions inside, not an action itself. Choosing this row opens a panel; it never does anything."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Your classes, appended rather than replacing the component's own. They land on the row that opens the submenu."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands the row down — the child menu cannot be opened."
      },
      {
        "name": "label",
        "type": "string",
        "optional": true,
        "doc": "Typeahead text when children aren't plain text."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Artwork at the head of the row, in the same reserved gutter every other row uses. Only the head: the tail is the system's here, because the chevron saying a child menu exists is not a call-site decision."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the row that opens the submenu."
      }
    ]
  },
  "MenuTrigger": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The trigger's own label, and it stays the caller's: a menu never writes back into the button that opened it. (Reporting the chosen value on the trigger is Select's job, §23.) It lands on the `render` target, so `render={<Button/>}` plus children is one button."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Your classes, appended rather than replacing the component's own. They land on the trigger, and with `render` on the element you rendered into."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands the trigger down — the menu cannot be opened. It reaches whichever a11y contract `nativeButton` resolved to, which is why that inference exists: on an anchor, `disabled` is an inert attribute and the announcement has to come from `aria-disabled` instead."
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the rendered element really is a `<button>`. Inferred from `render` exactly as Button infers it, and almost never passed — the escape is for a custom component whose own root is a button, where inspection cannot see through it (§5)."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Usually a Kookie Button: `<MenuTrigger render={<Button/>}>Open</MenuTrigger>`."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the trigger, and with `render` on the element you rendered into."
      }
    ]
  },
  "Progress": {
    "element": null,
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "Names the task for AT. Required in spirit but not by the type: inside a `Field.Root`, or with a visible heading wired through `aria-labelledby`, a second name is noise."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the bar. Outer spacing is the caller's Box, never this (the non-negotiable)."
      }
    ]
  },
  "RadioGroup": {
    "element": null,
    "props": []
  },
  "Radio": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the mark. Outer spacing is the caller's Box, never this (the non-negotiable)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4 — the MARK ladder, the checkbox's index verbatim: `mark(n)` is one line of the label beside it, and the diameter is that square's, so a radio and the checkbox above it in a form are the same size of thing by construction rather than by two ladders agreeing. The painted box leaves the control height ladder; the TARGET does not — it stays a control of this size capped at the touch floor (§16). Density never touches it: a mark is content, and it grows only where the type it matches grows (§17)."
      }
    ]
  },
  "ScrollArea": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The content that scrolls. It lands inside the viewport, never beside the bars — the viewport, the scrollbars and the corner are assembly rather than API (§10), so there is nothing else to place. The scroll region needs a bounded height to be a scroll region: state it here through `style`, or let a Shell pane or a menu's popup bound it."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the root. Outer spacing is the caller's Box, never this (the non-negotiable)."
      },
      {
        "name": "focusable",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the viewport is a keyboard tab stop (default true — a standalone scroll region must be reachable to scroll by keyboard, per Base UI). A HOST WIDGET that already owns keyboard scrolling passes false: ARIA drops `role=\"presentation\"` from any focusable element, so a focusable viewport inside a `role=\"menu\"` popup exposed as a nameless `generic` between the menu and its items — \"menu owns menuitem\" broken for every menu, and a stray tab stop inside a roving-focus widget (audit 2026-08-18). The menu's roving highlight scrolls the viewport by itself, so nothing is lost there."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the root, not on the viewport that scrolls."
      }
    ]
  },
  "SegmentedControl": {
    "element": null,
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "§10 — states that content passes BEHIND this control, so it expresses the theme's material instead of resolving solid. The ambient `<Box backdrop>` region answers this for a whole toolbar; this is the one-off escape, and it is Button's own prop verbatim."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the track. Outer spacing is the caller's Box, never this (the non-negotiable)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4, §26 — the control HEIGHT ladder, priced on the TRACK: the track is the control, so a segmented control stands level with a Button of the same size in the toolbar beside it. Each segment derives its own box from that channel — the track minus a designed inset, the switch's sentence one control over — and stamps no index of its own, which is §4's hosted-control rule with N hosts rather than one and is why the two boxes cannot disagree. It sits on the root, never per segment: a bar of mixed sizes is not a thing anyone means."
      }
    ]
  },
  "SegmentedItem": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the segment. Outer spacing is the caller's Box, never this."
      }
    ]
  },
  "SelectContent": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The option rows — `SelectItem`, divided by `SelectGroup` and named by `SelectLabel`. They are mounted only while the panel is open, which is exactly the case the root's `items` map exists for: a closed select has no row to read a label off. A `<Separator>` is refused here where a menu takes one (§23) — inside a listbox it is markup an accessibility check reports, and a group is the divider the role already has."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Your classes, appended rather than replacing the component's own. They land on the popup, not on the positioner around it, so a width or a max-height you set is the panel's."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the popup, not on the positioner around it, so a width or a max-height you set is the panel's."
      }
    ]
  },
  "SelectGroup": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The `SelectItem` rows this group holds, and at most one `SelectLabel` naming them. Placing the label INSIDE is what earns the association: Base UI points the group's `aria-labelledby` at it, so the name is announced with each option rather than only seen above them."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "SelectItem": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "What the option READS as. This is the ItemText, so it is also what the closed trigger paints once the panel has been opened — before that, the root's `items` map is the only thing that can resolve a value to these words."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands the option down — it cannot be chosen. It stays in the list and stays announced: a choice that is unavailable right now is information, where an absent row says nothing about why the thing you were looking for is not there."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "value",
        "type": "string",
        "optional": false,
        "doc": "The value this option names — what the form submits and the trigger displays."
      }
    ]
  },
  "SelectLabel": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The heading's words — the name of the group below it, never an option. Nothing here is choosable, and a label that reads like a choice is the one way this part misleads."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "Select": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The trigger and the content. Select renders no DOM of its own — state and wiring only — so this is `<SelectTrigger>` and `<SelectContent>`."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Uncontrolled starting state for the panel. Mutually exclusive with `open`."
      },
      {
        "name": "defaultValue",
        "type": "string",
        "optional": true,
        "doc": "Uncontrolled starting value. Mutually exclusive with `value`, and the case `items` exists for: it can paint before the panel has ever opened."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Stands the whole control down: the panel cannot open and the hidden input stops submitting. It is also the platform-shaped answer for a value that must not change, since `readOnly` is refused: HTML never defined it for `<select>`, so a disabled trigger beside a hidden input carrying the value is how that case is spelled."
      },
      {
        "name": "items",
        "type": "Record<string, React.ReactNode>",
        "optional": true,
        "doc": "value → label, for the CLOSED trigger. Base UI resolves an option's label from its mounted ItemText, and a closed panel has none mounted — without this map a select whose panel never opened displays the raw value string. Optional because an always-open or placeholder-resting select never needs it; pass it whenever a defaultValue can paint before the panel first opens."
      },
      {
        "name": "name",
        "type": "string",
        "optional": true,
        "doc": "Identifies the field when a form is submitted (Base UI renders the hidden input)."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fires when the panel opens or closes. Not when the value changes — that is `onValueChange`, and conflating the two is how a select ends up committing on hover."
      },
      {
        "name": "onValueChange",
        "type": "(value: string) => void",
        "optional": true,
        "doc": "Fires when the chosen value changes — a selection, never an open or a close."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state of the PANEL, paired with `onOpenChange` — Dialog's pattern, which the whole library shares. Orthogonal to `value`: opening chooses nothing."
      },
      {
        "name": "required",
        "type": "boolean",
        "optional": true,
        "doc": "Marks the field required for form validation, exactly as on a native `<select>`; it lands on the hidden input, so the platform does the enforcing."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4 — the same index the trigger wears; rows, glyphs and type all price from it."
      },
      {
        "name": "value",
        "type": "string",
        "optional": true,
        "doc": "Controlled value, paired with `onValueChange`. The closed trigger paints the matching option's LABEL, not this string — see `items` for the case where no option is mounted yet to resolve one."
      }
    ]
  },
  "SelectTrigger": {
    "element": "button",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "§10 — a placement fact (2026-08-17): content passes behind this trigger, so the theme's material may express. Unset, reads the ambient `<Box backdrop>` region."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Your classes, appended rather than replacing the component's own. They land on the trigger, which is a field-shaped control."
      },
      {
        "name": "placeholder",
        "type": "string",
        "optional": true,
        "doc": "Shown, in the faint role, while no value is chosen — an empty select INVITES (§15)."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the trigger, which is a field-shaped control."
      }
    ]
  },
  "Separator": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the line. Outer spacing is the caller's Box, never this (the non-negotiable)."
      }
    ]
  },
  "ShellBottom": {
    "element": "aside",
    "props": [
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Initial state when uncontrolled. Omit BOTH and the pane is `auto`: the stylesheet resolves its resting state per window class, and the first user toggle makes it explicit."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "§27 — is this pane part of the app frame? `flush` (the default) tiles it against its neighbours, each seam one hairline. `flush={false}` pulls it off the frame, and what happens next is DERIVED rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only if the content is itself flush; otherwise it grounds — its own surface resting on the app's ground, the card relationship at pane scale. One boolean per pane reaches all four postures, and the derivation cannot be told the lie a three-value axis could (a floating sidebar beside a grounded content card)."
      },
      {
        "name": "height",
        "type": "number",
        "optional": true,
        "doc": "§27 — the bottom pane's block extent, the width prop's sentence turned 90°."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fired on user-driven changes only (trigger, Escape, scrim) — never at mount, never on a window-class crossing: auto's responsive resolution is CSS's, and CSS calls nobody."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state — Dialog's pattern exactly. PASSING IT CONDITIONALLY IS SUPPORTED, and stating that is the point of this paragraph (the builder's port was relying on it while nothing said it was allowed, 2026-08-21). `{...(preview ? { open: false } : {})}` pins the pane closed while the flag is on and hands control straight back when it goes: the uncontrolled state is kept untouched throughout rather than being overwritten by the controlled value, so the pane returns to exactly the state the user last left it in. React warns about this shape for form inputs because a value has nowhere to go; a pane's does. A law holds the round trip."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "optional": true,
        "doc": "§27 — how this pane occupies the window while it is open. `ShellPresentation` says what the three values mean; what belongs here is when to reach for one. `auto` answers a question about the ROOM, and it answers it in CSS through §18's window class, so first paint is right with no script and no hydration to mismatch. Stating a value instead answers a question about the PRODUCT, and it does more than pin a posture: `overlay` also makes the pane rest CLOSED at every width, because an overlay is summoned rather than lived in, where `auto` lets a nav column rest open on a roomy window. So an explicit value is for a pane whose behaviour is a decision (a drawer that must never be ambient; an inspector that must never cover the work), and `auto` for every pane whose behaviour is a consequence of how much window there is."
      }
    ]
  },
  "ShellContent": {
    "element": "main",
    "props": [
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "§27 — is this pane part of the app frame? `flush` (the default) tiles it against its neighbours, each seam one hairline. `flush={false}` pulls it off the frame, and what happens next is DERIVED rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only if the content is itself flush; otherwise it grounds — its own surface resting on the app's ground, the card relationship at pane scale. One boolean per pane reaches all four postures, and the derivation cannot be told the lie a three-value axis could (a floating sidebar beside a grounded content card)."
      }
    ]
  },
  "ShellHeader": {
    "element": "header",
    "props": [
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "§27 — is this pane part of the app frame? `flush` (the default) tiles it against its neighbours, each seam one hairline. `flush={false}` pulls it off the frame, and what happens next is DERIVED rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only if the content is itself flush; otherwise it grounds — its own surface resting on the app's ground, the card relationship at pane scale. One boolean per pane reaches all four postures, and the derivation cannot be told the lie a three-value axis could (a floating sidebar beside a grounded content card)."
      }
    ]
  },
  "ShellInspector": {
    "element": "nav",
    "props": [
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Initial state when uncontrolled. Omit BOTH and the pane is `auto`: the stylesheet resolves its resting state per window class, and the first user toggle makes it explicit."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "§27 — is this pane part of the app frame? `flush` (the default) tiles it against its neighbours, each seam one hairline. `flush={false}` pulls it off the frame, and what happens next is DERIVED rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only if the content is itself flush; otherwise it grounds — its own surface resting on the app's ground, the card relationship at pane scale. One boolean per pane reaches all four postures, and the derivation cannot be told the lie a three-value axis could (a floating sidebar beside a grounded content card)."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fired on user-driven changes only (trigger, Escape, scrim) — never at mount, never on a window-class crossing: auto's responsive resolution is CSS's, and CSS calls nobody."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state — Dialog's pattern exactly. PASSING IT CONDITIONALLY IS SUPPORTED, and stating that is the point of this paragraph (the builder's port was relying on it while nothing said it was allowed, 2026-08-21). `{...(preview ? { open: false } : {})}` pins the pane closed while the flag is on and hands control straight back when it goes: the uncontrolled state is kept untouched throughout rather than being overwritten by the controlled value, so the pane returns to exactly the state the user last left it in. React warns about this shape for form inputs because a value has nowhere to go; a pane's does. A law holds the round trip."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "optional": true,
        "doc": "§27 — how this pane occupies the window while it is open. `ShellPresentation` says what the three values mean; what belongs here is when to reach for one. `auto` answers a question about the ROOM, and it answers it in CSS through §18's window class, so first paint is right with no script and no hydration to mismatch. Stating a value instead answers a question about the PRODUCT, and it does more than pin a posture: `overlay` also makes the pane rest CLOSED at every width, because an overlay is summoned rather than lived in, where `auto` lets a nav column rest open on a roomy window. So an explicit value is for a pane whose behaviour is a decision (a drawer that must never be ambient; an inspector that must never cover the work), and `auto` for every pane whose behaviour is a consequence of how much window there is."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The control index the pane's own navigation is priced at — its rows, and (when the rail's items land) its squares. Not the pane's WIDTH: a pane's extent is a statement about the app's content and has no ladder, which is why `width` is a raw number and this is an index."
      },
      {
        "name": "width",
        "type": "number",
        "optional": true,
        "doc": "§27 — the system's first sanctioned raw length: a pane's width is the app's content speaking, and no ladder exists that could price it. In CSS pixels. It overrides the designed default by writing the one custom property the stylesheet reads (`--kui-shell-w`) — which is deliberately the whole future resize architecture: a later drag writes where this writes."
      }
    ]
  },
  "ShellNavGroup": {
    "element": "div",
    "props": [
      {
        "name": "label",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The group's heading. Omit it for an unlabelled cluster."
      }
    ]
  },
  "ShellNavItem": {
    "element": "button",
    "props": [
      {
        "name": "current",
        "type": "boolean",
        "optional": true,
        "doc": "This is the page you are on. Announced (`aria-current=\"page\"`) as well as painted — \"you are here\" is information, and a colour alone tells nobody who cannot see it."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Be an anchor instead: a nav item usually navigates, and a link is a link (§13)."
      }
    ]
  },
  "Shell": {
    "element": "div",
    "props": [
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The control index this app's navigation is priced at — inherited by every pane, and overridable per pane. An editor is size 1 throughout and was having to say so on each pane separately (found by the builder's port, 2026-08-21); the per-pane default of `\"2\"` was a default with no home, which is the one thing a system with a size axis should not ship. Not the app's TYPE size and not any pane's WIDTH — a pane's extent is a statement about content and has no ladder, which is why `width` is a raw number and this is an index."
      }
    ]
  },
  "ShellRailItem": {
    "element": "button",
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": false,
        "doc": "REQUIRED, because the item is icon-only: an icon with no name is a button nobody can read (Button's `iconOnly` takes the same line). If the rail ever grows labels, they go UNDER the icon and stay a switch on the pane — one word under one icon and not the next is how a column of icons stops lining up."
      },
      {
        "name": "current",
        "type": "boolean",
        "optional": true,
        "doc": "The region you are in. Announced as well as painted, exactly as a nav row's is."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Be an anchor instead — a rail is primary navigation, and a link is a link."
      }
    ]
  },
  "ShellRailList": {
    "element": "div",
    "props": []
  },
  "ShellRail": {
    "element": "nav",
    "props": [
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Initial state when uncontrolled. Omit BOTH and the pane is `auto`: the stylesheet resolves its resting state per window class, and the first user toggle makes it explicit."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "§27 — is this pane part of the app frame? `flush` (the default) tiles it against its neighbours, each seam one hairline. `flush={false}` pulls it off the frame, and what happens next is DERIVED rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only if the content is itself flush; otherwise it grounds — its own surface resting on the app's ground, the card relationship at pane scale. One boolean per pane reaches all four postures, and the derivation cannot be told the lie a three-value axis could (a floating sidebar beside a grounded content card)."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fired on user-driven changes only (trigger, Escape, scrim) — never at mount, never on a window-class crossing: auto's responsive resolution is CSS's, and CSS calls nobody."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state — Dialog's pattern exactly. PASSING IT CONDITIONALLY IS SUPPORTED, and stating that is the point of this paragraph (the builder's port was relying on it while nothing said it was allowed, 2026-08-21). `{...(preview ? { open: false } : {})}` pins the pane closed while the flag is on and hands control straight back when it goes: the uncontrolled state is kept untouched throughout rather than being overwritten by the controlled value, so the pane returns to exactly the state the user last left it in. React warns about this shape for form inputs because a value has nowhere to go; a pane's does. A law holds the round trip."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "optional": true,
        "doc": "§27 — how this pane occupies the window while it is open. `ShellPresentation` says what the three values mean; what belongs here is when to reach for one. `auto` answers a question about the ROOM, and it answers it in CSS through §18's window class, so first paint is right with no script and no hydration to mismatch. Stating a value instead answers a question about the PRODUCT, and it does more than pin a posture: `overlay` also makes the pane rest CLOSED at every width, because an overlay is summoned rather than lived in, where `auto` lets a nav column rest open on a roomy window. So an explicit value is for a pane whose behaviour is a decision (a drawer that must never be ambient; an inspector that must never cover the work), and `auto` for every pane whose behaviour is a consequence of how much window there is."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The control index the pane's own navigation is priced at — its rows, and (when the rail's items land) its squares. Not the pane's WIDTH: a pane's extent is a statement about the app's content and has no ladder, which is why `width` is a raw number and this is an index."
      }
    ]
  },
  "ShellScroll": {
    "element": null,
    "props": []
  },
  "ShellSidebar": {
    "element": "nav",
    "props": [
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Initial state when uncontrolled. Omit BOTH and the pane is `auto`: the stylesheet resolves its resting state per window class, and the first user toggle makes it explicit."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "§27 — is this pane part of the app frame? `flush` (the default) tiles it against its neighbours, each seam one hairline. `flush={false}` pulls it off the frame, and what happens next is DERIVED rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only if the content is itself flush; otherwise it grounds — its own surface resting on the app's ground, the card relationship at pane scale. One boolean per pane reaches all four postures, and the derivation cannot be told the lie a three-value axis could (a floating sidebar beside a grounded content card)."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fired on user-driven changes only (trigger, Escape, scrim) — never at mount, never on a window-class crossing: auto's responsive resolution is CSS's, and CSS calls nobody."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state — Dialog's pattern exactly. PASSING IT CONDITIONALLY IS SUPPORTED, and stating that is the point of this paragraph (the builder's port was relying on it while nothing said it was allowed, 2026-08-21). `{...(preview ? { open: false } : {})}` pins the pane closed while the flag is on and hands control straight back when it goes: the uncontrolled state is kept untouched throughout rather than being overwritten by the controlled value, so the pane returns to exactly the state the user last left it in. React warns about this shape for form inputs because a value has nowhere to go; a pane's does. A law holds the round trip."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "optional": true,
        "doc": "§27 — how this pane occupies the window while it is open. `ShellPresentation` says what the three values mean; what belongs here is when to reach for one. `auto` answers a question about the ROOM, and it answers it in CSS through §18's window class, so first paint is right with no script and no hydration to mismatch. Stating a value instead answers a question about the PRODUCT, and it does more than pin a posture: `overlay` also makes the pane rest CLOSED at every width, because an overlay is summoned rather than lived in, where `auto` lets a nav column rest open on a roomy window. So an explicit value is for a pane whose behaviour is a decision (a drawer that must never be ambient; an inspector that must never cover the work), and `auto` for every pane whose behaviour is a consequence of how much window there is."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The control index the pane's own navigation is priced at — its rows, and (when the rail's items land) its squares. Not the pane's WIDTH: a pane's extent is a statement about the app's content and has no ladder, which is why `width` is a raw number and this is an index."
      },
      {
        "name": "width",
        "type": "number",
        "optional": true,
        "doc": "§27 — the system's first sanctioned raw length: a pane's width is the app's content speaking, and no ladder exists that could price it. In CSS pixels. It overrides the designed default by writing the one custom property the stylesheet reads (`--kui-shell-w`) — which is deliberately the whole future resize architecture: a later drag writes where this writes."
      }
    ]
  },
  "ShellTrigger": {
    "element": "button",
    "props": [
      {
        "name": "action",
        "type": "\"toggle\" | \"open\" | \"close\"",
        "optional": true,
        "doc": "What the press does to `target`. `toggle` is the disclosure button every shell has, and the default because it is the one a button that only drives a pane should be. The one-way values are for a press that ALREADY means something else and must not undo itself. A rail square that re-points the sidebar has to SHOW the sidebar, so it is `open`: as a toggle, pressing a second region would close the panel it had just filled, and picking a region the sidebar is not showing would do nothing visible at all. A dismiss button inside an overlaying pane is `close` for the mirror reason. Stating the direction is what keeps those presses from becoming controls that appear to do nothing."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Usually a Kookie Button: `<ShellTrigger target=\"sidebar\" render={<Button iconOnly …/>}>`."
      },
      {
        "name": "target",
        "type": "ShellPaneTarget",
        "optional": false,
        "doc": "Which pane this button drives."
      }
    ]
  },
  "Slider": {
    "element": null,
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "Names the value for AT, applied to the thumb's hidden range input. Inside a `Field.Root` the field's label wires itself instead. A RANGE slider names both thumbs with the same string plus Base UI's per-thumb value text; a block that needs \"Minimum\" and \"Maximum\" is a composition (Field + two labelled sliders), not a prop here."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the root. Outer spacing is the caller's Box, never this (the non-negotiable)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4 — the control HEIGHT ladder, taken on the root, because the root is the control: the whole strip is pressable, so a slider is exactly as tall a target as the Button beside it and §16's floors arrive with no mechanism of its own. The same index then prices the parts through the families they belong to — the thumb off the mark ladder (one line of the label's type), the rail off its own designed track ladder — so a handle and the checkbox above it in one form read as the same size of thing."
      }
    ]
  },
  "Spinner": {
    "element": "span",
    "props": []
  },
  "Stack": {
    "element": null,
    "props": []
  },
  "Surface": {
    "element": "div",
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into an element you already have — a `<section>`, an `<aside>`, a layout (§5)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4, §6 — padding and corner from the CONTAINER band, one step up from a card's."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "Switch": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the mark. Outer spacing is the caller's Box, never this (the non-negotiable)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4 — the MARK ladder, SHIFTED: the track is `mark(n + 1)`, the one-index step every peer system arrives at by hand, so a switch reads one weight class above the checkbox at the same index while the two still belong to one family. The shift lives in the shared size join, so this component states no geometry of its own; the width rides the same index through the family's designed ladder, and the thumb derives from the channel rather than restating it. The TARGET is still a control of this size capped at the touch floor (§16). Density never touches it — a mark grows only where its label does (§17), and at coarse size 4 the band prices two type steps alike, so the shift is inert there and a switch stands exactly level with its checkbox."
      }
    ]
  },
  "TabsList": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the bar. Outer spacing is the caller's Box, never this (the non-negotiable)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4, §26 — the control height ladder, priced on the LIST and not on the tabs. SegmentedControl's decision one component over, and the thing a reader gets wrong exactly once: the bar is what carries the index, and each tab derives its box from that channel and stamps no index of its own. So a mixed-size bar is not expressible, which is right — a bar of tabs at two sizes is not a thing anyone means, and asking every tab to repeat the number is an invitation to disagree. It sits here rather than on `Tabs` because the list is the part that HAS a box; the root owns no layout at all."
      }
    ]
  },
  "TabsPanel": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "Tabs": {
    "element": null,
    "props": []
  },
  "TabsTab": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the tab. Outer spacing is the caller's Box, never this (the non-negotiable)."
      }
    ]
  },
  "TextArea": {
    "element": "textarea",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "§10 — a placement fact (2026-08-17): content passes behind this control, so the theme's material may express. Unset, reads the ambient `<Box backdrop>` region."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4 — the control family's index, minus the one join a growing box cannot take. Padding, corner, type and border all price from it; HEIGHT does not, because the content decides that (`rows`) — this is §4's \"non-fixed-height components: padding is the dimension\". The block padding is derived so that a one-row textarea is geometrically the TextField at the same index, and the control height survives as a floor rather than a ceiling."
      }
    ]
  },
  "TextField": {
    "element": "input",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "§10 — a placement fact (2026-08-17): content passes behind this control, so the theme's material may express. Unset, reads the ambient `<Box backdrop>` region."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Applied to the WRAPPER — the element that is the control."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Passive by convention — an icon, a unit, a currency mark. Clicking it lands the caret."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "§4 — the control family's index, Button's ladder exactly: height, inline padding, corner, the value's type step and the slot geometry all price from one number, so a field and the button that submits it stand level. It replaces the platform's own `size` attribute rather than joining it — that one is a character-count width hack predating CSS, and it would collide. The WRAPPER wears it, because the wrapper is the control."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Applied to the WRAPPER, so `width` sizes the field rather than the text inside it."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "May be interactive: a clear button, a reveal toggle. A real button brings its own semantics, and the wrapper stands out of its way (§10's element-brings-interactivity)."
      },
      {
        "name": "type",
        "type": "TextFieldType",
        "optional": true,
        "doc": "Narrowed from the platform's open list — see TextFieldType."
      }
    ]
  },
  "Text": {
    "element": "span",
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "emphasis",
        "type": "Emphasis",
        "optional": true,
        "doc": "§9, §15 — the one loudness axis, resolved for type as foreground roles: loud reads --color-text, medium the muted role, quiet the faint one. Rests loud — full contrast is the accessible resting state for reading, the inversion of the control default. Quiet is below body-copy contrast by design; never a reading-length line."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into the flow element the document needs — a `<p>`, a `<label>` (§5)."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "§15 — a step on the type ramp, and the ramp is three designed scales joined at one index: font-size, line height and letter spacing move together, so a step can never change the size without the leading that makes it readable. Nine steps rather than the control family's four — reading has the wider dynamic range (§4 shares the numeral, not the scale). Anchors at 3, the body step §15's composition ladder is built around."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "tone",
        "type": "Tone",
        "optional": true,
        "doc": "§7, §15 — a semantic family, never a colour name: the meaning is the API and the theme resolves the pigment. Re-scopes the emphasis ladder onto the family's ink trio. Unset means tone-less: the text reads whatever context its surface sets."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "§15 — the face, named rather than numbered: a token is the system's to re-point and a `600` is not. Three rungs, and the ladder tops out at semibold because `bold` is refused system-wide — a 700 face is a fifth way to say \"important\" competing with three the system already designs. Rests regular: body copy is what everything else is heavier than."
      }
    ]
  },
  "Theme": {
    "element": null,
    "props": [
      {
        "name": "appearance",
        "type": "Appearance",
        "optional": true,
        "doc": "§5, §7 — which palette this scope resolves against. `inherit` is the third value and it is not a no-op: it emits no attribute at all, so the nearest ancestor keeps applying — which is exactly what the dark-SSR design needs. A pre-paint inline script owns `data-appearance` on `<html>`, the root Theme inherits it, and there is one source of truth with no flash and nothing for hydration to mismatch. Set it to pin a section against the document: a light panel inside a dark app is `appearance=\"light\"` here."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The subtree the scope covers. The Theme renders a real element to carry its attributes, because the tokens are scoped by attribute selectors and an attribute needs a node."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "contrast",
        "type": "Contrast",
        "optional": true,
        "doc": "§7 — the CONFORMANCE surface, not a design knob. At rest a border or a fill is dress, judged by eye and held to no floor; `high` is where the floors bind, re-solving the tone bands, the control and field edges and the track to their conformance tiers, and leaning on the glass rather than unmaking it (§10). Left UNSET the Theme stamps no attribute, which is what lets `@media (prefers-contrast: more)` reach the scope; asking for `normal` is an explicit opt-out of that platform signal."
      },
      {
        "name": "density",
        "type": "Density",
        "optional": true,
        "doc": "§3, §12 — how tightly the app breathes. It re-picks the layout-space steps every distance reads and re-declares the control family's designed heights and paddings; it deliberately reaches NEITHER type, the icon box, nor a mark, which are content and would otherwise answer the same question twice. An app identity chosen once — a denser toolbar is a nested Theme on an element that already exists, never a prop per control."
      },
      {
        "name": "depth",
        "type": "Depth",
        "optional": true,
        "doc": "§5, §10 — does light exist in this app: whether surfaces sit up off the page and raised controls catch it. Elevation is an app identity and never a per-card knob — no call site chooses a shadow — so this is the one sanctioned consumer of the shadow palette, and `flat` spells the no-op layers rather than deleting the rules."
      },
      {
        "name": "material",
        "type": "Material",
        "optional": true,
        "doc": "§10 — OF WHAT MATERIAL IS THIS APP BUILT (2026-08-16, Kushagra; moved here from nine component props). One value for the whole scope: a table and a chair made of the same oak are the same oak, so a dialog and a menu under one theme are the same glass, and there is no per-family rung to walk and no ceiling to hit at `thick`. What makes a dialog read heavier than a menu is therefore NOT its material — it is coverage and the scrim. The same glass over 900px of application obscures far more than the same glass over a 170px menu, and a dialog additionally pushes the page back behind a scrim it already owns. Nothing needed a second thickness to say that. `solid` is the default and is a material, not the absence of one: it is the rung where light stops passing through. That is also why this is not a boolean — `glass` would still owe a thickness beside it, which is two props for one fact. The value reaches components through CONTEXT and each component stamps its own `data-material`; the Theme writes no material attribute of its own. The selectors stay element-keyed, which is what the `@property inherits: false` guards in recipes.css were built for — a descendant-keyed rule would make every control inside a glass pane paint its container's veil, the defect those guards already fixed four times."
      },
      {
        "name": "pointer",
        "type": "Pointer",
        "optional": true,
        "doc": "§16, §17 — which pointer world this scope is priced for. `auto` follows `@media (pointer: coarse)`. Pinning forces the WHOLE world, not just the touch targets: the coarse geometry, the wider control cells, the mark ladder and §17's handheld type band all move together, which is both what a phone actually needs and how those cells get judged on a desktop. There is no `device` prop — coarse means handheld."
      },
      {
        "name": "radius",
        "type": "RadiusLevel",
        "optional": true,
        "doc": "§6 — the corner identity, one app-wide choice. Each level is a designed palette rather than a factor, re-declared per family, so `none` squares every corner that is DRESS while the four that are role semantics hold their shape (a radio, the two grips, and the channel a round grip nests in). `full` STATES the capsule per cell — half the control's own height — rather than asking CSS to clamp a huge number against the rendered box."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Put the theme on an element you already have, rather than adding a wrapper (§5). Never `<body>` or `<html>`: portals land at `document.body`, and a theme ON the body contains its own portals — the stacking frame inverts silently and an app z-index covers every popup (§20). A dev-build warning fires if you do."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  }
};
