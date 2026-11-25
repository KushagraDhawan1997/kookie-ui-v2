import { Button, Field, FieldLabel, FieldRow, Flex, Grid, TextField } from "@kushagradhawan/kookie-ui-react";

// Short fields that belong together sit side by side in a FieldRow, which sets
// the space between them and drops to one column on a narrow window. The grid
// stacks the rows, and the address takes a row of its own.
export default function Example() {
  return (
    <Grid gap="5" columns="minmax(0, 1fr)" style={{ maxWidth: "32rem" }}>
      <FieldRow>
        <Field>
          <FieldLabel>First name</FieldLabel>
          <TextField defaultValue="Shruti" />
        </Field>
        <Field>
          <FieldLabel>Last name</FieldLabel>
          <TextField defaultValue="Bhatia" />
        </Field>
      </FieldRow>
      <Field>
        <FieldLabel>Billing address</FieldLabel>
        <TextField placeholder="Street and number" />
      </Field>
      <FieldRow>
        <Field>
          <FieldLabel>City</FieldLabel>
          <TextField />
        </Field>
        <Field>
          <FieldLabel>Postal code</FieldLabel>
          <TextField />
        </Field>
      </FieldRow>
      <Flex justify="flex-end">
        <Button emphasis="loud">Save address</Button>
      </Flex>
    </Grid>
  );
}
