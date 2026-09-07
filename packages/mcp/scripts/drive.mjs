/**
 * Drives the built server over a real stdio pipe: spawns `dist/index.js`, speaks JSON-RPC at
 * it, and prints every response with its size in characters.
 *
 * A harness rather than a law: the laws in `src/` read the mechanisms directly, and this
 * exists to prove the assembled binary answers a client — the one thing no unit can show.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const child = spawn("node", [path.join(HERE, "../dist/index.js")], { stdio: ["pipe", "pipe", "inherit"] });

let buffer = "";
const waiting = new Map();
child.stdout.on("data", (chunk) => {
  buffer += chunk;
  for (let nl = buffer.indexOf("\n"); nl !== -1; nl = buffer.indexOf("\n")) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    const message = JSON.parse(line);
    if (message.id !== undefined && waiting.has(message.id)) {
      waiting.get(message.id)(message);
      waiting.delete(message.id);
    }
  }
});

let nextId = 1;
const send = (method, params) =>
  new Promise((resolve) => {
    const id = nextId++;
    waiting.set(id, resolve);
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  });
const notify = (method, params) =>
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`);

const text = (response) => response.result?.content?.map((part) => part.text).join("") ?? JSON.stringify(response);

const init = await send("initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "drive", version: "0" },
});
console.log("== initialize ==");
console.log(JSON.stringify(init.result?.serverInfo ?? init));
notify("notifications/initialized", {});

const tools = await send("tools/list", {});
console.log("\n== tools/list ==");
for (const tool of tools.result.tools) {
  console.log(`- ${tool.name}(${Object.keys(tool.inputSchema?.properties ?? {}).join(", ")})`);
}

const calls = [
  ["list_components", { family: "Indicator" }],
  ["list_components", {}],
  ["get_component", { name: "button" }],
  ["get_component", { name: "Toast" }],
  ["get_component", { name: "shell" }],
  ["get_tokens", { query: "radius-control" }],
  ["get_tokens", { query: "zzz" }],
  [
    "check_usage",
    {
      code: `import { Button, Card, Flex, Text } from "@kookie-ui/react";

export function Bad() {
  return (
    <Card className="mt-4 rounded-lg shadow-md" style={{ padding: 12 }}>
      <Flex gap="3">
        <Button variant="solid" size="5" m="4">Save</Button>
        <Button tone="purple" asChild>Cancel</Button>
        <Text size="3" weight="bold">Hello</Text>
        <MyOwnThing className="flex" />
        <Button {...rest} />
      </Flex>
    </Card>
  );
}`,
    },
  ],
  [
    "check_usage",
    {
      code: `<Flex gap="3" p="4"><Button tone="destructive" emphasis="loud">Delete</Button></Flex>`,
    },
  ],
];

let largest = 0;
let largestName = "";
for (const [name, args] of calls) {
  const response = await send("tools/call", { name, arguments: args });
  const body = text(response);
  console.log(`\n== ${name} ${JSON.stringify(args).slice(0, 90)} == (${body.length} chars, ~${Math.ceil(body.length / 3)} tokens at 3 chars/token)`);
  console.log(body.length > 1800 ? `${body.slice(0, 1500)}\n… [${body.length - 1500} more chars]` : body);
  if (body.length > largest) {
    largest = body.length;
    largestName = name;
  }
}

console.log(`\n== largest response ==\n${largestName}: ${largest} chars ≈ ${Math.ceil(largest / 3)} tokens (cap 25,000)`);
child.kill();
