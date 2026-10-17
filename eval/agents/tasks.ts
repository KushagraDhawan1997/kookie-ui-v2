/**
 * The eight tasks. Each prompt is written the way a product person would ask: it says what the
 * screen does and never names a Kookie component or prop. The rubric checks are what the shipped
 * docs say that screen should be built with.
 */

/** Checks every task is scored on. */
export const UNIVERSAL_CHECKS = ["one-loud-per-screen", "group-gap-steps", "no-card-in-card"] as const;

export type Task = {
  id: string;
  title: string;
  prompt: string;
  /** Rubric checks for this task, on top of the universal ones. */
  checks: string[];
};

export const TASKS: Task[] = [
  {
    id: "01-settings",
    title: "Settings form",
    prompt:
      "Build an account settings screen. A person can change their name and their email address, and turn email notifications on or off. One button saves all of it.",
    checks: ["field-labels", "checkbox-for-submitted-setting", "main-button-says-action"],
  },
  {
    id: "02-delete",
    title: "Delete project with confirm",
    prompt:
      "Build a project settings screen that includes a way to delete the project. Deleting is permanent and removes all of the project's files, so the person must confirm before it happens.",
    checks: ["alert-for-irreversible", "alert-parts-direct", "alert-cancel-first", "alert-tone-on-action", "alert-labels-not-ok"],
  },
  {
    id: "03-shell",
    title: "App shell",
    prompt:
      "Build the frame of a small web app: a navigation column on the side, a header row at the top, and two pages called Overview and Projects. Each page shows its title. Choosing a page in the navigation shows that page and makes it clear which page is open.",
    checks: ["shell-once", "pages-in-shell-content", "page-per-screen", "nav-marks-current"],
  },
  {
    id: "04-list-states",
    title: "Project list with empty and error states",
    prompt:
      "Build a screen that lists the person's projects, loaded from a slow server. Fake the server with a timer. Besides the loaded list, the screen must handle three cases: while the list is loading, when there are no projects yet, and when loading fails. Put a constant at the top of the file that picks what the fake server returns (projects, an empty list, or an error) so each case can be seen.",
    checks: ["spinner-while-loading", "tone-by-meaning"],
  },
  {
    id: "05-async-save",
    title: "Async save",
    prompt:
      "Build a screen where a person edits a project's description and saves it. Saving takes about two seconds and sometimes fails; fake it with a timer. While it saves, show that it is working. When it finishes, tell the person whether it worked.",
    checks: ["busy-button-loading", "busy-button-keeps-label", "outcome-beside-action", "tone-by-meaning"],
  },
  {
    id: "06-responsive-cards",
    title: "Responsive card list",
    prompt:
      "Build a screen that shows a team's projects as cards. Each card shows the project's name, its owner, when it was last updated and its status. On a narrow screen the cards sit in one column; with more room they form a grid.",
    checks: ["grid-for-cards", "grid-columns-responsive"],
  },
  {
    id: "07-invite",
    title: "Invite teammates dialog",
    prompt:
      "Build a team members screen with an Invite teammates button. The button opens a panel over the page where the person types an email address, picks a role (Member or Admin), and sends the invite, or backs out without sending.",
    checks: ["field-labels", "form-panel-not-alert", "dialog-has-title", "dialog-has-close", "main-button-says-action"],
  },
  {
    id: "08-view-switch",
    title: "Switch between views of one list",
    prompt:
      "Build a screen with a list of files. Let the person switch how the same files are shown: as a list of rows, or as a grid of tiles.",
    checks: ["segmented-for-layout", "segmented-named"],
  },
];

export const checksFor = (task: Task): string[] => [...UNIVERSAL_CHECKS, ...task.checks];

/**
 * The prompt every run gets. Identical across arms: what an arm changes is what the app
 * folder holds, never what the agent is told.
 */
export function promptFor(task: Task): string {
  return [
    "You are working in a Vite + React 19 + TypeScript app (strict mode). Its UI library is @kushagradhawan/kookie-ui-react, which is already installed and set up: src/main.tsx imports the stylesheet and wraps the app in the library's theme.",
    "",
    `Task: ${task.prompt}`,
    "",
    "Rules for this job:",
    "- Build the screen with @kushagradhawan/kookie-ui-react. Do not add other UI libraries, CSS frameworks or packages.",
    "- @hugeicons/react and @hugeicons/core-free-icons are installed if you want icons.",
    "- Put your code in src/. src/App.tsx must render the screen.",
    "- Fake any data or network call with local state and timers.",
    "- When you are done, run `npx tsc --noEmit` and fix every error it reports.",
  ].join("\n");
}
