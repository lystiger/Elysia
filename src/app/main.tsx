import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SpaceProvider } from "../features/spaces/SpaceContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SpaceProvider>
      <App />
    </SpaceProvider>
  </React.StrictMode>
);
