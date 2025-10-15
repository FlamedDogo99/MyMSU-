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
  const response = await originalFetch.call(this, ...args);
  overrideJson("api/locked-cards", (data) => {
    data.cards = []; // Remove list of locked cards
    return data;
  });
  overrideJson("api/preferences", (data) => {
    data.dashboard.cards = data.dashboard.cards.filter((item) => {
      return !item.isLocked;
    }); // Remove locked cards from preferences
    return data;
  });
  overrideJson("api/dashboard-load", (data) => {
    data.announcements = data.announcements.filter((item) => {
      return item.externalLinkUrl !== "https://www.montana.edu/uit/mymsu";
    }); // Remove "Welcome to MyMSU" alert
    return data;
  });
  overrideJson("api/sessions", (data) => {
    if (config.method === "get" || !config.method) {
      if (data.remainingTime < 3) {
        // When data.remainingTime is bellow 2, it displays the logout prompt
        fetch(resource, {
          header: { "Access-Control-Allow-Origin": "*" },
          mode: "cors",
          credentials: "include",
          method: "post"
        })
          .then((response) => response.json())
          .then((json) => {
            if (json.remainingTime !== 60) {
              console.warn("Unable to refresh session", data);
              return data;
            }
          });
      }
      data.remainingTime = 60;
    }
    return data;
  });
  return response;
};
