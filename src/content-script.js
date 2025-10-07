let MyMSUStylesheet
function createStylesheet() {
  const link = document.createElement("link");
  link.id = "MyMSU Stylesheet";
  link.rel = "stylesheet";
  link.type = "text/css"
  link.href = chrome.runtime.getURL("style.css");
  (document.body || document.documentElement).appendChild(link);

  MyMSUStylesheet = document.getElementById("MyMSU Stylesheet");
}

function updateStylesheetVisibility() {
  const isDisabled = sessionStorage.getItem("MyMSU Stylesheet Disabled") === "true";
  sendUpdateMessage(isDisabled);
  if(MyMSUStylesheet) {
    MyMSUStylesheet.disabled = isDisabled;
  } else {
    if(!isDisabled) {
      createStylesheet();

    }
  }
}

/**
 * Request the background script to update the extension icon's state
 * @param {boolean} isDisabled true if the icon is in the "on" state, false elsewise
 */
function sendUpdateMessage(isDisabled) {
  chrome.runtime.sendMessage({type: 'updateIsDisabled', value: isDisabled})
    .catch(reason => {
      throw new Error("Unable to send message to background. " + reason);
    });
}

/*
 * Respond to the background script's action button clicked messages, and send back the current state
 */
chrome.runtime.onMessage.addListener(function(message, _, sendResponse) {
  switch (message.type) {
    case "toggleIsDisabled":
      const isDisabled = sessionStorage.getItem("MyMSU Stylesheet Disabled") === "true"
      if(isDisabled) {
        sessionStorage.setItem("MyMSU Stylesheet Disabled", "false")
      } else {
        sessionStorage.setItem("MyMSU Stylesheet Disabled", "true")
      }
      sendResponse(!isDisabled)
      updateStylesheetVisibility();
      break;
    default:
      sendResponse(false);
      throw new TypeError("Unknown message type:" + message);
  }
});

/*
 * Child windows of a tab can change session storage, so when the window regains
 * focus we want to make sure our state matches the sessionStorage state
 */
document.addEventListener("visibilitychange", updateStylesheetVisibility)
/*
 * Check session storage state onload
 */
updateStylesheetVisibility();
