import { h1, div, signal } from "./lib.js";

const counter = signal("");

const App = () => {
  return div({ class: "App" })(h1()(counter));
};

const add = (parent, child) => {
  parent.appendChild(child);
};

// Mount
add(document.body, App());

// Render
const gameLoop = (time) => {
  requestAnimationFrame(gameLoop);
  counter.data = (time / 1000).toFixed(2);
};
requestAnimationFrame(gameLoop);
