/**
 * GENERATED — do not edit. Source: packages/ui/src/**, via apps/docs/scripts/generate-api.ts.
 *
 * Regenerate with `pnpm --filter docs run api`. A law regenerates and compares, so a hand
 * edit fails CI for everyone rather than only the session that made it.
 *
 * Only the props the package DECLARES are here. Every component also takes its native
 * element's props; `element` names which one.
 */
export type ApiProp = { name: string; type: string; values?: string[]; optional: boolean; doc: string };
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
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the accordion, from `1` to `4`. It sets the height, the padding, the text size and the chevron of each trigger. It also sets the panel padding, so the panel text lines up with the trigger label. Unset, it uses the `size` of the nearest `Theme`."
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
        "doc": "The heading level of the trigger, from `2` to `6`. Defaults to `3`. Screen reader users find the sections by their headings, so match the level to the page outline."
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
        "doc": "The label of the action. Use the verb from the question, such as \"Delete\", not \"OK\"."
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
        "doc": "Turns off the action button, such as until the person types a name to confirm. Cancel stays on."
      },
      {
        "name": "onClick",
        "type": "React.MouseEventHandler<HTMLButtonElement>",
        "optional": true,
        "doc": "Called when the action is pressed. The alert closes on the same press. If the action must wait for a result, use a `Dialog` and control its `open` prop."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "Sets the colour meaning of the action button. Use `destructive` for a delete or another action that you can't undo. The default is neutral."
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
        "doc": "The label of the safe choice. \"Cancel\" is always correct. A label that names what staying means is often better, such as \"Keep editing\"."
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
        "doc": "Turns off the Cancel button. Use it rarely: then only Escape can close the alert without the action."
      },
      {
        "name": "onClick",
        "type": "React.MouseEventHandler<HTMLButtonElement>",
        "optional": true,
        "doc": "Called on the press, before the alert closes. Cancel always closes the alert, so don't use this to keep it open."
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
        "doc": "The alert's parts, in reading order: `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogCancel`, then `AlertDialogAction`. Put the parts directly inside, not in a `Flex`, because the content sets the layout. Cancel comes first, so it gets focus when the alert opens. If you need more than these four parts, use a `Dialog`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds your classes to the panel. They don't replace the component's own classes."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Adds inline styles to the panel, not to the dimmed background behind it."
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
        "doc": "The result of going ahead, such as what is lost and if it can come back. Screen readers announce it with the title, so don't repeat the question."
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
        "doc": "The `AlertDialogTrigger` and the `AlertDialogContent`. `AlertDialog` renders no element of its own."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Uncontrolled starting state. Don't use it together with `open`."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean, details: OverlayOpenChangeDetails) => void",
        "optional": true,
        "doc": "Called when the alert opens or closes. A press outside the alert doesn't close it. Only the two buttons and Escape close it, and Escape does the same as Cancel."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state. Use it together with `onOpenChange`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the whole alert. It changes the panel, its corner and padding, the title and description text, and the two buttons."
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
        "doc": "The question that the alert asks. It is the heading, and screen readers announce the alert by it. Say what will happen and to what, such as \"Delete three files?\"."
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
        "doc": "The button's label. Name the action, not the alert, such as \"Delete…\". The ellipsis tells people that a question comes next. The label goes on the `render` element."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds your classes to the trigger. With `render`, they go on the element that you rendered."
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
        "doc": "Tells the trigger if the rendered element is a real `<button>`. By default, the trigger finds this from `render`."
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
        "doc": "Adds inline styles to the trigger. With `render`, they go on the element that you rendered."
      }
    ]
  },
  "Attachment": {
    "element": null,
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when the tile sits over other content, such as an image. The tile then uses the theme's material. Unset, it follows the nearest `<Box backdrop>`."
      },
      {
        "name": "children",
        "type": "string",
        "optional": false,
        "doc": "The file name. It must be a string. It is also the accessible name of the tile, and it is added to the name of the remove button, such as \"Remove report.pdf\"."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the tile. For space around the tile, wrap it in a `Box` with `m`."
      },
      {
        "name": "icon",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "An icon or a thumbnail for the file. It's optional. Screen readers skip it, because the name identifies the file."
      },
      {
        "name": "meta",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A second line of text, such as the file size, the file type or an error message. It shows smaller and quieter than the name, and screen readers read it with the tile. If `state` is `error`, put the reason here. Colour alone doesn't tell the user what went wrong."
      },
      {
        "name": "onRemove",
        "type": "() => void",
        "optional": true,
        "doc": "Called when the user presses the remove button. The button shows only when you set this prop. The tile doesn't remove itself: remove the file from your own list."
      },
      {
        "name": "progress",
        "type": "number",
        "optional": true,
        "doc": "The upload progress, from 0 to 1. The tile uses it only when `state` is `uploading`. If you don't know the progress, leave it out: the bar then moves without a value. The `processing` state never shows a value."
      },
      {
        "name": "removeLabel",
        "type": "string",
        "optional": true,
        "doc": "The accessible name of the remove button. Defaults to `\"Remove\"`. Set it to translate the label."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the tile, from `1` to `4`. It sets the padding, the corner, the icon, the remove button and the text size of the name."
      },
      {
        "name": "state",
        "type": "AttachmentState",
        "values": [
          "idle",
          "uploading",
          "processing",
          "error"
        ],
        "optional": true,
        "doc": "What is happening to the file: `idle`, `uploading`, `processing` or `error`. Defaults to `idle`. The tile only shows the state. Your app holds the file and changes the state."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "AvatarGroup": {
    "element": "span",
    "props": [
      {
        "name": "size",
        "type": "AvatarSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "The size step for all avatars in the group, from `1` to `9`. A `size` that you set on an avatar wins."
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
        "doc": "The text alternative for the picture. Defaults to empty, so screen readers skip the avatar. This is correct when the person's name shows next to it. If the avatar is the only thing that names the person, put the name here."
      },
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when the avatar sits over other content, such as an image. The fallback then uses the theme's material. A picture covers it. Unset, it follows the nearest `<Box backdrop>`."
      },
      {
        "name": "badge",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A `Badge` in the top-end corner of the avatar, such as a count or a dot. The avatar positions the badge. For a word next to the avatar, use a `Chip` instead."
      },
      {
        "name": "fallback",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The content that shows when there is no picture, usually initials. Unset, the avatar shows a person icon. A string scales with the avatar. Other content shows as you give it."
      },
      {
        "name": "size",
        "type": "AvatarSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "The size step of the avatar, from `1` to `9`. Sizes `1` to `4` match the height of a `Button` at the same step, and `5` to `9` are larger. Unset, the avatar uses the size of its `AvatarGroup`, then the nearest `Theme`."
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
        "name": "aria-label",
        "type": "string",
        "optional": false,
        "doc": "The accessible name of the dot, such as \"New messages\". It's required when the badge has no content, because a screen reader can't read a colour."
      },
      {
        "name": "children",
        "type": "undefined",
        "optional": true,
        "doc": "No content. A badge with no content shows as a dot, and it needs an `aria-label`."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "The text size step of the badge, from `1` to `9`. There's no default: unset, the badge scales with the line it sits in, such as a tab label, a row or an avatar. Set it only when the badge stands alone."
      },
      {
        "name": "tone",
        "type": "Tone",
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "The meaning of the badge, which sets its colour. Defaults to `accent`, which means \"something is here\". Use `destructive` for \"something needs you\". You can also use `warning`, `success`, `info` or any other tone."
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
        "values": [
          "loud",
          "medium",
          "quiet"
        ],
        "optional": true,
        "doc": "The emphasis level of the text, which sets its colour. Defaults to `loud`. Don't use `quiet` for a quote, because its contrast is too low to read easily."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the quote as a different element."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "The text size step, from `1` to `9`. Defaults to `3`, the body size, as on `Text`."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "The colour family of the text, such as `destructive`. The line at the side stays grey in every tone."
      },
      {
        "name": "weight",
        "type": "Weight",
        "values": [
          "regular",
          "medium",
          "semibold"
        ],
        "optional": true,
        "doc": "The font weight: `regular`, `medium` or `semibold`. Defaults to `regular`."
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
        "doc": "Marks an area where the components sit over other content, such as a toolbar over a canvas or a panel over an image. Buttons, fields, cards and selects inside it then use the theme's material. Set it once here, not on each control. Set `backdrop={false}` to make an area inside it plain again. It doesn't change the layout."
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
        "doc": "Renders the box as a different element, so you don't add a wrapper."
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
        "doc": "The hidden levels, in path order. The ellipsis button opens a menu of these levels. This prop is required, so the button always opens something."
      },
      {
        "name": "label",
        "type": "string",
        "optional": true,
        "doc": "The accessible name of the ellipsis button. The default is \"More levels\". Set it to translate the name."
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
        "doc": "Renders the link as your framework's own link component, or as an `<a>` with `target` and `rel`. `BreadcrumbLink` keeps its appearance."
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
        "doc": "Adds a class to the outer `<nav>` element."
      },
      {
        "name": "label",
        "type": "string",
        "optional": true,
        "doc": "The accessible name of the `<nav>` landmark. The default is \"Breadcrumb\". Screen readers use it to tell this navigation from others. Set it to translate the name."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "Sets the text size of every item in the breadcrumb. The default is `2`, the size for labels and secondary text."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "ButtonGroup": {
    "element": "div",
    "props": [
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the buttons in the group, from `1` to `4`. A `size` that you set on a button wins."
      }
    ]
  },
  "Button": {
    "element": "button",
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "The name of the button for screen readers. Required when `iconOnly` is set."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "The id of an element on the page that names this button. Use it instead of `aria-label`. One of the two is required with `iconOnly`."
      },
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when the button sits over other content, such as an image. The button then uses the theme's material. If you don't set it, the button follows the nearest `<Box backdrop>`."
      },
      {
        "name": "bordered",
        "type": "boolean",
        "optional": true,
        "doc": "Adds a thin border. A `quiet` button with a border looks a little more prominent than a `quiet` button without one."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "done",
        "type": "boolean",
        "optional": true,
        "doc": "Shows a tick in place of the icon to say that the action finished. The tick replaces the icon at once, in the same box, and the icon comes back as soon as `done` is false again. Use it for actions with no other visible result, such as copy. You hold the value and clear it yourself. Unlike `loading`, it doesn't block the press. Also change the label or `aria-label` (for example, `Copy` to `Copied`), because screen readers don't announce the tick."
      },
      {
        "name": "emphasis",
        "type": "Emphasis",
        "values": [
          "loud",
          "medium",
          "quiet"
        ],
        "optional": true,
        "doc": "Sets how prominent the button is next to the buttons beside it. `loud` uses the solid colour of the tone, `medium` uses a soft fill, and `quiet` has no fill. The default is `medium`. Use `loud` for the one main action on a screen."
      },
      {
        "name": "focusableWhenDisabled",
        "type": "boolean",
        "optional": true,
        "doc": "Keep focus on the button when it becomes disabled part-way through an interaction."
      },
      {
        "name": "iconOnly",
        "type": "true",
        "optional": false,
        "doc": "Makes the button square and shows only the icon in `children`. You must also set `aria-label` or `aria-labelledby`."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content before the label, usually an icon. While `loading` is true, the spinner takes this place, so nothing moves."
      },
      {
        "name": "loading",
        "type": "boolean",
        "optional": true,
        "doc": "Shows a spinner and blocks the press while an action runs. The label stays visible. On an `iconOnly` button, the spinner replaces the icon."
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Says whether the rendered element is a real `<button>`. The value comes from `render`, so you almost never need to set it. Set it only when `render` passes a component that renders a `<button>`, because a wrong value breaks accessibility without a warning."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the button as a different element, such as a link. The appearance and behaviour stay the same. See `nativeButton` if you pass a component."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the button, from `1` to `4`. The step sets the height, the side padding, the corner, the icon size and the label size together. Controls with the same `size` stand level with each other. If you don't set it, the button uses the `size` of the nearest `Theme`, which is `2` by default."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "Sets what the action means, and the theme picks the colour. For example, use `destructive` for an action that deletes something. The default is `neutral`."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content after the label, such as a chevron, a count or a control. The spinner never replaces it."
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
        "doc": "Set `backdrop` when content passes behind the card, such as an image, a canvas or a scrolling feed. The card then uses the theme's material. Without it, the card is solid. If you don't set it, the card follows the nearest `<Box backdrop>`. The theme chooses the material, not this prop."
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
        "doc": "Renders the card as a different element, which decides what the card does. An `<article>` is static. A `<button>` or an `<a>` makes the card pressable, with hover, press and disabled states. A `<label>` around a `Radio` or a `Checkbox` makes the whole card select that control, and a selected card shows a selected edge."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the padding and the corner size. The card's height comes from its content."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "CarouselButton": {
    "element": null,
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "The name of the button for screen readers. The default is `Previous` or `Next`."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The icon, usually an arrow. The library ships no icons, so supply your own."
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
  "CarouselItem": {
    "element": "div",
    "props": []
  },
  "Carousel": {
    "element": null,
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "The name of the carousel for screen readers. Set this or `aria-labelledby`, so that users know what the previous and next buttons move."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "The id of an element on the page that names the carousel, usually the heading above it."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The rail and its buttons. You decide where the buttons go."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class for the root element. To add space around the carousel, wrap it in a `Box`."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "CarouselRail": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The items. Wrap each item that the rail stops at in a `CarouselItem`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "fade",
        "type": "boolean",
        "optional": true,
        "doc": "Fades the content at an edge when more content is past that edge. Use it when the rail runs to the edge of a panel. With buttons at both ends, you may not need it."
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
        "doc": "A class name for the checkbox. For space around it, wrap it in a `Box` with `m`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the checkbox, from `1` to `4`. The box is one line of text tall at the same step, so it lines up with its label. A checkbox, a radio and a switch at the same step look the same size. Unset, it uses the `size` of the nearest `Field` or `Theme`."
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
        "doc": "Set `backdrop` when the chip sits over other content, such as an image or a map. The chip then uses the theme's material. On a plain background it stays solid."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "The word or the number in the chip. A chip must have content."
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
        "values": [
          "loud",
          "medium",
          "quiet"
        ],
        "optional": true,
        "doc": "The emphasis level of the text: `loud`, `medium` or `quiet`. It changes the text colour, not the fill."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the chip as a different element."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "The text size step of the chip, from `1` to `9`. There's no default: unset, the chip takes the text size of the line around it. Set it only when the chip stands alone."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "The category of the chip, which sets its text colour. Defaults to `neutral`. For example, use `success` for a finished job, `destructive` for a failed one, `warning` for one that needs attention and `info` for one that is running. The fill stays grey in every tone."
      },
      {
        "name": "weight",
        "type": "Weight",
        "values": [
          "regular",
          "medium",
          "semibold"
        ],
        "optional": true,
        "doc": "The font weight, by name. `semibold` is the heaviest. There's no default: unset, the chip takes the weight of the text around it."
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
        "doc": "Moves the code down so that the `topbar` row doesn't cover the first line. Set it when the row goes across the full width, such as a file name on one side and a button on the other. Don't set it for one button in a corner."
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
        "doc": "A class name for the `<pre>` element. Put a syntax highlighter's classes here. For space around the block, wrap it in a `Box` with `m`."
      },
      {
        "name": "footer",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content for a row at the bottom of the block, such as an expand button or a status line. Pass the content only: the block positions the row."
      },
      {
        "name": "hosted",
        "type": "boolean",
        "optional": true,
        "doc": "Removes the block's own background, border and padding. Set it when the block is already inside a panel of the same kind, such as a `Surface`. The parent panel then supplies the background, the corner and the padding."
      },
      {
        "name": "maxLines",
        "type": "number",
        "optional": true,
        "doc": "The maximum height of the block, in lines of code. Longer code scrolls. No line is hidden, so users can reach all lines with the mouse, the keyboard or a screen reader."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the code block, from `1` to `4`. It sets the padding, the corner and the text size of the code. It also sets the height of a line for `maxLines`."
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
        "doc": "Content for a row at the top of the block, such as a file name, a language chip or a copy button. The row floats over the code. Pass the content only: the block positions the row. If the row goes across the full width, also set `band`."
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
        "values": [
          "loud",
          "medium",
          "quiet"
        ],
        "optional": true,
        "doc": "The emphasis level of the text: `loud`, `medium` or `quiet`. It changes the text colour. Defaults to `loud`."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the code as a different element."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "The text size step, from `1` to `9`. There's no default: unset, the code takes the text size of the line around it. For example, `<Text size=\"2\">the <Code>value</Code></Text>` matches the text. Set it only when the code stands alone."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "The colour family of the text and the fill. Defaults to `neutral`."
      },
      {
        "name": "weight",
        "type": "Weight",
        "values": [
          "regular",
          "medium",
          "semibold"
        ],
        "optional": true,
        "doc": "The font weight, by name. `semibold` is the heaviest. There's no default: unset, the code takes the weight of the text around it."
      }
    ]
  },
  "ComboboxCollection": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "(item: T, index: number) => React.ReactNode",
        "optional": false,
        "doc": "A function that renders one option. It is called for each match in the group."
      }
    ]
  },
  "ComboboxContent": {
    "element": "div",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A `<ComboboxList>` and a `<ComboboxEmpty>`. Don't use a `<Separator>` here. Use groups to divide the options."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds your classes to the panel. The component's own classes stay."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Adds inline styles to the panel. Your styles apply last."
      }
    ]
  },
  "ComboboxEmpty": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The message that the panel shows when no option matches. Put a sentence in a `<Text>`."
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
  "ComboboxGroup": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A `ComboboxLabel` that names the group, and a `ComboboxCollection` that renders its options."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "items",
        "type": "readonly ComboboxOption[]",
        "optional": false,
        "doc": "The options in this group. The group is hidden when none of them match."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "ComboboxInput": {
    "element": "input",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when the field sits over other content, such as an image. The field then uses the theme's material. If you don't set it, the field follows the nearest `<Box backdrop>`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds your classes to the visible field box, not to the `<input>` inside it."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content before the text, such as an icon or a unit. A click on it puts the cursor in the field. The package has no icons, so bring your own."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Adds inline styles to the visible field box. A `width` sets the width of the whole field."
      }
    ]
  },
  "ComboboxItem": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The text of the row. When you choose the option, the field shows the option's label, not this text. Use the same label here."
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
        "doc": "Turns off the option, so you can't choose it. The option stays in the list, and screen readers still announce it."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      },
      {
        "name": "value",
        "type": "ComboboxOption",
        "optional": false,
        "doc": "The option that this row chooses. Pass the item that your render function receives."
      }
    ]
  },
  "ComboboxLabel": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The name of the group. You can't choose a label."
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
  "ComboboxList": {
    "element": null,
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "The accessible name of the list of options. You usually don't need it. If you don't set it, the list uses the name of the field, from `ComboboxInput`'s `aria-label` or a `Field` label. Set it only to give the list a different name."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "The `id` of an element that names the list, where the words are already on screen."
      },
      {
        "name": "children",
        "type": "(item: T, index: number) => React.ReactNode",
        "optional": false,
        "doc": "A function that renders one option or group. It is called for each match of the typed text."
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
  "Combobox": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A `<ComboboxInput>` and a `<ComboboxContent>`. `Combobox` renders no element of its own."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the panel is open at the start, when the combobox controls it. Don't use it with `open`."
      },
      {
        "name": "defaultValue",
        "type": "T | null",
        "optional": true,
        "doc": "The option chosen at the start, when the combobox controls its own value. Don't use it with `value`."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Turns off the whole control. You can't type, the panel can't open, and the form doesn't submit the value."
      },
      {
        "name": "form",
        "type": "string",
        "optional": true,
        "doc": "The `id` of the form that the field belongs to. Use it when the combobox is outside that form. Set it here, not on `ComboboxInput`."
      },
      {
        "name": "items",
        "type": "readonly (T | ComboboxOptionGroup<T>)[]",
        "optional": false,
        "doc": "All the options, as a flat list or as groups (`{ value, items }`). The typed text filters them by label, and `ComboboxList` renders only the matches. Keep this array stable: define it outside the component or in a `useMemo`. A new array on each render runs the filter again."
      },
      {
        "name": "name",
        "type": "string",
        "optional": true,
        "doc": "The name of the field when a form is submitted. The combobox sends the chosen value through a hidden input."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Called when the panel opens or closes. It isn't called when the value changes."
      },
      {
        "name": "onValueChange",
        "type": "(value: T | null) => void",
        "optional": true,
        "doc": "Called when the chosen option changes. The value is `null` when the field is cleared. It isn't called when you type, because typed text only filters the list."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the panel is open, when you control it. Use it with `onOpenChange`. Opening the panel doesn't change the value."
      },
      {
        "name": "readOnly",
        "type": "boolean",
        "optional": true,
        "doc": "Shows and submits the value, but you can't change it. The panel doesn't open, and the field loses its fill, as a read-only `TextField` does."
      },
      {
        "name": "required",
        "type": "boolean",
        "optional": true,
        "doc": "Makes a chosen option necessary before the form can submit. Typed text alone doesn't count."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the field and the panel. The rows, the icons and the text all use it. Inside a `Field`, the field's size applies when you don't set this."
      },
      {
        "name": "value",
        "type": "T | null",
        "optional": true,
        "doc": "The chosen option, when you control it. Use it with `onValueChange`. `null` means no option is chosen."
      }
    ]
  },
  "CommandCollection": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "(item: T) => React.ReactNode",
        "optional": false,
        "doc": "A function that renders a row for each item in the group that matches the query."
      }
    ]
  },
  "CommandContent": {
    "element": null,
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": false,
        "doc": "The accessible name of the palette. It is required, because the palette has no visible title."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "A `CommandInput`, a `CommandList`, and a `CommandEmpty` for when nothing matches."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the panel."
      },
      {
        "name": "filter",
        "type": "React.ComponentPropsWithoutRef<typeof Autocomplete.Root>[\"filter\"]",
        "optional": true,
        "doc": "A custom function that decides which items match the query. If you don't set it, the palette uses Base UI's matcher. Set it to `null` to turn off filtering, for example when you filter `items` yourself."
      },
      {
        "name": "onQueryChange",
        "type": "(query: string) => void",
        "optional": true,
        "doc": "Called with the query each time it changes, and with an empty query when the palette closes. You can read the query but not set it. Use it to rank, limit or fetch `items` yourself, which `filter` can't do."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "CommandEmpty": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "The content to show when no item matches. It shows inside the list panel."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "CommandGroupLabel": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "The name of the group. It is text only, and it isn't focusable."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "CommandGroup": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "A `CommandGroupLabel` and a `CommandCollection` for the rows."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the group."
      },
      {
        "name": "items",
        "type": "readonly unknown[]",
        "optional": false,
        "doc": "The items in this group. The group hides when none of them match the query."
      }
    ]
  },
  "CommandInput": {
    "element": null,
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": false,
        "doc": "The accessible name of the search field. It is required, because a placeholder is not a name: it goes away when you type."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the search field."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content before the field, such as a search icon. The package has no icons, so supply your own."
      }
    ]
  },
  "CommandItem": {
    "element": null,
    "props": [
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the row."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content before the label, such as an icon or an avatar."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "The element to render the row as, such as an `<a href>` or your framework's link component. Use it when a row goes to a page, such as a search result. The row then works as a real link, with open in a new tab and a link role for screen readers."
      },
      {
        "name": "tone",
        "type": "\"destructive\"",
        "values": [
          "destructive"
        ],
        "optional": true,
        "doc": "The colour of the row. Set it to `destructive` for a command that deletes something."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content at the far end of the row, such as a keyboard shortcut, a category or a count."
      }
    ]
  },
  "CommandList": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "(item: T) => React.ReactNode",
        "optional": false,
        "doc": "Called for each item that survives the filter."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the list panel."
      }
    ]
  },
  "Command": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "A `CommandTrigger`, if there is one, and a `CommandContent`."
      },
      {
        "name": "defaultOpen",
        "type": "DialogProps[\"defaultOpen\"]",
        "optional": true,
        "doc": "Whether the palette is open at the start, for an uncontrolled palette. Use it for demos. A real palette usually uses `open`, because your key handler opens it."
      },
      {
        "name": "items",
        "type": "readonly unknown[]",
        "optional": false,
        "doc": "All the items that the palette can show, before filtering. The palette shows only the items that match the query, so `CommandList` takes a function, not children. Keep this array stable. Declare it at module scope or wrap it in `useMemo`. A new array on each render runs the filter again each time."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean, details: CommandOpenChangeDetails) => void",
        "optional": true,
        "doc": "Called each time the palette opens or closes. `details.reason` tells the cause, such as Escape, an outside press, or `\"item-press\"` when a row runs. Call `details.cancel()` to keep the palette open, for example after a row that doesn't end the task."
      },
      {
        "name": "open",
        "type": "DialogProps[\"open\"]",
        "optional": true,
        "doc": "Whether the palette is open, for a controlled palette. Use it with `onOpenChange`. Most palettes are controlled, because your own key handler opens them."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the palette, from `\"1\"` to `\"4\"`. It sets the panel, the search field, the rows and the group labels, including their text size. The rows are one step larger than the app's controls at the same step, and the search text is larger again. The default comes from the theme."
      }
    ]
  },
  "CommandTrigger": {
    "element": "button",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The button's label. With `render`, the label goes on the rendered element, so `<DialogClose render={<Button/>}>Cancel</DialogClose>` makes one button."
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
        "doc": "Tells the part if the rendered element is a real `<button>`. By default, the part finds this from `render`. Set it if your own component renders a `<button>` that the part can't detect."
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
  "ComposerInput": {
    "element": "textarea",
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "The name of the input for screen readers, such as `Message`. Required, because a `Field` label can't name this input."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "The id of an element on the page that names this input. Use it instead of `aria-label`. One of the two is required."
      }
    ]
  },
  "Composer": {
    "element": "form",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when content passes behind the composer, such as a scrolling conversation. The composer then uses the theme's material. If you don't set it, the composer follows the nearest `<Box backdrop>`."
      },
      {
        "name": "context",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Short information about the conversation, such as the model or the remaining context. It shows below the composer, inset from its sides."
      },
      {
        "name": "notices",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Messages that need attention before the next message, such as `Notice` and `Confirmation`. They show in a column above the composer, and the last one is nearest to the text. They use the composer's `size` unless they set their own. Focus doesn't move to them."
      },
      {
        "name": "onFiles",
        "type": "(files: File[]) => void",
        "optional": true,
        "doc": "Called with the files that the user drops on the composer or pastes into the text. The composer has no attach button. Add your own control for that."
      },
      {
        "name": "onSubmit",
        "type": "(event: React.FormEvent<HTMLFormElement>) => void",
        "optional": true,
        "doc": "Called when the user sends a message. The default form submission is already prevented."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the whole composer, from `1` to `4`. It sets the padding, the corner, the text size and the size of the controls in the row. A `size` prop on a control inside the composer overrides it."
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
        "doc": "The icon for each `status`. The library ships no icons, so supply your own."
      },
      {
        "name": "labels",
        "type": "Partial<Record<ComposerStatus, string>>",
        "optional": true,
        "doc": "The accessible name for each `status`. The defaults are `Send`, `Sending`, `Stop` and `Retry`. Set them if your app isn't in English."
      },
      {
        "name": "onStop",
        "type": "() => void",
        "optional": true,
        "doc": "Called when the user presses the button while `status` is `streaming`. The button doesn't submit then."
      },
      {
        "name": "status",
        "type": "ComposerStatus",
        "values": [
          "ready",
          "submitted",
          "streaming",
          "error"
        ],
        "optional": true,
        "doc": "Sets what the request is doing, which changes what the button does. The default is `ready`. `ready` sends, `submitted` shows a spinner, `streaming` stops the request and `error` sends again."
      }
    ]
  },
  "Confirmation": {
    "element": null,
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when content passes behind the confirmation. It then uses the theme's material."
      },
      {
        "name": "busy",
        "type": "boolean",
        "optional": true,
        "doc": "Shows that the work is starting. The confirm button shows a spinner and the cancel button is disabled."
      },
      {
        "name": "cancelLabel",
        "type": "string",
        "optional": false,
        "doc": "The no, in your words: \"Not now\"."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "The request, in your words: \"Run 4 nodes for $0.32?\""
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "confirmLabel",
        "type": "string",
        "optional": false,
        "doc": "The yes, in your words: \"Run\"."
      },
      {
        "name": "icon",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "An icon from your own icon set, shown before the request. It is hidden from assistive technology."
      },
      {
        "name": "onCancel",
        "type": "() => void",
        "optional": false,
        "doc": "Called when the person presses the cancel button. Remove the confirmation here, because it has no dismiss button."
      },
      {
        "name": "onConfirm",
        "type": "() => void",
        "optional": false,
        "doc": "Called when the person presses the confirm button. Set `busy` while the work starts."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size of the padding, the corner, the buttons and the text. If you don't set it, the confirmation uses the size of the nearest `Theme`."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "Sets the colour family of the request. The default is `neutral`. Use `warning` or `destructive` when saying yes is risky and the words don't already say so."
      }
    ]
  },
  "ContextMenuContent": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The rows of the menu. Use `MenuItem` and the other menu parts."
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
  "ContextMenu": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A `<ContextMenuTrigger>` and a `<ContextMenuContent>`. `ContextMenu` renders no element of its own."
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
        "doc": "Fires on every open and close, including the dismissals the menu handles itself."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controls whether the menu is open. Use it with `onOpenChange`. You rarely need it."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the menu. The rows, icons and text all use it."
      }
    ]
  },
  "ContextMenuTrigger": {
    "element": "div",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The area that answers a right-click."
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
        "doc": "Renders the area as an element you already have, such as a canvas or a row."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
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
        "doc": "The button's label. With `render`, the label goes on the rendered element, so `<DialogClose render={<Button/>}>Cancel</DialogClose>` makes one button."
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
        "doc": "Tells the part if the rendered element is a real `<button>`. By default, the part finds this from `render`. Set it if your own component renders a `<button>` that the part can't detect."
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
        "doc": "The panel's content. You write the layout yourself. Add a `DialogTitle`, because without it the panel has no accessible name. Add a `DialogClose`, so that screen reader users can leave the dialog."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds your classes to the panel. They don't replace the component's own classes."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Adds inline styles to the panel, not to the dimmed background behind it."
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
        "doc": "The supporting text: what the dialog asks for. Screen readers announce it with the title, so don't repeat the title. If you have nothing to add, leave the description out."
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
        "doc": "The `DialogTrigger` and the `DialogContent`, in either order. `Dialog` renders no element of its own."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Uncontrolled starting state. Use it when no other code needs to know if the dialog is open. Don't use it together with `open`."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean, details: OverlayOpenChangeDetails) => void",
        "optional": true,
        "doc": "Called when the dialog opens or closes. The second argument gives the `reason`, such as an outside press or Escape, and the native `event`. Call `cancel()` on it to keep the dialog open, for example when there are unsaved changes."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controlled open state. Use it together with `onOpenChange`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the panel: its maximum width, padding and corner. `DialogTitle` and `DialogDescription` follow this size, and match an `AlertDialog` at the same size. A `Text` or `Heading` that you add keeps its own size."
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
        "doc": "The dialog's name. It is the visible heading, and screen readers announce the dialog by it. Name the task, such as \"Rename project\", not the type of control."
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
        "doc": "The button's label. With `render`, the label goes on the rendered element, so `<DialogClose render={<Button/>}>Cancel</DialogClose>` makes one button."
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
        "doc": "Tells the part if the rendered element is a real `<button>`. By default, the part finds this from `render`. Set it if your own component renders a `<button>` that the part can't detect."
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
        "doc": "A class name for the field. For space around the field, wrap it in a `Box` with `m`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step for the whole field, from `1` to `4`. It sets the size of the label, the description, the error and the control. A `size` that you set on the control itself wins."
      }
    ]
  },
  "Flex": {
    "element": "div",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Marks an area where the components sit over other content, such as a toolbar over a canvas or a panel over an image. Buttons, fields, cards and selects inside it then use the theme's material. Set it once here, not on each control. Set `backdrop={false}` to make an area inside it plain again. It doesn't change the layout."
      },
      {
        "name": "container",
        "type": "boolean",
        "optional": true,
        "doc": "Make this Box measurable. Responsive values such as `{ initial, sm, md, lg }` on anything inside it then resolve against this Box's width instead of against the nearest measurable ancestor, which is the Theme root when there is nothing nearer. CSS imposes a trade here: a measurable box can never size itself around its contents, so its width has to come from outside. Put `container` on things the layout already sizes, such as a sidebar with a width, a main column that grows, or a grid cell. Or state `width`, `flexGrow` or `flexBasis` yourself. A container Box left to shrink-wrap, for example as a plain flex-row item, renders zero pixels wide, and a development build warns you when that happens."
      },
      {
        "name": "display",
        "type": "\"flex\" | \"inline-flex\"",
        "values": [
          "flex",
          "inline-flex"
        ],
        "optional": true,
        "doc": "Set `inline-flex` to place the flex container in a line of text. Defaults to `flex`. For a `display` that changes with the width, use `Box`."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the box as a different element, so you don't add a wrapper."
      }
    ]
  },
  "Grid": {
    "element": "div",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Marks an area where the components sit over other content, such as a toolbar over a canvas or a panel over an image. Buttons, fields, cards and selects inside it then use the theme's material. Set it once here, not on each control. Set `backdrop={false}` to make an area inside it plain again. It doesn't change the layout."
      },
      {
        "name": "container",
        "type": "boolean",
        "optional": true,
        "doc": "Make this Box measurable. Responsive values such as `{ initial, sm, md, lg }` on anything inside it then resolve against this Box's width instead of against the nearest measurable ancestor, which is the Theme root when there is nothing nearer. CSS imposes a trade here: a measurable box can never size itself around its contents, so its width has to come from outside. Put `container` on things the layout already sizes, such as a sidebar with a width, a main column that grows, or a grid cell. Or state `width`, `flexGrow` or `flexBasis` yourself. A container Box left to shrink-wrap, for example as a plain flex-row item, renders zero pixels wide, and a development build warns you when that happens."
      },
      {
        "name": "display",
        "type": "\"grid\" | \"inline-grid\"",
        "values": [
          "grid",
          "inline-grid"
        ],
        "optional": true,
        "doc": "Set `inline-grid` to place the grid in a line of text. Defaults to `grid`. For a `display` that changes with the width, use `Box`."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the box as a different element, so you don't add a wrapper."
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
        "values": [
          "loud",
          "medium",
          "quiet"
        ],
        "optional": true,
        "doc": "The emphasis level of the text, which sets its colour, as on `Text`. Use `medium` for a muted section label."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the heading as a different element. Use it to set the heading level, such as `render={<h1/>}`. The text size doesn't change. Defaults to `<h2>`."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "The text size step, from `1` to `9`, the same steps as `Text`. Defaults to `6`, the size for a card title. It doesn't change the heading level: use `render` for that."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "The meaning of the heading, which sets its colour family, such as `destructive`."
      },
      {
        "name": "weight",
        "type": "Weight",
        "values": [
          "regular",
          "medium",
          "semibold"
        ],
        "optional": true,
        "doc": "The font weight: `regular`, `medium` or `semibold`. Defaults to `medium`. There's no `bold`: use a larger `size` to make a heading stronger."
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
        "values": [
          "loud",
          "medium",
          "quiet"
        ],
        "optional": true,
        "doc": "The emphasis level of the text: `loud`, `medium` or `quiet`. It changes the text colour, not the key."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the key as a different element."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "The text size step, from `1` to `9`. There's no default: unset, the key takes the text size of the line around it."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "The colour family of the text and the fill. Defaults to `neutral`. The edge stays grey in every tone."
      },
      {
        "name": "weight",
        "type": "Weight",
        "values": [
          "regular",
          "medium",
          "semibold"
        ],
        "optional": true,
        "doc": "The font weight, by name. `semibold` is the heaviest. There's no default: unset, the key takes the weight of the text around it."
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
        "doc": "Renders the link as a different element, such as your framework's link component or an `<a>` with `target` and `rel`. `Link` keeps its text styles."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "The text size step, from `1` to `9`. There's no default: unset, the link takes the text size of the sentence around it. Set it only when the link stands alone."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "The meaning of the link, which sets the colour of the text and the underline. Defaults to `accent`, so that users can find the link in a paragraph. A `destructive` link is red."
      },
      {
        "name": "weight",
        "type": "Weight",
        "values": [
          "regular",
          "medium",
          "semibold"
        ],
        "optional": true,
        "doc": "The font weight, by name. `semibold` is the heaviest. There's no default: unset, the link takes the weight of the text around it."
      }
    ]
  },
  "ListItem": {
    "element": "li",
    "props": []
  },
  "List": {
    "element": "ul",
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
        "values": [
          "loud",
          "medium",
          "quiet"
        ],
        "optional": true,
        "doc": "Sets how strong the text colour is. The default is `loud`, which is full contrast. A nested list without an `emphasis` keeps its parent's level, also when it sets its own `tone`. Bullets always stay faint. Numbers use the same level as the words."
      },
      {
        "name": "ordered",
        "type": "false",
        "optional": true,
        "doc": "Renders a bulleted `<ul>`. Use it when the order of the items has no meaning."
      },
      {
        "name": "reversed",
        "type": "never",
        "optional": true,
        "doc": "Not available on a bulleted list, because bullets have no order to reverse. Set `ordered` to use `reversed`."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "Sets the text size, from `1` to `9`. The default is `3`, as on `Text`. A nested list without a `size` uses the size of the list that holds it."
      },
      {
        "name": "start",
        "type": "never",
        "optional": true,
        "doc": "Not available on a bulleted list, because there is no number to start from. Set `ordered` to use `start`."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "Sets the colour family of the words and the markers."
      },
      {
        "name": "weight",
        "type": "Weight",
        "values": [
          "regular",
          "medium",
          "semibold"
        ],
        "optional": true,
        "doc": "Sets the font weight. The default is `regular`, and `semibold` is the heaviest. A nested list without a `weight` uses its parent's weight."
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
        "doc": "Controls whether the row is ticked. Use it with `onCheckedChange`. A ticked row shows a tick in the accent colour. The rest of the row does not change."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The text of the row. Write it so that the ticked state reads as true."
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
        "doc": "Close the menu when this row is chosen. Off by default, so the user can toggle several rows in one visit."
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
        "doc": "Turns the row off, so the user cannot change it. The row still shows whether it is ticked."
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
        "doc": "Content at the end of the row, such as a shortcut hint or a count. The tick is at the start."
      }
    ]
  },
  "MenuContent": {
    "element": null,
    "props": [
      {
        "name": "align",
        "type": "\"start\" | \"center\" | \"end\"",
        "values": [
          "start",
          "center",
          "end"
        ],
        "optional": true,
        "doc": "How the menu aligns along that edge. The default is `\"start\"`."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The rows of the panel: `MenuItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuGroup`, `MenuLabel` and `MenuSub`. For a divider, use `<Separator>`. The panel uses the theme settings of its trigger, although it renders in a portal."
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
        "values": [
          "top",
          "bottom",
          "left",
          "right"
        ],
        "optional": true,
        "doc": "The edge of the trigger that the menu opens from. The default is `\"bottom\"`."
      },
      {
        "name": "sideOffset",
        "type": "number",
        "optional": true,
        "doc": "The distance from the trigger, in pixels. The default is 4. Change it only if you must."
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
        "doc": "The rows of the group, and at most one `MenuLabel` that names them. Put the label inside the group. Then assistive technology announces the label as the name of the group."
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
        "doc": "Turns the row off, so it cannot be chosen. The row stays visible, which tells the user that the action exists."
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
        "doc": "Content at the start of the row, usually an icon. It uses the same column as the tick of a checkable row, so icons and ticks line up. You do not need an `inset` prop to align rows."
      },
      {
        "name": "onClick",
        "type": "React.MouseEventHandler<HTMLElement>",
        "optional": true,
        "doc": "Runs when the user chooses the row. The menu then closes, so show any result outside the menu."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the row as a different element, such as an `<a href>` or your framework's link. Use it when the rows go to places instead of doing actions. The row stays one clickable target. Do not put a link inside the row instead."
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
        "values": [
          "destructive"
        ],
        "optional": true,
        "doc": "Marks the row as a dangerous action, such as delete. `\"destructive\"` is the only value."
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
        "doc": "A `<MenuTrigger>` and a `<MenuContent>`. `Menu` renders no element of its own."
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
        "doc": "Controls whether the menu is open. Use it with `onOpenChange`. You rarely need it, because the trigger opens the menu."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the menu. The rows, icons and text all use it."
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
        "doc": "The `MenuRadioItem` rows, and at most one `MenuLabel` that names the choice. The label names the group for assistive technology, as in `MenuGroup`."
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
        "doc": "Turns off every row in the group."
      },
      {
        "name": "onValueChange",
        "type": "(value: string) => void",
        "optional": true,
        "doc": "Fires with the newly chosen value. The user cannot clear the choice. If \"none\" is a valid answer, add a row for it."
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
        "doc": "Controls the chosen value. Use it with `onValueChange`. The group makes sure that only one row is chosen."
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
        "doc": "The text of the row. Name the option, not a sentence about it."
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
        "doc": "Close the menu when this row is chosen. Off by default, so the user sees the new choice. Turn it on when the choice is the only reason to open the menu."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Turns the row off, so it cannot be chosen. The row still shows whether it is the current choice."
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
        "doc": "Content at the end of the row, such as a shortcut hint or a count. The dot is at the start."
      },
      {
        "name": "value",
        "type": "string",
        "optional": false,
        "doc": "The value that the row sets when the user chooses it. It must be unique in the group. If two rows share a value, both show as chosen."
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
        "doc": "The rows of the submenu. Use the same parts as in `MenuContent`, including a further `MenuSub`. The submenu takes its width from its content."
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
        "doc": "A `MenuSubTrigger` and a `MenuSubContent`. `MenuSub` renders no element of its own."
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
        "doc": "Controls whether this submenu is open. Use it with `onOpenChange`. It does not affect the parent menu. You rarely need it, because `MenuSubTrigger` opens the submenu."
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
        "doc": "The text of the row. Name the group of actions inside the submenu. Choosing the row only opens the submenu."
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
        "doc": "Content at the start of the row, usually an icon. It uses the same column as the other rows. There is no `trailing` prop, because the row always shows a chevron at the end."
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
        "doc": "The label of the trigger. The menu never changes it. To show a chosen value on the trigger, use `Select`. With `render={<Button/>}`, the children go inside that button."
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
        "doc": "Turns the trigger off, so the menu cannot open. On an element that is not a `<button>`, such as a link, the trigger sets `aria-disabled` so that assistive technology announces it."
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Tells the trigger whether the rendered element is a real `<button>`. The trigger works this out from `render`, so you rarely set it. Set it when your own component renders a `<button>` and the trigger cannot see that."
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
  "MessageScrollerButton": {
    "element": null,
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": false,
        "doc": "The accessible name of the button, such as \"Jump to latest\"."
      },
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Whether content passes behind the button. The default is `true`, because the button floats over the transcript. The button then uses the theme's material. With a solid theme it stays solid."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "The icon of the button."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "MessageScrollerContent": {
    "element": "div",
    "props": []
  },
  "MessageScrollerItem": {
    "element": "div",
    "props": [
      {
        "name": "messageId",
        "type": "string",
        "optional": true,
        "doc": "A stable id for the message. Use it to scroll to the message and to know when it is visible."
      },
      {
        "name": "scrollAnchor",
        "type": "boolean",
        "optional": true,
        "doc": "Scrolls this message near the top when it arrives, so the user sees the reply from its start. In a chat, set it on the person's own message."
      }
    ]
  },
  "MessageScroller": {
    "element": null,
    "props": [
      {
        "name": "autoScroll",
        "type": "boolean",
        "optional": true,
        "doc": "Keeps the newest content in view while the user is at the end. The default is `true`. If the user scrolls up, the transcript stays where they are until they return to the end."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A `ScrollArea` or a `ShellScroll` that holds the transcript and the jump button. Its viewport becomes the scroller. Give that scroll area an `aria-label`."
      },
      {
        "name": "defaultScrollPosition",
        "type": "MessageScrollerDefaultScrollPosition",
        "values": [
          "start",
          "end",
          "last-anchor"
        ],
        "optional": true,
        "doc": "Where the transcript opens: at the end, at the start, or at the last anchored message. The default is `end`."
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
        "doc": "The id of the node for the current page. That row gets `aria-current=\"page\"` and shows in the accent colour. A nav tree has no selection."
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
        "doc": "Renders each leaf as your router's link, for example `renderLink={(node) => <Link href={node.href!} />}`. Without it, a leaf renders a plain `<a href>`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the rows. The default is the `size` of the nearest `Theme`, which is `2` by default."
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
        "doc": "One action that fixes the condition, such as \"Get more usage\". Pass your own `<Button>`. Don't use a general label such as \"OK\"."
      },
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when content passes behind the notice, such as a scrolling region. The notice then uses the theme's material. In normal flow it stays solid. If you don't set it, the notice follows the nearest `<Box backdrop>`."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "The message, usually one sentence. For several paragraphs, use a `Card`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds a class to the notice. To add space around it, wrap it in a `<Box m>`."
      },
      {
        "name": "dismissLabel",
        "type": "string",
        "optional": true,
        "doc": "The accessible name of the dismiss button. The default is \"Dismiss\". Set it to translate the label."
      },
      {
        "name": "icon",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "An icon shown before the message. The package has no icons, so bring one from your own icon set. The icon is hidden from assistive technology, so put the meaning in the words."
      },
      {
        "name": "onDismiss",
        "type": "() => void",
        "optional": true,
        "doc": "Called when the person presses the ✕ dismiss button. The button shows only when you set this callback. Dismissing hides the message but doesn't fix the condition. Your app must remove the notice and remember the choice, because the notice keeps no state of its own."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size of the notice: the padding, the corner, the text and the dismiss button. If you don't set it, the notice uses the size of the nearest `Theme`, which is `2` by default. A `<Text>` that sets its own `size` keeps it."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "Sets the colour family, which tells the category of the message. The default is `neutral`. Use `warning`, `destructive`, `success` or `info` only when the colour adds a fact that the words don't already give."
      }
    ]
  },
  "NumberField": {
    "element": "input",
    "props": [
      {
        "name": "allowOutOfRange",
        "type": "boolean | undefined",
        "optional": true,
        "doc": "Lets a typed value go outside `min` and `max`. The browser then reports the value as out of range when the form submits, and the field doesn't correct it. The buttons and arrow keys still stay in range."
      },
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when the field sits over other content, such as an image. The field then uses the theme's material. If you don't set it, the field follows the nearest `<Box backdrop>`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the outer element, which draws the field."
      },
      {
        "name": "decrementLabel",
        "type": "string",
        "optional": true,
        "doc": "The accessible name of the decrease button. The default is \"Decrease\". Set it to translate the name."
      },
      {
        "name": "defaultValue",
        "type": "number | undefined",
        "optional": true,
        "doc": "The start value of an uncontrolled field. Use `value` for a controlled field."
      },
      {
        "name": "disabled",
        "type": "boolean | undefined",
        "optional": true,
        "doc": "Disables the field. It takes no input, and the whole field shows as disabled."
      },
      {
        "name": "form",
        "type": "string | undefined",
        "optional": true,
        "doc": "The `id` of the form that the field belongs to. Use it when the field is outside the form."
      },
      {
        "name": "format",
        "type": "Intl.NumberFormatOptions | undefined",
        "optional": true,
        "doc": "The `Intl.NumberFormat` options that format the value. Put a unit, a currency or a percent here, for example `{ style: \"currency\", currency: \"USD\" }`. The field shows it in the user's locale, screen readers announce it, and typed text is parsed back to a number."
      },
      {
        "name": "id",
        "type": "string | undefined",
        "optional": true,
        "doc": "The `id` of the input. A `<label for>` uses it to name the field."
      },
      {
        "name": "incrementLabel",
        "type": "string",
        "optional": true,
        "doc": "The accessible name of the increase button. The default is \"Increase\". Set it to translate the name."
      },
      {
        "name": "largeStep",
        "type": "number | undefined",
        "optional": true,
        "doc": "The amount that Shift + an arrow key adds or removes. Use it for large changes."
      },
      {
        "name": "locale",
        "type": "Intl.LocalesArgument | undefined",
        "optional": true,
        "doc": "The locale that formats and parses the value. The default is the user's locale."
      },
      {
        "name": "max",
        "type": "number | undefined",
        "optional": true,
        "doc": "The highest permitted value. At this value, the increase button is disabled."
      },
      {
        "name": "min",
        "type": "number | undefined",
        "optional": true,
        "doc": "The lowest permitted value. At this value, the decrease button is disabled."
      },
      {
        "name": "name",
        "type": "string | undefined",
        "optional": true,
        "doc": "The name of the value in the submitted form. The form submits the number, not the formatted text."
      },
      {
        "name": "onValueChange",
        "type": "| ((value: number | null, eventDetails: BaseNumberField.Root.ChangeEventDetails) => void) | undefined",
        "optional": true,
        "doc": "Called on every change of the value. It receives the number, or `null` when the field is empty, and details of the cause: typing, a stepper press or an arrow key. Use this in place of `onChange`, which the field doesn't take."
      },
      {
        "name": "onValueCommitted",
        "type": "| ((value: number | null, eventDetails: BaseNumberField.Root.CommitEventDetails) => void) | undefined",
        "optional": true,
        "doc": "Called when the value is final: on blur after typing, or when a press is released. `onValueChange` also gets each intermediate value. Use this callback to save the value."
      },
      {
        "name": "readOnly",
        "type": "boolean | undefined",
        "optional": true,
        "doc": "Prevents changes to the value. The value stays selectable, and the form still submits it."
      },
      {
        "name": "required",
        "type": "boolean | undefined",
        "optional": true,
        "doc": "Prevents form submission while the field is empty."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the field, from `\"1\"` to `\"4\"`. It sets the height, padding, corner, text size and buttons, the same as a `Button` or `TextField`. The default comes from the enclosing `Field`, then from the theme."
      },
      {
        "name": "smallStep",
        "type": "number | undefined",
        "optional": true,
        "doc": "The amount that Alt + an arrow key adds or removes. Use it for fine changes."
      },
      {
        "name": "snapOnStep",
        "type": "boolean | undefined",
        "optional": true,
        "doc": "Rounds the value to a multiple of `step` when it steps. Otherwise, it steps from the current value."
      },
      {
        "name": "step",
        "type": "number | \"any\" | undefined",
        "optional": true,
        "doc": "The amount that one button press or one arrow key adds or removes. `\"any\"` turns off the browser's step validation, and each step then moves the value by 1."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles for the outer element. A `width` here sets the width of the whole field."
      },
      {
        "name": "value",
        "type": "number | null | undefined",
        "optional": true,
        "doc": "The value of a controlled field. `null` means the field is empty, not zero."
      }
    ]
  },
  "Page": {
    "element": "div",
    "props": [
      {
        "name": "description",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A sentence under the title that describes the page. It shows larger than the body text. It's optional."
      },
      {
        "name": "mark",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A logo or mark above the title, such as an app's logo on its home page. It sits close to the title. Most pages don't need it."
      },
      {
        "name": "title",
        "type": "string",
        "optional": false,
        "doc": "The title of the page. It shows large at the top. When it scrolls away, it also shows in the `ToolbarTitle` of the toolbar above. It must be a string, because it shows in two places."
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
        "values": [
          "start",
          "center",
          "end"
        ],
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
        "doc": "Adds your classes to the panel. They don't replace the component's own classes."
      },
      {
        "name": "side",
        "type": "\"top\" | \"right\" | \"bottom\" | \"left\"",
        "values": [
          "top",
          "right",
          "bottom",
          "left"
        ],
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
        "doc": "Adds inline styles to the panel. A width that you set here is the panel's width."
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
        "doc": "The supporting text under the title. Screen readers announce it with the title, so don't repeat the title here."
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
        "doc": "The `PopoverTrigger` and the `PopoverContent`, in that order. The panel attaches to the trigger."
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
        "doc": "Called when the panel opens or closes."
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
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the panel's padding and corner. It doesn't change the size of your own content. Set the text size on that content yourself. `PopoverTitle` and `PopoverDescription` follow this size."
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
        "doc": "The panel's name. It is the visible heading, and screen readers announce the panel by it. Name the content, such as \"Filters\", not the type of control."
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
        "doc": "The accessible name of the task, such as \"Uploading photos\". Set it unless something else names the bar, such as a `Field` label or `aria-labelledby`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the bar. For space around it, wrap it in a `Box` with `m`."
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
        "doc": "A class name for the radio. For space around it, wrap it in a `Box` with `m`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the radio, from `1` to `4`. The circle is one line of text tall at the same step, so it lines up with its label and matches a checkbox. The area that you can press is as large as a `Button` at the same step. Unset, it uses the `size` of the nearest `Field` or `Theme`."
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
        "doc": "Marks the row as the current location, such as the page you are on or the open file. The row sets `aria-current`. It is not a selection or a form value. To let people pick one of several options, use a `RadioGroup`."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Disables the row. The row stays in the list, so people can still see that the item exists."
      },
      {
        "name": "highlighted",
        "type": "boolean",
        "optional": true,
        "doc": "Highlights the row from your code. Use it for a list that moves a highlight with the arrow keys while focus stays elsewhere, such as a command palette. When you set this prop, even to `false`, the row no longer highlights on hover. If you don't set it, the row highlights on hover."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content before the label, such as an icon, an avatar or a tick."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the row as a different element. Use `<a>` for a row that goes to a page. Use `<div>` for a row in a read-only list. A `<div>` row doesn't highlight on hover."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the height of the row. A row has the same height as a `Button` of the same size. If you don't set it, the row uses the size of the nearest `Theme`, which is `2` by default."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "Sets the colour family of the row. Use it only when one row has a special meaning, such as `destructive` for a delete action in a list of commands."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content at the far end of the row, such as a shortcut, a count or a chevron."
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
        "doc": "The accessible name of the scroll area. Set it on a focusable scroll area, because screen readers announce a tab stop without a name as nothing. With a name, the scroll area is a `region` landmark."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "The id of an element that names the scroll area, usually a heading above it. Use it instead of `aria-label`, not together with it."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The content that scrolls. The scroll area must have a limited height. Set one with `style`, or put the scroll area in a container that limits its height, such as a `Shell` panel."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds a class to the outer element. To add space around it, wrap it in a `<Box m>`."
      },
      {
        "name": "fade",
        "type": "boolean",
        "optional": true,
        "doc": "Fades the content at each edge that has more content beyond it. An edge fades only while content is hidden on that side. The fade shows the background behind it, so it works on any colour or on glass. The default is `false`."
      },
      {
        "name": "focusable",
        "type": "boolean",
        "optional": true,
        "doc": "Whether keyboard users can tab to the scroll area. The default is `true`, so people can scroll it with the keyboard. Set it to `false` inside a component that already handles keyboard scrolling, such as a menu."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles for the outer element, not for the viewport that scrolls."
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
        "doc": "Set `backdrop` when the control sits over other content, such as an image. It then uses the theme's material. Unset, it follows the nearest `<Box backdrop>`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the control. For space around it, wrap it in a `Box` with `m`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the control, from `1` to `4`. It is as tall as a `Button` at the same step. Set it here, not on each segment. All segments use this size."
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
        "doc": "A class name for the segment."
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
        "doc": "The options: `SelectItem` elements, in `SelectGroup` elements with a `SelectLabel` if you need groups. Don't use a `<Separator>` here. Use groups to divide the options."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds your classes to the panel. The component's own classes stay. A width or a maximum height that you set applies to the panel."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Adds inline styles to the panel. Your styles apply last."
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
        "doc": "The `SelectItem` options in the group, and one `SelectLabel` that names them. Put the label inside the group. Screen readers then announce the group name with its options."
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
        "doc": "The text of the option in the panel. The closed trigger doesn't show this text. If the label isn't the same as the value, put it in the `items` prop of `Select` too."
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
        "doc": "Turns off the option, so you can't choose it. The option stays in the list, and screen readers still announce it."
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
        "doc": "The value of this option. The form submits it, and the trigger shows it or its label from `items`."
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
        "doc": "The name of the options below it. You can't choose a label, so don't write it like an option."
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
        "doc": "A `<SelectTrigger>` and a `<SelectContent>`. `Select` renders no element of its own."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the panel is open at the start, when the select controls it. Don't use it with `open`."
      },
      {
        "name": "defaultValue",
        "type": "string",
        "optional": true,
        "doc": "The value at the start, when the select controls its own value. Don't use it with `value`."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Turns off the whole control. The panel can't open, and the form doesn't submit the value. There's no `readOnly`. For a value that must submit but can't change, use a disabled select and your own hidden input with the value."
      },
      {
        "name": "items",
        "type": "Record<string, React.ReactNode>",
        "optional": true,
        "doc": "Maps each value to the label that the closed trigger shows. The trigger reads its text only from this map, not from the option you clicked. Without it, the trigger shows the raw value. You can leave it out if each value is the same as its label."
      },
      {
        "name": "name",
        "type": "string",
        "optional": true,
        "doc": "The name of the field when a form is submitted. The select sends its value through a hidden input."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Called when the panel opens or closes. It isn't called when the value changes. Use `onValueChange` for that."
      },
      {
        "name": "onValueChange",
        "type": "(value: string | null) => void",
        "optional": true,
        "doc": "Called when the chosen value changes. It isn't called when the panel opens or closes. The value is `null` when the select clears it. This occurs when the options change and no longer include the current value, for example a region list that changes with the country."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the panel is open, when you control it. Use it with `onOpenChange`. Opening the panel doesn't change the value."
      },
      {
        "name": "required",
        "type": "boolean",
        "optional": true,
        "doc": "Makes a value necessary before the form can submit, as on a native `<select>`. The browser does the check."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the trigger and the panel. The rows, the icons and the text all use it. Inside a `Field`, the field's size applies when you don't set this."
      },
      {
        "name": "value",
        "type": "string",
        "optional": true,
        "doc": "The chosen value, when you control it. Use it with `onValueChange`. The trigger shows this value, or its label from `items`."
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
        "doc": "Set `backdrop` when the trigger sits over other content, such as an image. The trigger then uses the theme's material. If you don't set it, the trigger follows the nearest `<Box backdrop>`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds your classes to the trigger. The component's own classes stay."
      },
      {
        "name": "placeholder",
        "type": "string",
        "optional": true,
        "doc": "The text that the trigger shows, in a muted colour, while no value is chosen."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Adds inline styles to the trigger. Your styles apply last."
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
        "doc": "A class name for the line. For space around it, wrap it in a `Box` with `m`."
      }
    ]
  },
  "SheetClose": {
    "element": "button",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The label of the button. If you set `render`, the label goes inside that element, so the result is one button with one label."
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
        "doc": "Whether the rendered element is a native `<button>`. The default comes from `render`."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "The element to render as the button, usually a Kookie `Button`: `<SheetTrigger render={<Button/>}>Filters</SheetTrigger>`."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "SheetContent": {
    "element": "div",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The content of the panel. Include a `SheetTitle`, because it gives the panel its accessible name. Also include a `SheetClose`. If the content is taller than the window, the panel scrolls. Put a `ScrollArea` directly inside to keep the content above and below it in place."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Class names for the panel. They don't go on the backdrop."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles for the panel. They don't go on the backdrop."
      }
    ]
  },
  "SheetDescription": {
    "element": "p",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A short description of the sheet. Screen readers announce it with the title, so don't repeat the title here."
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
  "Sheet": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "A `<SheetTrigger>` and a `<SheetContent>`, in either order. The sheet adds no elements of its own."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the sheet is open at the start, for an uncontrolled sheet. Don't use it with `open`."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean, details: SheetOpenChangeDetails) => void",
        "optional": true,
        "doc": "Called each time the sheet opens or closes. `details.reason` tells the cause, such as `swipe`, and `details.event` is the native event. Call `details.cancel()` to stop the change, for example to warn about unsaved changes."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the sheet is open, for a controlled sheet. Use it with `onOpenChange`."
      },
      {
        "name": "side",
        "type": "SheetSide",
        "values": [
          "bottom",
          "inline-start",
          "inline-end"
        ],
        "optional": true,
        "doc": "The edge that the sheet comes in from. `bottom` is the default, and shows a task that comes up over the page. `inline-end` and `inline-start` show a panel beside the page, such as details, filters or a cart. The inline sides follow the reading direction."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the sheet, from `\"1\"` to `\"4\"`. It sets the width, padding and corner, and the text size of `SheetTitle` and `SheetDescription`. On a side sheet, the width is the full width. On a bottom sheet, it is the maximum width. It doesn't change text that you add."
      }
    ]
  },
  "SheetTitle": {
    "element": "h2",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The title of the sheet. It is the visible heading and the name that a screen reader announces. Name the task, such as \"Filters\", not the type of panel."
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
  "SheetTrigger": {
    "element": "button",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The label of the button. If you set `render`, the label goes inside that element, so the result is one button with one label."
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
        "doc": "Whether the rendered element is a native `<button>`. The default comes from `render`."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "The element to render as the button, usually a Kookie `Button`: `<SheetTrigger render={<Button/>}>Filters</SheetTrigger>`."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
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
        "doc": "Set `backdrop` when content passes behind this pane, such as a canvas, a map or an image. The pane then uses the theme's material. Without it, the pane stays solid. If you leave it unset, the pane follows the nearest `<Box backdrop>` region. A pane that opens as an overlay always uses the theme's material. This prop does not change that."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Sets whether the pane starts open when you do not control it. If you set neither this nor `open`, the window size decides whether the pane is open. The first toggle then sets the state."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "Sets whether this pane joins the app frame. The default is `true`. A flush pane sits against its neighbours with one hairline between them. Set `flush={false}` to pull the pane off the frame. The pane then floats over the content if the content is flush. Otherwise it becomes a separate panel on the app background. This prop does not change the material. Use `backdrop` for that."
      },
      {
        "name": "height",
        "type": "number",
        "optional": true,
        "doc": "Sets the pane's height in CSS pixels. If you leave it unset, the pane uses its default height."
      },
      {
        "name": "maxHeight",
        "type": "number",
        "optional": true,
        "doc": "Sets the largest height, in CSS pixels, that a resize can give the pane. If you leave it unset, the shell's height is the limit."
      },
      {
        "name": "minHeight",
        "type": "number",
        "optional": true,
        "doc": "Sets the smallest height, in CSS pixels, that a resize can give the pane. The default is a minimum that the shell supplies."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Called when the user opens or closes the pane: with a trigger, the Escape key or a press on the scrim. It is not called when the pane mounts. It is not called when a window resize opens or closes the pane."
      },
      {
        "name": "onResize",
        "type": "(height: number) => void",
        "optional": true,
        "doc": "Called once when the user ends a resize, with the pane's new height. Save it if you want it to stay after a reload."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controls whether the pane is open. Use it with `onOpenChange`. You can set it only some of the time. For example, `{...(preview ? { open: false } : {})}` keeps the pane closed during a preview. When you remove it, the pane goes back to its last state."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "values": [
          "auto",
          "fixed",
          "overlay",
          "bar"
        ],
        "optional": true,
        "doc": "Sets how the pane takes space when it is open. - `auto`, the default: in the layout on a wide window, and over the content on a narrow one. - `fixed`: always in the layout. - `overlay`: always over the content, with a scrim. The pane also starts closed at every window size. Use `overlay` for a drawer that the user opens when they need it."
      },
      {
        "name": "resizable",
        "type": "boolean",
        "optional": true,
        "doc": "Lets the user drag the pane's top edge to change its height. The user can also move it with the arrow keys."
      },
      {
        "name": "resizeLabel",
        "type": "string",
        "optional": true,
        "doc": "The handle's accessible name."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the pane: its padding and the controls in it. The default is the shell's `size`."
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
        "doc": "Sets whether this pane joins the app frame. The default is `true`. A flush pane sits against its neighbours with one hairline between them. Set `flush={false}` to pull the pane off the frame. The pane then floats over the content if the content is flush. Otherwise it becomes a separate panel on the app background. This prop does not change the material. Use `backdrop` for that."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the pane: its padding and the controls in it. The default is the shell's `size`."
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
        "doc": "Set `backdrop` when content passes behind this pane, such as a canvas, a map or an image. The pane then uses the theme's material. Without it, the pane stays solid. If you leave it unset, the pane follows the nearest `<Box backdrop>` region. A pane that opens as an overlay always uses the theme's material. This prop does not change that."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "Sets whether this pane joins the app frame. The default is `true`. A flush pane sits against its neighbours with one hairline between them. Set `flush={false}` to pull the pane off the frame. The pane then floats over the content if the content is flush. Otherwise it becomes a separate panel on the app background. This prop does not change the material. Use `backdrop` for that."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the header: its padding, its row height and the controls in it. The default is the shell's `size`."
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
        "doc": "Set `backdrop` when content passes behind this pane, such as a canvas, a map or an image. The pane then uses the theme's material. Without it, the pane stays solid. If you leave it unset, the pane follows the nearest `<Box backdrop>` region. A pane that opens as an overlay always uses the theme's material. This prop does not change that."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Sets whether the pane starts open when you do not control it. If you set neither this nor `open`, the window size decides whether the pane is open. The first toggle then sets the state."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "Sets whether this pane joins the app frame. The default is `true`. A flush pane sits against its neighbours with one hairline between them. Set `flush={false}` to pull the pane off the frame. The pane then floats over the content if the content is flush. Otherwise it becomes a separate panel on the app background. This prop does not change the material. Use `backdrop` for that."
      },
      {
        "name": "maxWidth",
        "type": "number",
        "optional": true,
        "doc": "Sets the largest width, in CSS pixels, that a resize can give the pane. If you leave it unset, the shell's width is the limit."
      },
      {
        "name": "minWidth",
        "type": "number",
        "optional": true,
        "doc": "Sets the smallest width, in CSS pixels, that a resize can give the pane. The default is a minimum that the shell supplies."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Called when the user opens or closes the pane: with a trigger, the Escape key or a press on the scrim. It is not called when the pane mounts. It is not called when a window resize opens or closes the pane."
      },
      {
        "name": "onResize",
        "type": "(width: number) => void",
        "optional": true,
        "doc": "Called once when the user ends a resize, with the pane's new width. Save the width if you want it to stay after a reload. If you set `width`, the pane keeps the dragged width until you change `width`."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controls whether the pane is open. Use it with `onOpenChange`. You can set it only some of the time. For example, `{...(preview ? { open: false } : {})}` keeps the pane closed during a preview. When you remove it, the pane goes back to its last state."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "values": [
          "auto",
          "fixed",
          "overlay",
          "bar"
        ],
        "optional": true,
        "doc": "Sets how the pane takes space when it is open. - `auto`, the default: in the layout on a wide window, and over the content on a narrow one. - `fixed`: always in the layout. - `overlay`: always over the content, with a scrim. The pane also starts closed at every window size. Use `overlay` for a drawer that the user opens when they need it."
      },
      {
        "name": "resizable",
        "type": "boolean",
        "optional": true,
        "doc": "Lets the user drag the pane's edge to change its width. The pane gets a handle with `role=\"separator\"`. The user can also move it with the arrow keys."
      },
      {
        "name": "resizeLabel",
        "type": "string",
        "optional": true,
        "doc": "Sets the accessible name of the resize handle. The default is in English, so set it for other languages."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the pane: its padding, its rows and its buttons. It does not set the width. The default is the shell's `size`."
      },
      {
        "name": "width",
        "type": "number",
        "optional": true,
        "doc": "Sets the pane's width in CSS pixels. If you leave it unset, the pane uses its default width."
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
        "doc": "Marks the row as the current page. Screen readers announce it with `aria-current=\"page\"`, and the row shows it."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Sets the icon before the label. It uses the label's neutral colour, and the accent colour on the current row."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the row as another element, such as a link: `render={<a href=\"/settings\" />}`."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Sets content after the label, at the far edge of the row, such as a count or a chevron."
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
        "doc": "Makes the row float over the pane's scrolling content, so the content passes behind it. The pane then sets `--kui-pane-inset-block-start` (or `--kui-pane-inset-block-end` for a footer) to the row's height. Use it to pad content that must not go under the row. Use it with the `fade` prop of `ScrollArea` to keep the row legible."
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
        "doc": "Makes the row float over the pane's scrolling content, so the content passes behind it. The pane then sets `--kui-pane-inset-block-start` (or `--kui-pane-inset-block-end` for a footer) to the row's height. Use it to pad content that must not go under the row. Use it with the `fade` prop of `ScrollArea` to keep the row legible."
      }
    ]
  },
  "Shell": {
    "element": "div",
    "props": [
      {
        "name": "contained",
        "type": "boolean",
        "optional": true,
        "doc": "Makes the shell fill its parent element instead of the window. By default, the shell takes the window's height. On a narrow touch screen the page scrolls, so the browser can hide its toolbars. A contained shell always scrolls inside itself. Use it for a shell in a card, in a demo or in a canvas."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step for the shell's panes and navigation. Each pane uses it unless the pane sets its own `size`. It does not set the type size or the pane widths. Use `width` on a pane for its width."
      }
    ]
  },
  "ShellRailAction": {
    "element": "button",
    "props": [
      {
        "name": "label",
        "type": "string",
        "optional": false,
        "doc": "Sets the button's name. Screen readers announce it, and the tab bar shows it under the icon."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the button as another element, such as a link, for an action that goes to a page."
      }
    ]
  },
  "ShellRailItem": {
    "element": "button",
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "Sets the item's name. Use `label` instead: it names the item and also shows the word in the tab bar."
      },
      {
        "name": "current",
        "type": "boolean",
        "optional": true,
        "doc": "Marks the item as the current section. Screen readers announce it, and the item shows it."
      },
      {
        "name": "label",
        "type": "string",
        "optional": true,
        "doc": "Sets the item's name. In the rail, screen readers announce it, because the item shows only an icon. In the tab bar, it also shows under the icon."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the item as another element, such as a link: `render={<a href=\"/inbox\" />}`."
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
        "doc": "Set `backdrop` when content passes behind this pane, such as a canvas, a map or an image. The pane then uses the theme's material. Without it, the pane stays solid. If you leave it unset, the pane follows the nearest `<Box backdrop>` region. A pane that opens as an overlay always uses the theme's material. This prop does not change that."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Sets whether the pane starts open when you do not control it. If you set neither this nor `open`, the window size decides whether the pane is open. The first toggle then sets the state."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "Sets whether this pane joins the app frame. The default is `true`. A flush pane sits against its neighbours with one hairline between them. Set `flush={false}` to pull the pane off the frame. The pane then floats over the content if the content is flush. Otherwise it becomes a separate panel on the app background. This prop does not change the material. Use `backdrop` for that."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Called when the user opens or closes the pane: with a trigger, the Escape key or a press on the scrim. It is not called when the pane mounts. It is not called when a window resize opens or closes the pane."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controls whether the pane is open. Use it with `onOpenChange`. You can set it only some of the time. For example, `{...(preview ? { open: false } : {})}` keeps the pane closed during a preview. When you remove it, the pane goes back to its last state."
      },
      {
        "name": "presentation",
        "type": "ShellRailPresentation",
        "values": [
          "auto",
          "bar",
          "rail",
          "overlay"
        ],
        "optional": true,
        "doc": "Sets how the rail looks on a narrow window. - `auto`, the default: a rail on a wide window, and a tab bar along the bottom on a narrow one. - `bar`: a tab bar on a narrow window, and nothing on a wide one. - `rail`: never a tab bar. It opens as a drawer on a narrow window. Use it when the rail has too many items for a tab bar. - `overlay`: always a drawer."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the pane: its padding, its rows and its buttons. It does not set the width. The default is the shell's `size`."
      }
    ]
  },
  "ShellScroll": {
    "element": null,
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "The accessible name of the scroll area. Set it on a focusable scroll area, because screen readers announce a tab stop without a name as nothing. With a name, the scroll area is a `region` landmark."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "The id of an element that names the scroll area, usually a heading above it. Use it instead of `aria-label`, not together with it."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The content that scrolls. The scroll area must have a limited height. Set one with `style`, or put the scroll area in a container that limits its height, such as a `Shell` panel."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds a class to the outer element. To add space around it, wrap it in a `<Box m>`."
      },
      {
        "name": "fade",
        "type": "boolean",
        "optional": true,
        "doc": "Fades the content at each edge that has more content beyond it. An edge fades only while content is hidden on that side. The fade shows the background behind it, so it works on any colour or on glass. The default is `false`."
      },
      {
        "name": "focusable",
        "type": "boolean",
        "optional": true,
        "doc": "Whether keyboard users can tab to the scroll area. The default is `true`, so people can scroll it with the keyboard. Set it to `false` inside a component that already handles keyboard scrolling, such as a menu."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Inline styles for the outer element, not for the viewport that scrolls."
      }
    ]
  },
  "ShellSidebar": {
    "element": "nav",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when content passes behind this pane, such as a canvas, a map or an image. The pane then uses the theme's material. Without it, the pane stays solid. If you leave it unset, the pane follows the nearest `<Box backdrop>` region. A pane that opens as an overlay always uses the theme's material. This prop does not change that."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Sets whether the pane starts open when you do not control it. If you set neither this nor `open`, the window size decides whether the pane is open. The first toggle then sets the state."
      },
      {
        "name": "flush",
        "type": "boolean",
        "optional": true,
        "doc": "Sets whether this pane joins the app frame. The default is `true`. A flush pane sits against its neighbours with one hairline between them. Set `flush={false}` to pull the pane off the frame. The pane then floats over the content if the content is flush. Otherwise it becomes a separate panel on the app background. This prop does not change the material. Use `backdrop` for that."
      },
      {
        "name": "maxWidth",
        "type": "number",
        "optional": true,
        "doc": "Sets the largest width, in CSS pixels, that a resize can give the pane. If you leave it unset, the shell's width is the limit."
      },
      {
        "name": "minWidth",
        "type": "number",
        "optional": true,
        "doc": "Sets the smallest width, in CSS pixels, that a resize can give the pane. The default is a minimum that the shell supplies."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Called when the user opens or closes the pane: with a trigger, the Escape key or a press on the scrim. It is not called when the pane mounts. It is not called when a window resize opens or closes the pane."
      },
      {
        "name": "onResize",
        "type": "(width: number) => void",
        "optional": true,
        "doc": "Called once when the user ends a resize, with the pane's new width. Save the width if you want it to stay after a reload. If you set `width`, the pane keeps the dragged width until you change `width`."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Controls whether the pane is open. Use it with `onOpenChange`. You can set it only some of the time. For example, `{...(preview ? { open: false } : {})}` keeps the pane closed during a preview. When you remove it, the pane goes back to its last state."
      },
      {
        "name": "presentation",
        "type": "ShellPresentation",
        "values": [
          "auto",
          "fixed",
          "overlay",
          "bar"
        ],
        "optional": true,
        "doc": "Sets how the pane takes space when it is open. - `auto`, the default: in the layout on a wide window, and over the content on a narrow one. - `fixed`: always in the layout. - `overlay`: always over the content, with a scrim. The pane also starts closed at every window size. Use `overlay` for a drawer that the user opens when they need it."
      },
      {
        "name": "resizable",
        "type": "boolean",
        "optional": true,
        "doc": "Lets the user drag the pane's edge to change its width. The pane gets a handle with `role=\"separator\"`. The user can also move it with the arrow keys."
      },
      {
        "name": "resizeLabel",
        "type": "string",
        "optional": true,
        "doc": "Sets the accessible name of the resize handle. The default is in English, so set it for other languages."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the pane: its padding, its rows and its buttons. It does not set the width. The default is the shell's `size`."
      },
      {
        "name": "width",
        "type": "number",
        "optional": true,
        "doc": "Sets the pane's width in CSS pixels. If you leave it unset, the pane uses its default width."
      }
    ]
  },
  "ShellTrigger": {
    "element": "button",
    "props": [
      {
        "name": "action",
        "type": "\"toggle\" | \"open\" | \"close\"",
        "values": [
          "toggle",
          "open",
          "close"
        ],
        "optional": true,
        "doc": "Sets what a press does to the `target` pane: `toggle`, `open` or `close`. The default is `toggle`. Use `open` when a press must always show the pane, such as a rail item that changes what the sidebar shows. Use `close` for a close button inside a pane that opens as an overlay."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the trigger as another element, usually a Kookie `Button`: `<ShellTrigger target=\"sidebar\" render={<Button iconOnly />} />`."
      },
      {
        "name": "target",
        "type": "ShellPaneTarget",
        "values": [
          "rail",
          "sidebar",
          "inspector",
          "bottom"
        ],
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
        "doc": "The accessible name of the slider. Inside a `Field`, the field's label names it, so you don't need this prop. A range slider gives the same name to both thumbs. If each thumb needs its own name, use two sliders with their own labels."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the slider. For space around it, wrap it in a `Box` with `m`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the slider, from `1` to `4`. The slider is as tall as a `Button` at the same step, and the track and thumb grow with it. Unset, it uses the `size` of the nearest `Field` or `Theme`."
      }
    ]
  },
  "Spinner": {
    "element": "span",
    "props": []
  },
  "SplitButton": {
    "element": "button",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when the button sits over other content, such as an image. The button then uses the theme's material. If you don't set it, the button follows the nearest `<Box backdrop>`."
      },
      {
        "name": "bordered",
        "type": "boolean",
        "optional": true,
        "doc": "Adds a thin border. A `quiet` button with a border looks a little more prominent than a `quiet` button without one."
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
        "values": [
          "loud",
          "medium",
          "quiet"
        ],
        "optional": true,
        "doc": "Sets how prominent the button is next to the buttons beside it. `loud` uses the solid colour of the tone, `medium` uses a soft fill, and `quiet` has no fill. The default is `medium`. Use `loud` for the one main action on a screen."
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
        "doc": "Content before the label, usually an icon. While `loading` is true, the spinner takes this place, so nothing moves."
      },
      {
        "name": "loading",
        "type": "boolean",
        "optional": true,
        "doc": "Shows a spinner and blocks the press while an action runs. The label stays visible. On an `iconOnly` button, the spinner replaces the icon."
      },
      {
        "name": "menu",
        "type": "React.ReactNode",
        "optional": false,
        "doc": "The other actions: `MenuItem`s, groups and separators, exactly what `MenuContent` holds."
      },
      {
        "name": "menuLabel",
        "type": "string",
        "optional": false,
        "doc": "The chevron half's name. Required, because that half has no words of its own."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the button, from `1` to `4`. The step sets the height, the side padding, the corner, the icon size and the label size together. Controls with the same `size` stand level with each other. If you don't set it, the button uses the `size` of the nearest `Theme`, which is `2` by default."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "Sets what the action means, and the theme picks the colour. For example, use `destructive` for an action that deletes something. The default is `neutral`."
      }
    ]
  },
  "Stack": {
    "element": "div",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Marks an area where the components sit over other content, such as a toolbar over a canvas or a panel over an image. Buttons, fields, cards and selects inside it then use the theme's material. Set it once here, not on each control. Set `backdrop={false}` to make an area inside it plain again. It doesn't change the layout."
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
        "doc": "Renders the box as a different element, so you don't add a wrapper."
      }
    ]
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
        "doc": "Renders the surface as a different element, such as a `<section>`, an `<aside>` or a layout component."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the surface, from `1` to `4`. It sets the padding and the corner. The corner is larger than a card's at the same step, so cards inside it fit well."
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
        "doc": "A class name for the switch. For space around it, wrap it in a `Box` with `m`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the switch, from `1` to `4`. The track is as tall as a checkbox one step larger, so a switch looks a little larger than a checkbox at the same step. Unset, it uses the `size` of the nearest `Field` or `Theme`."
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
        "values": [
          "start",
          "center",
          "end"
        ],
        "optional": true,
        "doc": "Sets the horizontal alignment of the cell content. The default is `start`. Use `end` for numbers, so their digits line up. Set the same value on the head and on every cell of a column."
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
        "values": [
          "start",
          "center",
          "end"
        ],
        "optional": true,
        "doc": "Sets the horizontal alignment of the cell content. The default is `start`. Use `end` for numbers, so their digits line up. Set the same value on the head and on every cell of a column."
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
        "doc": "The accessible name of the scroll region around the table. Keyboard users reach this region when the table is wider than its container. To name the table itself, use a `TableCaption`."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "The id of an element that names the scroll region, usually a heading above the table. Use it instead of `aria-label`, not together with it."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds a class to the scroll wrapper around the table, not to the `<table>`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the cell padding and the text size, from `1` to `4`. The padding also follows the theme's density. The default is the `size` of the nearest `Theme`, which is `2` unless you change it."
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
        "doc": "A class name for the bar. For space around the bar, wrap it in a `Box` with `m`."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the tab bar, from `1` to `4`. Set it on the list, not on each tab. All the tabs in the bar use this size, so one bar can't mix sizes."
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
        "doc": "A class name for the tab. For space around the tab, use a `Box` with `m`."
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
        "doc": "Set `backdrop` when the text area sits over other content, such as an image. It then uses the theme's material. Unset, it follows the nearest `<Box backdrop>`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "A class name for the outer element, which draws the box."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the text area, from `1` to `4`. It sets the padding, the corner, the text size and the border. It doesn't set the height: use `rows` for that. The padding is the same on all four sides, so `rows={1}` is taller than a `TextField` at the same step."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Styles for the outer element, which draws the box. A `width` sets the width of the box. Set `resize: \"none\"` to remove the resize handle."
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
        "doc": "Set `backdrop` when content passes behind the field. The field then uses the theme's material. If you don't set it, the field follows the nearest `<Box backdrop>`."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": "Adds a class to the visible box around the input."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content before the text, such as an icon, a unit or a currency symbol. A click on it puts the caret in the field."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size of the field: the height, the padding, the corner and the text. A field has the same height as a `Button` of the same size. This prop replaces the native `size` attribute of `<input>`."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": "Styles the visible box around the input, so a `width` sets the width of the whole field."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content after the text. It can be interactive, such as a clear button or a toggle that shows a password."
      },
      {
        "name": "type",
        "type": "TextFieldType",
        "values": [
          "text",
          "email",
          "password",
          "search",
          "tel",
          "url",
          "number"
        ],
        "optional": true,
        "doc": "The input type. Only text types are available. See TextFieldType."
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
        "values": [
          "loud",
          "medium",
          "quiet"
        ],
        "optional": true,
        "doc": "The emphasis level of the text, which sets its colour. Defaults to `loud`, the full text colour. `medium` is muted and `quiet` is faint. Don't use `quiet` for text that people must read, because its contrast is low."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the text as a different element, such as a `<p>` or a `<label>`."
      },
      {
        "name": "size",
        "type": "TypeSize",
        "values": [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9"
        ],
        "optional": true,
        "doc": "The text size step, from `1` to `9`. Defaults to `3`, the body size. Each step sets the font size, the line height and the letter spacing together."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "The meaning of the text, which sets its colour family, such as `destructive`. The emphasis levels then use colours from that family. Unset, the text uses the colour of the surface it sits on."
      },
      {
        "name": "weight",
        "type": "Weight",
        "values": [
          "regular",
          "medium",
          "semibold"
        ],
        "optional": true,
        "doc": "The font weight: `regular`, `medium` or `semibold`. Defaults to `regular`. There's no `bold`."
      }
    ]
  },
  "Theme": {
    "element": null,
    "props": [
      {
        "name": "appearance",
        "type": "Appearance",
        "values": [
          "inherit",
          "light",
          "dark"
        ],
        "optional": true,
        "doc": "Sets the colour scheme for this scope: `light`, `dark` or `inherit`. `inherit` writes nothing, so the nearest ancestor decides. Use it on the root theme when a script in the document head sets the appearance on `<html>`. This prevents a flash of the wrong scheme with server rendering. Set `light` or `dark` to fix one section, such as a light panel inside a dark app."
      },
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The content that this theme applies to. The theme renders an element to hold its attributes."
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
        "values": [
          "normal",
          "high"
        ],
        "optional": true,
        "doc": "Turns on high contrast for this scope: `normal` or `high`. `high` makes borders, fills and tracks meet the accessibility contrast minimums. If you leave it unset, the scope follows the user's `prefers-contrast: more` setting. `normal` ignores that setting. Put it on the same element as an `appearance` that is not `inherit`. If the appearance is set on `<html>`, set `data-contrast` on `<html>` too. A development build warns when the two are on different elements."
      },
      {
        "name": "density",
        "type": "Density",
        "values": [
          "compact",
          "default",
          "comfortable"
        ],
        "optional": true,
        "doc": "Sets how much space the app gives its controls: `compact`, `default` or `comfortable`. It changes layout gaps, control heights and control padding. It does not change type, icons or checkboxes. Set it once for the app. For one denser area, such as a toolbar, wrap that area in a nested `Theme`."
      },
      {
        "name": "depth",
        "type": "Depth",
        "values": [
          "flat",
          "elevated"
        ],
        "optional": true,
        "doc": "Sets whether surfaces and raised controls cast shadows: `elevated` or `flat`. The default is `elevated`. `flat` removes the shadows. Set it once for the app. No component has its own shadow prop."
      },
      {
        "name": "material",
        "type": "Material",
        "values": [
          "solid",
          "thin",
          "regular",
          "thick"
        ],
        "optional": true,
        "doc": "Sets the material for every component in this scope. The values are `solid`, `thin`, `regular` and `thick`. The default is `solid`, which lets no light through. The other three are glass, from the clearest to the most frosted. One value applies to the whole scope, so a menu and a dialog in the same theme use the same glass. Glass shows only where something sits over other content. Mark a region with `<Box backdrop>`, or set `backdrop` on one component. Other controls stay solid."
      },
      {
        "name": "pointer",
        "type": "Pointer",
        "values": [
          "fine",
          "coarse",
          "auto"
        ],
        "optional": true,
        "doc": "Sets the input type for this scope: `fine`, `coarse` or `auto`. The default is `auto`, which follows the device's `pointer: coarse` media query. `coarse` gives touch-sized controls and larger reading type, as on a phone. Set it to check the touch layout on a desktop."
      },
      {
        "name": "radius",
        "type": "RadiusLevel",
        "values": [
          "none",
          "small",
          "medium",
          "large",
          "full"
        ],
        "optional": true,
        "doc": "Sets the corner radius for the app: `none`, `small`, `medium`, `large` or `full`. The default is `full`, which gives controls a pill shape. `none` gives square corners. A radio button, a slider thumb, a switch thumb and a switch track keep their round shape at every value."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the theme on an element that you supply, instead of an extra wrapper element. Do not use `<body>` or `<html>`. Popups render into `<body>`, and a theme on it puts every popup below the app's own layers. A development build warns if you do."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the default size step for every sized component in this scope. The values are `\"1\"` to `\"4\"`, and the default is `\"2\"`. A `size` on a component always wins. A `Field` or a `Composer` also wins for the controls inside it. It does not change type. `Text`, `Heading` and `Blockquote` use their own nine-step scale. `Code`, `Kbd`, `Badge` and `Chip` take the size of the line they sit in."
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
        "values": [
          "horizontal",
          "vertical"
        ],
        "optional": true,
        "doc": "The direction in which the arrow keys move focus. Defaults to `horizontal`. This prop doesn't change the layout. Use `render` with a `Flex` or `Stack` to arrange the toggles."
      }
    ]
  },
  "Toggle": {
    "element": "button",
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "The name of the button for screen readers. Required when `iconOnly` is set."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "The id of an element on the page that names this button. Use it instead of `aria-label`. One of the two is required with `iconOnly`."
      },
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when the toggle sits over other content, such as an image. The toggle then uses the theme's material. Unset, it follows the nearest `<Box backdrop>`."
      },
      {
        "name": "bordered",
        "type": "boolean",
        "optional": true,
        "doc": "Adds a thin border. The border shows in both states: unpressed it looks like an outline button, and pressed it also gets a fill."
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
        "name": "iconOnly",
        "type": "true",
        "optional": false,
        "doc": "Makes the button square and shows only the icon in `children`. You must also set `aria-label` or `aria-labelledby`."
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
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "The size step of the toggle, from `1` to `4`. It matches a `Button` at the same step. Unset, the toggle uses the `size` of the nearest `Field` or `Theme`."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "The meaning of the toggle's state, which sets its colour. Defaults to `neutral`. When pressed, the toggle shows a soft fill in this tone. Use `destructive` if turning it on does something dangerous."
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
  "ToolbarButton": {
    "element": "button",
    "props": [
      {
        "name": "aria-label",
        "type": "string",
        "optional": true,
        "doc": "The name of the button for screen readers. Required when `iconOnly` is set."
      },
      {
        "name": "aria-labelledby",
        "type": "string",
        "optional": true,
        "doc": "The id of an element on the page that names this button. Use it instead of `aria-label`. One of the two is required with `iconOnly`."
      },
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when the button sits over other content, such as an image. The button then uses the theme's material. If you don't set it, the button follows the nearest `<Box backdrop>`."
      },
      {
        "name": "bordered",
        "type": "boolean",
        "optional": true,
        "doc": "Adds a thin border. A `quiet` button with a border looks a little more prominent than a `quiet` button without one."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "done",
        "type": "boolean",
        "optional": true,
        "doc": "Shows a tick in place of the icon to say that the action finished. The tick replaces the icon at once, in the same box, and the icon comes back as soon as `done` is false again. Use it for actions with no other visible result, such as copy. You hold the value and clear it yourself. Unlike `loading`, it doesn't block the press. Also change the label or `aria-label` (for example, `Copy` to `Copied`), because screen readers don't announce the tick."
      },
      {
        "name": "emphasis",
        "type": "Emphasis",
        "values": [
          "loud",
          "medium",
          "quiet"
        ],
        "optional": true,
        "doc": "Sets how prominent the button is next to the buttons beside it. `loud` uses the solid colour of the tone, `medium` uses a soft fill, and `quiet` has no fill. The default is `medium`. Use `loud` for the one main action on a screen."
      },
      {
        "name": "focusableWhenDisabled",
        "type": "boolean",
        "optional": true,
        "doc": "Keep focus on the button when it becomes disabled part-way through an interaction."
      },
      {
        "name": "iconOnly",
        "type": "true",
        "optional": false,
        "doc": "Makes the button square and shows only the icon in `children`. You must also set `aria-label` or `aria-labelledby`."
      },
      {
        "name": "leading",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content before the label, usually an icon. While `loading` is true, the spinner takes this place, so nothing moves."
      },
      {
        "name": "loading",
        "type": "boolean",
        "optional": true,
        "doc": "Shows a spinner and blocks the press while an action runs. The label stays visible. On an `iconOnly` button, the spinner replaces the icon."
      },
      {
        "name": "nativeButton",
        "type": "boolean",
        "optional": true,
        "doc": "Says whether the rendered element is a real `<button>`. The value comes from `render`, so you almost never need to set it. Set it only when `render` passes a component that renders a `<button>`, because a wrong value breaks accessibility without a warning."
      },
      {
        "name": "render",
        "type": "RenderElement",
        "optional": true,
        "doc": "Renders the button as a different element, such as a link. The appearance and behaviour stay the same. See `nativeButton` if you pass a component."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the button, from `1` to `4`. The step sets the height, the side padding, the corner, the icon size and the label size together. Controls with the same `size` stand level with each other. If you don't set it, the button uses the `size` of the nearest `Theme`, which is `2` by default."
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
        "values": [
          "neutral",
          "accent",
          "destructive",
          "blue",
          "green",
          "orange",
          "amber",
          "success",
          "warning",
          "info"
        ],
        "optional": true,
        "doc": "Sets what the action means, and the theme picks the colour. For example, use `destructive` for an action that deletes something. The default is `neutral`."
      },
      {
        "name": "trailing",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "Content after the label, such as a chevron, a count or a control. The spinner never replaces it."
      }
    ]
  },
  "ToolbarGroup": {
    "element": "div",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when content passes behind the group. The group then uses the theme's material. If you don't set it, the group follows the nearest `<Box backdrop>` or the toolbar's `backdrop`."
      },
      {
        "name": "disabled",
        "type": "boolean",
        "optional": true,
        "doc": "Turns every control in the group off at once."
      }
    ]
  },
  "ToolbarOverflow": {
    "element": "div",
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The controls in the cluster, in order. The controls that don't fit show in the `⋯` menu."
      },
      {
        "name": "label",
        "type": "string",
        "optional": true,
        "doc": "The accessible name of the `⋯` button. The default is `More`."
      }
    ]
  },
  "Toolbar": {
    "element": "div",
    "props": [
      {
        "name": "backdrop",
        "type": "boolean",
        "optional": true,
        "doc": "Set `backdrop` when content passes behind the row, such as in a floating header. Every control in the row then uses the theme's material. The row itself stays transparent. A `backdrop` prop on a control overrides it."
      },
      {
        "name": "orientation",
        "type": "\"horizontal\" | \"vertical\"",
        "values": [
          "horizontal",
          "vertical"
        ],
        "optional": true,
        "doc": "Sets the direction of the row and of the arrow keys. The default is `horizontal`. Use `vertical` for a strip of tools along an edge."
      },
      {
        "name": "size",
        "type": "Size",
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of every control in the row that doesn't set its own `size`. The default is one step above the app's `size`, which is `3` in a default app."
      }
    ]
  },
  "ToolbarSeparator": {
    "element": null,
    "props": []
  },
  "ToolbarTitle": {
    "element": null,
    "props": [
      {
        "name": "children",
        "type": "React.ReactNode",
        "optional": true,
        "doc": "The title text. Leave it out to show the title of the `Page` in this panel."
      },
      {
        "name": "className",
        "type": "string",
        "optional": true,
        "doc": ""
      },
      {
        "name": "id",
        "type": "string",
        "optional": true,
        "doc": "The id of the title, so that you can point `aria-labelledby` at it."
      },
      {
        "name": "style",
        "type": "React.CSSProperties",
        "optional": true,
        "doc": ""
      }
    ]
  },
  "TooltipContent": {
    "element": "div",
    "props": [
      {
        "name": "align",
        "type": "\"start\" | \"center\" | \"end\"",
        "values": [
          "start",
          "center",
          "end"
        ],
        "optional": true,
        "doc": "How the tooltip lines up with the trigger along that side. The default is `center`."
      },
      {
        "name": "children",
        "type": "string",
        "optional": true,
        "doc": "The text of the tooltip. It must be a string, such as \"Undo\" or \"Undo ⌘Z\". Components such as `Kbd` don't show correctly on the tooltip's inverted colours. For richer content, use a `Popover`."
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
        "values": [
          "top",
          "right",
          "bottom",
          "left"
        ],
        "optional": true,
        "doc": "The side of the trigger to show the tooltip on. The default is `top`. If that side has no room, the tooltip moves to the opposite side."
      },
      {
        "name": "sideOffset",
        "type": "number",
        "optional": true,
        "doc": "The gap between the trigger and the tooltip, in pixels. The default is the gap that all floating panels use."
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
        "doc": "A `TooltipTrigger` and a `TooltipContent`, in that order."
      },
      {
        "name": "defaultOpen",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the tooltip starts open, when you don't control it."
      },
      {
        "name": "onOpenChange",
        "type": "(open: boolean) => void",
        "optional": true,
        "doc": "Called when the tooltip opens or closes."
      },
      {
        "name": "open",
        "type": "boolean",
        "optional": true,
        "doc": "Whether the tooltip is open. Use it with `onOpenChange` to control the tooltip."
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
        "doc": "Lets the user select more than one row. Shift with an arrow key or a click selects a range. Cmd or Ctrl with a click adds or removes one row. If it's off, a click replaces the selection."
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
        "values": [
          "1",
          "2",
          "3",
          "4"
        ],
        "optional": true,
        "doc": "Sets the size step of the rows. The default is the `size` of the nearest `Theme`, which is `2` by default."
      }
    ]
  }
};
