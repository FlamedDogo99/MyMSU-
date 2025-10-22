const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [resource, config] = args;
  function overrideJson(contains, callback) {
    /* We cannot throw an error here. If any problem occurs, we need to pretend that everything is fine,
     * and just return the original fetch result */
    try {
      if (resource.indexOf(contains) !== -1) {
        response.json = () =>
          response
            .clone()
            .json()
            .then((data) => callback(data));
      }
    } catch (_) {}
  }
  function overrideText(contains, callback) {
    try {
      if (resource.indexOf(contains) !== -1) {
        response.text = () => response
          .clone()
          .text()
          .then((data) => callback(data))
      }
    } catch(_) {}
  }
  const response = await originalFetch.call(this, ...args);
  overrideJson("api/locked-cards", (data) => {
    if (config.method === "GET" || !config.method) data.cards = []; // Remove list of locked cards
    return data;
  });
  overrideJson("api/preferences", (data) => {
    if (config.method === "GET" || !config.method) {
      data.dashboard.cards = data.dashboard.cards.filter((item) => {
        return !item.isLocked;
      }); // Remove locked cards from preferences
    }
    return data;
  });
  overrideJson("api/dashboard-load", (data) => {
    if (config.method === "GET" || !config.method) {
      data.announcements = data.announcements.filter((item) => {
        return item.externalLinkUrl !== "https://www.montana.edu/uit/mymsu";
      }); // Remove "Welcome to MyMSU" alert
    }
    return data;
  });
  overrideText("425de6281097a59e8877", (data) => {
    return "debugger;" + data;
  })
  return response;
};
