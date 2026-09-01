import { CodeBlock } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

const SOURCE = `export function App() {
  return (
    <Theme appearance="dark">
      <Button tone="accent">Ship it</Button>
    </Theme>
  )
}`;

export default function Example({ size = "2" }: { size?: Size }) {
  return <CodeBlock size={size}>{SOURCE}</CodeBlock>;
}
