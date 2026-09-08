// @vitest-environment happy-dom
/**
 * THE ADAPTOR, AGAINST THE REAL RUNTIME (§48).
 *
 * `webmcp-register.ts` is written to a proposal that has already moved three times, and every
 * law that checked it before used a hand-written stub shaped like the draft its author
 * remembered. A stub agrees with the code by construction of the same memory. This file
 * initialises the reference polyfill itself — the dependency the page loads on request — and
 * hands the adaptor whatever the polyfill actually installs, so a spelling the proposal moves
 * next lands here as a red law and not as a page that quietly registers nothing.
 *
 * THIS FILE RUNS IN A DOM. The polyfill refuses to install without `window`, `document` and
 * `Document.prototype` — measured: in bare node `initializeWebMCPPolyfill()` returns before
 * defining anything — so this is the one docs law that asks vitest for `happy-dom`. The rest
 * of the suite stays in node, where it belongs.
 */
import { describe, expect, it } from "vitest";

import { buildTools } from "./agent-tools";
import { candidatesIn, registerTools } from "./webmcp-register";


const tools = buildTools({
  fetchText: async (path) => `# ${path}\n`,
  tokenNames: () => ["--space-4", "--radius-control-2"],
  resolveToken: (name) => (name === "--space-4" ? "12px" : ""),
});


describe("WebMCP, on the reference polyfill", () => {
  it("registers every tool on what the polyfill installs, and a call answers", async () => {
    const polyfill = await import("@mcp-b/webmcp-polyfill");
    polyfill.initializeWebMCPPolyfill();
    try {
      const scope = { document, navigator };
      // The polyfill must have put a host somewhere the adaptor looks, or the rest is vacuous.
      expect(candidatesIn(scope).length).toBeGreaterThan(0);

      const host = await registerTools(scope, tools);
      expect(host).not.toBeNull();
      expect(host?.registered).toBe(tools.length);

      // What the polyfill exposes is the draft's own surface, so calling through it is the
      // proof that the wire shape the adaptor chose is one a real host accepts. The polyfill's
      // context lists with `getTools()` and runs with `executeTool(name, inputJson)` — the
      // input travels as a JSON STRING, which is the draft's spelling and not MCP's.
      const container = candidatesIn(scope)[0]!.container as {
        getTools: () => Promise<Array<{ name: string }>>;
        executeTool: (tool: { name: string }, inputJson: string) => Promise<unknown>;
      };
      const registered = await container.getTools();
      const names = registered.map((t) => t.name);
      for (const tool of tools) expect(names, `${tool.name} is listed by the host`).toContain(tool.name);

      // `document.modelContext.executeTool` takes the registered tool OBJECT, not its name —
      // the name form is the deprecated `navigator` wrapper's. Measured: the name threw
      // "RegisteredTool must be an object".
      const first = registered.find((t) => t.name === tools[0]!.name)!;
      const result = (await container.executeTool(first, "{}")) as
        | { content?: Array<{ text?: string }> }
        | string;
      const text = typeof result === "string" ? result : (result.content?.[0]?.text ?? JSON.stringify(result));
      expect(text).toContain("components");
    } finally {
      polyfill.cleanupWebMCPPolyfill();
    }
  });

  it("registers nothing, throws nothing and reports no host where the API is absent", async () => {
    const host = await registerTools({ document: {}, navigator: {} }, tools);
    expect(host).toBeNull();
  });
});
