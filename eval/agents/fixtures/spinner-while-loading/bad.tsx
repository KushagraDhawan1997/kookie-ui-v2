import { useState } from "react";
import { Text } from "@kushagradhawan/kookie-ui-react";

// The empty area says "Loading..." and nothing shows the work continues.
export default function App() {
  const [rows] = useState<string[] | null>(null);
  return rows ? <Text>{rows.join(", ")}</Text> : <Text>Loading...</Text>;
}
