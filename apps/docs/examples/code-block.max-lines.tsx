import { CodeBlock } from "@kushagradhawan/kookie-ui-react";

const SOURCE = `{
  "name": "billing-service",
  "version": "2.4.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "test": "vitest run",
    "lint": "eslint src"
  },
  "dependencies": {
    "stripe": "^18.0.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.9.0",
    "vitest": "^3.2.0"
  }
}`;

// Six lines show, and the rest scroll. Nothing is cut off, so every line
// stays reachable by wheel, keyboard and screen reader.
export default function Example() {
  return <CodeBlock maxLines={6}>{SOURCE}</CodeBlock>;
}
