import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Main } from 'views/Main/Main';

const elementId = 'root';
const container = document.getElementById(elementId);
if (container === null) {
  throw new Error(`could not find element with id=${elementId}`);
}

const root = createRoot(container);
root.render(<Main />);
