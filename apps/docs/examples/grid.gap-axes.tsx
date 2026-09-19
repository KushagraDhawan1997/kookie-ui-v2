import { Grid, Text } from "@kookie-ui/react";

const rows = [
  ["Plan", "Team"],
  ["Seats", "25"],
  ["Renews on", "1 March"],
  ["Billing contact", "Shruti Bhatia"],
];

// `gapX` and `gapY` set the column gap and the row gap separately.
// Here the columns sit further apart than the rows, so each pair reads as one line.
export default function Example() {
  return (
    <Grid columns="max-content minmax(0, 1fr)" gapX="6" gapY="2">
      {rows.map(([term, value]) => [
        <Text key={`${term}-term`} size="3" emphasis="medium">
          {term}
        </Text>,
        <Text key={`${term}-value`} size="3">
          {value}
        </Text>,
      ])}
    </Grid>
  );
}
