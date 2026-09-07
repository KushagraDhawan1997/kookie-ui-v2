"use client";

import * as React from "react";

import type { Host } from "./webmcp-register";

/**
 * THE MOUNT (§47). Everything this file does happens after paint, or does not happen.
 *
 * `webmcp-register.ts` carries the state of the proposal and why this is an adaptor. What is
 * decided HERE is the cost: a reader of these pages gets one property read and nothing else.
 *
 * THE TOOLS ARE A DYNAMIC IMPORT, and that is the load-bearing line in the file. `agent-tools`
 * pulls the whole component registry, the generated API tables and the builder's catalog — the
 * three largest data modules on the site — and a static import would put every one of them in
 * the bundle of every page for a capability almost no visit uses. Behind `await import()` they
 * are a chunk that is fetched when a host exists and never otherwise.
 *
 * THE EFFECT IS THE WHOLE GUARD AGAINST RUNNING ON THE SERVER. There is no `typeof window`
 * check anywhere below, deliberately: an effect does not run during a server render, so the
 * check would be a second statement of a thing React already guarantees, and this repo has
 * spent several audits on exactly that shape.
 */

/**
 * The reference polyfill, and why it is a URL rather than an import.
 *
 * `@mcp-b/webmcp-polyfill` is the community runtime for this proposal — it installs
 * `document.modelContext` with the older `navigator.modelContext` beside it — and it is not a
 * dependency of this app. Adding one would put a third-party runtime in the lockfile of a
 * documentation site that refuses third-party UI, for a capability that is off by default; so
 * it is fetched, from its published ESM build, only when a reader has asked for it in the URL.
 *
 * IF IT BECOMES A DEPENDENCY this constant is deleted and the import below becomes a bare
 * specifier. Nothing else in this file changes.
 */
const POLYFILL = "https://cdn.jsdelivr.net/npm/@mcp-b/webmcp-polyfill/+esm";

/**
 * IT DOES NOT INSTALL ITSELF, and the first spelling here assumed it did.
 *
 * Importing the module and stopping was measured: the request came back 200 and
 * `document.modelContext` was still `undefined`, so the opt-in loaded a runtime and then
 * registered nothing. Its package declares `sideEffects` for the IIFE build ONLY — the ESM
 * entry is side-effect free on purpose and hands over `initializeWebMCPPolyfill` instead.
 *
 * The call is guarded rather than named directly because this is somebody else's package on a
 * proposal that is still moving: a build that goes back to installing on import satisfies the
 * first arm, and one that renames the initializer fails the way an absent polyfill already
 * fails — silently, with the notice never appearing.
 */
type Polyfill = { initializeWebMCPPolyfill?: () => void; cleanupWebMCPPolyfill?: () => void };

/** How a reader turns it on: `?webmcp=1` on any page. Nothing is remembered between loads —
    a capability that survives a reload is one a reader cannot get rid of by reloading. */
const OPT_IN = "webmcp";

export function WebMcp() {
  const [host, setHost] = React.useState<Host | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    let live = true;
    /** The polyfill's own teardown, if this page installed one. Ours to undo, nobody else's. */
    let cleanup: (() => void) | null = null;

    void (async () => {
      const scope: { document?: unknown; navigator?: unknown } = {
        document,
        navigator,
      };
      const asked = new URLSearchParams(window.location.search).get(OPT_IN);
      const optedIn = asked !== null && asked !== "0" && asked !== "false";

      // NATIVE FIRST, ALWAYS. A page that loaded the polyfill over a browser that already has
      // the API would be replacing an implementation with a stand-in for it.
      const native = document as { modelContext?: unknown };
      if (!native.modelContext && !(navigator as { modelContext?: unknown }).modelContext) {
        if (!optedIn) return;
        try {
          const module_: Polyfill = await import(
            /* @vite-ignore */ /* webpackIgnore: true */ POLYFILL
          );
          module_.initializeWebMCPPolyfill?.();
          cleanup = module_.cleanupWebMCPPolyfill ?? null;
        } catch {
          // The polyfill is a convenience and its absence is the ordinary case. Nothing a
          // reader can act on, so nothing is said — the notice below simply never appears.
          return;
        }
        // A polyfill that loaded and installed nothing is not a host — and nothing here needs
        // to say so. `registerTools` already answers "is there a surface" as the first thing
        // it does, and a guard here would be a second place that knows where a host lives.
        // It costs one chunk to find out, on a load the reader explicitly asked for.
      }

      const [{ buildTools }, { registerTools }] = await Promise.all([
        import("./agent-tools"),
        import("./webmcp-register"),
      ]);
      if (!live) return;

      const registered = await registerTools(
        scope,
        buildTools({
          /* The page fetching its own twin. Same origin, so no CORS and no configured base
             URL — this repo has no site URL anywhere, and the one place that needs an origin
             reads it off the request rather than from a constant (`llms.ts`). */
          fetchText: async (path) => {
            const response = await fetch(path, { signal: controller.signal });
            if (!response.ok) throw new Error(String(response.status));
            return response.text();
          },
          tokenNames,
          resolveToken,
        }),
        { signal: controller.signal },
      );
      if (live) setHost(registered);
    })();

    return () => {
      live = false;
      // The signal is what unregisters: the draft's own `registerTool(tool, { signal })` ties a
      // tool's lifetime to an AbortSignal, so a navigation takes the tools with it rather than
      // leaving a previous page's offer standing.
      controller.abort();
      // And the runtime goes with them, but only where this page is the one that installed it —
      // a native implementation is the browser's and has no teardown to call.
      cleanup?.();
    };
  }, []);

  if (!host) return null;

  /* ONE SENTENCE, IN THE FOOTER'S OWN VOICE. It is inside the footer's `note`, which is already
     a quiet `Text` — so this adds words and not a treatment, and a reader who does not care
     reads past it the way they read past a copyright line.

     IT ONLY EXISTS ONCE THE TOOLS DO. A line advertising a capability the browser does not
     have is the dead-control problem this repo has now found in three places: the builder's
     armed commands, the breadcrumb ellipsis that opened nothing, and a rail square with no
     panel behind it. So the component renders null until registration has actually returned. */
  return (
    <>
      {" "}
      This page offers {host.registered} tool{host.registered === 1 ? "" : "s"} to AI agents in
      your browser.
    </>
  );
}

/**
 * Every custom property the loaded stylesheets declare.
 *
 * READ FROM THE PAGE, which is the whole reason this surface can answer a token question at
 * all: the stylesheet in the document IS the emitted `tokens.css`, so the list cannot drift
 * from what the build generated and no snapshot of it exists to go stale. Cross-origin sheets
 * throw on `cssRules` and are skipped — the package's own is same-origin.
 */
function tokenNames(): string[] {
  const names = new Set<string>();
  const walk = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      const style = (rule as CSSStyleRule).style;
      if (style) {
        for (const property of Array.from(style)) {
          if (property.startsWith("--")) names.add(property);
        }
      }
      // Grouping rules — the appearance scopes, the contrast scopes, every media query — hold
      // most of what this system re-declares, so a walk that stopped at the top level would
      // miss every token that has a dark value.
      const nested = (rule as CSSGroupingRule).cssRules;
      if (nested) walk(nested);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules);
    } catch {
      // A cross-origin sheet. Nothing to read and nothing to report.
    }
  }
  // NOT SORTED HERE. `matchTokens` decides what a reader should see first, and sorting on both
  // sides made its ranking unreachable — the law that guards it could not fail.
  return [...names];
}

/**
 * One token, as the page resolves it.
 *
 * FROM A THEMED ELEMENT rather than from `:root`. Most of this system's roles are declared on
 * `.kui-theme` and not on the document element — that is §6's substitution-at-declaration, and
 * reading the root would answer "nothing" for every one of them.
 */
function resolveToken(name: string): string {
  const scope = document.querySelector(".kui-theme") ?? document.documentElement;
  return getComputedStyle(scope).getPropertyValue(name).trim();
}
