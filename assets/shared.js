window.__WUFI_INITIAL_DELAY = 200;
window.__WUFI_WAIT_MAX_TRIES = 5;

window.waitForContent = (element) =>
  new Promise((resolve, reject) => {
    let delay = window.__WUFI_INITIAL_DELAY;
    let tries = 0;

    (function tryFindContent() {
      if (Array.from(element.childNodes).some((node) => node.textContent)) {
        resolve();
      } else if (tries < window.__WUFI_WAIT_MAX_TRIES) {
        delay *= 2;
        tries += 1;
        setTimeout(tryFindContent, delay);
      } else {
        reject(new Error(`Content not found in ${element}`));
      }
    })();
  });

window.waitForElement = (selector) =>
  new Promise((resolve, reject) => {
    let delay = window.__WUFI_INITIAL_DELAY;
    let tries = 0;

    (function tryFindElement() {
      const element = document.querySelector(selector);

      if (element) {
        resolve(element);
      } else if (tries < window.__WUFI_WAIT_MAX_TRIES) {
        delay *= 2;
        tries += 1;
        setTimeout(tryFindElement, delay);
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
