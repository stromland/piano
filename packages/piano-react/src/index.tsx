import { createRoot } from "react-dom/client";
import React from "react";

import { Main } from "views/Main/Main";

import "./index.css";

const elementId = "root";
const container = document.getElementById(elementId);
if (container === null) {
  throw new Error(`could not find element with id=${elementId}`);
}

const root = createRoot(container);
root.render(<Main />);
