// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- the fixture is not a module this package compiles; see below.
// @ts-nocheck — DELIBERATELY WRONG, and not a module this package compiles.
//
// The vacuity guard for the plugin: a file whose only job is to be reported on. If a change to
// either rule stops both findings appearing here, the rules have gone quiet and the suite says
// so — a lint rule that fires on nothing is indistinguishable from a lint rule that is not
// wired up at all, which is the failure this repo keeps finding in other clothes.
//
// `@ts-nocheck` because it imports the package by its published name from INSIDE the package,
// which is the only specifier the rules key on. That name happens to resolve here through the
// package's own `exports` field, but only once `dist` exists — so without the suppression the
// fixture would typecheck or not depending on whether the build had run.
// Nothing imports this file: the law reads it as text and hands it to ESLint under a virtual
// filename, so it never enters the module graph or the build.
import { Card } from "@kookie-ui/react";

export function Wrong() {
  return (
    <Card className="p-4" data-tone="destructive">
      Both rules should fire on this element.
    </Card>
  );
}
