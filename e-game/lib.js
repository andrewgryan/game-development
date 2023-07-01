// @ts-check

let reactiveFn = null;

/**
 * @param {string} tagName
 * @returns {(text: string | HTMLElement ) => HTMLElement}
 */
const element = (tagName) => (text) => {
  const el = document.createElement(tagName);
  let node;
  if (typeof text === "string") {
    node = document.createTextNode(text);
  } else if (text.hasOwnProperty("data")) {
    // Reactive magic
    node = document.createTextNode("");
    reactiveFn = () => {
      console.log(text.data);
      node.nodeValue = text.data;
    };
    node.nodeValue = text.data;
    reactiveFn = null;
  } else {
    node = text;
  }
  el.appendChild(node);
  return el;
};

/**
 * @param {(...args: any[]) => HTMLElement} fn
 */
const attribute = (fn) => (attrs) => {
  return (...args) => {
    let el = fn(...args);
    if (typeof attrs === "undefined") {
      return el;
    }
    Object.entries(attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    return el;
  };
};

export const h1 = attribute(element("h1"));
export const div = attribute(element("div"));

export const signal = (initialValue) => {
  let subscribers = [];
  return new Proxy(
    { data: initialValue },
    {
      get: (target, prop, receiver) => {
        if (reactiveFn != null) {
          subscribers.push(reactiveFn);
        }
        return Reflect.get(target, prop, receiver);
      },
      set: (target, prop, value) => {
        let flag = Reflect.set(target, prop, value);
        subscribers.map((s) => s());
        return flag;
      },
    }
  );
};
