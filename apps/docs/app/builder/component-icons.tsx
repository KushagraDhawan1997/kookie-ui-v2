/**
 * The Add tab's categories (2026-09-15, Kushagra: "a tree, just like Apple's HIG… icons are
 * needed for categories in add panel"). The categories follow the HIG's own grouping; a part
 * files under its parent. Only a category wears a glyph.
 */
import * as React from "react";

import {
  CompassIcon,
  FormIcon,
  LayerBoxIcon,
  LayerCardIcon,
  LayerFlexIcon,
  LayerGridIcon,
  LayerStackIcon,
  LayerSurfaceIcon,
  LayoutIcon,
  MenuIcon,
  NoticeIcon,
  TypeIcon,
  WindowIcon,
} from "../icons";
import { CATALOG } from "./catalog";

type Glyph = () => React.ReactElement;

export const CATEGORIES: { name: string; Icon: Glyph; types: string[] }[] = [
  {
    name: "Layout and organization",
    Icon: LayoutIcon,
    types: ["Stack", "Flex", "Grid", "Box", "Theme", "Separator", "Card", "Surface", "Table", "List", "Accordion", "Tabs"],
  },
  { name: "Text", Icon: TypeIcon, types: ["Text", "Heading", "Blockquote", "Code", "CodeBlock", "Link", "Kbd"] },
  { name: "Menus and actions", Icon: MenuIcon, types: ["Button", "Toggle", "ToggleGroup", "Menu", "Toolbar"] },
  { name: "Navigation", Icon: CompassIcon, types: ["Breadcrumb", "Row"] },
  {
    name: "Selection and input",
    Icon: FormIcon,
    types: ["Field", "TextField", "TextArea", "NumberField", "Checkbox", "Switch", "RadioGroup", "Slider", "SegmentedControl", "Select"],
  },
  { name: "Presentation", Icon: WindowIcon, types: ["Dialog", "Sheet", "AlertDialog", "Popover", "Tooltip"] },
  {
    name: "Status",
    Icon: NoticeIcon,
    types: ["Notice", "Badge", "Chip", "Avatar", "AvatarGroup", "Progress", "Spinner", "Attachment"],
  },
];

const CATEGORY_OF = new Map(CATEGORIES.flatMap((c) => c.types.map((t) => [t, c.name] as const)));

/** The category a type files under — a part files under its parent. */
export const categoryOf = (type: string): string => {
  const owner = CATALOG[type]?.partOf ?? type;
  return CATEGORY_OF.get(owner) ?? "Other";
};

const LAYER_ICONS: Record<string, Glyph> = {
  Stack: LayerStackIcon,
  Flex: LayerFlexIcon,
  Grid: LayerGridIcon,
  Box: LayerBoxIcon,
  Card: LayerCardIcon,
  Surface: LayerSurfaceIcon,
};

/** A Layers row's glyph: the layout and surface containers only. */
export const iconFor = (type: string): React.ReactNode => {
  const Icon = LAYER_ICONS[type];
  return Icon ? <Icon /> : null;
};
