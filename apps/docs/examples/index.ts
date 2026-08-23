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
import BadgeExample from "./badge";
import BlockquoteExample from "./blockquote";
import BoxExample from "./box";
import ButtonExample from "./button";
import CardExample from "./card";
import CheckboxExample from "./checkbox";
import CodeExample from "./code";
import DialogExample from "./dialog";
import FieldExample from "./field";
import FlexExample from "./flex";
import GridExample from "./grid";
import HeadingExample from "./heading";
import KbdExample from "./kbd";
import LinkExample from "./link";
import MenuExample from "./menu";
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
import TabsExample from "./tabs";
import TextAreaExample from "./text-area";
import TextFieldExample from "./text-field";
import TextExample from "./text";
import TooltipExample from "./tooltip";
import ThemeExample from "./theme";

export const EXAMPLES: Record<string, React.ComponentType> = {
  "alert-dialog": AlertDialogExample,
  "badge": BadgeExample,
  "blockquote": BlockquoteExample,
  "box": BoxExample,
  "button": ButtonExample,
  "card": CardExample,
  "checkbox": CheckboxExample,
  "code": CodeExample,
  "dialog": DialogExample,
  "flex": FlexExample,
  "grid": GridExample,
  "heading": HeadingExample,
  "kbd": KbdExample,
  "link": LinkExample,
  "menu": MenuExample,
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
  "tabs": TabsExample,
  "text-area": TextAreaExample,
  "text-field": TextFieldExample,
  "text": TextExample,
  "tooltip": TooltipExample,
  "theme": ThemeExample,
};
