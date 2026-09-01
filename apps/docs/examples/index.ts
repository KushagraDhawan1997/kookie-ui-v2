/**
 * The example registry — one entry per component page's live specimen.
 *
 * Each example is a REAL FILE that is consumed twice: imported here and rendered, and read
 * off disk and shown as source (`example.tsx`). That is the whole design. A docs site whose
 * snippets are strings written beside the thing they claim to show is a drift machine, and
 * this repo has spent most of its audits on exactly that shape — two homes for one fact. One
 * file cannot disagree with itself.
 *
 * It also means `tsc` type-checks every sample the site publishes. A snippet in a fence is
 * text nobody compiles; these are modules in the app's own program, so an example using a
 * prop that no longer exists fails `pnpm run lint` rather than misleading a reader. That is
 * the same mechanism that caught a documented prop which had never existed (2026-08-08).
 *
 * The file name IS the component's slug — convention rather than a mapping field, so there
 * is no third place for the pairing to go wrong. A law walks both directions.
 */
import type * as React from "react";

import AlertDialogExample from "./alert-dialog";
import AttachmentExample from "./attachment";
import CommandExample from "./command";
import AccordionExample from "./accordion";
import AvatarExample from "./avatar";
import AvatarGroupExample from "./avatar-group";
import BadgeExample from "./badge";
import ChipExample from "./chip";
import BlockquoteExample from "./blockquote";
import BoxExample from "./box";
import BreadcrumbExample from "./breadcrumb";
import ButtonExample from "./button";
import CardExample from "./card";
import CheckboxExample from "./checkbox";
import CodeExample from "./code";
import CodeBlockExample from "./code-block";
import ContextMenuExample from "./context-menu";
import DialogExample from "./dialog";
import FieldExample from "./field";
import FlexExample from "./flex";
import GridExample from "./grid";
import HeadingExample from "./heading";
import KbdExample from "./kbd";
import LinkExample from "./link";
import MenuExample from "./menu";
import ComposerExample from "./composer";
import NoticeExample from "./notice";
import PopoverExample from "./popover";
import ProgressExample from "./progress";
import RadioGroupExample from "./radio-group";
import RadioExample from "./radio";
import RowExample from "./row";
import ScrollAreaExample from "./scroll-area";
import SegmentedControlExample from "./segmented-control";
import SelectExample from "./select";
import SeparatorExample from "./separator";
import ShellExample from "./shell";
import SliderExample from "./slider";
import SpinnerExample from "./spinner";
import StackExample from "./stack";
import SurfaceExample from "./surface";
import SwitchExample from "./switch";
import TableExample from "./table";
import ToggleExample from "./toggle";
import TabsExample from "./tabs";
import TextAreaExample from "./text-area";
import TextFieldExample from "./text-field";
import TextExample from "./text";
import TooltipExample from "./tooltip";
import NavTreeExample from "./nav-tree";
import TreeExample from "./tree";
import ThemeExample from "./theme";

export const EXAMPLES: Record<string, React.ComponentType> = {
  "alert-dialog": AlertDialogExample,
  "accordion": AccordionExample,
  attachment: AttachmentExample,
  "avatar": AvatarExample,
  "avatar-group": AvatarGroupExample,
  "badge": BadgeExample,
  "chip": ChipExample,
  "blockquote": BlockquoteExample,
  "box": BoxExample,
  "breadcrumb": BreadcrumbExample,
  "button": ButtonExample,
  "card": CardExample,
  "checkbox": CheckboxExample,
  "code": CodeExample,
  command: CommandExample,
  "code-block": CodeBlockExample,
  "context-menu": ContextMenuExample,
  "dialog": DialogExample,
  "flex": FlexExample,
  "grid": GridExample,
  "heading": HeadingExample,
  "kbd": KbdExample,
  "link": LinkExample,
  "menu": MenuExample,
  "composer": ComposerExample,
  "notice": NoticeExample,
  "popover": PopoverExample,
  "progress": ProgressExample,
  "radio-group": RadioGroupExample,
  "radio": RadioExample,
  "row": RowExample,
  "scroll-area": ScrollAreaExample,
  "segmented-control": SegmentedControlExample,
  "select": SelectExample,
  "field": FieldExample,
  "separator": SeparatorExample,
  "shell": ShellExample,
  "slider": SliderExample,
  "spinner": SpinnerExample,
  "stack": StackExample,
  "surface": SurfaceExample,
  "switch": SwitchExample,
  "table": TableExample,
  "toggle": ToggleExample,
  "tabs": TabsExample,
  "text-area": TextAreaExample,
  "text-field": TextFieldExample,
  "text": TextExample,
  "tooltip": TooltipExample,
  "nav-tree": NavTreeExample,
  "tree": TreeExample,
  "theme": ThemeExample,
};
