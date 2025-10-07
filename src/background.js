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

/*
 * Notify the content script when it's associated extension icon is pressed, and get it's current
 * state to set the extension icon's state
 */
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(
    tab.id,
    { type: "toggleIsDisabled" },
    (isDisabled) => {
      updateActionIcon(isDisabled, tab.id);
    }
  );
});

/*
 * Update the extension icon's state when a content-script requests to update the state.
 * This happens when the tab regains focus, as the state is stored in session storage, while
 * the extension icon's state is stored per-tab
 */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.type) {
    case "updateIsDisabled":
      updateActionIcon(message.value, sender.tab.id);
      break;
    default:
      throw new TypeError("Unknown message type:" + message);
  }
});
