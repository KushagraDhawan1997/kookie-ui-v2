/**
 * The root README states two counts, and the counts have a home elsewhere (2026-08-21).
 *
 * "21 guideline chapters" and "the reference for 31 components" are facts owned by
 * `chapters.ts` and `components/registry.ts`. A README is the one file in a repository that
 * nobody re-reads while working, so a number copied into it goes stale silently and stays
 * that way: the README this replaced still said the build order was "complete through step 6"
 * seventeen days and twenty-five components after that stopped being true.
 *
 * The alternative was to write no number, and it is worse. "Some chapters" tells a reader
 * nothing about whether this is a scaffold or a document. So the number stays and it is
 * checked against the registry it describes.
 *
 * WHAT THIS LAW IS, HONESTLY. It reads source, which this repo rates below reading a computed
 * value, and rightly. There is nothing to compute here: the claim is a number in prose against
 * a number in an array, and both sides are read rather than reconstructed. The vacuity guard
 * matters more than usual, because a regex that stops matching would otherwise assert nothing
 * at all, which is the failure mode this whole file exists to prevent one file over.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { CHAPTERS } from "./chapters";
import { ENTRIES } from "./components/registry";

const here = fileURLToPath(new URL(".", import.meta.url));
const appRoot = join(here, "..");
const readme = readFileSync(join(here, "../../../../README.md"), "utf8");

describe("the root README's counts match the registries they describe", () => {
  it("found the README at all", () => {
    // Without this, a moved or renamed file would make every match below return null, and a
    // law whose subject is absent reports nothing rather than failing.
    expect(readme).toContain("# Kookie UI v2");
    expect(readme.length).toBeGreaterThan(1000);
  });

  it("states the number of chapters that exist", () => {
    const match = /(\d+) guideline chapters/.exec(readme);
    expect(match, "the README no longer states a chapter count").not.toBeNull();
    expect(Number(match![1])).toBe(CHAPTERS.length);
  });

  it("states the number of components the reference covers", () => {
    const match = /the reference for (\d+) components/.exec(readme);
    expect(match, "the README no longer states a component count").not.toBeNull();
    expect(Number(match![1])).toBe(ENTRIES.length);
  });

  it("names no route the app does not serve", () => {
    /**
     * The routes are read OUT of the README and then proved to exist, rather than compared
     * against a list written here. A list would be a third home for the same fact, and it
     * would agree with the README on the day a route was deleted from the app.
     *
     * Next route groups are parentheses in the path and nothing in the URL, so a route can
     * live at `app/<route>` or inside any group directory. Both are tried.
     */
    const routes = [...readme.matchAll(/`(\/[a-z-]*)`/g)].map((m) => m[1]!);
    expect(routes.length, "the README stopped naming any route").toBeGreaterThanOrEqual(4);

    const groups = readdirSync(appRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("("))
      .map((entry) => entry.name);

    const dead = routes.filter((route) => {
      const candidates = ["", ...groups].map((group) =>
        join(appRoot, group, route, "page.tsx"),
      );
      return !candidates.some((candidate) => existsSync(candidate));
    });
    expect(dead, "the README names a route with no page").toEqual([]);
  });
});
