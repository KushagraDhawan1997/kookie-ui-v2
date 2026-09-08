import { Button } from "@kookie-ui/react";

import { Specimen } from "../../blocks/specimen";

const SOURCE = `<Button emphasis="loud">Continue</Button>
`;

export default async function Example() {
  return Specimen({
    sources: [{ code: SOURCE, lang: "tsx" }],
    children: <Button emphasis="loud">Continue</Button>,
  });
}
