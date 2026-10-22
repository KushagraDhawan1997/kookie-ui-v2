import * as React from "react";
import {
  Button,
  Card,
  Chip,
  Flex,
  Grid,
  Heading,
  Shell,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellPaneHeader,
  ShellScroll,
  ShellSidebar,
  Text,
  Toolbar,
  ToolbarButton,
} from "@kushagradhawan/kookie-ui-react";
import { useScene, useVersion } from "../harness";

/**
 * An app frame: a sidebar of 200 rows under a floating toolbar, beside a grid of 60 cards with a
 * floating toolbar of its own. The `glass` scene renders this same frame under a glass theme, so
 * every floating band and every card takes the material.
 */
export function ShellScene() {
  const [version, rerender] = useVersion();
  const root = React.useRef<HTMLDivElement>(null);
  const api = React.useMemo(
    () => ({ rerender, scroller: () => root.current?.querySelector<HTMLElement>(".kui-shell-sidebar .kui-scroll-viewport") ?? null }),
    [rerender],
  );
  useScene(api);

  return (
    <div ref={root} style={{ height: "100vh" }}>
      <Shell contained>
        <ShellSidebar aria-label="Main">
          <ShellPaneHeader float>
            <Toolbar backdrop aria-label="App">
              <Text weight="medium">Workspace</Text>
              <ToolbarButton iconOnly aria-label="Search">
                ⌕
              </ToolbarButton>
            </Toolbar>
          </ShellPaneHeader>
          <ShellScroll fade>
            {Array.from({ length: 10 }, (_, g) => (
              <ShellNavGroup key={g} label={`Section ${g}`}>
                {Array.from({ length: 20 }, (_, i) => (
                  <ShellNavItem key={i} current={i === version % 20 && g === 0}>
                    Page {g * 20 + i}
                  </ShellNavItem>
                ))}
              </ShellNavGroup>
            ))}
          </ShellScroll>
        </ShellSidebar>
        <ShellContent>
          <ShellPaneHeader float>
            <Toolbar backdrop aria-label="Page">
              <Heading size="5">Dashboard {version}</Heading>
              <Button backdrop>Export</Button>
            </Toolbar>
          </ShellPaneHeader>
          <ShellScroll>
            <Grid columns="3" gap="4" p="5" style={{ paddingBlockStart: "var(--kui-pane-inset-block-start)" }}>
              {Array.from({ length: 60 }, (_, i) => (
                <Card key={i} backdrop>
                  <Flex direction="column" gap="1">
                    <Text weight="medium">Metric {i}</Text>
                    <Heading size="6">{(i * 37 + version) % 1000}</Heading>
                    <Chip tone={i % 2 ? "success" : "destructive"}>
                      {i % 2 ? "+" : "-"}
                      {i % 9}%
                    </Chip>
                  </Flex>
                </Card>
              ))}
            </Grid>
          </ShellScroll>
        </ShellContent>
      </Shell>
    </div>
  );
}
