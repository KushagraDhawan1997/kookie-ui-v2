/**
 * The composition rubric. Deterministic, read off the TypeScript AST, no model judging.
 *
 * THE HARD RULE: every check enforces a sentence the shipped docs state, and carries that
 * sentence, its page under `packages/ui/agents/docs/` and the line it starts on. A check the
 * docs do not state is not a check. `test/citations.test.ts` re-reads every citation and fails
 * when the sentence has moved or changed, so a check cannot outlive the rule it enforces.
 *
 * A result is `pass`, `fail` or `na`. `na` means the check had nothing to judge (no alert in
 * the screen, so "the cancel button comes first" has no answer). It neither passes nor fails a
 * run. A check that should have had something to judge says so by failing a sibling check
 * instead: no AlertDialog fails `alert-for-irreversible`, and the alert's layout checks go `na`.
 */
import {
  allElements,
  attr,
  conditionsIn,
  descendants,
  directElements,
  elementsOf,
  has,
  isOn,
  normalizeCondition,
  where,
  type El,
  type Project,
  type VNode,
} from "./tree.ts";

export type Citation = {
  /** Path under `packages/ui/agents/docs/`. */
  page: string;
  /** 1-based line the sentence starts on. A wrapped sentence may run onto the next lines. */
  line: number;
  /** The sentence, verbatim. */
  quote: string;
};
export type Status = "pass" | "fail" | "na";
export type Result = { status: Status; notes: string[] };
export type Check = {
  id: string;
  title: string;
  cites: Citation[];
  run: (project: Project) => Result;
};

const pass = (notes: string[] = []): Result => ({ status: "pass", notes });
const fail = (notes: string[]): Result => ({ status: "fail", notes });
const na = (why: string): Result => ({ status: "na", notes: [why] });
const verdict = (problems: string[]): Result => (problems.length ? fail(problems) : pass());

// ---------------------------------------------------------------- shared facts

const LAYOUT = new Set(["Flex", "Stack", "Grid"]);
/** Controls that take `emphasis`. */
const EMPHASIS_CONTROLS = new Set(["Button", "SplitButton", "ToolbarButton", "AlertDialogAction", "ComposerSend"]);
/** composition.md:66 names the two that rest loud. */
const DEFAULT_LOUD = new Set(["AlertDialogAction", "ComposerSend"]);
/** composition.md:70-71: a dialog is a screen of its own. */
const SCREEN_OF_ITS_OWN = new Set(["DialogContent", "AlertDialogContent"]);
const DATA_TONES = new Set(["blue", "green", "orange", "amber"]);
const MEANING_TONES = new Set(["success", "warning", "info", "destructive"]);

function isLoud(el: El): boolean {
  if (!EMPHASIS_CONTROLS.has(el.tag)) return false;
  const emphasis = attr(el, "emphasis");
  if (!emphasis) return DEFAULT_LOUD.has(el.tag);
  return emphasis.strings.includes("loud");
}

function gapOf(el: El): number | undefined {
  const gap = attr(el, "gap");
  if (!gap) return undefined;
  const value = gap.kind === "string" ? gap.text : gap.object?.initial;
  return value && /^\d+$/.test(value) ? Number(value) : undefined;
}

function hasAncestor(ancestors: El[], ...tags: string[]): boolean {
  return ancestors.some((a) => tags.includes(a.tag));
}

/** Every `htmlFor` string in the project, for "point htmlFor at the control's id". */
function labelTargets(project: Project): Set<string> {
  const out = new Set<string>();
  for (const { el } of allElements(project)) {
    const target = attr(el, "htmlFor");
    if (target?.kind === "string" && target.text) out.add(target.text);
  }
  return out;
}

function idLinked(el: El, targets: Set<string>): boolean {
  const id = attr(el, "id");
  return id?.kind === "string" && !!id.text && targets.has(id.text);
}

/** Loud controls one screen can show at once. A choice shows one option; a repeat shows many. */
function loudOnScreen(nodes: VNode[], ownScreens: El[]): number {
  let total = 0;
  const panels: number[] = [];
  for (const node of nodes) {
    if (node.kind === "choice") {
      total += Math.max(0, ...node.options.map((option) => loudOnScreen(option, ownScreens)));
    } else if (node.kind === "repeat") {
      total += 2 * loudOnScreen(node.body, ownScreens);
    } else {
      if (SCREEN_OF_ITS_OWN.has(node.tag)) {
        ownScreens.push(node);
        continue;
      }
      const here = (isLoud(node) ? 1 : 0) + loudOnScreen([...node.children, ...node.attrChildren], ownScreens);
      if (node.tag === "TabsPanel") panels.push(here);
      else total += here;
    }
  }
  return total + (panels.length ? Math.max(...panels) : 0);
}

// ---------------------------------------------------------------- the checks

export const CHECKS: Check[] = [
  {
    id: "one-loud-per-screen",
    title: "At most one loud control on a screen",
    cites: [
      { page: "start/composition.md", line: 15, quote: "Give each screen one loud control, and make it the action the screen exists for." },
      { page: "start/composition.md", line: 70, quote: "Count loud controls across the whole screen, not inside the nearest card." },
      { page: "start/composition.md", line: 70, quote: "A dialog counts as a screen of its own, because it covers the page." },
      { page: "start/composition.md", line: 71, quote: "Two tab panels never compete either, because only one is visible at a time." },
      {
        page: "start/composition.md",
        line: 66,
        quote:
          "The two exceptions are `AlertDialogAction` and the send button in a `Composer`, which default to loud because each is the only action in its component.",
      },
    ],
    run(project) {
      const problems: string[] = [];
      const queue: El[] = [];
      const seen = new Set<string>();
      project.roots.forEach((root, index) => {
        const count = loudOnScreen(root, queue);
        if (count > 1) problems.push(`root ${index + 1}: ${count} loud controls can show at once`);
      });
      while (queue.length) {
        const screen = queue.shift()!;
        if (seen.has(screen.key)) continue;
        seen.add(screen.key);
        const count = loudOnScreen([...screen.children, ...screen.attrChildren], queue);
        if (count > 1) problems.push(`${where(screen)}: ${count} loud controls in one dialog`);
      }
      return verdict(problems);
    },
  },
  {
    id: "group-gap-steps",
    title: "The gap inside a group is at least two steps smaller than the gap around it",
    cites: [
      { page: "start/composition.md", line: 81, quote: "Make the gap inside a group at least two steps smaller than the gap around it." },
      {
        page: "start/composition.md",
        line: 136,
        quote: "Two levels that both separate groups can sit one step apart: a section at gap 6 can hold groups at gap 5.",
      },
    ],
    run(project) {
      const problems = new Map<string, string>();
      for (const { el: outer } of allElements(project)) {
        if (!LAYOUT.has(outer.tag)) continue;
        const around = gapOf(outer);
        if (around === undefined) continue;
        for (const inner of directElements(outer.children)) {
          if (!LAYOUT.has(inner.tag)) continue;
          const inside = gapOf(inner);
          if (inside === undefined) continue;
          const separatesGroups = directElements(inner.children).some((c) => LAYOUT.has(c.tag) && gapOf(c) !== undefined);
          const need = separatesGroups ? 1 : 2;
          if (around - inside < need) {
            problems.set(
              `${outer.key}>${inner.key}`,
              `${where(inner)} gap ${inside} inside ${where(outer)} gap ${around}: needs ${need} step${need > 1 ? "s" : ""} smaller`,
            );
          }
        }
      }
      return verdict([...problems.values()]);
    },
  },
  {
    id: "no-card-in-card",
    title: "No Card inside another Card",
    cites: [{ page: "components/card.md", line: 17, quote: "Don't put a card inside another card, and a development build warns you if you do." }],
    run(project) {
      const problems = new Map<string, string>();
      for (const { el, ancestors } of allElements(project)) {
        if (el.tag === "Card" && hasAncestor(ancestors, "Card")) problems.set(el.key, `${where(el)} is inside a Card`);
      }
      return verdict([...problems.values()]);
    },
  },
  {
    id: "field-labels",
    title: "Every form control is labelled through a Field",
    cites: [
      { page: "patterns/forms.md", line: 9, quote: "Wrap each control and its label in a `Field`." },
      { page: "patterns/forms.md", line: 26, quote: "Outside a `Field`, point `htmlFor` at the control's `id`." },
      { page: "patterns/forms.md", line: 31, quote: "For checkboxes and radios, wrap each option in a `FieldItem`." },
      {
        page: "components/switch.md",
        line: 18,
        quote: "Inside a `Field`, put the Switch in a `FieldItem` with a `FieldLabel` and `FieldDescription`, and they are connected for you.",
      },
    ],
    run(project) {
      const targets = labelTargets(project);
      const problems = new Map<string, string>();
      let seen = 0;
      for (const { el, ancestors } of allElements(project)) {
        if (["TextField", "TextArea", "NumberField", "Select", "Combobox", "RadioGroup"].includes(el.tag)) {
          seen++;
          if (!hasAncestor(ancestors, "Field") && !idLinked(el, targets)) problems.set(el.key, `${where(el)} has no Field and no htmlFor`);
        } else if (["Checkbox", "Radio", "Switch"].includes(el.tag)) {
          seen++;
          if (!hasAncestor(ancestors, "FieldItem") && !idLinked(el, targets)) {
            problems.set(el.key, `${where(el)} has no FieldItem and no htmlFor`);
          }
        }
      }
      if (!seen) return na("no form controls");
      return verdict([...problems.values()]);
    },
  },
  {
    id: "checkbox-for-submitted-setting",
    title: "A setting saved by a button is a Checkbox, not a Switch",
    cites: [{ page: "components/switch.md", line: 14, quote: "When the choice waits until a form is submitted, use a `Checkbox` instead." }],
    run(project) {
      const switches = elementsOf(project, "Switch");
      if (switches.length) return fail(switches.map((el) => `${where(el)}: the form has a save button, so this waits for a submit`));
      if (!elementsOf(project, "Checkbox").length) return fail(["no Checkbox for the notification setting"]);
      return pass();
    },
  },
  {
    id: "main-button-says-action",
    title: 'The main button says what it does, not "Submit"',
    cites: [{ page: "patterns/forms.md", line: 85, quote: 'Label the main button with what it does: "Create project", not "Submit".' }],
    run(project) {
      const loud = elementsOf(project, "Button", "SplitButton", "ToolbarButton").filter(isLoud);
      if (!loud.length) return na("no loud button");
      return verdict(loud.filter((el) => /^\s*(submit|ok)\s*$/i.test(el.text)).map((el) => `${where(el)} is labelled "${el.text}"`));
    },
  },
  {
    id: "alert-for-irreversible",
    title: "A permanent action asks first with an AlertDialog",
    cites: [
      { page: "components/alert-dialog.md", line: 25, quote: "Use an alert dialog before an action that is hard to undo." },
      { page: "components/dialog.md", line: 22, quote: "To ask a yes-or-no question before a risky action, use `AlertDialog`." },
      { page: "patterns/modality.md", line: 31, quote: "Ask a person to confirm only an action that can't be undone." },
    ],
    run(project) {
      if (!elementsOf(project, "AlertDialog").length) return fail(["no AlertDialog"]);
      if (!elementsOf(project, "AlertDialogAction").length) return fail(["the AlertDialog has no AlertDialogAction"]);
      return pass();
    },
  },
  {
    id: "alert-parts-direct",
    title: "The alert's four parts sit directly inside AlertDialogContent",
    cites: [
      {
        page: "patterns/modality.md",
        line: 70,
        quote: "An alert has four parts in this order: a title, a description, a cancel button and an action button.",
      },
      { page: "patterns/modality.md", line: 71, quote: "Put them directly inside `AlertDialogContent`, and the component lays them out." },
    ],
    run(project) {
      const contents = elementsOf(project, "AlertDialogContent");
      if (!contents.length) return na("no AlertDialogContent");
      const parts = ["AlertDialogTitle", "AlertDialogDescription", "AlertDialogCancel", "AlertDialogAction"];
      const problems: string[] = [];
      for (const content of contents) {
        const direct = directElements(content.children);
        for (const part of parts) {
          if (!direct.some((el) => el.tag === part)) problems.push(`${where(content)}: ${part} is not a direct child`);
        }
        for (const el of direct) {
          if (!parts.includes(el.tag)) problems.push(`${where(el)} wraps or adds to the alert's parts`);
        }
      }
      return verdict(problems);
    },
  },
  {
    id: "alert-cancel-first",
    title: "The alert's cancel button comes before its action",
    cites: [{ page: "patterns/modality.md", line: 100, quote: "Write the cancel button first." }],
    run(project) {
      const contents = elementsOf(project, "AlertDialogContent");
      const problems: string[] = [];
      let judged = 0;
      for (const content of contents) {
        const order = descendants(content).map((el) => el.tag);
        const cancel = order.indexOf("AlertDialogCancel");
        const action = order.indexOf("AlertDialogAction");
        if (cancel < 0 || action < 0) continue;
        judged++;
        if (cancel > action) problems.push(`${where(content)}: the action is written before the cancel button`);
      }
      if (!judged) return na("no alert with both buttons");
      return verdict(problems);
    },
  },
  {
    id: "alert-tone-on-action",
    title: "A delete action carries tone destructive, and the panel carries no tone",
    cites: [
      {
        page: "components/button.md",
        line: 19,
        quote:
          "Use `tone` for meaning rather than for a colour you like: `destructive` for an action that deletes or removes, `accent` for your brand's main action, and `success` for an action that approves.",
      },
      { page: "patterns/modality.md", line: 102, quote: "Put the tone on the action button, never on the panel." },
    ],
    run(project) {
      const actions = elementsOf(project, "AlertDialogAction");
      if (!actions.length) return na("no AlertDialogAction");
      const problems: string[] = [];
      for (const el of actions) {
        if (!attr(el, "tone")?.strings.includes("destructive")) problems.push(`${where(el)} has no tone="destructive"`);
      }
      for (const el of elementsOf(project, "AlertDialog", "AlertDialogContent")) {
        if (has(el, "tone")) problems.push(`${where(el)} puts a tone on the panel`);
      }
      return verdict(problems);
    },
  },
  {
    id: "alert-labels-not-ok",
    title: 'The alert\'s buttons say what will happen, not "OK"',
    cites: [{ page: "patterns/modality.md", line: 101, quote: 'Label both buttons with what will happen: "Delete project", not "OK".' }],
    run(project) {
      const buttons = elementsOf(project, "AlertDialogAction", "AlertDialogCancel");
      if (!buttons.length) return na("no alert buttons");
      return verdict(buttons.filter((el) => /^\s*ok\s*$/i.test(el.text)).map((el) => `${where(el)} is labelled "${el.text}"`));
    },
  },
  {
    id: "shell-once",
    title: "One Shell holds the app frame",
    cites: [
      {
        page: "components/shell.md",
        line: 34,
        quote:
          "Use a Shell once, at the root of an app, to hold its frame: a full-width header, a narrow rail of icons, a sidebar, the main content, an inspector and a bottom pane.",
      },
    ],
    run(project) {
      const shells = elementsOf(project, "Shell");
      if (shells.length === 1) return pass();
      return fail([shells.length ? `${shells.length} Shell elements` : "no Shell"]);
    },
  },
  {
    id: "pages-in-shell-content",
    title: "The pages sit inside ShellContent",
    cites: [{ page: "components/shell.md", line: 34, quote: "Include only the panes you need, and put your pages inside `ShellContent`." }],
    run(project) {
      if (!elementsOf(project, "ShellContent").length) return fail(["no ShellContent"]);
      const problems = new Map<string, string>();
      for (const { el, ancestors } of allElements(project)) {
        if (el.tag !== "Page") continue;
        if (hasAncestor(ancestors, "Shell") && !hasAncestor(ancestors, "ShellContent")) {
          problems.set(el.key, `${where(el)} is in the Shell but not in ShellContent`);
        }
      }
      return verdict([...problems.values()]);
    },
  },
  {
    id: "page-per-screen",
    title: "Each screen a person moves to is a Page",
    cites: [{ page: "components/page.md", line: 15, quote: "Use a Page for each screen someone moves to, such as a settings page or a report." }],
    run(project) {
      const pages = elementsOf(project, "Page");
      if (pages.length >= 2) return pass();
      if (pages.some((el) => attr(el, "title")?.kind === "expr")) return pass(["one Page with a title chosen per screen"]);
      return fail([pages.length ? "one Page for two screens" : "no Page"]);
    },
  },
  {
    id: "nav-marks-current",
    title: "The navigation marks the open page with current",
    cites: [{ page: "patterns/navigation.md", line: 238, quote: "Set `current` on the `ShellNavItem` or `ShellRailItem` for the open page." }],
    run(project) {
      const items = elementsOf(project, "ShellNavItem", "ShellRailItem");
      if (items.some((el) => has(el, "current"))) return pass();
      if (elementsOf(project, "NavTree").some((el) => has(el, "currentId"))) return pass(["NavTree currentId"]);
      return fail([items.length ? "no nav item sets current" : "no ShellNavItem or ShellRailItem"]);
    },
  },
  {
    id: "spinner-while-loading",
    title: "An area with nothing to show yet shows a Spinner",
    cites: [{ page: "patterns/feedback.md", line: 46, quote: "Use a standalone `Spinner` for an area that has nothing to show yet." }],
    run(project) {
      return elementsOf(project, "Spinner").length ? pass() : fail(["no Spinner"]);
    },
  },
  {
    id: "tone-by-meaning",
    title: "A status message takes a meaning tone, not a colour",
    cites: [
      { page: "patterns/feedback.md", line: 161, quote: "Choose the tone by its meaning: write `success`, not `green`." },
      {
        page: "start/composition.md",
        line: 191,
        quote: "`blue`, `green`, `orange` and `amber` are for colour as data, such as a chart series or a category.",
      },
    ],
    run(project) {
      const problems: string[] = [];
      for (const el of elementsOf(project, "Text", "Notice")) {
        const colours = (attr(el, "tone")?.strings ?? []).filter((tone) => DATA_TONES.has(tone));
        if (colours.length) problems.push(`${where(el)} tone ${colours.join("/")}`);
      }
      return verdict(problems);
    },
  },
  {
    id: "busy-button-loading",
    title: "The button that started the work shows loading",
    cites: [{ page: "patterns/feedback.md", line: 22, quote: "Set `loading` on a `Button` while its action runs." }],
    run(project) {
      return elementsOf(project, "Button").some((el) => isOn(el, "loading")) ? pass() : fail(["no Button sets loading"]);
    },
  },
  {
    id: "busy-button-keeps-label",
    title: "A busy button keeps its label",
    cites: [
      { page: "patterns/feedback.md", line: 20, quote: "Keep the label on a busy button" },
      {
        page: "components/spinner.md",
        line: 15,
        quote:
          "When the wait belongs to an action, use the `loading` prop on `Button`, because the button then marks itself as busy and keeps its label.",
      },
    ],
    run(project) {
      const busy = elementsOf(project, "Button").filter((el) => isOn(el, "loading"));
      if (!busy.length) return na("no Button sets loading");
      const problems: string[] = [];
      for (const el of busy) {
        const loading = attr(el, "loading");
        const flag = loading?.kind === "expr" && loading.expr ? normalizeCondition(loading.expr.getText()) : null;
        if (flag && el.childExprs.some((expr) => conditionsIn(expr).includes(flag))) {
          problems.push(`${where(el)} swaps its label on ${flag}`);
        }
        if (descendants(el).some((child) => child.tag === "Spinner")) problems.push(`${where(el)} holds its own Spinner`);
      }
      return verdict(problems);
    },
  },
  {
    id: "outcome-beside-action",
    title: "The outcome shows where the action happened",
    cites: [
      { page: "patterns/feedback.md", line: 113, quote: "Put the outcome where the action happened" },
      { page: "patterns/feedback.md", line: 115, quote: "Put a `Text` in the matching tone beside it." },
      { page: "patterns/feedback.md", line: 117, quote: "For an action with no other visible result, such as copy, set `done`." },
    ],
    run(project) {
      const busy = allElements(project).filter(({ el }) => el.tag === "Button" && isOn(el, "loading"));
      if (!busy.length) return na("no Button sets loading");
      const seen = new Set<string>();
      const problems: string[] = [];
      for (const { el, ancestors } of busy) {
        if (seen.has(el.key)) continue;
        seen.add(el.key);
        if (isOn(el, "done")) continue;
        // "Beside it": the button's own row, or the group that holds that row.
        const near = ancestors.slice(-2);
        const toned = near.some((holder) =>
          descendants(holder).some(
            (child) => child !== el && child.tag === "Text" && (attr(child, "tone")?.strings ?? []).some((t) => MEANING_TONES.has(t)),
          ),
        );
        if (!toned) problems.push(`${where(el)}: no toned Text beside it and no done`);
      }
      return verdict(problems);
    },
  },
  {
    id: "grid-for-cards",
    title: "A set of cards sits in a Grid",
    cites: [
      {
        page: "components/grid.md",
        line: 15,
        quote: "Use a Grid when children must line up in two directions, such as a set of cards or a form with two columns.",
      },
    ],
    run(project) {
      const grids = elementsOf(project, "Grid").filter((el) => descendants(el).some((child) => child.tag === "Card"));
      return grids.length ? pass() : fail(["no Grid holds the cards"]);
    },
  },
  {
    id: "grid-columns-responsive",
    title: "The card grid's columns change by breakpoint",
    cites: [
      { page: "components/grid.md", line: 21, quote: "Most props accept either one value or a value for each breakpoint: `{ initial, sm, md, lg }`." },
      {
        page: "components/grid.md",
        line: 27,
        quote: "For any other layout, write the CSS template in `columns`, such as `repeat(auto-fill, minmax(12rem, 1fr))`.",
      },
    ],
    run(project) {
      const grids = elementsOf(project, "Grid").filter((el) => descendants(el).some((child) => child.tag === "Card"));
      if (!grids.length) return na("no card grid");
      const responsive = grids.some((el) => {
        const columns = attr(el, "columns");
        if (!columns) return false;
        if (columns.object) return Object.keys(columns.object).filter((k) => ["initial", "sm", "md", "lg"].includes(k)).length >= 2;
        return columns.strings.some((s) => /auto-(fill|fit)/.test(s));
      });
      return responsive ? pass() : fail(["the card grid has one column count at every width"]);
    },
  },
  {
    id: "form-panel-not-alert",
    title: "A panel that holds a field is not an AlertDialog",
    cites: [
      {
        page: "patterns/modality.md",
        line: 65,
        quote: "If the panel needs any control besides its two buttons, such as a type-to-confirm field or a checkbox, use a `Dialog`.",
      },
    ],
    run(project) {
      const fields = allElements(project).filter(({ el }) => ["TextField", "TextArea", "Select", "Combobox", "Checkbox"].includes(el.tag));
      if (!fields.length) return fail(["no field for the email address"]);
      const inAlert = fields.filter(({ ancestors }) => hasAncestor(ancestors, "AlertDialogContent"));
      return verdict([...new Set(inAlert.map(({ el }) => `${where(el)} is inside an AlertDialog`))]);
    },
  },
  {
    id: "dialog-has-title",
    title: "Every dialog has a DialogTitle",
    cites: [
      {
        page: "components/dialog.md",
        line: 32,
        quote: "A screen reader announces the dialog by its `DialogTitle` and reads the `DialogDescription` with it, so always include a title.",
      },
    ],
    run(project) {
      const contents = elementsOf(project, "DialogContent");
      if (!contents.length) return na("no DialogContent");
      return verdict(
        contents.filter((el) => !descendants(el).some((child) => child.tag === "DialogTitle")).map((el) => `${where(el)} has no DialogTitle`),
      );
    },
  },
  {
    id: "dialog-has-close",
    title: "Every dialog has a DialogClose",
    cites: [
      {
        page: "patterns/modality.md",
        line: 117,
        quote:
          "Put a `DialogClose` in every dialog, usually in the row of actions, because a screen reader user on a touch screen needs a button to leave.",
      },
    ],
    run(project) {
      const contents = elementsOf(project, "DialogContent");
      if (!contents.length) return na("no DialogContent");
      return verdict(
        contents.filter((el) => !descendants(el).some((child) => child.tag === "DialogClose")).map((el) => `${where(el)} has no DialogClose`),
      );
    },
  },
  {
    id: "segmented-for-layout",
    title: "Switching how one list is shown is a SegmentedControl, not Tabs",
    cites: [
      {
        page: "patterns/navigation.md",
        line: 260,
        quote: "Use a `SegmentedControl` when the choice sets a value, such as a grid or a list layout, and the content stays where it is.",
      },
      {
        page: "components/tabs.md",
        line: 20,
        quote: "To choose a value that changes content in place, such as a list or grid view, use a `SegmentedControl`.",
      },
    ],
    run(project) {
      const tabs = elementsOf(project, "Tabs");
      if (tabs.length) return fail(tabs.map((el) => `${where(el)} switches the layout with Tabs`));
      return elementsOf(project, "SegmentedControl").length ? pass() : fail(["no SegmentedControl"]);
    },
  },
  {
    id: "segmented-named",
    title: "The SegmentedControl has an aria-label that names the setting",
    cites: [{ page: "components/segmented-control.md", line: 22, quote: "Give the control an `aria-label` that names the setting." }],
    run(project) {
      const controls = elementsOf(project, "SegmentedControl");
      if (!controls.length) return na("no SegmentedControl");
      return verdict(
        controls.filter((el) => !has(el, "aria-label") && !has(el, "aria-labelledby")).map((el) => `${where(el)} has no aria-label`),
      );
    },
  },
];

export const CHECK_BY_ID = new Map(CHECKS.map((check) => [check.id, check]));

/** Run named checks on a project. */
export function runChecks(project: Project, ids: readonly string[]): Record<string, Result> {
  const out: Record<string, Result> = {};
  for (const id of ids) {
    const check = CHECK_BY_ID.get(id);
    if (!check) throw new Error(`unknown check ${id}`);
    out[id] = check.run(project);
  }
  return out;
}
