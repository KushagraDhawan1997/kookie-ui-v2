"use client";

/**
 * The examples a page can DRIVE, as client modules (2026-08-30).
 *
 * A control lives in the browser and the specimen it moves has to be re-rendered there, so the
 * component must be in the client bundle. The server cannot hand one over: a function does not
 * cross the RSC boundary, which is exactly the error the first spelling produced.
 *
 * EVERY CONTROLLABLE PAGE IS HERE, AND THEY ARE SPLIT (2026-08-31, Kushagra: "add configurator
 * to all component specimens"). This table held six static imports and its own comment gave the
 * reason — "importing all forty would put every example in the bundle of every component page"
 * — so growing it to thirty-seven would have made that comment describe the defect it was
 * written to prevent. `next/dynamic` is the answer rather than the trade: the map still names
 * every example, and the bundler splits each into its own chunk, so a page ships the one it
 * renders. `ssr` is left on, which is the half that matters here — the specimen is still
 * server-rendered, so there is no fallback frame and no flash before hydration.
 *
 * The pairing with `controls.ts`'s `OFFERED` is checked by a law: a slug that offers controls
 * and is missing here would render a page whose knobs move nothing.
 */
import dynamic from "next/dynamic";

const Accordion = dynamic(() => import("../../examples/accordion"));
const AlertDialog = dynamic(() => import("../../examples/alert-dialog"));
const Avatar = dynamic(() => import("../../examples/avatar"));
const AvatarGroup = dynamic(() => import("../../examples/avatar-group"));
const Badge = dynamic(() => import("../../examples/badge"));
const Blockquote = dynamic(() => import("../../examples/blockquote"));
const Box = dynamic(() => import("../../examples/box"));
const Breadcrumb = dynamic(() => import("../../examples/breadcrumb"));
const Button = dynamic(() => import("../../examples/button"));
const Card = dynamic(() => import("../../examples/card"));
const Checkbox = dynamic(() => import("../../examples/checkbox"));
const Chip = dynamic(() => import("../../examples/chip"));
const Code = dynamic(() => import("../../examples/code"));
const Dialog = dynamic(() => import("../../examples/dialog"));
const Field = dynamic(() => import("../../examples/field"));
const Flex = dynamic(() => import("../../examples/flex"));
const Grid = dynamic(() => import("../../examples/grid"));
const Heading = dynamic(() => import("../../examples/heading"));
const Kbd = dynamic(() => import("../../examples/kbd"));
const Link = dynamic(() => import("../../examples/link"));
const Menu = dynamic(() => import("../../examples/menu"));
const Notice = dynamic(() => import("../../examples/notice"));
const Popover = dynamic(() => import("../../examples/popover"));
const Radio = dynamic(() => import("../../examples/radio"));
const RadioGroup = dynamic(() => import("../../examples/radio-group"));
const Row = dynamic(() => import("../../examples/row"));
const Select = dynamic(() => import("../../examples/select"));
const Slider = dynamic(() => import("../../examples/slider"));
const SegmentedControl = dynamic(() => import("../../examples/segmented-control"));
const Stack = dynamic(() => import("../../examples/stack"));
const Surface = dynamic(() => import("../../examples/surface"));
const Switch = dynamic(() => import("../../examples/switch"));
const Table = dynamic(() => import("../../examples/table"));
const Tabs = dynamic(() => import("../../examples/tabs"));
const Text = dynamic(() => import("../../examples/text"));
const TextArea = dynamic(() => import("../../examples/text-area"));
const TextField = dynamic(() => import("../../examples/text-field"));
const Toggle = dynamic(() => import("../../examples/toggle"));

/* eslint-disable @typescript-eslint/no-explicit-any -- each example declares its own props, and
   the point of this table is that they differ; the values a control produces are validated
   against the catalog's schema before they reach one. */
export const CONTROLLED: Record<string, React.ComponentType<any>> = {
  "accordion": Accordion,
  "alert-dialog": AlertDialog,
  "avatar": Avatar,
  "avatar-group": AvatarGroup,
  "badge": Badge,
  "blockquote": Blockquote,
  "box": Box,
  "breadcrumb": Breadcrumb,
  "button": Button,
  "card": Card,
  "checkbox": Checkbox,
  "chip": Chip,
  "code": Code,
  "dialog": Dialog,
  "field": Field,
  "flex": Flex,
  "grid": Grid,
  "heading": Heading,
  "kbd": Kbd,
  "link": Link,
  "menu": Menu,
  "notice": Notice,
  "popover": Popover,
  "radio": Radio,
  "radio-group": RadioGroup,
  "row": Row,
  "select": Select,
  "slider": Slider,
  "segmented-control": SegmentedControl,
  "stack": Stack,
  "surface": Surface,
  "switch": Switch,
  "table": Table,
  "tabs": Tabs,
  "text": Text,
  "text-area": TextArea,
  "text-field": TextField,
  "toggle": Toggle,
};
