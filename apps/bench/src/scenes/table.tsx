import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Flex,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  ScrollArea,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@kushagradhawan/kookie-ui-react";
import { useScene, useVersion } from "../harness";

const STATUSES = ["Active", "Invited", "Paused", "Archived"] as const;
const TONES = ["success", "info", "warning", "neutral"] as const;

/** A data table: 500 rows, each with an avatar, a status chip, a checkbox and a row menu. */
export function TableScene() {
  const [version, rerender] = useVersion();
  const root = React.useRef<HTMLDivElement>(null);
  const api = React.useMemo(
    () => ({ rerender, scroller: () => root.current?.querySelector<HTMLElement>(".kui-scroll-viewport") ?? null }),
    [rerender],
  );
  useScene(api);

  return (
    <div ref={root}>
      <ScrollArea style={{ height: "100vh" }}>
        <Table aria-label="People">
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 500 }, (_, i) => {
              const n = (i + version) % 4;
              return (
                <TableRow key={i}>
                  <TableCell>
                    <Checkbox aria-label={`Select row ${i}`} defaultChecked={n === 0} />
                  </TableCell>
                  <TableCell>
                    <Flex align="center" gap="2">
                      <Avatar size="1" fallback={String.fromCharCode(65 + (i % 26))} />
                      <Text>Person {i + version}</Text>
                    </Flex>
                  </TableCell>
                  <TableCell>person{i}@example.com</TableCell>
                  <TableCell>
                    <Chip tone={TONES[n]}>{STATUSES[n]}</Chip>
                  </TableCell>
                  <TableCell>{(i * 7 + version) % 50}</TableCell>
                  <TableCell>
                    <Menu>
                      <MenuTrigger
                        render={
                          <Button emphasis="quiet" iconOnly aria-label={`Actions for row ${i}`}>
                            …
                          </Button>
                        }
                      />
                      <MenuContent>
                        <MenuItem>Edit</MenuItem>
                        <MenuItem>Duplicate</MenuItem>
                        <Separator />
                        <MenuItem tone="destructive">Delete</MenuItem>
                      </MenuContent>
                    </Menu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <Box position="fixed" top="2" right="2">
        <Button data-bench="rerender" onClick={rerender}>
          Shuffle
        </Button>
      </Box>
    </div>
  );
}
