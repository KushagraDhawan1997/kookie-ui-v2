/**
 * The appearance mechanism's laws (REVIEW's dark-SSR resolution).
 *
 * There are TWO implementations of one rule here, and that is the design: a string of
 * plain JS that runs in `<head>` before React exists, and a React store that runs after.
 * Both read the same two storage keys, both compute the same appearance, both stamp the
 * same two attributes on `<html>`. Nothing but discipline kept them in step — so the first
 * law is that they cannot disagree, over every cell of the input space.
 *
 * The second law is the one the audit's two criticals would have failed: storage access can
 * THROW rather than return null (Safari "Block all cookies" and friends), and both halves
 * must survive it — the script by stamping anyway, the store by not crashing the render.
 */
import { afterEach, describe, expect, it } from "vitest";

import { apply, resetSessionForTest, setAppearance } from "./appearance";
import { APPEARANCE_KEY, CONTRAST_KEY, appearanceScript } from "./appearance-script";

type Attrs = Record<string, string>;

/** The three globals both halves touch, stubbed so a cell is a pure function of its inputs. */
function environment({ osDark, storage }: { osDark: boolean; storage: Map<string, string> | "throws" }) {
  const attrs: Attrs = {};
  const documentElement = {
    setAttribute: (k: string, v: string) => {
      attrs[k] = v;
    },
    removeAttribute: (k: string) => {
      delete attrs[k];
    },
    getAttribute: (k: string) => attrs[k] ?? null,
  };
  const localStorage = {
    getItem: (k: string) => {
      if (storage === "throws") throw new Error("The operation is insecure.");
      return storage.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (storage === "throws") throw new Error("The operation is insecure.");
      storage.set(k, v);
    },
    removeItem: (k: string) => {
      if (storage === "throws") throw new Error("The operation is insecure.");
      storage.delete(k);
    },
  };
  const matchMedia = (q: string) => ({
    matches: q.includes("dark") ? osDark : false,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  return { attrs, documentElement, localStorage, matchMedia };
}

/** Run the shipped script string exactly as the browser would, against the stubs. */
function runScript(env: ReturnType<typeof environment>): Attrs {
  const fn = new Function("document", "localStorage", "matchMedia", appearanceScript);
  fn({ documentElement: env.documentElement }, env.localStorage, env.matchMedia);
  return env.attrs;
}

/** Install the stubs as the globals both halves read. The store resolves `document`,
    `localStorage` and `matchMedia` at CALL time, so one static import serves every cell. */
function install(env: ReturnType<typeof environment>) {
  Object.assign(globalThis, {
    document: { documentElement: env.documentElement },
    localStorage: env.localStorage,
    matchMedia: env.matchMedia,
  });
}

/** Run the STORE's half against the same stubbed environment. */
function runStore(env: ReturnType<typeof environment>): Attrs {
  install(env);
  // Re-derive from whatever is already stored, which is what the script does. Going through
  // the setters would WRITE, and the point is to compare two readers of one state.
  apply();
  return env.attrs;
}

afterEach(() => {
  // The session override is module state by design (it outranks storage for this page
  // view), so a cell must not inherit the previous one's choice.
  resetSessionForTest();
  for (const k of ["document", "localStorage", "matchMedia"]) {
    delete (globalThis as Record<string, unknown>)[k];
  }
});

describe("the two halves of the mechanism cannot disagree", () => {
  const APPEARANCES = [undefined, "light", "dark"] as const;
  const CONTRASTS = [undefined, "normal", "high"] as const;

  for (const stored of APPEARANCES) {
    for (const contrast of CONTRASTS) {
      for (const osDark of [false, true]) {
        const name = `stored=${stored ?? "none"} contrast=${contrast ?? "none"} os=${osDark ? "dark" : "light"}`;
        it(`agree at ${name}`, () => {
          const seed = () => {
            const m = new Map<string, string>();
            if (stored) m.set(APPEARANCE_KEY, stored);
            if (contrast) m.set(CONTRAST_KEY, contrast);
            return m;
          };
          const fromScript = runScript(environment({ osDark, storage: seed() }));
          const fromStore = runStore(environment({ osDark, storage: seed() }));
          expect(fromStore).toEqual(fromScript);

          // And the pair is what §7 requires, not merely equal to each other: appearance is
          // ALWAYS stamped, and contrast is stamped only when it was chosen — an unset
          // contrast must leave no attribute, or `prefers-contrast: more` can never reach a
          // page that never asked.
          expect(fromScript["data-appearance"]).toBe(
            stored ?? (osDark ? "dark" : "light"),
          );
          expect(fromScript["data-contrast"]).toBe(contrast);
        });
      }
    }
  }
});

describe("a browser that denies storage gets a themed page, not a broken one", () => {
  // Both criticals of the 2026-08-06 audit live here. Storage access THROWS in Safari's
  // "Block all cookies" and its Chrome/Firefox equivalents; before the fix the script's
  // single try/catch swallowed the throw along with its own stamp (so a dark-OS visitor got
  // the light fallback), and the store's unguarded read ran during render and took every
  // route to Next's error page.
  for (const osDark of [false, true]) {
    it(`the script still stamps the OS appearance (os=${osDark ? "dark" : "light"})`, () => {
      const attrs = runScript(environment({ osDark, storage: "throws" }));
      expect(attrs["data-appearance"]).toBe(osDark ? "dark" : "light");
      expect(attrs["data-contrast"]).toBeUndefined();
    });

    it(`the store reads without throwing, and agrees (os=${osDark ? "dark" : "light"})`, () => {
      const attrs = runStore(environment({ osDark, storage: "throws" }));
      expect(attrs["data-appearance"]).toBe(osDark ? "dark" : "light");
    });
  }

  it("a write that cannot persist still applies — the toggle is never a no-op", () => {
    const env = environment({ osDark: false, storage: "throws" });
    install(env);
    // Pre-fix this threw out of setItem before apply() ran, so the page stayed light while
    // the click reported nothing.
    expect(() => setAppearance("dark")).not.toThrow();
    expect(env.attrs["data-appearance"]).toBe("dark");
  });
});
