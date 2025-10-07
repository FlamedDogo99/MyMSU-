let MyMSUStylesheet;

/**
 * Add the stylesheet to the dom and update our instance of it
 */
function addStylesheet() {
  const link = document.createElement("link");
  link.id = "MyMSU Stylesheet";
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.runtime.getURL("style.css");
  (document.body || document.documentElement).appendChild(link);

  MyMSUStylesheet = document.getElementById("MyMSU Stylesheet");
}

/**
 * Request the background script to update the extension icon's state
 * @param {boolean} isDisabled true if the icon is in the "off" state, false elsewise
 */
function sendUpdateMessage(isDisabled) {
  chrome.runtime
    .sendMessage({ type: "updateIsDisabled", value: isDisabled })
    .catch((reason) => {
      throw new Error("Unable to send message to background. " + reason);
    });
}

/**
 * If the stylesheet exists, update it's disabled property. Otherwise, if isDisabled is false, create the stylesheet
 * @param {boolean} isDisabled - true if the stylesheet should be disabled, false otherwise
 */
function updateStylesheetVisibility(isDisabled) {
  sendUpdateMessage(isDisabled);
  if (MyMSUStylesheet) {
    /*
     * The content-script runs at document start, and on Chrome there's issues with
     * setting the element's disabled property before the dom loads. Because of this
     * we only append the stylesheet if it should be enabled
     * There could still be issues if the user presses the extension icon before the dom
     * finishes loading but this is rare, and resolves itself with subsequent presses
     */
    MyMSUStylesheet.disabled = isDisabled;
  } else {
    if (!isDisabled) {
      addStylesheet();
    }
  }
}

/*
 * Respond to the background script's action button clicked messages, and send back the current state.
 */
chrome.runtime.onMessage.addListener(function (message, _, sendResponse) {
  switch (message.type) {
    case "toggleIsDisabled":
      const isDisabled =
        sessionStorage.getItem("MyMSU Stylesheet Disabled") === "true";
      if (isDisabled) {
        sessionStorage.setItem("MyMSU Stylesheet Disabled", "false");
      } else {
        sessionStorage.setItem("MyMSU Stylesheet Disabled", "true");
      }
      // !isDisabled since we're toggling states, and don't want to read from sessionStorage again
      sendResponse(!isDisabled);
      updateStylesheetVisibility(!isDisabled);
      break;
    default:
      sendResponse(false);
      throw new TypeError("Unknown message type:" + message);
  }
});

/*
 * Child windows of a tab can change session storage, so when the window regains
 * focus we want to make sure our state matches the sessionStorage state.
 * This also fires when the window blurs, but doesn't add much performance overhead
 */
document.addEventListener("visibilitychange", () => {
  updateStylesheetVisibility(
    sessionStorage.getItem("MyMSU Stylesheet Disabled") === "true"
  );
});

/*
 * Check session storage state onload
 */
updateStylesheetVisibility(
  sessionStorage.getItem("MyMSU Stylesheet Disabled") === "true"
);
