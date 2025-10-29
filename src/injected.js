(function () {
  const Config = {
    static: {
      API: {
        dashboard: "https://experience.elluciancloud.com/api/dashboard-load",
        categories: "https://experience.elluciancloud.com/api/categories",
        academic:
          "https://experience.elluciancloud.com/api/profile/academic-programs",
        user: "https://experience.elluciancloud.com/api/user",
        profile: "https://experience.elluciancloud.com/api/profile"
      },
      css: {
        react: {
          tabs: "#dashboard_tabs_container",
          stateContainer: "spaceDetailOuterDiv",
          tabsParent: "#maincontent"
        }
      },
      cards: {
        types: {
          embedded: "WysiwygCard",
          list: "all-accounts|Ellucian|Foundation|Quick%20Links",
          degreeworks: "s_degreeworks_link"
        },
        fixCard: {
          externalLinkUrl: null,
          dateCreated: 1,
          dateMarkedDefault: 0,
          configurationData: {
            card: {
              client: {}
            }
          },
          miniCardIcon: "file-signature",
          isVisible: true,
          externalLinkLabel: null,
          isExtensionTemplate: true,
          isLocked: true,
          roles: ["EXP_ADMIN_BZ", "EXP_EMPLOYEE_BZ"],
          isDefaultCard: false,
          dateMarkedLocked: 0,
          description: "MyMSU breaks without this",
          id: "my-msu-minus-card-fix",
          tags: ["card"],
          type: "all-accounts|Ellucian|Foundation|Quick%20Links",
          title: "MyMSU Breaks without this"
        }
      }
    },
    get: {
      API: {
        degreeworks: (gid) =>
          "https://degreeworks.montana.edu:5559/DashboardServlet/bz_PROD/?SCRIPT=SD2WORKS&PORTALSTUID=" +
          gid,
        embedded: (cardId) =>
          "https://experience.elluciancloud.com/api/embedded-html/" + cardId
      }
    }
  };

  class SharedPromise {
    promiseObject;
    promiseResolution;
    value;
    constructor() {
      const self = this;
      this.promiseObject = new Promise((resolve) => {
        self.promiseResolution = resolve;
      });
    }
    get() {
      return this.value
        ? new Promise((resolve) => resolve(this.value))
        : this.promiseObject;
    }
    updatePromise(value) {
      this.value = value;
      this.promiseResolution(value);
    }
  }

  class DomHelper {
    static el(tagName, options, children) {
      const element = document.createElement(tagName);
      for (const style in options.style) {
        if (Object.prototype.hasOwnProperty.call(options.style, style)) {
          element.style[style] = options.style[style];
        }
      }
      options.id && (element.id = options.id);
      options.href && (element.href = options.href);
      options.class && (element.className = options.class);
      options.text && (element.innerText = options.text);
      if (children && children.length !== 0) element.append(...children);
      return element;
    }
    static string(text) {
      const parser = new DOMParser();
      return parser.parseFromString(text, "text/html");
    }
    static strip(html, options = { imageSubstitute: "Link" }) {
      const images = Array.from(html.getElementsByTagName("img"));
      for (let image of images) {
        if (image.closest("a")) {
          const alt = image.alt;
          image.replaceWith(
            this.el("p", {
              class: "replace-image",
              text: alt && alt !== "" ? alt : options.imageSubstitute
            })
          );
        } else {
          image.remove();
        }
      }
      const brs = Array.from(html.getElementsByTagName("br"));
      for (let br of brs) {
        br.remove();
      }
      return Array.from(html.body.children);
    }
    static waitForElement(selector) {
      return new Promise((resolve) => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
        } else {
          const observer = new MutationObserver((_) => {
            if (document.querySelector(selector)) {
              observer.disconnect();
              resolve(document.querySelector(selector));
            }
          });
          observer.observe(document.documentElement, {
            childList: true,
            subtree: true
          });
        }
      });
    }
    static replaceStyling(element, cssText) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(cssText);
      element.adoptedStyleSheets = [sheet];
    }
    static addStyling(element, cssText) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(cssText);
      element.adoptedStyleSheets.push(sheet);
    }
  }
  const dom = DomHelper;

  customElements.define(
    "view-element",
    class ViewElement extends HTMLElement {
      disconnectedCallback() {
        this.dispatchEvent(new Event("disconnected"));
      }
    }
  );

  class OrderedDomView {
    children;
    body;
    constructor(className) {
      this.body = dom.el("div", {
        class: className
      });
      this.children = [];
    }
    getElement() {
      return this.body;
    }
    append(child, sortBy) {
      const childPair = {
        sortBy: sortBy,
        child: child
      };
      if (this.children.length === 0) {
        this.children.push(childPair);
        this.body.appendChild(child);
      } else {
        const index = this.children.findIndex((el) => {
          // We aren't taking advantage of better searching algorithms :/
          return el.sortBy.localeCompare(sortBy) >= 0;
        });
        if (index === -1) {
          this.children.push(childPair);
          this.body.appendChild(child);
        } else {
          const beforeChild = this.children[index].child;
          this.children.splice(index, 0, childPair);
          this.body.insertBefore(child, beforeChild);
        }
      }
    }
    remove(index) {
      this.children[index].child.remove();
      this.children.splice(index, 1);
    }
  }

  class UserDataManager {
    userDataPromise;
    constructor() {
      this.userDataPromise = new SharedPromise();
      this.initSetHooks();
    }
    initSetHooks() {
      const self = this;
      Object.defineProperties(window, {
        ___PRELOADED_STATE__: {
          value: "",
          writable: true
        },
        __PRELOADED_STATE__: {
          get: function () {
            return this.___PRELOADED_STATE__;
          },
          set: function (val) {
            this.___PRELOADED_STATE__ = val;

            self.parseState(this.___PRELOADED_STATE__);
          },
          configurable: true
        }
      });
    }
    parseState(state) {
      const value = JSON.parse(window.atob(state));
      this.userDataPromise.updatePromise(value);
    }

    getUserData() {
      return this.userDataPromise.get();
    }
  }
  class ReactManager {
    historyPromise;
    constructor() {
      this.initSetHooks();
      this.historyPromise = new SharedPromise();
    }
    initSetHooks() {
      function getState(element) {
        if (!element) return;
        const reactKey = Object.keys(element).find((key) =>
          key.startsWith("__reactProps")
        );
        if (reactKey) return element[reactKey]?.children?._owner?.stateNode;
      }
      const internal = getState(
        document.getElementById(Config.static.css.react.stateContainer)
      );
      if (internal) {
        this.handleInternal(internal);
        return;
      }
      const observer = new MutationObserver((_) => {
        const internal = getState(
          document.getElementById(Config.static.css.react.stateContainer)
        );
        if (internal) {
          observer.disconnect();
          this.handleInternal(internal);
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
    handleInternal(internal) {
      this.historyPromise.updatePromise(internal.props.history);
    }
    getHistory() {
      return this.historyPromise.get();
    }
  }

  class NetworkManager {
    fetch;
    cachedNavigation;
    reactManager;
    history;
    listeners;
    constructor(reactManager) {
      this.reactManager = reactManager;
      this.listeners = {};
      this.initOverrides();
      this.initReactHistory();
      this.initListeners();
    }
    initOverrides() {
      this.fetch = window.fetch;
      const self = this;
      window.fetch = async (...args) => {
        const [resource, config] = args;

        function overrideJson(contains, callback) {
          /* We cannot throw an error here. If any problem occurs, we need to pretend that everything is fine,
           * and just return the original fetch result */
          try {
            const index = resource.indexOf(contains);
            if (index !== -1) {
              response.json = () =>
                response
                  .clone()
                  .json()
                  .then((data) => callback(data, index));
            }
          } catch (_) {}
        }
        const response = await self.fetch.call(window, ...args);
        overrideJson("api/locked-cards", (data) => {
          if (config.method === "GET" || !config.method) data.cards = []; // Remove list of locked cards
          return data;
        });
        overrideJson("api/preferences", (data) => {
          if (config.method === "GET" || !config.method) {
            data.dashboard.cards = data.dashboard.cards.filter((card) => {
              return !card.isLocked;
            }); // Remove locked cards from preferences
          }
          return data;
        });
        overrideJson("api/dashboard-load", (data) => {
          if (config.method === "GET" || !config.method) {
            data.announcements = data.announcements.filter((item) => {
              return (
                item.externalLinkUrl !== "https://www.montana.edu/uit/mymsu"
              );
            });
            data.cardsConfiguration = data.cardsConfiguration.filter((card) => {
              return (
                card.type !== Config.static.cards.types.embedded &&
                card.type !== Config.static.cards.types.list
              );
            });
            data.cardsConfiguration.push(Config.static.cards.fixCard);
          }
          return data;
        });
        overrideJson("api/categories", (data) => {
          if (config.method === "GET" || !config.method) {
            for (const categoryItem of data) {
              categoryItem.cards.push(Config.static.cards.fixCard.id);
            }
          }
          return data;
        });
        return response;
      };
    }
    json(url) {
      const self = this;
      return new Promise((resolve) => {
        self.fetch
          .call(window, url)
          .then((response) => response.json())
          .then((json) => resolve(json));
      });
    }
    getCurrentSlug() {
      const pathName = window.location.pathname;
      const filter = "/montana";
      const filterIndex = pathName.indexOf(filter);
      if (filterIndex !== -1) {
        const path = pathName.slice(filter.length);
        const params = new URLSearchParams(window.location.search);
        const category = params.get("category");
        const result =
          path === "/discover"
            ? "all"
            : !category || category === "home"
              ? "dashboard"
              : category;
        return encodeURIComponent(result);
      } else {
        return false;
      }
    }
    initReactHistory() {
      this.reactManager.getHistory().then((propHistory) => {
        this.history = propHistory;
        if (this.cachedNavigation) {
          this.pushHistory(this.cachedNavigation);
        }
      });
    }
    pushHistory(navigation) {
      this.cachedNavigation = navigation;
      if (this.history) {
        this.history.push(navigation);
      }
    }
    initListeners() {
      window.addEventListener("popstate", (_) => {
        setTimeout(() => {
          this.dispatch("history", null);
        }, 1);
      });
    }
    addEventListener(type, callback) {
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(callback);
    }
    dispatch(type, data) {
      const listeners = this.listeners[type];
      if (listeners) {
        for (const listener of listeners) {
          listener(data);
        }
      }
    }
    getLastNavigation() {
      return this.cachedNavigation;
    }
    setLastNavigation(navigation) {
      this.cachedNavigation = navigation;
    }
  }
  class NotificationManager {
    notificationIdMap;
    previousNotificationIds;
    constructor() {
      this.notificationIdMap = {};
      this.previousNotificationIds = new Set();
    }
    loadNotifications(notifications) {
      const removedNotifications = new Set(this.previousNotificationIds);
      for (const notification of notifications) {
        const id = notification.id;
        if (this.previousNotificationIds.has(id)) {
          removedNotifications.delete(id);
          continue;
        }

        this.previousNotificationIds.add(id);
        this.notificationIdMap[id] = {
          start: notification.created,
          visibile: notification.starts,
          end: notification.expires,
          message: notification.message,
          source: notification.source
        };
        this.notificationIdMap[id].element = this.createElement(
          this.notificationIdMap[id]
        );
      }
      for (const notificationId of removedNotifications.keys()) {
        this.previousNotificationIds.delete(notificationId);
        this.notificationIdMap[notificationId].element.remove();
        delete this.notificationIdMap[notificationId];
      }
    }
    createElement(notificationNumber) {
      return null;
    }
    getFormattedDate(number) {
      return new Date(number * 1000).toLocaleString();
    }
  }

  class NavManager extends OrderedDomView {
    viewManager;
    userDataManager;
    networkManager;
    isResourceLoaded; // if fetched resources have returned
    navIdMap; // categoryId -> navItem
    cardClassMap; // cardId -> navId class
    categoryRequests; // array of requested categories for cardIds

    constructor(viewManager, userDataManager, networkManager) {
      super("navManager");
      this.viewManager = viewManager;
      this.userDataManager = userDataManager;
      this.networkManager = networkManager;
      this.isResourceLoaded = false;
      this.navIdMap = {};
      this.cardClassMap = {};
      this.categoryRequests = {};

      this.networkManager.addEventListener("history", this.historyChanged);
    }
    historyChanged() {
      const categoryItem = this.getCategoryBySlug(
        this.networkManager.getCurrentSlug()
      );
      if (
        categoryItem &&
        categoryItem.navigation !== this.networkManager.getLastNavigation()
      ) {
        // The nav bar does not reflect the url state, update
        this.networkManager.setLastNavigation(categoryItem.navigation);
        this.setNavSelection(categoryItem.id);
        this.viewManager.updateNav(
          categoryItem.id,
          categoryItem.navigation,
          false
        );
      }
    }
    // Handle categories + cards from fetch request results
    parseCategories(categories) {
      for (const category of categories) {
        const slug = encodeURIComponent(category.slug.toLowerCase());
        this.navIdMap[category.id] = {
          cards: category.cards,
          slug: slug,
          label: category.label,
          id: category.id,
          navigation: {
            pathname: "/",
            search: "category=" + slug
          }
        };
        this.navIdMap[category.id].navElement = this.createNavElement(
          category.id,
          category.label
        );
      }
      this.isResourceLoaded = true;
    }
    createNavElement(id, label) {
      const item = dom.el("span", {
        class: "nav-item",
        text: label
      });
      const self = this;
      const navigation = this.navIdMap[id].navigation;
      item.addEventListener(
        "click",
        function (_) {
          self.viewManager.updateNav(id, navigation, true);
          self.setNavSelection(id);
        },
        false
      );
      return item;
    }
    setNavSelection(id) {
      for (const categoryId of Object.keys(this.navIdMap)) {
        const navElement = this.navIdMap[categoryId].navElement;
        if (categoryId === id) {
          navElement.classList.add("selected");
        } else {
          navElement.classList.remove("selected");
        }
      }
    }
    // Returns a promise, resolves to cardId -> categoryId
    getCategory(cardId) {
      return new Promise((resolve) => {
        if (this.cardClassMap[cardId]) {
          resolve(this.cardClassMap[cardId]);
        } else {
          this.categoryRequests[cardId] = (categoryId) => resolve(categoryId);
        }
      });
    }
    getCategoryBySlug(slug) {
      for (const navId of Object.keys(this.navIdMap)) {
        const navItem = this.navIdMap[navId];
        if (navItem.slug === slug) {
          return navItem;
        }
      }
    }
    getCardIds(navId) {
      return this.navIdMap[navId].cards;
    }
    // Show nav items based on what cards the user has access to
    showNavForCardIds(cardIds) {
      for (const categoryId of Object.keys(this.navIdMap)) {
        const navItem = this.navIdMap[categoryId];
        let isItemAdded = false;
        for (const cardId of navItem.cards) {
          if (this.cardClassMap[cardId] === undefined)
            this.cardClassMap[cardId] = ["id-all"];
          this.cardClassMap[cardId].push("id-" + categoryId);
          // If we haven't added this category yet and we have a cardId from that category, add it to the dom
          if (cardIds.includes(cardId) && !isItemAdded) {
            this.append(navItem.navElement, navItem.label);
            isItemAdded = true;
          }
        }
      }
      // Resolve all requests for cardId -> categoryId
      for (const cardId of Object.keys(this.categoryRequests)) {
        const request = this.categoryRequests[cardId];
        const categoryId = this.cardClassMap[cardId];
        if (categoryId) {
          request(categoryId);
        }
      }
      // We should never have leftover requests after this step
      if (Object.keys(this.categoryRequests).length !== 0) {
        console.log("Unresolved cardIds:", Object.keys(this.categoryRequests));
        for (const cardId of Object.keys(this.categoryRequests)) {
          const request = this.categoryRequests[cardId];
          request("all");
        }
      }
      this.createFakeNavItem(
        "all",
        "all",
        "All",
        cardIds,
        {
          pathname: "/discover",
          search: ""
        },
        "a"
      );
      this.createFakeNavItem(
        "dashboard",
        "dashboard",
        "Dashboard",
        [],
        {
          pathname: "/",
          search: ""
        },
        "Dashboard"
      );
    }
    createFakeNavItem(id, slug, label, cardIds, navigation, sortBy) {
      this.navIdMap[id] = {
        id: id,
        slug: slug,
        cards: cardIds,
        navigation: navigation
      };
      const item = this.createNavElement(id, label);
      this.navIdMap[id].navElement = item;
      this.append(item, sortBy);
    }
  }

  class CardManager extends OrderedDomView {
    viewManager;
    userDataManager;
    networkManager;
    isResourceLoaded;
    cardIdMap;
    constructor(viewManager, userDataManager, networkManager) {
      super("cardManager");
      this.viewManager = viewManager;
      this.userDataManager = userDataManager;
      this.networkManager = networkManager;
      this.isResourceLoaded = false;
      this.cardIdMap = {};
    }
    getCardIds() {
      return Object.keys(this.cardIdMap);
    }
    parseDashboard(json) {
      for (const card of json.cardsConfiguration) {
        this.cardIdMap[card.id] = { card: card };
        // For all the embedded cards, fetch each individual resource and handle it
        if (card.type === Config.static.cards.types.embedded) {
          this.networkManager
            .json(Config.get.API.embedded(card.id))
            .then((htmlString) => {
              this.handleCard(
                dom.strip(dom.string(htmlString), {
                  imageSubstitute: card.title
                }),
                card
              );
            });
        } else if (card.type === Config.static.cards.types.list) {
          const linkList =
            card.configurationData.card.customConfiguration.client.linkList;
          const links = linkList.map((link) => {
            return dom.el("a", { href: link.url }, [
              dom.el("p", { text: link.name })
            ]);
          });
          this.handleCard(links, card);
        } else if (
          card.type.indexOf(Config.static.cards.types.degreeworks) !== -1
        ) {
          const degreeworksLink = dom.el("a", {}, [
            dom.el("p", { text: card.title })
          ]);
          this.userDataManager.getUserData().then((data) => {
            degreeworksLink.href = Config.get.API.degreeworks(data.user.erpId);
          });
          this.handleCard([degreeworksLink], {
            title: card.title,
            id: card.id
          });
        }
      }
      this.isResourceLoaded = true;
    }
    createCardElement(contents, card) {
      const title = [
        dom.el("span", {
          class: "card-title",
          text: card.title
        })
      ];
      if (card.externalLinkUrl) {
        // The "..." on the default cards
        title.push(
          dom.el(
            "a",
            {
              class: "title-link",
              href: card.externalLinkUrl
            },
            [
              dom.el("button", {
                text:
                  card.externalLinkLabel && card.externalLinkLabel !== ""
                    ? card.externalLinkLabel
                    : "Link"
              })
            ]
          )
        );
      }
      return dom.el("div", { class: "flattened-card" }, [
        dom.el("span", { class: "title-container" }, title),
        dom.el("div", { class: "card-contents" }, contents)
      ]);
    }
    handleCard(contents, card) {
      const cardElement = this.createCardElement(contents, card);
      this.viewManager
        .getCardCategory(card.id)
        .then((categoryId) => cardElement.classList.add(...categoryId)); // request the category id
      this.cardIdMap[card.id].cardElement = cardElement;
      this.append(cardElement, card.title); // add to dom, sort by title
    }
  }

  // coordinates navManager and cardManager, attaches them to shadow dom
  class ViewManager {
    navManager;
    cardManager;
    userDataManager;
    networkManager;
    reactManager;
    domElement;
    body;
    constructor() {
      this.reactManager = new ReactManager();
      this.networkManager = new NetworkManager(this.reactManager);
      this.userDataManager = new UserDataManager();
      this.navManager = new NavManager(
        this,
        this.userDataManager,
        this.networkManager
      );
      this.cardManager = new CardManager(
        this,
        this.userDataManager,
        this.networkManager
      );
    }
    build() {
      /*
       * Custom view-element dispatches a "disconnect" event when removed from the dom
       */
      this.domElement = dom.el("view-element", {
        id: "MyMSUViewManager",
        style: {
          "padding-right": "1em",
          "padding-left": "1em",
          display: "block"
        }
      });
      this.domElement.addEventListener("disconnected", (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        // Appending to a new parent dispatches the event as well
        if (!this.domElement.isConnected) this.attach();
      });

      this.domElement.attachShadow({ mode: "open" });
      this.body = dom.el(
        "div",
        {
          class: "body"
        },
        [
          this.navManager.getElement(),
          dom.el("div", { class: "yellow-bar" }),
          this.cardManager.getElement()
        ]
      );
      const resetElement = dom.el(
        "div",
        {
          class: "reset",
          style: {
            all: "initial"
          }
        },
        [this.body]
      );
      this.domElement.shadowRoot.appendChild(resetElement);
      this.loadResources();
      // Cheap way to hide native navbar
      dom.addStyling(
        document,
        Config.static.css.react.tabs + "{display:none !important;}"
      );

      this.attach();
    }
    attach() {
      // Insert below native nav bar
      document.documentElement.appendChild(this.domElement);
      dom.waitForElement("body").then((element) => {
        if (element.firstChild) {
          element.insertBefore(this.domElement, element.firstChild);
        } else {
          element.appendChild(this.domElement);
        }
        dom
          .waitForElement(Config.static.css.react.tabsParent)
          .then((element) => {
            element.parentElement.insertBefore(this.domElement, element);
          });
      });
    }
    loadResources() {
      this.networkManager
        .json(Config.static.API.categories)
        .then((categories) => {
          this.navManager.parseCategories(categories);
          this.checkIsLoaded();
        });
      this.networkManager
        .json(Config.static.API.dashboard)
        .then((dashboard) => {
          this.cardManager.parseDashboard(dashboard);
          this.checkIsLoaded();
        });
    }
    checkIsLoaded() {
      if (
        this.cardManager.isResourceLoaded &&
        this.navManager.isResourceLoaded
      ) {
        // When both resources are loaded, feed cards into nav for filtering
        this.navManager.showNavForCardIds(this.cardManager.getCardIds());
        const currentSlug = this.networkManager.getCurrentSlug();
        const categoryItem = this.navManager.getCategoryBySlug(currentSlug);
        // Update nav state if needed
        if (categoryItem) {
          this.navManager.setNavSelection(categoryItem.id);
          this.updateNav(categoryItem.id, categoryItem.navigation, false);
        }
      }
    }
    updateNav(id, navigation, shouldPush) {
      dom.replaceStyling(
        this.domElement.shadowRoot,
        `.id-${id} {display: initial !important}`
      );

      shouldPush && this.networkManager.pushHistory(navigation);
    }
    getCardCategory(cardId) {
      return this.navManager.getCategory(cardId);
    }
  }

  const viewManager = new ViewManager();
  viewManager.build();
})();
