/**
 * Templates (2026-08-20): screens to start from, and — because this editor can check its own
 * house style — screens that hold to it. A law runs `reviewDocument` over every one of them
 * and expects SILENCE, which means these are not decoration: they are the composition brief
 * demonstrated, and if the brief's rules change, the templates fail CI until they follow.
 *
 * Each one is built from the same closed vocabulary a person has: token indices, closed axis
 * values, no lengths, no colours. Nothing here can say anything a call site could not.
 */

import {
  canvasNode, defaultDocTheme, node, withStableIds, type BuilderDoc, type BuilderNode } from "./model";

export type Template = {
  id: string;
  name: string;
  /** What this screen is FOR, in one line — the palette shows it, so it earns its words. */
  blurb: string;
  build: () => BuilderNode[];
};

/** The §15 ladder, spelled once so every template below reads from one place: page 8,
    section 7, card title 6, body 3, label and meta 2. */
const TITLE = "6";
const SECTION = "7";
const BODY = "2";

const field = (label: string, placeholder: string) =>
  node("Stack", { gap: "2" }, {
    children: [
      node("Text", { size: BODY, weight: "medium" }, { text: label }),
      node("TextField", { placeholder, "aria-label": label }),
    ],
  });

const switchRow = (label: string, meaning: string, on = false) =>
  node("Flex", { gap: "4", align: "center", justify: "space-between" }, {
    children: [
      node("Stack", { gap: "1" }, {
        children: [
          node("Text", { size: BODY, weight: "medium" }, { text: label }),
          node("Text", { size: BODY, emphasis: "medium" }, { text: meaning }),
        ],
      }),
      node("Switch", { "aria-label": label, ...(on ? { defaultChecked: true } : {}) }),
    ],
  });

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    name: "Blank",
    blurb: "Nothing at all — start from the palette.",
    build: () => [],
  },
  {
    id: "confirm",
    name: "Confirm card",
    blurb: "A question, its consequence, and the two ways out.",
    build: () => [
      node("Card", { size: "3" }, {
        children: [
          node("Stack", { gap: "5" }, {
            children: [
              node("Stack", { gap: "2" }, {
                children: [
                  node("Heading", { size: TITLE }, { text: "Delete this workspace?" }),
                  node("Text", { size: BODY, emphasis: "medium" }, {
                    text: "Every project, member and API key goes with it. This cannot be undone.",
                  }),
                ],
              }),
              node("Flex", { gap: "3", justify: "flex-end" }, {
                children: [
                  node("Button", { emphasis: "quiet", bordered: true }, { text: "Keep it" }),
                  node("Button", { tone: "destructive", emphasis: "loud" }, { text: "Delete workspace" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  },
  {
    id: "sign-in",
    name: "Sign in",
    blurb: "The narrow column every product starts with.",
    build: () => [
      node("Card", { size: "4" }, {
        children: [
          node("Stack", { gap: "6" }, {
            children: [
              node("Stack", { gap: "2" }, {
                children: [
                  node("Heading", { size: TITLE }, { text: "Sign in" }),
                  node("Text", { size: BODY, emphasis: "medium" }, { text: "Use the address your team invited." }),
                ],
              }),
              node("Stack", { gap: "4" }, {
                children: [field("Email", "you@company.com"), field("Password", "••••••••")],
              }),
              // The mark and its label are one thing (gap 3); that pair against the link is
              // two things (gap 5). The review rule caught this template stating both at 3.
              node("Flex", { gap: "5", align: "center", justify: "space-between" }, {
                children: [
                  node("Flex", { gap: "3", align: "center" }, {
                    children: [
                      node("Checkbox", { "aria-label": "Stay signed in" }),
                      node("Text", { size: BODY }, { text: "Stay signed in" }),
                    ],
                  }),
                  node("Button", { emphasis: "quiet" }, { text: "Forgot password" }),
                ],
              }),
              node("Button", { emphasis: "loud" }, { text: "Sign in" }),
            ],
          }),
        ],
      }),
    ],
  },
  {
    id: "settings",
    name: "Settings section",
    blurb: "Labelled switches with their consequences said quietly.",
    build: () => [
      node("Card", { size: "3" }, {
        children: [
          node("Stack", { gap: "6" }, {
            children: [
              node("Stack", { gap: "2" }, {
                children: [
                  node("Heading", { size: TITLE }, { text: "Notifications" }),
                  node("Text", { size: BODY, emphasis: "medium" }, {
                    text: "Choose what reaches you outside the app.",
                  }),
                ],
              }),
              node("Stack", { gap: "4" }, {
                children: [
                  switchRow("Deploys", "Every finished deploy, success or failure.", true),
                  node("Separator"),
                  switchRow("Mentions", "When a teammate names you in a comment.", true),
                  node("Separator"),
                  switchRow("Weekly digest", "One summary each Monday morning."),
                ],
              }),
              node("Flex", { gap: "3", justify: "flex-end" }, {
                children: [node("Button", { emphasis: "loud" }, { text: "Save changes" })],
              }),
            ],
          }),
        ],
      }),
    ],
  },
  {
    id: "toolbar",
    name: "Page header",
    blurb: "A section title, a view switch, and the one action.",
    build: () => [
      node("Stack", { gap: "6" }, {
        children: [
          // The title block and the controls are two groups (gap 5); the controls among
          // themselves are one (gap 3).
          node("Flex", { gap: "5", align: "center", justify: "space-between" }, {
            children: [
              node("Stack", { gap: "1" }, {
                children: [
                  node("Heading", { size: SECTION }, { text: "Projects" }),
                  node("Text", { size: BODY, emphasis: "medium" }, { text: "12 active, 3 archived" }),
                ],
              }),
              node("Flex", { gap: "3", align: "center" }, {
                children: [
                  node("SegmentedControl", { defaultValue: "grid", "aria-label": "View" }, {
                    children: [
                      node("SegmentedItem", { value: "list" }, { text: "List" }),
                      node("SegmentedItem", { value: "grid" }, { text: "Grid" }),
                    ],
                  }),
                  node("Button", { emphasis: "loud" }, { text: "New project" }),
                ],
              }),
            ],
          }),
          node("Grid", { columns: "repeat(3, minmax(0, 1fr))", gap: "4" }, {
            children: [1, 2, 3].map((n) =>
              node("Card", { size: "2" }, {
                children: [
                  node("Stack", { gap: "2" }, {
                    children: [
                      node("Text", { size: "3", weight: "medium" }, { text: `Project ${n}` }),
                      node("Text", { size: BODY, emphasis: "medium" }, { text: "Updated this morning" }),
                    ],
                  }),
                ],
              }),
            ),
          }),
        ],
      }),
    ],
  },
  {
    id: "form",
    name: "Form with actions",
    blurb: "Grouped fields, a note that carries a consequence, and a save row.",
    build: () => [
      node("Card", { size: "3" }, {
        children: [
          node("Stack", { gap: "6" }, {
            children: [
              node("Stack", { gap: "2" }, {
                children: [
                  node("Heading", { size: TITLE }, { text: "Project details" }),
                  node("Text", { size: BODY, emphasis: "medium" }, { text: "Everyone with access sees these." }),
                ],
              }),
              node("Stack", { gap: "4" }, {
                children: [
                  field("Name", "Orbital"),
                  node("Stack", { gap: "2" }, {
                    children: [
                      node("Text", { size: BODY, weight: "medium" }, { text: "Description" }),
                      node("TextArea", { rows: 3, "aria-label": "Description", placeholder: "What is it for?" }),
                    ],
                  }),
                  node("Flex", { gap: "3", align: "center" }, {
                    children: [
                      node("Checkbox", { "aria-label": "Archive when idle" }),
                      node("Text", { size: BODY }, { text: "Archive after 90 days without activity" }),
                    ],
                  }),
                ],
              }),
              node("Flex", { gap: "3", justify: "flex-end" }, {
                children: [
                  node("Button", { emphasis: "quiet", bordered: true }, { text: "Cancel" }),
                  node("Button", { emphasis: "loud" }, { text: "Save changes" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  },
];

/** A template as a document. Ids are the STABLE set for the same reason the starter's are:
    a template can be built during render, where the module counter is not safe. */
export const templateDoc = (template: Template): BuilderDoc => ({
  theme: defaultDocTheme(),
  // A template's blocks are the canvas's CHILDREN — the template describes a screen, and the
  // screen sits in the canvas like everything else.
  roots: withStableIds([canvasNode(template.build())], `t-${template.id}-`),
});
