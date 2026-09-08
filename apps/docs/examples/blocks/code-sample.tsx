import { CodeSample } from "../../blocks/code-sample";

const SOURCE = `export function Submit() {
  return <Button emphasis="loud">Continue</Button>;
}
`;

export default async function Example() {
  return CodeSample({ code: SOURCE, lang: "tsx", title: "submit.tsx", lineNumbers: true });
}
