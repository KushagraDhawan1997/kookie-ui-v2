#!/usr/bin/env node
/**
 * The KookieUI MCP server. Four tools over stdio.
 *
 * WHAT IT IS FOR. A model writing code against this system fails one way: it reaches for a
 * prop we do not have, because the API it has memorised is Radix Themes' and shadcn's. The
 * package answers that at compile time (`system/refused.ts`) and the site answers it in prose.
 * Neither reaches a model composing a snippet with no checkout to compile. This does.
 *
 * THE SIZE CEILING IS THE DESIGN CONSTRAINT, not a detail. A client truncates a tool result at
 * about 25,000 tokens, and a truncated result is worse than a short one: it ends mid-sentence
 * and the reader cannot tell anything is missing. There are 54 components and a full reference
 * is far past that, so no tool returns the whole registry. Every list is filtered and says how
 * much it left; every detail tool takes one component. `budgeted()` in `tools.ts` enforces it
 * once, and `budget.test.ts` sweeps every answer this server can give.
 *
 * WHAT IT DELIBERATELY DOES NOT DO, against shadcn's server as the reference. That one exists
 * to INSTALL: its centre of gravity is the add command, and its tools browse registries of
 * copyable source. Ours is a dependency, not a copy, so there is nothing to fetch and no
 * install command to compose. What is scarce here is not the source — a consumer already has
 * it in `node_modules` — it is the BOUNDARY: which props do not exist, which values a closed
 * union takes, and what to write instead. So there is no add, no icon search (this package
 * ships no icon set on purpose), no preview URL, and one tool that reads the caller's own code
 * back to them.
 */
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import { exportedSymbols } from "./check.ts";
import { checkCode, families, getComponent, getTokens, listComponents } from "./tools.ts";

/** One text result. The tool bodies have already been through the budget. */
const reply = (text: string) => ({ content: [{ type: "text" as const, text }] });

export function createServer(): McpServer {
  const server = new McpServer(
    { name: "kookie-ui", version: "0.0.0" },
    { capabilities: { tools: {} } },
  );

  server.registerTool(
    "list_components",
    {
      title: "List KookieUI components",
      description:
        "Every component KookieUI exports, as a name and one sentence, grouped by family " +
        `(${families().join(", ")}). Names and abstracts only — call ` +
        "get_component for the props and the refusals of one. Start here when you do not know " +
        "what this system calls a thing.",
      inputSchema: z.object({
        family: z.enum(families()).optional().describe("Only this family. Omit for all of them."),
        query: z
          .string()
          .optional()
          .describe("Only components whose name or abstract contains this text."),
      }),
    },
    async (args) => reply(listComponents(args)),
  );

  server.registerTool(
    "get_component",
    {
      title: "Read one KookieUI component",
      description:
        "The full reference for ONE component: what it is, what it refuses and why, a real " +
        "example, and every prop it declares with its type. This is the same document the " +
        "documentation site serves, so it is never a paraphrase. Read it before writing the " +
        "component, and again whenever a prop you expected does not exist.",
      inputSchema: z.object({
        name: z
          .string()
          .describe(
            "An exported name (`Button`), a part (`MenuItem`), or a slug (`alert-dialog`). Case and hyphens do not matter.",
          ),
      }),
    },
    async (args) => reply(getComponent(args)),
  );

  server.registerTool(
    "check_usage",
    {
      title: "Check code against KookieUI's rules",
      description:
        "Reads a piece of JSX and reports what this system refuses in it: props that do not " +
        'exist (`variant`, `asChild`, `m` on a control), values outside a closed union (`size="5"`), ' +
        "utility classes in className, and raw lengths or colours in style. Every reason it " +
        "prints is the system's own. Run it on any KookieUI markup you wrote or edited, before " +
        "handing it over.",
      inputSchema: z.object({
        code: z.string().describe("JSX or TSX. A fragment is fine; it does not have to compile."),
      }),
    },
    async (args) => reply(checkCode(args)),
  );

  server.registerTool(
    "get_tokens",
    {
      title: "Look up KookieUI tokens",
      description:
        "The generated custom properties and the values they resolve to, filtered by a query. " +
        "Use it when you need a real token name for a `style` escape or for app CSS — this " +
        "system's rule is that every value resolves through one. It never returns the whole " +
        "set: there are hundreds, so give a query like `space`, `tone-solid` or `radius`.",
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            "Matched against token names, e.g. `space`, `radius-control`, `accent`, `shadow`.",
          ),
        limit: z.number().int().min(1).max(200).default(60).describe("How many to return."),
      }),
    },
    async (args) => reply(getTokens(args)),
  );

  return server;
}

// Loaded here so a missing or broken snapshot fails at start-up, where the process can still
// print why, rather than inside the first tool call where a client sees an empty answer.
if (!exportedSymbols().length) throw new Error("dist/data.json carries no components");

serveStdio(createServer);
