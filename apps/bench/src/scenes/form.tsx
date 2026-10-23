import * as React from "react";
import {
  Box,
  Checkbox,
  Field,
  FieldLabel,
  Flex,
  Grid,
  Radio,
  RadioGroup,
  SegmentedControl,
  SegmentedItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Slider,
  Switch,
  Text,
  TextArea,
  TextField,
} from "@kushagradhawan/kookie-ui-react";
import { useScene, useVersion } from "../harness";

const CHOICES = { a: "Alpha", b: "Beta", c: "Gamma" };

/** A long settings form: 40 groups of fields, every kind v2 has. */
export function FormScene() {
  const [version, rerender] = useVersion();
  const scroller = React.useRef<HTMLDivElement>(null);
  const api = React.useMemo(() => ({ rerender, scroller: () => scroller.current }), [rerender]);
  useScene(api);

  return (
    <Box ref={scroller} p="5" style={{ height: "100vh", overflow: "auto" }}>
      <Grid columns="2" gap="5">
        {Array.from({ length: 40 }, (_, i) => (
          <Flex key={i} direction="column" gap="2">
            <Field>
              <FieldLabel>Setting {i + version}</FieldLabel>
              <TextField data-bench={i === 0 ? "type" : undefined} placeholder={`Value ${i}`} />
            </Field>
            <TextArea placeholder="Notes" aria-label={`Notes ${i}`} />
            <Select defaultValue="a" items={CHOICES}>
              <SelectTrigger aria-label={`Choice ${i}`} />
              <SelectContent>
                {Object.entries(CHOICES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Flex gap="3" align="center">
              <Checkbox aria-label={`Enable ${i}`} defaultChecked={(i + version) % 2 === 0} />
              <Switch aria-label={`Sync ${i}`} defaultChecked />
            </Flex>
            <RadioGroup defaultValue="1" aria-label={`Mode ${i}`}>
              <Flex gap="3" align="center">
                <Radio value="1" aria-label="Daily" />
                <Text>Daily</Text>
                <Radio value="2" aria-label="Weekly" />
                <Text>Weekly</Text>
              </Flex>
            </RadioGroup>
            <SegmentedControl defaultValue="l" aria-label={`Side ${i}`}>
              <SegmentedItem value="l">Left</SegmentedItem>
              <SegmentedItem value="r">Right</SegmentedItem>
            </SegmentedControl>
            <Slider defaultValue={(i * 5 + version) % 100} aria-label={`Level ${i}`} />
          </Flex>
        ))}
      </Grid>
    </Box>
  );
}
