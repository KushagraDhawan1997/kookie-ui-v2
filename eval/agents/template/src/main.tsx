import "@kushagradhawan/kookie-ui-react/styles.css";
import { Theme } from "@kushagradhawan/kookie-ui-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme>
      <App />
    </Theme>
  </StrictMode>,
);
