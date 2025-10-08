document.addEventListener("click", (event)=> {
  debugger;
  let target = event.target.closest('a') || event.target.closest('button')
  if(target) {
    event.preventDefault();
  }
})

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

const path = (state, size) =>
  chrome.runtime.getURL(`icons/icon-${state}-${size}.png`);

const imageDataOn = {
  16: path("on", 16),
  48: path("on", 48),
  128: path("on", 128)
};
const imageDataOff = {
  16: path("off", 16),
  48: path("off", 48),
  128: path("off", 128)
};

/**
 * Update the extensions icon
 * @param {boolean} isDisabled - true if the icon is in the on state, false elsewise
 * @param {number} tabId - the ID of the tab requesting the update
 */
function updateActionIcon(isDisabled, tabId) {
  chrome.action
    .setIcon({
      tabId: tabId,
      path: isDisabled ? imageDataOff : imageDataOn
    })
    .catch((reason) => {
      throw new Error("Unable to set extension icon. " + reason);
    });
}

/**
 * Request the background script to update the extension icon's state
 * @param {boolean} isDisabled true if the icon is in the "off" state, false elsewise
 */
function sendUpdateMessage(isDisabled) {
  chrome.tabs.getCurrent()
    .then((tab) => {
      updateActionIcon(isDisabled, tab.id)
    })
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

chrome.action.onClicked.addListener((tab) => {
  const isDisabled =
    sessionStorage.getItem("MyMSU Stylesheet Disabled") === "true";
  if (isDisabled) {
    sessionStorage.setItem("MyMSU Stylesheet Disabled", "false");
  } else {
    sessionStorage.setItem("MyMSU Stylesheet Disabled", "true");
  }
  // !isDisabled since we're toggling states, and don't want to read from sessionStorage again
  updateStylesheetVisibility(!isDisabled);
});


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
