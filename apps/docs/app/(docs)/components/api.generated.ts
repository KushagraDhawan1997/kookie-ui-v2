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
  "AccordionItem": {
    "element": null,
    "props": [
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
  "AccordionPanel": {
    "element": null,
    "props": [
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
  "Accordion": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "An index into the control family, 1–4. It sets the trigger rows — height, inset, type step, the chevron's box — and the panel's inset with them, so the panel's words start under the trigger's label. Defaults to `2`."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "AccordionTrigger": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "headingLevel",
        "type": "2 | 3 | 4 | 5 | 6",
        "optional": true,
        "doc": "The heading level the trigger sits in. An accordion's triggers are headings — that is how a screen reader user finds them — and the level should follow the page's outline. Defaults to `3`."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "AlertDialogAction": {
    "element": "button",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The committing choice, in words, and it should be the verb. \"OK\" makes the reader go back to the title to remember what they are agreeing to. \"Delete\" answers the question where it is pressed."
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
        "doc": "Turns the committing action off, for a confirmation that is not satisfied yet, such as a typed-name gate or a pending check. Cancel stays live, so this is never a trap."
      },
      {
        "name": "onClick",
        "type": "React.MouseEventHandler<HTMLButtonElement>",
        "optional": true,
        "doc": "Where the work starts. The alert closes on the same press, because its job ends when a choice is made. An action that has to wait for a result and report back belongs in a Dialog whose `open` you control."
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
        "doc": "The one meaning an action may carry beyond going ahead. Use `destructive` for the deletes this component mostly exists for. Neutral otherwise."
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
        "doc": "The way out, in words. \"Cancel\" always reads, and naming what staying means often reads better, such as \"Keep editing\". Judge the two buttons together: two named sides is what makes the alert a choice rather than a warning with a dismiss button."
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
        "doc": "Turns off the safe way out. It is rarely right, because it leaves Escape as the only retreat from a panel that refuses outside presses."
      },
      {
        "name": "onClick",
        "type": "React.MouseEventHandler<HTMLButtonElement>",
        "optional": true,
        "doc": "Runs on the press, before the alert closes. Cancel always closes, so use this for tidying up, never for deciding whether to close."
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
        "doc": "The alert's parts, in reading order: `AlertDialogTitle`, `AlertDialogDescription`, then `AlertDialogCancel` and `AlertDialogAction`. Write a list of parts, never a Flex, because Content owns the layout. That is what lets the entry animate the content, and what makes Cancel-first mean reading order, start side and initial focus at once. Anything beyond those four makes the thing a Dialog."
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
        "doc": "What going ahead costs: the consequence the title could not fit, said once. It is announced together with the title, so it should add something, such as what is lost and whether it comes back, rather than restate the question in longer words."
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
        "doc": "The trigger and the content. AlertDialog renders no DOM of its own, only state and wiring, so this is an `<AlertDialogTrigger>` and an `<AlertDialogContent>`."
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
        "doc": "Fires on every open and close. It carries no dismissal details, and that follows from the role rather than being an omission: an alert refuses outside presses, so the only ways out are the two buttons and Escape, and Escape is the Cancel action by another route."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state, paired with `onOpenChange`, in the pattern the whole library shares."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "Sets the whole alert: the box, the corner, the padding, the title and description type steps, and the two buttons. It may reach the type where Dialog's size cannot, because the content here is the system's own."
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
        "doc": "The question, phrased as one. It is the alert's accessible name as well as its heading, so it should say what is about to happen and to what. \"Delete three files?\" works. A title naming the widget leaves the buttons underneath meaningless."
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
        "doc": "The button's words. Name what is about to be risked rather than the alert itself: \"Delete…\" opens the confirmation, and the ellipsis is the platform's own promise that a question is coming. They land on the `render` target, so a Kookie Button plus children is one button."
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
        "doc": "Turns the trigger off, so the alert cannot be raised from here."
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the rendered element really is a `<button>`. It is inferred from `render`."
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
  "AvatarGroup": {
    "element": "span",
    "props": [
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "One step for every avatar in the group. The group is a line of text with no words in it, and each unset avatar takes that line — so the size is said once, here, and an avatar that states its own still wins."
      }
    ]
  },
  "Avatar": {
    "element": "span",
    "props": [
      {
        "name": "alt",
        "type": "string",
        "optional": true,
        "doc": "What the picture is, for someone who cannot see it. Defaults to empty, which marks the image decorative — right when the person's name is written beside it, which is where an avatar usually is. State the name here when the avatar is the only thing naming them."
      },
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Says that content passes behind this avatar, so the theme's material can show through its fallback face (a picture is opaque and covers it). Unset, it follows the surrounding `<Box backdrop>` region — Chip's wiring."
      },
      {
        "name": "badge",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A `Badge` pinned to the top-end of the disc — a count, or a bare dot. The avatar owns the corner and the cut-out (a ring in the surface colour, the group's own); the badge owns only itself. A word beside the avatar is a Chip in the row, not this."
      },
      {
        "name": "fallback",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "What shows when there is no picture: initials, usually. Unset, a generic person glyph. A string is drawn at the avatar's own type step; anything else is placed as given."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "A step on the type ramp, 1–9, and OPTIONAL with no default: unset, an avatar is exactly one line of the text beside it, so the one next to a name in a list is list-sized and the one in a profile header is header-sized with nothing said twice. Set it when the avatar stands alone."
      },
      {
        "name": "src",
        "type": "string",
        "optional": true,
        "doc": "The picture. When it has not loaded, or fails, the fallback shows in its place."
      }
    ]
  },
  "Badge": {
    "element": "span",
    "props": [
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "A step on the type ramp, 1–9, and OPTIONAL with no default: unset, a badge is a share of the line it sits in — the tab label, the row, the avatar it is pinned to — so it is never priced twice. Set it only when it stands alone."
      },
      {
        "name": "tone",
        "type": "Tone",
        "optional": true,
        "doc": "What the badge means, in the system's own vocabulary: `accent` (the default) for \"something is here\", `destructive` for \"something needs you\", `warning`, `success`, `info` or any family. It is the same closed set every tone-carrying component reads, so an app maps its own words onto it — \"alert\" is `destructive` — and the system never learns them."
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
        "doc": "Picks an ink colour. It rests loud, as all type does, because a quote is something somebody reads and quiet sits below the reading contrast floor."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into the element the document needs, such as a child of a `<figure>`."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "A step on the shared ramp. It defaults to 3 like `Text`, and unlike `Code`, because a quote is a block and sets its own step rather than taking the line it sits in."
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
        "doc": "Moves the ink onto that family. It does not tint the rule: a destructive quote is red words beside a neutral rule."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "Token names, never numbers, and semibold is the heaviest. It rests at regular, like `Text`, because a quote is copy. The rule and the indent set it apart, and a heavier weight would make it a heading in quotation marks."
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
        "doc": "Marks a region where content passes behind the components inside it, such as a toolbar over a canvas or a panel over a hero image. Every glass-capable component within it (buttons, fields, cards, selects) then resolves the theme's material instead of solid. Say it once for the region rather than on every control. `backdrop={false}` marks a sub-region as plain again. Layout is untouched: this is a React context, not a style."
      },
      {
        "name": "container",
        "type": "boolean",
        "optional": true,
        "doc": "Make this Box measurable. Responsive values such as `{ initial, sm, md, lg }` on anything inside it then resolve against this Box's width instead of against the nearest measurable ancestor, which is the Theme root when there is nothing nearer. CSS imposes a trade here: a measurable box can never size itself around its contents, so its width has to come from outside. Put `container` on things the layout already sizes, such as a sidebar with a width, a main column that grows, or a grid cell. Or state `width`, `flexGrow` or `flexBasis` yourself. A container Box left to shrink-wrap, for example as a plain flex-row item, renders zero pixels wide, and a development build warns you when that happens."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into an element you already have, instead of adding a wrapper."
      }
    ]
  },
  "BreadcrumbEllipsis": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "items",
        "type": "BreadcrumbEllipsisItem[]",
        "optional": false,
        "doc": "The levels you dropped, in path order. REQUIRED, and that is the design: three dots say \"there is more here\", so an ellipsis that opens nothing is a control promising something it does not have. The component owns the menu so that no call site can ship a dead one."
      },
      {
        "name": "label",
        "type": "string",
        "optional": true,
        "doc": "What the hidden stretch is called — the button's accessible name. A WORD, so a non-English app states its own."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "BreadcrumbItem": {
    "element": "li",
    "props": [
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
  "BreadcrumbLink": {
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
        "doc": "Render into your framework's own link component, or an `<a>` carrying `target` and `rel`. `BreadcrumbLink` supplies the treatment; where it goes is yours."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "BreadcrumbPage": {
    "element": "span",
    "props": [
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
  "Breadcrumb": {
    "element": "nav",
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the `<nav>` — the element you lay out. The list inside it is the system's."
      },
      {
        "name": "label",
        "type": "string",
        "optional": true,
        "doc": "The landmark's accessible name, which is how a screen reader's landmark list tells this `<nav>` from the app's own. It is a WORD, so a non-English app states its own — `Notice`'s `dismissLabel` is the same prop for the same reason."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "A step on the shared ramp, and it reaches every crumb by inheritance — a bar of mixed steps is not a thing anyone means, which is Tabs' own sentence one family over. Defaults to 2, §15's label-and-meta rung: a breadcrumb tells you where you are, and where you are is not the thing you came to read."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
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
        "doc": "Says that content passes behind this button, so the theme's material can show. Unset, it follows the surrounding `<Box backdrop>` region. It cannot pick a material. It only says there is something behind this to bend."
      },
      {
        "name": "bordered",
        "type": "boolean",
        "optional": true,
        "doc": "Adds a hairline. It is separate from loudness: quiet with a border is the old outline button, and it reads half a step above quiet."
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
        "doc": "How loud this action is against the actions beside it. It is the only ranking axis in the system, and there is no `variant`: one prop cannot mean colour and prominence at once. On a button it picks a fill. Loud is the tone's solid colour, medium is a soft wash, and quiet has no fill at all. Read a row of actions in the order the fills state. Defaults to `medium`, so a screen earns its one loud button by asking for it."
      },
      {
        "name": "focusableWhenDisabled",
        "type": "boolean",
        "optional": true,
        "doc": "Keep focus on the button when it becomes disabled part-way through an interaction."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The slot before the label, usually an icon. While `loading` is true the Spinner takes this slot, in the same box, so nothing shifts."
      },
      {
        "name": "loading",
        "type": "boolean",
        "optional": true,
        "doc": "Blocks the press and shows a Spinner. The label never goes away. On an `iconOnly` button the Spinner takes the glyph's place rather than sitting beside it, because there the glyph IS the label."
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the rendered element really is a `<button>`. It is inferred from `render`, and you almost never need to pass it. It exists because Base UI decides its whole accessibility contract from this value, and getting it wrong fails silently."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into an element you already have, such as a link or a `<summary>`. The appearance and the behaviour stay this component's, and only the tag changes. Base UI decides its accessibility contract from what the result is, which is inferred from what you pass here. See `nativeButton` for the case that cannot be inspected."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "An index into the control family, never a measurement. One number sets five things at once: the height, the side padding, the corner, the icon box and the label's type step. Every control at the same index stands level with every other, and re-pricing a step is one config line rather than a sweep of call sites. Density and the pointer setting change what the index resolves to. They never change what it means. Defaults to `2`."
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
        "doc": "What the action means, not what colour it is. `destructive` says what the press does, and the theme decides the colour, which is what lets a palette move without a call site being edited. Defaults to `neutral`, so nothing is accent by accident."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The slot after the label: a chevron, a count, or a whole control. The Spinner never replaces it."
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
        "doc": "Says whether something passes behind this card: a hero image, a canvas, a scrolling feed. A card in ordinary flow sits on the page, where glass blurs nothing and still costs a full backdrop read on every paint, so by default it renders solid whatever the theme's material is. Unset, it follows the surrounding `<Box backdrop>` region. A menu or a dialog always covers content, so neither needs this. The material itself is still the theme's: this prop cannot pick one."
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
        "doc": "Render into an element you already have, and let that element decide what the card does. An `<article>` stays inert. A button or a link presses, and takes the control state machine whole, disabled included. A `<label>` wrapped around a `Radio` or a `Checkbox` makes the whole card the target of that control, and the chosen card takes the selected edge. There is no `selected` prop and no `interactive` prop, because the element already says which of these it is."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "Sets the padding and the corner. A card has no height of its own to set."
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
        "doc": "An index into the mark ladder, which every control that is its own mark shares. It leaves the height ladder, because that is the geometry of a box that contains a label and this one sits beside one. It keeps the index, so a checkbox, a radio and a switch at the same number read as the same size of thing. The ladder is the line box, so the mark is exactly one line of the label beside it and lines up with no offset. Defaults to 2."
      }
    ]
  },
  "Chip": {
    "element": "span",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "States PLACEMENT, never a material (§10, 2026-08-26 — Kushagra: \"chip must grow backdrop\", the floating-controls-take-glass rule reaching the one inert atom that floats): a chip overlaying content — a status chip over an image, a count over a map, a file label over a code well — marks itself as over-content and resolves the theme's material. On calm ground it resolves solid and pays nothing. `Code` and `Kbd` deliberately do not take it: they live inside running text, which never floats."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "The word, or the count. A chip with nothing in it is refused by this type: see below."
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
        "doc": "Picks an ink colour, the same three the surrounding copy uses. It moves the letters, not the fill — a chip that faded its box would be reading one axis two ways."
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
        "doc": "A step on the shared ramp. Optional with no default, for the same reason `Code` and `Kbd` are: a chip takes the size of the line it sits beside, so a chip next to a card title is bigger than one in a table row without either call site repeating the index. Set it only when the chip stands alone."
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
        "doc": "The family, and this is the axis a chip exists for. `success` for a finished job, `destructive` for a failed one, `warning` for one that needs attention, `info` for one that is merely running. It moves the INK, and the chip stays grey. That reversed on 2026-08-23 (Kushagra, from the tone x emphasis board: *\"why do these buttons continue to have a light filter?\"*): no family paints a faded wash any more, so a chip's box is one neutral whatever category it carries and the category arrives in the letters. Measured, a `destructive` chip is byte-identical to a `neutral` one and only the word is red. `Notice` deliberately did NOT follow, and that is the line the change was drawn along: a chip's chip reads `--tone-soft` and a Notice's box reads `--tone-a3`, so a tone-forward SURFACE keeps its tint while a chip loses one. Defaults to `neutral`."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "Token names, never numbers, and semibold is the heaviest. Unset with no default, as `size` is: the fill and the pill are what mark a chip out, never the weight."
      }
    ]
  },
  "CodeBlock": {
    "element": null,
    "props": [
      {
        "name": "band",
        "type": "boolean",
        "optional": true,
        "doc": "Does the top row SPAN the pane, so the code owes it a safe area? A BAND IS RESERVED FOR A ROW THAT REACHES TWO WALLS, NOT FOR ONE CONTROL IN A CORNER. A name at one wall and an action at the other cover the whole of the first line, so the first line needs somewhere else to be. A row holding only an action occupies one corner, and reserving a pane's width of clearance for it puts a hand's width of nothing in the other one. A FLAG HERE AND A NODE ABOVE, deliberately: the well cannot read its chrome's shape off the node — counting the row's children would be this element guessing at the caller's arrangement. What it can be told is the one geometric fact it needs, by the code that decided it."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "The code. Plain text, or the spans a highlighter produced from it."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the code element (the `<pre>`), which is where a highlighter's own classes go. Outer spacing is the caller's Box, never this."
      },
      {
        "name": "footer",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The same row at the BOTTOM of the pane — an expand control, a status line. Both rows hang from the pane itself, so in a hosted well they measure from the same box: hanging one of them from a wrapper around the element counts the host's inset twice."
      },
      {
        "name": "hosted",
        "type": "boolean",
        "optional": true,
        "doc": "The element is already inside a pane, so it draws none of its own. A pane inside a pane of the same kind is two grounds painting one colour, separated by a hairline that says nothing — the fault §10 names when it separates a Card (an object) from a Surface (what an object sits on). A code well is a ground, so a well inside a ground is the same ground twice. Hosted, the HOST's pane is the well: fill, corner, hairline, clip and inset all come from it, and what stays here is the one thing the host cannot give — a positioning context for the floating chrome, and a scroller that reaches the host's own walls. It is not a second appearance. The element still renders one arrangement; this says who owns the box around it, the way §4 says a hosted control's geometry comes from its container."
      },
      {
        "name": "maxLines",
        "type": "number",
        "optional": true,
        "doc": "The bound: the well's maximum height, in LINES of its own code. Bounded means SCROLLABLE, never clipped — every line stays reachable by wheel, keyboard and assistive technology. That is what lets an expand control be a convenience rather than a gate: a collapse that hides code leaves it in the tab order, and this shape makes that defect inexpressible. No fade over the last lines. A scrollable well with a visible scrollbar already says there is more."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "One index for the whole element: the pane's padding and corner, the mono step, and the arithmetic the bound and the chrome's safe area are built from. SIZE PRICES EVERYTHING here for the reason §24/§25/§30 already state: a component that owns its pane AND its text prices both. `Dialog` stops at the box because its content is the caller's; a code well's content is code, and code is the one thing this element knows it is holding."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "topbar",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A row floating over the TOP of the pane — a file name, a language chip, a copy button. A NODE RATHER THAN A FLAG, because the well does not know what its chrome is. It owns the pane, the mono step, the scroller and the row's BOX; what sits in the row, and how that content is arranged, belongs to the caller. Pass content, not a positioned element: the element places the row itself, reaching both walls and padding itself back by less than the code's own inset, so the chrome reads as belonging to the pane rather than to the text. It floats rather than sitting in flow because a translucent control exists to be legible with content passing behind it. A glass row with nothing behind it is decoration wearing a material's name. The platform pattern is the same one: a scroll view holds a top content inset and its content passes under a translucent toolbar."
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
        "doc": "Picks an ink colour, the same three the surrounding copy uses. It rests loud, because a faded literal is harder to read and gains nothing."
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
        "doc": "A step on the shared ramp. It is optional with no default, which is the one thing this component does differently from `Text`: a word inside a sentence has no size of its own. Unset, it takes the font size, line height and letter spacing of the line it sits in, so `<Text size=\"2\">the <Code>value</Code></Text>` matches without the call site repeating the index. Set it only when the chip stands alone."
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
        "doc": "Moves both the ink and the chip's own fill onto that family, because a word with a fill behind it has two things to tint. Defaults to `neutral`."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "Token names, never numbers, and semibold is the heaviest. Unset with no default, for the same reason `size` is: a literal quoted inside a sentence keeps that sentence's weight, and the mono font is already what sets it apart."
      }
    ]
  },
  "ComposerInput": {
    "element": "textarea",
    "props": []
  },
  "Composer": {
    "element": "form",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Says content passes behind the composer, so the theme's material can show. Unset, it follows the surrounding `<Box backdrop>` region. A composer over a scrolling conversation is the case selectivity exists for (§10)."
      },
      {
        "name": "onFiles",
        "type": "(files: File[]) => void",
        "optional": true,
        "doc": "Files dropped on the composer or pasted into its input, handed over raw. The system owns the two events that land on its own elements; the app owns the files and everything after (§30). There is no attach button here for the same reason."
      },
      {
        "name": "onSubmit",
        "type": "(event: React.FormEvent<HTMLFormElement>) => void",
        "optional": true,
        "doc": "Fired when the person sends. The event is already `preventDefault`ed."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The index, set once for the whole unit. It prices the pane's padding and corner, the step its own text is set at, AND the controls you compose into the row — a Button, a Select or a field under the text all take it through `ControlSizeContext` (§28), so a composer is sized as one thing. An explicit `size` on a control always wins, so nothing is ever re-sized behind a number somebody typed. The reach stops at the composer's own subtree: a Button beside it keeps the family's rest."
      }
    ]
  },
  "ComposerRow": {
    "element": "div",
    "props": []
  },
  "ComposerSend": {
    "element": null,
    "props": [
      {
        "name": "icons",
        "type": "Partial<Record<ComposerStatus, React.ReactNode>>",
        "optional": true,
        "doc": "The glyph in each state. The system ships no icon set (§8), so these are the app's."
      },
      {
        "name": "labels",
        "type": "Partial<Record<ComposerStatus, string>>",
        "optional": true,
        "doc": "The accessible name in each state, for an app that is not in English."
      },
      {
        "name": "onStop",
        "type": "() => void",
        "optional": true,
        "doc": "Called instead of submitting while `status` is `streaming`."
      },
      {
        "name": "status",
        "type": "ComposerStatus",
        "optional": true,
        "doc": "What the request is doing. Defaults to `ready`."
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
        "doc": "The button's words. They land on the `render` target when there is one, so `<DialogClose render={<Button/>}>Cancel</DialogClose>` is a single button carrying a single label, not a Button nested inside a second one."
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
        "doc": "Whether the rendered element really is a `<button>`. It is inferred from `render`."
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
        "doc": "The panel's whole content, and it belongs to you. That is the line between this component and AlertDialog, whose content belongs to the system. Nothing here is arranged for you, so write the layout the screen needs. Two parts are worth reaching for: a `DialogTitle`, without which the panel has no accessible name at all, and a `DialogClose`, because a screen reader user inside a trapped panel needs a reachable way out."
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
        "doc": "The supporting line: what the panel is asking for, said once. It is announced together with the title, so a description that restates the title is heard twice. A panel with nothing to add has no description, rather than a padded sentence."
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
        "doc": "The trigger and the content. Dialog renders no DOM of its own, only state and wiring, so this is a `<DialogTrigger>` and a `<DialogContent>`, in either order."
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
        "doc": "Fires on every open and close, controlled or not. The second argument is what makes a guard writable: `reason` names what did it, such as an outside press or Escape, `event` is the native event behind it, and `cancel()` refuses that one dismissal. That makes \"you have unsaved changes\" a real answer rather than a race."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state. Pass it with `onOpenChange`. These three props are the library's one controlled-state pattern, and every floating component and every Shell pane repeats it unchanged."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "Sets the panel's maximum width, its padding, its corner — and the two parts the system owns, `DialogTitle` and `DialogDescription`, which take the same step map an alert's title and description take, so the two components agree at every index. It never touches type the call site wrote: a `<Text>` or a `<Heading>` you place keeps its own step."
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
        "doc": "The panel's name, in words. It is the visible heading and the string a screen reader announces the dialog by, which is one obligation rather than two. Name the task, such as \"Rename project\", never the widget."
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
        "doc": "The button's words. They land on the `render` target when there is one, so `<DialogClose render={<Button/>}>Cancel</DialogClose>` is a single button carrying a single label, not a Button nested inside a second one."
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
        "doc": "Whether the rendered element really is a `<button>`. It is inferred from `render`."
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
  "FieldItem": {
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
        "doc": "The control index, set once for the whole unit: the label, the description, the error and the control inside it. It reaches the control through React context, and an explicit `size` on the control always wins, so a control is never re-sized behind a number somebody typed."
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
        "doc": "Picks an ink colour, the same three `Text` uses. Use it for a muted section label."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Name the real outline level, such as `render={<h1/>}`, without moving the type step."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "A step on the same ramp `Text` reads. One type system, not two, so the index means the same thing on both. It sets the type and nothing else: the document outline level is `render`'s job, which is what lets a sidebar's `h2` sit at 4 while the hero's sits at 8. Defaults to 6, the card-title step."
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
        "doc": "A meaning for the ink, never a colour name. The theme resolves the colour."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "Token names, never numbers. It rests at semibold, which is also the heaviest weight in the system, because `bold` is refused. A heading gets its weight from the step it stands on and the ink colour it wears, never from a heavier face."
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
        "doc": "Picks an ink colour, as it does on all type. It changes the letters, not the cap."
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
        "doc": "A step on the shared ramp. Optional with no default, for the same reason `Code` is: a key cap inside a sentence takes that sentence's step."
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
        "doc": "Moves the ink and the fill onto that family. The edge is a grey relief line and does not follow the tone. Defaults to `neutral`."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "Token names, never numbers, and semibold is the heaviest. Unset with no default, as `size` is. The box, the edge and the shadow are what say \"key\". The weight never was."
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
        "doc": "Render into the element you need, such as your framework's own link component or an `<a>` carrying `target` and `rel`. `Link` supplies the type treatment. The element and where it goes are yours."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "A step on the shared ramp. Optional with no default, which is `Code`'s rule: a word inside a sentence has no size of its own. Unset, a link takes the font size, line height and letter spacing of the sentence it sits in, so a link inside `<Text size=\"2\">` matches without the call site repeating the index. Set it only when the link stands alone."
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
        "doc": "A meaning, never a colour name. It moves the ink onto that family, so a destructive link is red words with a red underline. It defaults to `accent`, which is one of four places in the system where a component does not rest neutral. A link is the one run of text whose job is to be found inside a paragraph. The exception is about which family it picks, not about loudness, so the rule that a screen has one focal action is untouched."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "Token names, never numbers, and semibold is the heaviest. Unset with no default, for the same reason `size` is: a link inside a sentence keeps that sentence's weight, and the colour and the underline already set it apart."
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
        "doc": "Controlled ticked state, paired with `onCheckedChange`. Ticked shows as the accent colour on the indicator and nothing else, because rows are peers: a chosen row is marked rather than made louder, which is what keeps a menu of ten filters from looking like a ranking."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The row's words: the thing being toggled, phrased so the ticked state reads as true."
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
        "doc": "Close the menu when this row is chosen. Off by default for a checkable row, because toggling several filters is one visit."
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
        "doc": "Turns the row off, so the toggle cannot move. Its current state still shows, which is the point: \"on, and you may not change it\" is information."
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
        "doc": "The tail of the row: a shortcut hint or a count. The head is the tick's reserved gutter."
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
        "doc": "The panel's rows: `MenuItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuGroup`, `MenuLabel` and `MenuSub`. A divider is the ordinary `<Separator>`, because a menu-specific part would rename a component that already exists. Everything here mounts inside the portal, where the panel re-applies the theme axes of the place it landed rather than the ones it was written under."
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
        "doc": "The rows the group holds, and at most one `MenuLabel` naming them. Putting the label inside the group is what earns the association: Base UI points the group's `aria-labelledby` at it, so the name is announced rather than only printed above the rows."
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
        "doc": "The row's words, which are the verb. Plain text keeps typeahead working. Anything richer needs a `label`."
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
        "doc": "Close the menu when this item is chosen. On by default, because a menu is a list of verbs."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Turns the row off, so it cannot be chosen. It stays in the list on purpose: a greyed row still says the action exists and where it lives, and removing it says nothing."
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
        "doc": "Artwork at the head of the row, usually an icon. It is the same slot a checkable row's tick occupies, so an icon here and a tick one row down sit in one column. That is also why there is no `inset` prop: a checkable row keeps its indicator mounted whether or not it is ticked, so the gutter holds by geometry rather than by a flag."
      },
      {
        "name": "onClick",
        "type": "React.MouseEventHandler<HTMLElement>",
        "optional": true,
        "doc": "What choosing the row does. The menu closes around it, so this is where work starts. Anything that has to report back needs a surface that outlives the panel."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render the row into the element it really is — your framework's link component, or an `<a href>`, for a menu of PLACES rather than of verbs. The row stays one target, which is the whole reason this is a render escape and not a nested anchor: a link inside the row would be a second target inside a target, and `trailing`'s own note already refuses that. Opened 2026-09-01 for `BreadcrumbEllipsis`, which is a list of places by definition."
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
        "doc": "The one meaning a row may carry. It is not a palette: the list stays this narrow on purpose, and widening it is a decision rather than a default."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The tail of the row: a `<Kbd>` shortcut hint, a count, a state glyph. Not a second action. A row is one target, and a control inside it would be a second one."
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
        "doc": "The heading's words: what the rows beneath it have in common. Nothing here is pressable. A label that names an action is a `MenuItem` written in the wrong part."
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
        "doc": "The trigger and the content. Menu renders no DOM of its own, only state and wiring, so this is a `<MenuTrigger>` and a `<MenuContent>`."
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
        "doc": "Fires on every open and close, controlled or not, including the dismissals the menu handles itself: Escape, an outside press, and choosing a row."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state, paired with `onOpenChange`, in the pattern the whole library shares. A menu rarely needs it, because opening is the trigger's job."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The same index the trigger wears. The rows, the glyphs and the type all take it."
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
        "doc": "The `MenuRadioItem` rows, and at most one `MenuLabel` naming the question. A radio group is a group, so the label is wired to it exactly as `MenuGroup`'s is."
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
        "doc": "Turns every row in the group off at once. One statement rather than the same prop repeated per row, so a group that is momentarily unavailable cannot be half-disabled."
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
        "doc": "Controlled chosen value, paired with `onValueChange`. The group holds the choice and the rows only report it, which is why exclusivity needs no bookkeeping at the call site."
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
        "doc": "The row's words: the option itself, not a sentence about it."
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
        "doc": "Close the menu when this row is chosen. Off by default, like the checkable row's, because staying open is what lets you watch the dot land where you put it. Turn it on where choosing is the whole visit."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Turns the row off, so it cannot be chosen. It still shows whether it currently is the choice, which is the case this matters for: the answer you are stuck with."
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
        "doc": "The tail of the row: a shortcut hint or a count. The head is the dot's reserved gutter, mounted whether or not this is the chosen row."
      },
      {
        "name": "value",
        "type": "string",
        "optional": false,
        "doc": "What this row answers with. The group compares it against its own value to decide which row is marked, so it has to be unique inside the group. Two rows sharing a value are one choice drawn twice."
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
        "doc": "The child panel's rows, written exactly as a top-level panel's are, including a further `MenuSub`, which nests with no depth limit. What differs is the geometry, and that belongs to the system: the panel takes its width from what is in it rather than from the panel it came out of."
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
        "doc": "The `MenuSubTrigger` row and the `MenuSubContent` panel it opens. MenuSub renders no DOM of its own, only state and wiring, exactly like the root."
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
        "doc": "Controlled open state of this submenu, paired with `onOpenChange`. It is independent of the menu the row sits in: a submenu opens and closes on its own row, and closing it leaves the parent panel standing. Rarely needed, because opening is the sub-trigger's job."
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
        "doc": "The row's words: the name of the group of actions inside, not an action itself. Choosing this row opens a panel. It never does anything else."
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
        "doc": "Turns the row off, so the child menu cannot be opened."
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
        "doc": "Artwork at the head of the row, in the same reserved gutter every other row uses. Only the head: the tail belongs to the system here, because the chevron that says a child menu exists is not a call-site decision."
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
    "element": "button",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The trigger's own label, and it stays yours: a menu never writes back into the button that opened it. Reporting a chosen value on the trigger is Select's job. It lands on the `render` target, so `render={<Button/>}` plus children is one button."
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
        "doc": "Turns the trigger off, so the menu cannot be opened. It reaches whichever accessibility contract `nativeButton` resolved to, which is why that inference exists: on an anchor, `disabled` is an inert attribute and the announcement has to come from `aria-disabled`."
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the rendered element really is a `<button>`. It is inferred from `render` exactly as Button infers it, and you almost never pass it. The escape is for a custom component whose own root is a button, which inspection cannot see through."
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
  "NavTree": {
    "element": "div",
    "props": [
      {
        "name": "currentId",
        "type": "string | null",
        "optional": true,
        "doc": "The id of the node for the page the person is ON. That row announces `aria-current=\"page\"` and paints the current identity (accent ink, the medium rung) — ShellNavItem's own pair. Location, not selection: a nav tree has no selection at all."
      },
      {
        "name": "defaultExpandedIds",
        "type": "readonly string[]",
        "optional": true,
        "doc": "Uncontrolled starting expansion."
      },
      {
        "name": "expandedIds",
        "type": "readonly string[]",
        "optional": true,
        "doc": "Controlled expansion, paired with `onExpandedChange`."
      },
      {
        "name": "items",
        "type": "readonly TreeNode[]",
        "optional": false,
        "doc": "The hierarchy, as data. Leaves carry `href`; sections carry `children`. See `TreeNode`."
      },
      {
        "name": "onExpandedChange",
        "type": "(ids: string[]) => void",
        "optional": true,
        "doc": "Fires when a section opens or closes, with the whole expanded set."
      },
      {
        "name": "renderLink",
        "type": "(node: TreeNode) => RenderElement",
        "optional": true,
        "doc": "The link escape, per node — how a leaf becomes the app's router link (`renderLink={(node) => <Link href={node.href!} />}`). Without it a leaf renders a plain `<a href>`. The element's own props win, the Button-as-anchor lesson: the machine never writes `type` onto a link."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The rows' index — the row family's own `size`, stamped per row. Rests at 2."
      }
    ]
  },
  "Notice": {
    "element": null,
    "props": [
      {
        "name": "action",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "One action, and it is the one that resolves the condition. \"Get more usage\", not \"OK\". Bring your own `<Button/>`, so the system never invents a label."
      },
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Says content passes behind this strip, so the theme's material can show. A notice pinned over a scrolling region is exactly the case. A notice in ordinary flow says nothing here, resolves solid and costs nothing. Unset, it follows the surrounding `<Box backdrop>` region."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "The message, usually one sentence. A notice with several paragraphs is a Card."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the strip. Outer spacing is the caller's Box, never this (the non-negotiable)."
      },
      {
        "name": "dismissLabel",
        "type": "string",
        "optional": true,
        "doc": "The dismissal's accessible name. English by default because the package ships no translation layer; state your own and it is stated once, here."
      },
      {
        "name": "icon",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The symbol, if your app has an icon set. The package ships none, so the slot is safe when empty and a notice with nothing in it has no symbol. It carries no meaning of its own and is hidden from assistive technology, because the words are the message."
      },
      {
        "name": "onDismiss",
        "type": "() => void",
        "optional": true,
        "doc": "Acknowledgement, which is a different verb from the action: pressing ✕ agrees to stop being told, and changes nothing about whether the condition holds. **The memory is the app's, and that is the whole reason this is a callback.** A notice that dismissed itself would forget on reload, and a ✕ the app cannot honour is a ✕ that lied. Passing nothing renders no dismissal at all, which is right for a condition nobody may wave away."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "Sets the box: the padding, the corner and the dismiss button the component places. It does not set the words, because a notice holds your text and text sets its own step. It rests at 2 rather than a card's 3, because a notice is a strip across the top of something rather than an object in its own right."
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
        "doc": "The category, never the volume. It rests neutral, and a warning can be grey: a notice is a condition stated plainly, not an alarm. Reach for `warning`, `destructive`, `success` or `info` when the family says something the sentence does not already say."
      }
    ]
  },
  "PopoverClose": {
    "element": null,
    "props": [
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Usually a Kookie Button: `<PopoverClose render={<Button/>}>Done</PopoverClose>`."
      }
    ]
  },
  "PopoverContent": {
    "element": "div",
    "props": [
      {
        "name": "align",
        "type": "\"start\" | \"center\" | \"end\"",
        "optional": true,
        "doc": "How it lines up along that side."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The panel's content, and it belongs to you. One part is worth reaching for: a `PopoverTitle`, without which the panel has no accessible name."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Your classes, appended rather than replacing the component's own. They land on the panel, not on the positioner around it."
      },
      {
        "name": "side",
        "type": "\"top\" | \"right\" | \"bottom\" | \"left\"",
        "optional": true,
        "doc": "Which side of the trigger to prefer. The panel flips itself when that side has no room."
      },
      {
        "name": "sideOffset",
        "type": "number",
        "optional": true,
        "doc": "The gap from the trigger, in pixels. Defaults to the family's own."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles, merged last. They land on the panel, so a width you set is the panel's."
      }
    ]
  },
  "PopoverDescription": {
    "element": "p",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The supporting line, said once. It is announced together with the title, so a description that restates the title is heard twice."
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
  "Popover": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The trigger and the content, in that order. Both are parts of this component rather than free children: the trigger is what the panel anchors to, and the content is what portals."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Uncontrolled starting state."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Told when the panel opens or closes."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The panel's box: its padding and its corner. NOT the type inside it — the content is yours, so its steps are yours to state. That line is Dialog's and it holds here for the same reason: a surface never sizes the words it is holding. What the index does reach is `PopoverTitle` and `PopoverDescription`, because those two exist only because the accessibility wiring forces them, and type the system owns is type the system may size."
      }
    ]
  },
  "PopoverTitle": {
    "element": "h2",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The panel's name, in words. It is the visible heading and the string a screen reader announces the panel by, which is one obligation rather than two. Name the thing, such as \"Filters\", never the widget."
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
  "PopoverTrigger": {
    "element": null,
    "props": [
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Usually a Kookie Button: `<PopoverTrigger render={<Button/>}>Filters</PopoverTrigger>`."
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
        "doc": "The mark ladder, and the same index a checkbox uses. The mark is one line of the label beside it, and the circle's diameter is that square's, so a radio and the checkbox above it in a form are the same size of thing. The painted box leaves the control height ladder. The target does not: it stays the size of a control at that index. Defaults to 2."
      }
    ]
  },
  "Row": {
    "element": "button",
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "current",
        "type": "boolean",
        "optional": true,
        "doc": "This is the thing you are looking at now — the page you are on, the file that is open. It is LOCATION, not selection: it announces `aria-current` and it is not a form value. For \"the one I picked out of several\", use a `RadioGroup`: picking one of several is a radio group (§26), and a row that faked it with an attribute would be the exact shape that decision refused."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Turns the row off. It stays in the list: a dead row still says the thing exists."
      },
      {
        "name": "highlighted",
        "type": "boolean",
        "optional": true,
        "doc": "Lights the row from OUTSIDE — for a list that moves a highlight with the arrow keys while focus stays somewhere else, which is what a command palette and a search field's results both are. **Passing it at all changes how the row answers the pointer**, and that is the point. A list with a roving highlight has two cursors — the keyboard's and the pointer's — and a row that answered both would stay lit under a resting pointer after the keyboard had moved on. So a row you drive is driven only by you: state `highlighted` and hover stops painting; leave it unset and the pointer is the only cursor, which is what an ordinary list wants."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Before the label: an icon, an avatar, a tick."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Be a link, or be inert. A row that navigates should be an `<a>`, and a row in a list you only read should be a `<div>` — the element is the semantics, and this is how you say so."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The row's box: a standing row rides the control height ladder, so it stands level with a `Button` of the same index (§21). The text line plus one designed inset — the shorter box — is the FLOATING row's, i.e. a row inside a menu or a select panel. It rests at 2, like every other control in the library."
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
        "doc": "The one meaning a row carries beyond being itself. A `destructive` row is the delete in a list of verbs. It is a narrow vocabulary on purpose: a list of peers where three rows wear three families is a list that has stopped being a list."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "After it, pushed to the far edge: a shortcut, a count, a chevron."
      }
    ]
  },
  "ScrollArea": {
    "element": null,
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "Names the scroll region. A focusable ScrollArea is a real tab stop, and a tab stop with no name is announced as nothing — so this is the one thing a standalone scroll region cannot do without. Given a name, the viewport announces as a `region` landmark; given none, it stays structural and the surrounding content has to carry the meaning. It is a DECLARED prop rather than a hyphenated attribute riding a rest spread, because TypeScript exempts hyphenated JSX attribute names from excess-property checking: written on a closed props object with no rest, `aria-label` compiled, rendered, and reached the DOM nowhere at all (2026-08-26)."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "Names the region from an element that already carries the words — the heading above it, usually. Same rules as `aria-label`, and the two are mutually exclusive in ARIA."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The content that scrolls. It lands inside the viewport, never beside the bars, because the viewport, the scrollbars and the corner are assembly rather than API. A scroll region needs a bounded height to be a scroll region: state one here through `style`, or let a Shell pane or a menu's panel bound it."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the root. Outer spacing is the caller's Box, never this (the non-negotiable)."
      },
      {
        "name": "fade",
        "type": "boolean",
        "optional": true,
        "doc": "Fades content toward any edge that has more behind it (2026-08-29, opt-in). A MASK on the viewport, so the content dissolves and whatever the pane paints — seal, ground, a glass veil, a photograph — shows through; no colour is picked and none can be wrong. Each edge fades only while content is actually hidden on that side, ramping in over the first `--scrollbar-fade` pixels of scrolling, and it costs no JS of this package's: Base UI already publishes the per-edge overflow distances as CSS variables in the same pass that sizes the thumb, and the mask is pure CSS over them."
      },
      {
        "name": "focusable",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the viewport is a keyboard tab stop. It defaults to true, because a standalone scroll region has to be reachable in order to scroll by keyboard. Pass false from a component that already owns keyboard scrolling, such as Menu: ARIA drops `role=\"presentation\"` from any focusable element, so a focusable viewport inside a menu would appear as a nameless node between the menu and its items, and would add a stray tab stop."
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
        "doc": "Says content passes behind this control, so it shows the theme's material instead of resolving solid. A `<Box backdrop>` region answers this for a whole toolbar. This is the one-off escape, and it is Button's own prop."
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
        "doc": "The control height ladder, set on the track, because the track is the control: a segmented control stands level with a Button of the same size in the toolbar beside it. Each segment derives its own box from that channel, which is the track minus a fixed inset, and states no index of its own, so the two boxes cannot disagree. It sits on the root, never on a segment: a bar of mixed sizes is not a thing anyone means."
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
    "element": "div",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The option rows: `SelectItem`, divided by `SelectGroup` and named by `SelectLabel`. A `<Separator>` is refused here where a menu takes one: inside a listbox it is markup an accessibility check reports, and a group is the divider the role already has."
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
        "doc": "The `SelectItem` rows this group holds, and at most one `SelectLabel` naming them. Putting the label inside the group is what earns the association: Base UI points the group's `aria-labelledby` at it, so the name is announced with each option rather than only seen above them."
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
        "doc": "What the option reads as INSIDE the panel. The closed trigger never paints these words: Base UI resolves the trigger's text from the root's `items` map, and from nothing else. Where a label differs from its value, that map is what has to carry it."
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
        "doc": "Turns the option off, so it cannot be chosen. It stays in the list and stays announced, because a choice that is unavailable right now is information, where a missing row says nothing about why the thing you were looking for is not there."
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
        "doc": "The value this option names: what the form submits and what the trigger displays."
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
        "doc": "The heading's words: the name of the group below it, never an option. Nothing here is choosable, and a label that reads like a choice is the one way this part misleads."
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
        "doc": "The trigger and the content. Select renders no DOM of its own, only state and wiring, so this is a `<SelectTrigger>` and a `<SelectContent>`."
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
        "doc": "Uncontrolled starting value. Mutually exclusive with `value`."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Turns the whole control off: the panel cannot open and the hidden input stops submitting. It is also how you express a value that must not change, since `readOnly` is refused: HTML never defined it for a `<select>`, so a disabled trigger beside a hidden input carrying the value is how that case is written."
      },
      {
        "name": "items",
        "type": "Record<string, React.ReactNode>",
        "optional": true,
        "doc": "A map from value to label, and it is the ONLY thing that turns a chosen value into words on the closed trigger. Base UI resolves the trigger's text from this map alone — it never reads the text of the row you picked — so a select whose labels differ from its values needs it at every moment, not only before the panel has first opened. Without it the trigger paints the raw value string forever, including immediately after a click on a row that says something else. Omit it only where the value IS the label, or where the select rests on a placeholder."
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
        "doc": "Fires when the panel opens or closes. It does not fire when the value changes: that is `onValueChange`, and conflating the two is how a select ends up committing on hover."
      },
      {
        "name": "onValueChange",
        "type": "(value: string | null) => void",
        "optional": true,
        "doc": "Fires when the chosen value changes. It never fires on an open or a close. `null` is a real argument and not a defensive union: Base UI CLEARS the value when the mounted option set changes and the current value is no longer among it — a dependent pair of selects, where picking a country replaces the region list. It reaches this callback before it is applied. It used to arrive as the literal string `\"null\"` (2026-08-26 audit), which a controlled consumer would have written straight back in as a value."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state of the panel, paired with `onOpenChange`. It is independent of `value`, because opening chooses nothing."
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
        "doc": "The same index the trigger wears. The rows, the glyphs and the type all take it."
      },
      {
        "name": "value",
        "type": "string",
        "optional": true,
        "doc": "Controlled value, paired with `onValueChange`. The closed trigger paints this string unless `items` maps it to a label; a mounted row's text is never consulted."
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
        "doc": "Says content passes behind this trigger, so the theme's material can show. Unset, it follows the surrounding `<Box backdrop>` region."
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
        "doc": "Shown in the muted ink while no value is chosen. An empty select should invite a choice."
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
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Says whether something passes behind this pane: a canvas, a map, a photograph, the work area itself when this pane floats over it. A pane in an ordinary frame sits on the app's ground, where glass blurs a flat colour and still costs a full backdrop read on every paint — and a pane is the largest box in the library, so it is the most expensive place to pay for nothing. By default it renders solid whatever the theme's material is. Unset, it follows the surrounding `<Box backdrop>` region, which is what makes a flush pane translucent over a window-wide wallpaper. The material itself is still the theme's: this prop cannot pick one."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "The starting state when the pane is uncontrolled. Omit both this and `open` and the pane is auto: the stylesheet decides its resting state from the window size, and the first toggle makes the choice explicit."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "Is this pane part of the app frame? `flush`, the default, tiles it against its neighbours with one hairline at each seam. `flush={false}` pulls it off the frame, and what happens next is derived rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only when the content is itself flush. Otherwise it grounds, and becomes its own surface resting on the app's ground. One boolean reaches all four arrangements, and it cannot be told a lie a three-value prop could, such as a floating sidebar beside a grounded content card. It also decides the seams. A flush pane draws one hairline on its inner edge, and that edge needs something on the other side of it: pull the content off the frame and every seam facing it goes, because the card's own gap and edge already draw that boundary. A rail beside a flush sidebar keeps its seam — both of those are still in the frame. It says nothing about the material. A pane over a canvas states `backdrop`, whatever its posture — the two questions are independent and were briefly wired together (LOG 2026-08-29)."
      },
      {
        "name": "height",
        "type": "number",
        "optional": true,
        "doc": "The bottom pane's height in CSS pixels. It is the `width` prop's sentence turned ninety degrees."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fires on user-driven changes only: a trigger, Escape, a press on the scrim. It never fires at mount, and never when the window crosses a size boundary, because auto is resolved in CSS and CSS calls nobody."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state, in the same pattern Dialog uses. Passing it conditionally is supported. `{...(preview ? { open: false } : {})}` pins the pane closed while the flag is on, and hands control straight back when it goes. The uncontrolled state is kept untouched throughout rather than overwritten, so the pane returns to exactly the state the user last left it in."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "optional": true,
        "doc": "How this pane occupies the window while it is open. `auto` answers a question about the room, and it answers it in CSS from the window size, so first paint is right with no script and nothing for hydration to mismatch. Stating a value instead answers a question about the product, and it does more than pin the arrangement: `overlay` also makes the pane rest closed at every width, because an overlay is something you summon rather than live in, where `auto` lets a nav column rest open on a roomy window. So state a value for a pane whose behaviour is a decision, such as a drawer that must never be ambient. Leave it auto for a pane whose behaviour follows from how much window there is."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The index this pane is drawn at: its padding, and anything it holds. It defaults to the app's."
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
        "doc": "Is this pane part of the app frame? `flush`, the default, tiles it against its neighbours with one hairline at each seam. `flush={false}` pulls it off the frame, and what happens next is derived rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only when the content is itself flush. Otherwise it grounds, and becomes its own surface resting on the app's ground. One boolean reaches all four arrangements, and it cannot be told a lie a three-value prop could, such as a floating sidebar beside a grounded content card. It also decides the seams. A flush pane draws one hairline on its inner edge, and that edge needs something on the other side of it: pull the content off the frame and every seam facing it goes, because the card's own gap and edge already draw that boundary. A rail beside a flush sidebar keeps its seam — both of those are still in the frame. It says nothing about the material. A pane over a canvas states `backdrop`, whatever its posture — the two questions are independent and were briefly wired together (LOG 2026-08-29)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The index this pane is drawn at: its padding, and anything it holds. It defaults to the app's."
      }
    ]
  },
  "ShellHeader": {
    "element": "header",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Says whether something passes behind this pane: a canvas, a map, a photograph, the work area itself when this pane floats over it. A pane in an ordinary frame sits on the app's ground, where glass blurs a flat colour and still costs a full backdrop read on every paint — and a pane is the largest box in the library, so it is the most expensive place to pay for nothing. By default it renders solid whatever the theme's material is. Unset, it follows the surrounding `<Box backdrop>` region, which is what makes a flush pane translucent over a window-wide wallpaper. The material itself is still the theme's: this prop cannot pick one."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "Is this pane part of the app frame? `flush`, the default, tiles it against its neighbours with one hairline at each seam. `flush={false}` pulls it off the frame, and what happens next is derived rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only when the content is itself flush. Otherwise it grounds, and becomes its own surface resting on the app's ground. One boolean reaches all four arrangements, and it cannot be told a lie a three-value prop could, such as a floating sidebar beside a grounded content card. It also decides the seams. A flush pane draws one hairline on its inner edge, and that edge needs something on the other side of it: pull the content off the frame and every seam facing it goes, because the card's own gap and edge already draw that boundary. A rail beside a flush sidebar keeps its seam — both of those are still in the frame. It says nothing about the material. A pane over a canvas states `backdrop`, whatever its posture — the two questions are independent and were briefly wired together (LOG 2026-08-29)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The index this header is drawn at: its padding, the height of its row, and anything it holds. It defaults to the app's, like every pane."
      }
    ]
  },
  "ShellInspector": {
    "element": "nav",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Says whether something passes behind this pane: a canvas, a map, a photograph, the work area itself when this pane floats over it. A pane in an ordinary frame sits on the app's ground, where glass blurs a flat colour and still costs a full backdrop read on every paint — and a pane is the largest box in the library, so it is the most expensive place to pay for nothing. By default it renders solid whatever the theme's material is. Unset, it follows the surrounding `<Box backdrop>` region, which is what makes a flush pane translucent over a window-wide wallpaper. The material itself is still the theme's: this prop cannot pick one."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "The starting state when the pane is uncontrolled. Omit both this and `open` and the pane is auto: the stylesheet decides its resting state from the window size, and the first toggle makes the choice explicit."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "Is this pane part of the app frame? `flush`, the default, tiles it against its neighbours with one hairline at each seam. `flush={false}` pulls it off the frame, and what happens next is derived rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only when the content is itself flush. Otherwise it grounds, and becomes its own surface resting on the app's ground. One boolean reaches all four arrangements, and it cannot be told a lie a three-value prop could, such as a floating sidebar beside a grounded content card. It also decides the seams. A flush pane draws one hairline on its inner edge, and that edge needs something on the other side of it: pull the content off the frame and every seam facing it goes, because the card's own gap and edge already draw that boundary. A rail beside a flush sidebar keeps its seam — both of those are still in the frame. It says nothing about the material. A pane over a canvas states `backdrop`, whatever its posture — the two questions are independent and were briefly wired together (LOG 2026-08-29)."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fires on user-driven changes only: a trigger, Escape, a press on the scrim. It never fires at mount, and never when the window crosses a size boundary, because auto is resolved in CSS and CSS calls nobody."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state, in the same pattern Dialog uses. Passing it conditionally is supported. `{...(preview ? { open: false } : {})}` pins the pane closed while the flag is on, and hands control straight back when it goes. The uncontrolled state is kept untouched throughout rather than overwritten, so the pane returns to exactly the state the user last left it in."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "optional": true,
        "doc": "How this pane occupies the window while it is open. `auto` answers a question about the room, and it answers it in CSS from the window size, so first paint is right with no script and nothing for hydration to mismatch. Stating a value instead answers a question about the product, and it does more than pin the arrangement: `overlay` also makes the pane rest closed at every width, because an overlay is something you summon rather than live in, where `auto` lets a nav column rest open on a roomy window. So state a value for a pane whose behaviour is a decision, such as a drawer that must never be ambient. Leave it auto for a pane whose behaviour follows from how much window there is."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The control index this pane's own navigation is drawn at: its rows and its squares. It is not the pane's width. A pane's extent is a statement about your content and has no ladder, which is why `width` is a raw number and this is an index."
      },
      {
        "name": "width",
        "type": "number",
        "optional": true,
        "doc": "The pane's width in CSS pixels, and the one place this system sanctions a raw length: a pane's width is your content speaking, and no ladder could size it. It overrides the default by writing the custom property the stylesheet reads, which is also where a future drag-resize will write."
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
        "doc": "This is the page you are on. It is announced with `aria-current=\"page\"` as well as painted, because \"you are here\" is information and a colour alone tells nobody who cannot see it."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The row's icon. It rests in the label's neutral ink and takes the ACCENT only on the current row (REVERSED 2026-08-26, Kushagra, judging Finder over the docs sidebar: \"make resting icons neutral not accent\" — when every icon is accent, accent stops meaning \"you are here\", and the current row has nothing to pop against). The 2026-08-23 rule this replaces painted them accent always; recipes.css carries the reversal's record."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Be an anchor instead. A nav item usually navigates, and a link is a link."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "After the label, pushed to the far edge: a count, a chevron, a status dot."
      }
    ]
  },
  "ShellPaneFooter": {
    "element": "div",
    "props": [
      {
        "name": "float",
        "type": "boolean",
        "optional": true,
        "doc": "Lift the row out of flow, over the pane's scroller: content passes behind it, and the pane publishes `--kui-pane-inset-block-start` — one control row plus the pane's padding — so what should clear the row can pad by it and what should run behind it can ignore it. Pairs with ScrollArea's `fade`, which is what keeps the passing content legible."
      }
    ]
  },
  "ShellPaneHeader": {
    "element": "div",
    "props": [
      {
        "name": "float",
        "type": "boolean",
        "optional": true,
        "doc": "Lift the row out of flow, over the pane's scroller: content passes behind it, and the pane publishes `--kui-pane-inset-block-start` — one control row plus the pane's padding — so what should clear the row can pad by it and what should run behind it can ignore it. Pairs with ScrollArea's `fade`, which is what keeps the passing content legible."
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
        "doc": "The control index this app's navigation is drawn at. Every pane inherits it, and any pane can overrule it. It is not the app's type size, and it is not any pane's width: a pane's extent is a statement about your content and has no ladder, which is why `width` is a raw number and this is an index."
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
        "doc": "Required, because the item is icon-only, and an icon with no name is a button nobody can read. If the rail ever grows labels they go under the icon and stay a setting on the pane: one word under one icon and not the next is how a column of icons stops lining up."
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
        "doc": "Be an anchor instead. A rail is primary navigation, and a link is a link."
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
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Says whether something passes behind this pane: a canvas, a map, a photograph, the work area itself when this pane floats over it. A pane in an ordinary frame sits on the app's ground, where glass blurs a flat colour and still costs a full backdrop read on every paint — and a pane is the largest box in the library, so it is the most expensive place to pay for nothing. By default it renders solid whatever the theme's material is. Unset, it follows the surrounding `<Box backdrop>` region, which is what makes a flush pane translucent over a window-wide wallpaper. The material itself is still the theme's: this prop cannot pick one."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "The starting state when the pane is uncontrolled. Omit both this and `open` and the pane is auto: the stylesheet decides its resting state from the window size, and the first toggle makes the choice explicit."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "Is this pane part of the app frame? `flush`, the default, tiles it against its neighbours with one hairline at each seam. `flush={false}` pulls it off the frame, and what happens next is derived rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only when the content is itself flush. Otherwise it grounds, and becomes its own surface resting on the app's ground. One boolean reaches all four arrangements, and it cannot be told a lie a three-value prop could, such as a floating sidebar beside a grounded content card. It also decides the seams. A flush pane draws one hairline on its inner edge, and that edge needs something on the other side of it: pull the content off the frame and every seam facing it goes, because the card's own gap and edge already draw that boundary. A rail beside a flush sidebar keeps its seam — both of those are still in the frame. It says nothing about the material. A pane over a canvas states `backdrop`, whatever its posture — the two questions are independent and were briefly wired together (LOG 2026-08-29)."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fires on user-driven changes only: a trigger, Escape, a press on the scrim. It never fires at mount, and never when the window crosses a size boundary, because auto is resolved in CSS and CSS calls nobody."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state, in the same pattern Dialog uses. Passing it conditionally is supported. `{...(preview ? { open: false } : {})}` pins the pane closed while the flag is on, and hands control straight back when it goes. The uncontrolled state is kept untouched throughout rather than overwritten, so the pane returns to exactly the state the user last left it in."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "optional": true,
        "doc": "How this pane occupies the window while it is open. `auto` answers a question about the room, and it answers it in CSS from the window size, so first paint is right with no script and nothing for hydration to mismatch. Stating a value instead answers a question about the product, and it does more than pin the arrangement: `overlay` also makes the pane rest closed at every width, because an overlay is something you summon rather than live in, where `auto` lets a nav column rest open on a roomy window. So state a value for a pane whose behaviour is a decision, such as a drawer that must never be ambient. Leave it auto for a pane whose behaviour follows from how much window there is."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The control index this pane's own navigation is drawn at: its rows and its squares. It is not the pane's width. A pane's extent is a statement about your content and has no ladder, which is why `width` is a raw number and this is an index."
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
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Says whether something passes behind this pane: a canvas, a map, a photograph, the work area itself when this pane floats over it. A pane in an ordinary frame sits on the app's ground, where glass blurs a flat colour and still costs a full backdrop read on every paint — and a pane is the largest box in the library, so it is the most expensive place to pay for nothing. By default it renders solid whatever the theme's material is. Unset, it follows the surrounding `<Box backdrop>` region, which is what makes a flush pane translucent over a window-wide wallpaper. The material itself is still the theme's: this prop cannot pick one."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "The starting state when the pane is uncontrolled. Omit both this and `open` and the pane is auto: the stylesheet decides its resting state from the window size, and the first toggle makes the choice explicit."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "Is this pane part of the app frame? `flush`, the default, tiles it against its neighbours with one hairline at each seam. `flush={false}` pulls it off the frame, and what happens next is derived rather than chosen: a pane floats if the content is underneath it, and the content is underneath it only when the content is itself flush. Otherwise it grounds, and becomes its own surface resting on the app's ground. One boolean reaches all four arrangements, and it cannot be told a lie a three-value prop could, such as a floating sidebar beside a grounded content card. It also decides the seams. A flush pane draws one hairline on its inner edge, and that edge needs something on the other side of it: pull the content off the frame and every seam facing it goes, because the card's own gap and edge already draw that boundary. A rail beside a flush sidebar keeps its seam — both of those are still in the frame. It says nothing about the material. A pane over a canvas states `backdrop`, whatever its posture — the two questions are independent and were briefly wired together (LOG 2026-08-29)."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Fires on user-driven changes only: a trigger, Escape, a press on the scrim. It never fires at mount, and never when the window crosses a size boundary, because auto is resolved in CSS and CSS calls nobody."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state, in the same pattern Dialog uses. Passing it conditionally is supported. `{...(preview ? { open: false } : {})}` pins the pane closed while the flag is on, and hands control straight back when it goes. The uncontrolled state is kept untouched throughout rather than overwritten, so the pane returns to exactly the state the user last left it in."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "optional": true,
        "doc": "How this pane occupies the window while it is open. `auto` answers a question about the room, and it answers it in CSS from the window size, so first paint is right with no script and nothing for hydration to mismatch. Stating a value instead answers a question about the product, and it does more than pin the arrangement: `overlay` also makes the pane rest closed at every width, because an overlay is something you summon rather than live in, where `auto` lets a nav column rest open on a roomy window. So state a value for a pane whose behaviour is a decision, such as a drawer that must never be ambient. Leave it auto for a pane whose behaviour follows from how much window there is."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The control index this pane's own navigation is drawn at: its rows and its squares. It is not the pane's width. A pane's extent is a statement about your content and has no ladder, which is why `width` is a raw number and this is an index."
      },
      {
        "name": "width",
        "type": "number",
        "optional": true,
        "doc": "The pane's width in CSS pixels, and the one place this system sanctions a raw length: a pane's width is your content speaking, and no ladder could size it. It overrides the default by writing the custom property the stylesheet reads, which is also where a future drag-resize will write."
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
        "doc": "What the press does to `target`. `toggle` is the disclosure button every shell has, and it is the default. The one-way values are for a press that already means something else and must not undo itself. A rail square that re-points the sidebar has to show the sidebar, so it is `open`: as a toggle, pressing a second region would close the panel it had just filled, and picking a region the sidebar is not showing would do nothing visible at all. A dismiss button inside an overlaying pane is `close` for the mirror reason."
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
        "doc": "Names the value for assistive technology. It lands on the thumb's hidden range input. Inside a `Field` the field's label wires itself instead. A range slider names both thumbs with the same string, plus Base UI's per-thumb value text. Something that needs \"Minimum\" and \"Maximum\" is a composition of a Field and two labelled sliders, not a prop here."
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
        "doc": "The control height ladder, taken on the root, because the root is the control: the whole strip is pressable, so a slider is exactly as tall a target as the Button beside it. The same index then sizes the parts through the families they belong to, with the thumb on the mark ladder. Defaults to 2."
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
        "doc": "Render into an element you already have, such as a `<section>`, an `<aside>` or a layout primitive."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "Sets the padding and the corner, one step larger than a card at the same index, because a container needs a larger corner than the things inside it."
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
        "doc": "The mark ladder, one step up. The track is the checkbox's mark at the next index, which is the relationship every peer system arrives at by hand, so a switch reads one weight class above the checkbox at the same number while both stay in one family. The width follows the same index. Defaults to 2."
      }
    ]
  },
  "TableBody": {
    "element": "tbody",
    "props": []
  },
  "TableCaption": {
    "element": "caption",
    "props": []
  },
  "TableCell": {
    "element": "td",
    "props": [
      {
        "name": "align",
        "type": "\"start\" | \"center\" | \"end\"",
        "optional": true,
        "doc": "Where the cell's content sits on the inline axis. Numbers end-align so their digits line up; words start-align. Defaults to `start`. Set it on the head and the cells of a column together, or the column reads as two."
      }
    ]
  },
  "TableHeader": {
    "element": "thead",
    "props": []
  },
  "TableHead": {
    "element": "th",
    "props": [
      {
        "name": "align",
        "type": "\"start\" | \"center\" | \"end\"",
        "optional": true,
        "doc": "Where the cell's content sits on the inline axis. Numbers end-align so their digits line up; words start-align. Defaults to `start`. Set it on the head and the cells of a column together, or the column reads as two."
      }
    ]
  },
  "Table": {
    "element": "table",
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "Names the SCROLL REGION around the table — the box a keyboard reaches when the table is wider than its room. DECLARED rather than left to ride the rest spread, both because it has to be pulled off the props that reach the `<table>` and because TypeScript exempts hyphenated attribute names from excess-property checking, which is how a prop can compile, render, and reach the DOM nowhere at all (ScrollArea's own scar, 2026-08-26). A `<caption>` names the table itself, natively, and needs nothing here."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "The same, from an element that already carries the words — a heading above the table, usually. Mutually exclusive with `aria-label`, as ARIA has it."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Dresses the scroll wrapper, never the table — the wrapper is the element you lay out."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "An index into the control family, 1–4, and it sets two things at once: the cell inset, picked from the layout-space palette so it tightens with density, and the type step the cells read at. Defaults to `2` — the step tables are set at almost everywhere, because a table is dense by nature."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "TableRow": {
    "element": "tr",
    "props": []
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
        "doc": "The control height ladder, set on the list and not on the tabs. It is SegmentedControl's decision one component over, and the thing a reader gets wrong exactly once: the bar carries the index, and each tab derives its box from that bar and states no index of its own. A mixed-size bar is therefore not expressible, which is right, and asking every tab to repeat the number is an invitation to disagree. It sits here rather than on `Tabs` because the list is the part that has a box. The root owns no layout at all."
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
        "doc": "Says content passes behind this control, so the theme's material can show. Unset, it follows the surrounding `<Box backdrop>` region."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Applied to the wrapper, which is the element that is the control (TextField's rule)."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The control index, minus the one part a growing box cannot take. The padding, the corner, the type and the border all come from it. The height does not, because the content decides that through `rows`. The block padding IS the side padding — one inset on all four sides — so a `rows={1}` textarea sits TALLER than a TextField at the same index; the control height survives as a floor, never a ceiling."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Applied to the wrapper, so a `width` sizes the box rather than the text inside it — and so `resize: \"none\"` still reaches the handle, which the wrapper carries."
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
        "doc": "Says content passes behind this control, so the theme's material can show. Unset, it follows the surrounding `<Box backdrop>` region."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Applied to the wrapper, which is the element that is the control."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Passive by convention: an icon, a unit, a currency mark. Clicking it lands the caret."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The control index, the same ladder Button uses: the height, the side padding, the corner, the value's type step and the slot geometry all come from one number, so a field and the button that submits it stand level. It replaces the platform's own `size` attribute rather than joining it, because that one counts characters, predates CSS, and would collide. The wrapper wears it, because the wrapper is the control."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Applied to the wrapper, so a `width` sizes the field rather than the text inside it."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "May be interactive: a clear button, a reveal toggle. A real button brings its own semantics, and the wrapper stands out of its way."
      },
      {
        "name": "type",
        "type": "TextFieldType",
        "optional": true,
        "doc": "Narrowed from the platform's open list. See TextFieldType."
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
        "doc": "On text, this picks an ink colour: loud is `--color-text`, medium is muted, quiet is faint. It rests loud, because full contrast is the correct resting state for reading. Quiet sits below the reading contrast floor on purpose, so never use it for a full line of text."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Render into the element the document needs, such as a `<p>` or a `<label>`."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "optional": true,
        "doc": "A step on the type ramp. One index sets three things together: font size, line height and letter spacing, so a step can never change the size without the leading that makes it readable. There are nine steps here, against the four a control has, because reading covers a wider range. Defaults to 3, the body step."
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
        "doc": "A meaning, never a colour name. The theme resolves the colour. Setting a tone moves the three emphasis levels onto that family's own inks. Unset, the text reads whatever ink colour its surface set."
      },
      {
        "name": "weight",
        "type": "Weight",
        "optional": true,
        "doc": "The weight, named rather than numbered, because a token is the system's to re-point and a `600` is not. There are three, and semibold is the heaviest: `bold` is refused across the system, since a 700 face is another way to say \"important\" competing with the size ramp and the ink colours. Defaults to regular."
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
        "doc": "Which palette this scope resolves against. `inherit` is a real third value, not a no-op: it writes no attribute at all, so the nearest ancestor keeps applying. That is what makes server rendering work in dark mode. A small script in the document head owns the attribute on `<html>`, the root Theme inherits it, and there is one source of truth with no flash and nothing for hydration to mismatch. Set it to pin a section against the document: a light panel inside a dark app is `appearance=\"light\"` here."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "What the scope covers. The Theme renders a real element to carry its attributes, because the tokens are scoped by attribute selectors and an attribute needs a node."
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
        "doc": "An accessibility setting, not a design knob. At rest a border or a fill is decoration, judged by eye and held to no floor. `high` is where the contrast floors bind: it re-solves the tone bands, the control and field edges and the track, and it leans on the glass rather than unmaking it. Left unset the Theme writes no attribute, which is what lets `@media (prefers-contrast: more)` reach the scope. Asking for `normal` is an explicit opt-out of that platform signal. **It has to sit on the same element as an `appearance`, and this scope's cannot be `inherit`.** The high-contrast palette is selected by the two together, so a Theme that resolves `inherit` and asks for `high` re-solves nothing. On the dark-SSR shape the appearance lives on `<html>`, so put `data-contrast` there too — which is what the pre-paint script does. A development build warns when the two come apart."
      },
      {
        "name": "density",
        "type": "Density",
        "optional": true,
        "doc": "How much room the app gives its controls. It re-picks the layout-space steps every distance reads, and it restates each control height and padding directly. It reaches neither type, the icon box, nor a mark, because those are content and would otherwise answer the same question twice. Choose it once for the app. A denser toolbar is a nested Theme on an element you already have, never a prop on each control."
      },
      {
        "name": "depth",
        "type": "Depth",
        "optional": true,
        "doc": "Whether light exists in this app: whether surfaces sit up off the page and raised controls catch it. Depth is an app identity and never a per-card choice, so no call site picks a shadow. This is the one thing that reads the shadow palette. `flat` writes no-op layers rather than deleting the rules."
      },
      {
        "name": "material",
        "type": "Material",
        "optional": true,
        "doc": "What the app is made of. One value covers the whole scope, so a dialog and a menu under one theme are the same glass. There is no per-component thickness and no ceiling to hit at `thick`. What makes a dialog read heavier than a menu is not its material. It is coverage and the scrim. The same glass over 900 pixels of application hides far more than the same glass over a 170-pixel menu, and a dialog also pushes the page back behind a scrim it already owns. `solid` is the default, and it is a material rather than the absence of one: it is the level where light stops passing through. That is also why this is not a boolean. A `glass` flag would still need a thickness beside it, which is two props for one fact. Where the glass shows is decided by placement. Mark a region with `<Box backdrop>`, or pass `backdrop` on a single component. An unmarked control in ordinary flow renders solid and costs nothing."
      },
      {
        "name": "pointer",
        "type": "Pointer",
        "optional": true,
        "doc": "What is touching the screen. `auto` follows `@media (pointer: coarse)`. Pinning it forces the whole coarse world, not only the touch targets: the wider control cells, the mark ladder and the handheld type band all move together. That is what a phone needs, and it is also how those cells get judged on a desktop. There is no `device` prop, because coarse means handheld."
      },
      {
        "name": "radius",
        "type": "RadiusLevel",
        "optional": true,
        "doc": "The corner, chosen once for the app. Each level is a set of hand-picked values rather than a multiplier, restated per family, so `none` squares every corner that is decoration while the four that carry a role hold their shape: a radio, the slider grip, the switch thumb, and the track a round thumb nests in. `full` states the capsule for each cell, which is half the control's own height, rather than asking CSS to clamp a huge number against the rendered box."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Put the theme on an element you already have, rather than adding a wrapper. Never on `<body>` or `<html>`. Portals land at `document.body`, so a theme on the body contains its own portals: the stacking order inverts silently and an app z-index covers every popup. A development build warns you if you do."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "ToggleGroup": {
    "element": null,
    "props": [
      {
        "name": "orientation",
        "type": "\"horizontal\" | \"vertical\"",
        "optional": true,
        "doc": "The axis the arrow keys walk. The group draws nothing, so the layout is the caller's Flex or Stack; this only tells the keyboard which way the toggles run. Defaults to `horizontal`."
      }
    ]
  },
  "Toggle": {
    "element": "button",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Says that content passes behind this toggle, so the theme's material can show. Unset, it follows the surrounding `<Box backdrop>` region."
      },
      {
        "name": "bordered",
        "type": "boolean",
        "optional": true,
        "doc": "Adds a hairline. Orthogonal to the pressed state: an unpressed bordered toggle is the old outline button, and pressing it fills the same box."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "defaultPressed",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the toggle starts on. The uncontrolled counterpart of `pressed`."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The slot before the label, usually an icon."
      },
      {
        "name": "onPressedChange",
        "type": "(pressed: boolean) => void",
        "optional": true,
        "doc": "Fires when the pressed state changes, with the new state."
      },
      {
        "name": "pressed",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the toggle is on. The controlled counterpart of `defaultPressed`."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "An index into the control family, never a measurement — Button's own prop, because a toggle IS a button that holds its state. Defaults to `2`, or to the index of the Field it sits in."
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
        "doc": "What the state means, not what colour it is. Defaults to `neutral`: a pressed toggle rests on the soft wash of its own family, so a toolbar of neutral toggles reads as one set and a `destructive` toggle says what being on does."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The slot after the label."
      },
      {
        "name": "value",
        "type": "string",
        "optional": true,
        "doc": "The value this toggle contributes to a `ToggleGroup`. Unused outside one."
      }
    ]
  },
  "TooltipContent": {
    "element": "div",
    "props": [
      {
        "name": "align",
        "type": "\"start\" | \"center\" | \"end\"",
        "optional": true,
        "doc": "How it lines up along that side."
      },
      {
        "name": "children",
        "type": "string",
        "optional": true,
        "doc": "The words, and they are a STRING rather than nodes — the one refusal the type carries. A tooltip is a label, and a label is a sentence. What it cannot be is a small composition: an inverted pane cannot invert an arbitrary subtree, because a component that stamps a tone re-declares the ink roles ON ITS OWN ELEMENT, which overrides anything a parent re-scoped — measured, a `Kbd` inside a tooltip kept the page's ink and its own pale fill, and vanished on a near-black pane. Inverting the whole palette instead would mean knowing the current appearance, which under `appearance=\"inherit\"` no React code can. The shortcut case is a string too: `Undo ⌘Z`. Anything that genuinely needs a chip in it is a `Popover`, which holds content because it was built to."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "side",
        "type": "\"top\" | \"right\" | \"bottom\" | \"left\"",
        "optional": true,
        "doc": "Which side of the trigger to prefer. It flips itself when that side has no room."
      },
      {
        "name": "sideOffset",
        "type": "number",
        "optional": true,
        "doc": "The gap from the trigger, in pixels. Defaults to the family's own."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "Tooltip": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The trigger and the content, in that order."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Uncontrolled starting state."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Told when it opens or closes."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state."
      }
    ]
  },
  "TooltipProvider": {
    "element": null,
    "props": []
  },
  "TooltipTrigger": {
    "element": null,
    "props": []
  },
  "Tree": {
    "element": "div",
    "props": [
      {
        "name": "defaultExpandedIds",
        "type": "readonly string[]",
        "optional": true,
        "doc": "Uncontrolled starting expansion."
      },
      {
        "name": "defaultSelectedIds",
        "type": "readonly string[]",
        "optional": true,
        "doc": "Uncontrolled starting selection."
      },
      {
        "name": "expandedIds",
        "type": "readonly string[]",
        "optional": true,
        "doc": "Controlled expansion, paired with `onExpandedChange`."
      },
      {
        "name": "items",
        "type": "readonly TreeNode[]",
        "optional": false,
        "doc": "The hierarchy, as data. See `TreeNode`."
      },
      {
        "name": "multiselectable",
        "type": "boolean",
        "optional": true,
        "doc": "Several rows selectable at once (§33): Shift-arrow and Shift-click extend a range, Cmd/Ctrl-click toggles. Announced as `aria-multiselectable`. Off, a click replaces."
      },
      {
        "name": "onExpandedChange",
        "type": "(ids: string[]) => void",
        "optional": true,
        "doc": "Fires when a node opens or closes, with the whole expanded set."
      },
      {
        "name": "onSelectionChange",
        "type": "(ids: string[]) => void",
        "optional": true,
        "doc": "Fires when the selection changes, with the whole selected set."
      },
      {
        "name": "selectedIds",
        "type": "readonly string[]",
        "optional": true,
        "doc": "Controlled selection, paired with `onSelectionChange`."
      },
      {
        "name": "size",
        "type": "Size",
        "optional": true,
        "doc": "The rows' index — the row family's own `size`, stamped per row. Rests at 2."
      }
    ]
  }
};
