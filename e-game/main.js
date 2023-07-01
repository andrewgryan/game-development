import { p, h1, div, signal } from "./lib.js";

const counter = signal(0);

const App = () => {
  return div({ class: "App" })(h1()(counter), p()("This is a paragraph."));
};

const add = (parent, child) => {
  parent.appendChild(child);
};

// Mount
add(document.body, App());

// Render
const gameLoop = (time) => {
  // requestAnimationFrame(gameLoop);
  counter.data = (time / 1000).toFixed(2);
};
requestAnimationFrame(gameLoop);
