import { useState } from "react";
import { Button, Field, FieldLabel, Flex, Stack, Text, TextArea } from "@kushagradhawan/kookie-ui-react";

export default function App() {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<"saved" | "failed" | null>(null);
  const save = () => {
    setSaving(true);
    setResult(null);
    setTimeout(() => {
      setSaving(false);
      setResult(Math.random() > 0.3 ? "saved" : "failed");
    }, 2000);
  };
  return (
    <Stack gap="5">
      <Field>
        <FieldLabel>Description</FieldLabel>
        <TextArea />
      </Field>
      <Flex gap="3" align="center">
        <Button tone="accent" emphasis="loud" loading={saving} onClick={save}>Save description</Button>
        {result === "saved" && <Text tone="success">Saved</Text>}
        {result === "failed" && <Text tone="destructive">Not saved. Try again.</Text>}
      </Flex>
    </Stack>
  );
}
