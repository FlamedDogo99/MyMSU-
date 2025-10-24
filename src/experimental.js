function injectIntoMain() {
  const injectScript = document.createElement("script");
  injectScript.src = chrome.runtime.getURL("injected.js");
  document.documentElement.appendChild(injectScript);
}
injectIntoMain();

function waitForId(selector) {
  return new Promise(resolve => {
    if (document.getElementById(selector)) {
      return resolve(document.getElementById(selector));
    }
    const observer = new MutationObserver(mutations => {
      if (document.getElementById(selector)) {
        observer.disconnect();
        resolve(document.getElementById(selector));
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
}

waitForId("MyMSUNavBuilder")
  .then((element) => {
    const link = document.createElement("link");
    link.href = chrome.runtime.getURL("experimental.css");
    link.rel = "stylesheet";
    element.shadowRoot.appendChild(link);
  });