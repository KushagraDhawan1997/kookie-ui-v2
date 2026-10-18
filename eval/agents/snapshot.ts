/**
 * Writes the checkUsage snapshot into `eval/agents/.cache/data.json`.
 *
 * It calls `buildData()` from `packages/mcp/scripts/build-data.ts`, the same derivation the MCP
 * server ships, and writes the result here instead of into `packages/mcp/dist`. That function
 * bundles the docs registry with esbuild (it does not build the docs app) and keeps its bundle in
 * `packages/mcp/node_modules/.cache`.
 *
 *   node --experimental-strip-types eval/agents/snapshot.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { CACHE_DIR, REPO } from "./lib/paths.ts";

const script = path.join(REPO, "packages/mcp/scripts/build-data.ts");
const { buildData } = (await import(pathToFileURL(script).href)) as { buildData: () => Promise<unknown> };
const data = await buildData();
mkdirSync(CACHE_DIR, { recursive: true });
const out = path.join(CACHE_DIR, "data.json");
writeFileSync(out, JSON.stringify(data));
console.log(`wrote ${path.relative(REPO, out)}`);
