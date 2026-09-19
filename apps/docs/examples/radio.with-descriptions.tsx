import { Field, FieldDescription, FieldItem, FieldLabel, Radio, RadioGroup } from "@kookie-ui/react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "24rem" }}>
      <FieldLabel>Backups</FieldLabel>
      <RadioGroup defaultValue="daily">
        <FieldItem>
          <Radio value="hourly" />
          <FieldLabel>Hourly</FieldLabel>
          <FieldDescription>Keeps 48 snapshots. Uses the most storage.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Radio value="daily" />
          <FieldLabel>Daily</FieldLabel>
          <FieldDescription>Keeps 30 snapshots, taken at midnight UTC.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Radio value="weekly" />
          <FieldLabel>Weekly</FieldLabel>
          <FieldDescription>Keeps 12 snapshots, taken on Sunday.</FieldDescription>
        </FieldItem>
      </RadioGroup>
    </Field>
  );
}
