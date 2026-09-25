"use client";

import * as React from "react";
import { Field, FieldLabel, Row, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

const COMMANDS = ["Create project", "Invite a member", "Open billing", "Rotate API key", "Sign out"];

export default function Example() {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const results = COMMANDS.filter((command) =>
    command.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Stack gap="3" style={{ minWidth: "20rem" }}>
      <Field>
        <FieldLabel>Search commands</FieldLabel>
        <TextField
          value={query}
          placeholder="Type to filter"
          aria-controls="command-results"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => Math.min(index + 1, results.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => Math.max(index - 1, 0));
            }
          }}
        />
      </Field>
      <Stack gap="1" id="command-results" role="listbox" aria-label="Commands">
        {results.map((command, index) => (
          <Row
            key={command}
            role="option"
            aria-selected={index === active}
            highlighted={index === active}
            tabIndex={-1}
          >
            {command}
          </Row>
        ))}
      </Stack>
    </Stack>
  );
}
