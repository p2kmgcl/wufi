window.wait = (delay) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

window.waitForContent = (element) =>
  new Promise((resolve, reject) => {
    let tries = 0;

    (function tryFindContent() {
      if (Array.from(element.childNodes).some((node) => node.textContent)) {
        resolve();
      } else if (tries < 10) {
        tries += 1;
        setTimeout(tryFindContent, 100 * tries);
      } else {
        reject(new Error(`Content not found in ${element}`));
      }
    })();
  });

window.waitForElement = (selector) =>
  new Promise((resolve, reject) => {
    let tries = 0;

    (function tryFindElement() {
      const element = document.querySelector(selector);

      if (element) {
        resolve(element);
      } else if (tries < 5) {
        tries += 1;
        setTimeout(tryFindElement, 100 * tries);
      } else {
        reject(new Error(`"${selector}" not found`));
      }
    })();
  });

window.querySiblingElement = (element, selector) => {
  if (!element || !element.parentElement) {
    return null;
  }

  return (
    element.parentElement.querySelector(selector) ||
    querySiblingElement(element.parentElement, selector)
  );
};

true;
