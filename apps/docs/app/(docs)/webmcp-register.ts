import type { AgentTool } from "./agent-tools";

/**
 * WebMCP, and the honest state of it (§47).
 *
 * WebMCP is the browser-side half of the Model Context Protocol: a page declares the things it
 * can do as named tools with JSON Schema inputs, and an agent looking at the page calls them
 * instead of guessing at the markup. It is a W3C Web Machine Learning Community Group
 * proposal, authored by Google and Microsoft, and as of this file being written it is a
 * PROPOSAL WITH ONE IMPLEMENTATION BEHIND A FLAG. No browser ships it on by default. So the
 * whole of this file is written to be a no-op, and that is the normal case rather than the
 * failure case.
 *
 * THE SPELLING IS IN MOTION, WHICH IS WHY THIS IS AN ADAPTOR AND NOT A CALL. Three things have
 * changed under the proposal already: the object moved from `navigator.modelContext` to
 * `document.modelContext`, registration moved from one `provideContext({ tools })` call to a
 * per-tool `registerTool()`, and the result shape has been both a bare serializable value and
 * MCP's own `{ content: [{ type: "text", text }] }`. Picking one and writing it inline would
 * be a bet on a draft. So this file asks the host what it has, in the order the draft has been
 * moving, and `agent-tools.ts` never learns which answer it got.
 *
 * WHY IT DEGRADES TO NOTHING RATHER THAN TO A POLYFILL BY DEFAULT. A reader of these pages is
 * a person reading documentation. Loading a runtime that exists to serve an agent nobody has
 * brought would be bytes spent on every visit for a capability almost no visit has — so the
 * polyfill is behind an explicit opt-in, and with no opt-in and no native API this costs one
 * property read.
 */

/** What the page is talking to, once the differences are behind us. */
export type Host = {
  /** Where it was found, for the notice a person sees and for the law. */
  surface: "document" | "navigator";
  /** Which call it accepted. */
  method: "registerTool" | "provideContext";
  registered: number;
};

/**
 * The two objects the draft has put `modelContext` on, newest first.
 *
 * `document` is the current spec and `navigator` is where it started; the reference polyfill
 * installs on both and warns on the second. Reading them in this order means a page that has
 * both takes the one the specification currently names.
 */
type Candidate = { surface: Host["surface"]; container: unknown };

export function candidatesIn(scope: {
  document?: unknown;
  navigator?: unknown;
}): Candidate[] {
  const out: Candidate[] = [];
  const fromDocument = (scope.document as { modelContext?: unknown } | undefined)?.modelContext;
  if (fromDocument) out.push({ surface: "document", container: fromDocument });
  const fromNavigator = (scope.navigator as { modelContext?: unknown } | undefined)?.modelContext;
  if (fromNavigator) out.push({ surface: "navigator", container: fromNavigator });
  return out;
}

/**
 * A tool's answer, in whichever shape the host wants.
 *
 * `agent-tools.ts` returns a string on purpose — the wire format is the part of this proposal
 * that has moved most, and the layer that knows the answers should not have to know how they
 * travel. MCP's own content array is the safer of the two: a host that wants a bare value
 * reads `content[0].text` out of it, and a host that wants the array cannot read one out of a
 * bare string.
 */
export const asToolResult = (text: string) => ({ content: [{ type: "text" as const, text }] });

type RegisterToolContainer = {
  registerTool: (tool: unknown, options?: unknown) => unknown;
};
type ProvideContextContainer = {
  provideContext: (context: { tools: unknown[] }) => unknown;
};

const wire = (tool: AgentTool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
  annotations: tool.annotations,
  execute: async (input: Record<string, unknown>) => asToolResult(await tool.execute(input ?? {})),
});

/**
 * Hand the tools to the first host that will take them.
 *
 * Returns `null` when there is no host, which is every browser today. It THROWS nothing: a
 * documentation page that fails to load because an experimental API disagreed with us would be
 * the worst possible trade, so every call is guarded and a host that rejects one tool does not
 * stop the rest.
 */
export async function registerTools(
  scope: { document?: unknown; navigator?: unknown },
  tools: readonly AgentTool[],
  options?: { signal?: AbortSignal },
): Promise<Host | null> {
  for (const { surface, container } of candidatesIn(scope)) {
    const perTool = container as Partial<RegisterToolContainer>;
    if (typeof perTool.registerTool === "function") {
      let registered = 0;
      for (const tool of tools) {
        try {
          await perTool.registerTool(wire(tool), options);
          registered += 1;
        } catch {
          // ONE TOOL, NOT THE SET. A host that refuses a name or a schema refuses that tool;
          // the other three are still worth offering, and there is nothing a reader of this
          // page could do about either outcome.
        }
      }
      if (registered > 0) return { surface, method: "registerTool", registered };
      continue;
    }

    const wholeSet = container as Partial<ProvideContextContainer>;
    if (typeof wholeSet.provideContext === "function") {
      try {
        await wholeSet.provideContext({ tools: tools.map(wire) });
        return { surface, method: "provideContext", registered: tools.length };
      } catch {
        continue;
      }
    }
  }
  return null;
}
