import { h1, div, signal } from "./lib.js";

const s = signal("Hello, World!");

const App = () => {
  return div({ class: "App" })(h1()(s));
};

const add = (parent, child) => {
  parent.appendChild(child);
};

// Mount
add(document.body, App());

// Render
const gameLoop = (time) => {
  requestAnimationFrame(gameLoop);
  s.data = Math.floor(time / 1000);
};
requestAnimationFrame(gameLoop);
