const path = (state, size) => chrome.runtime.getURL(`icons/icon-${state}-${size}.png`);

const imageDataOn = {
  16: path("on", 16),
  48: path("on", 48),
  128: path("on", 128)
}
const imageDataOff = {
  16: path("off", 16),
  48: path("off", 48),
  128: path("off", 128)
}

/**
 * Update the extensions icon
 * @param {boolean} isDisabled - true if the icon is in the on state, false elsewise
 * @param {number} tabId - the ID of the tab requesting the update
 */
function updateActionIcon(isDisabled, tabId) {
  chrome.action.setIcon({
    tabId: tabId,
    path: isDisabled ? imageDataOff : imageDataOn,
  })
    .catch((reason) => {
      throw new Error("Unable to set extension icon. " + reason)
    })
}

/*
 * When a tab has the extension icon clicked, have the toggle send and toggle it's state so the icon can be updated
 */
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {type: 'toggleIsDisabled'}, (isDisabled) => {
    updateActionIcon(isDisabled, tab.id)
  });
});

/*
 * If the page's display state doesn't align with what it has saved, it will send a message to update the icon's state
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch(message.type) {
    case "updateIsDisabled":
      updateActionIcon(message.value, sender.tab.id);
      break;
    default:
      throw new TypeError("Unknown message type:" + message);
  }
})