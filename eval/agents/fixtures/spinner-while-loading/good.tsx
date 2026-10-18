import { useEffect, useState } from "react";
import { Flex, Spinner, Text } from "@kushagradhawan/kookie-ui-react";

export default function App() {
  const [rows, setRows] = useState<string[] | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setRows(["Alpha"]), 1500);
    return () => clearTimeout(timer);
  }, []);
  if (!rows) {
    return (
      <Flex gap="2" align="center">
        <Spinner />
        <Text emphasis="medium">Loading projects</Text>
      </Flex>
    );
  }
  return <Text>{rows.join(", ")}</Text>;
}
