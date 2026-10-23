import * as React from "react";
import { createRoot } from "react-dom/client";
import { Theme } from "@kushagradhawan/kookie-ui-react";
import { TableScene } from "./scenes/table";
import { FormScene } from "./scenes/form";
import { MenuScene } from "./scenes/menu";
import { DialogsScene } from "./scenes/dialogs";
import { ShellScene } from "./scenes/shell";

const SCENES: Record<string, () => React.ReactElement> = {
  table: TableScene,
  form: FormScene,
  menu: MenuScene,
  dialogs: DialogsScene,
  shell: ShellScene,
  // The same frame on glass: every pane that floats takes the theme's material, so the
  // difference between this and `shell` is what blur, the lens and the filters cost.
  glass: ShellScene,
};

const name = new URLSearchParams(location.search).get("scene") ?? "table";
const Scene = SCENES[name];

createRoot(document.getElementById("root")!).render(
  <Theme material={name === "glass" ? "3" : "9"}>
    {Scene ? <Scene /> : <p>Unknown scene. Try one of: {Object.keys(SCENES).join(", ")}</p>}
  </Theme>,
);
