import { Card, Flex, Text } from "@kushagradhawan/kookie-ui-react";

const PROJECTS = [{ name: "Atlas" }, { name: "Beacon" }];

// Cards in a wrapping Flex, so their columns do not line up.
export default function App() {
  return (
    <Flex wrap="wrap" gap="4">
      {PROJECTS.map((project) => (
        <Card key={project.name}><Text>{project.name}</Text></Card>
      ))}
    </Flex>
  );
}
