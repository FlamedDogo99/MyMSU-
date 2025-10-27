(function() {

  const invasive = true;
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [resource, config] = args;

    function overrideJson(contains, callback) {
      /* We cannot throw an error here. If any problem occurs, we need to pretend that everything is fine,
       * and just return the original fetch result */
      try {
        const index = resource.indexOf(contains)
        if (index !== -1) {
          response.json = () =>
            response
              .clone()
              .json()
              .then((data) => callback(data, index));
        }
      } catch (_) {
      }
    }
    const response = await originalFetch.call(this, ...args);
    overrideJson("api/locked-cards", (data) => {
      if (config.method === "GET" || !config.method) data.cards = []; // Remove list of locked cards
      return data;
    });
    overrideJson("api/preferences", (data) => {
      if (config.method === "GET" || !config.method) {
        data.dashboard.cards = data.dashboard.cards.filter(card => {
          return !card.isLocked;
        }); // Remove locked cards from preferences
      }
      return data;
    });
    overrideJson("api/dashboard-load", (data) => {
      if (config.method === "GET" || !config.method) {
        data.announcements = data.announcements.filter((item) => {
          return item.externalLinkUrl !== "https://www.montana.edu/uit/mymsu";
        });
        if(invasive) data.cardsConfiguration = data.cardsConfiguration.filter(card => {
          return card.type !== "WysiwygCard" && card.type !== "all-accounts|Ellucian|Foundation|Quick%20Links"
        });
      }
      return data;
    });
    return response;
  };
  if(!invasive) return
  /*
   * Get state used by react props
   */
  function getReactState() {
    function getState(element) {
      if(!element) return;
      const reactKey  = Object.keys(element).find(key => key.startsWith("__reactProps"));
      if(reactKey) return element[reactKey]?.children?._owner?.stateNode;
    }
    return new Promise(resolve => {
      const internal = getState(document.getElementById("spaceDetailOuterDiv"))
      if (internal) {
        return resolve(internal);
      }
      const observer = new MutationObserver(_ => {
        const internal = getState(document.getElementById("spaceDetailOuterDiv"));
        if (internal) {
          observer.disconnect();
          resolve(internal);
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    });
  }
  /*
   * Helper function, returns promise for element by id
   */
  function waitForElementId(id) {
    return new Promise(resolve => {
      if(document.getElementById(id)) {
        resolve(document.getElementById(id));
      } else {
        const observer = new MutationObserver(_ => {
          if (document.getElementById(id)) {
            observer.disconnect();
            resolve(document.getElementById(id));
          }
        });
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
    });
  }
  /*
   * React will remove the ViewManager element when it changes state.
   * This allows us to detect removal and reinsert the ViewManager element
   * back into the dom
   */
  class ViewElement extends HTMLElement {
    constructor() {
      super();
    }
    disconnectedCallback() {
      this.dispatchEvent(new Event("disconnected"))
    }
  }
  customElements.define("view-element", ViewElement);

  /*
   * Basic dom builder
   */
  const dom = function(tagName, options, children) {
    const element = document.createElement(tagName);
    for(const style in options.style) {
      if(Object.prototype.hasOwnProperty.call(options.style, style)) {
        element.style[style] = options.style[style];
      }
    }
    options.id && (element.id = options.id);
    options.href && (element.href = options.href);
    options.class && (element.className = options.class);
    options.text && (element.innerText = options.text);
    if(children && children.length !== 0) element.append(...children);
    return element;
  }
  dom.string = function(text, options = {
    imageSubstitute: "Link"
  }) {
    const parser = new DOMParser();
    const html = parser.parseFromString(text, "text/html");
    //TODO: separate the filtering logic
    const images = Array.from(html.getElementsByTagName("img"));
    for(let image of images) {
      if(image.closest("a")) {
        const alt = image.alt;
        image.replaceWith(dom("p", {
          class: "replace-image",
          text: alt && alt !== "" ? alt : options.imageSubstitute
        }))
      } else {
        image.remove();
      }
    }
    const brs = Array.from(html.getElementsByTagName("br"));
    for(let br of brs) {
      br.remove();
    }
    return Array.from(html.body.children);
  }
  /*
   * View builder that inserts children in alphabetical order into the dom
   */
  class OrderedDomView {
    children;
    body;
    constructor(className) {
      this.body = dom("div", {
        class: className
      })
      this.children = [];
    }
    getElement() {
      return this.body;
    }
    append(child, sortBy) {
      const childPair = {
        sortBy: sortBy,
        child: child
      }
      if(this.children.length === 0) {
        this.children.push(childPair)
        this.body.appendChild(child);
      } else {
        const index = this.children.findIndex(el => {
          return el.sortBy.localeCompare(sortBy) >= 0
        })
        if(index === -1) {
          this.children.push(childPair)
          this.body.appendChild(child);
        } else {
          const beforeChild = this.children[index].child;
          this.children.splice(index, 0, childPair)
          this.body.insertBefore(child, beforeChild)
        }
      }
    }
  }

  class UserDataManager {
    userData;
    constructor() {
      this.hookNativeObject();
    }
    hookNativeObject() {
      const self = this
      Object.defineProperties(window, {
        ___PRELOADED_STATE__: {
          value: '',
          writable: true
        },
        __PRELOADED_STATE__: {
          get: function() {
            return this.___PRELOADED_STATE__;
          },
          set: function(val) {
            this.___PRELOADED_STATE__ = val;
            self.handleRawData(this.___PRELOADED_STATE__);
          },
          configurable: true
        }
      });
    }
    handleRawData(data) {
      this.userData = JSON.parse(window.atob(data))
    }
    getUserData() {
      return this.userData
    }
  }

  class NavManager extends OrderedDomView {
    isResourceLoaded // if fetched resources have returned
    viewManager
    navIdMap; // categoryId -> navItem
    cardClassMap; // cardId -> navId class
    categoryRequests; // array of requested categories for cardIds

    reactState; // react state object from dom
    cachedNavigation; // Last state set from navigating using the navManager


    constructor(viewManager) {
      super("navManager");
      this.viewManager = viewManager;
      this.isResourceLoaded = false;
      this.navIdMap = {};
      this.cardClassMap = {}
      this.categoryRequests = {};

      getReactState()
        .then(reactState => {
          this.reactState = reactState;
          window.REACTSTATE = reactState;

          // If we've already changed our nav state, update the react components
          if(this.cachedNavigation) {
            this.pushHistory(this.cachedNavigation)
          }
        })
      const self = this
      window.addEventListener("popstate", (event) => {
        setTimeout(() => {
          self.historyChanged();
        },1)
      })
    }
    historyChanged() {
      const categoryItem = this.getCategoryBySlug(this.viewManager.getCurrentSlug())
      if(categoryItem && categoryItem.navigation !== this.cachedNavigation) {
        // The nav bar does not reflect the url state, update
        this.cachedNavigation = categoryItem.navigation
        this.setNavSelection(categoryItem.id)
        this.viewManager.updateNav(categoryItem.id, categoryItem.navigation, false)
      }
    }
    // Tell react to change it's internal history, or cache the changes for later if we can't currently
    pushHistory(navigation) {
      this.cachedNavigation = navigation
      if(this.reactState) {
        this.reactState.props.history.push(navigation)
      }
    }
    loadResource(resourceUrl) {
      return new Promise(resolve => {
        originalFetch(resourceUrl)
          .then(result => result.json())
          .then(json => {
            this.handleResource(json)
            this.isResourceLoaded = true;
            resolve();
          })
      })
    }
    // Handle categories + cards from fetch request results
    handleResource(json) {
      for(const category of json) {
        const slug = encodeURIComponent(category.slug.toLowerCase())
        this.navIdMap[category.id] = {
          cards: category.cards,
          slug: slug,
          label: category.label,
          id: category.id,
          navigation: {
            pathname: "/",
            search: "category=" + slug
          }
        }
        this.navIdMap[category.id].navElement = this.createNavElement(category.id, category.label);

      }
    }
    createNavElement(id, label) {
      const item = dom("span", {
        class: "nav-item",
        text: label,
      })
      const self = this
      const navigation = this.navIdMap[id].navigation
      item.addEventListener("click", function(_){
        self.viewManager.updateNav(id, navigation, true);
        self.setNavSelection(id)
      }, false)
      return item;
    }
    setNavSelection(id) {
      for(const categoryId of Object.keys(this.navIdMap)) {
        const navElement = this.navIdMap[categoryId].navElement
        if(categoryId === id) {
          navElement.classList.add("selected")
        } else {
          navElement.classList.remove("selected")
        }
      }
    }
    // Returns a promise, resolves to cardId -> categoryId
    getCategory(cardId) {
      return new Promise(resolve => {
        if(this.cardClassMap[cardId]){
          resolve(this.cardClassMap[cardId])
        } else {
          this.categoryRequests[cardId] = categoryId => resolve(categoryId)
        }
      })
    }
    getCategoryBySlug(slug) {
      for(const navId of Object.keys(this.navIdMap)) {
        const navItem = this.navIdMap[navId]
        if(navItem.slug === slug) {
          return navItem
        }
      }
    }
    getCardIds(navId) {
      return this.navIdMap[navId].cards
    }
    // Show nav items based on what cards the user has access to
    showNavForCardIds(cardIds) {
      for(const categoryId of Object.keys(this.navIdMap)) {
        const navItem = this.navIdMap[categoryId];
        let isItemAdded = false;
        for(const cardId of navItem.cards) {
          if(this.cardClassMap[cardId] === undefined) this.cardClassMap[cardId] = ["id-all"]
          this.cardClassMap[cardId].push("id-" + categoryId)
          // If we haven't added this category yet and we have a cardId from that category, add it to the dom
          if(cardIds.includes(cardId) && !isItemAdded) {
            this.append(navItem.navElement, navItem.label)
            isItemAdded = true;
          }
        }
      }
      // Resolve all requests for cardId -> categoryId
      for(const cardId of Object.keys(this.categoryRequests)) {
        const request = this.categoryRequests[cardId];
        const categoryId = this.cardClassMap[cardId];
        if(categoryId) {
          request(categoryId)
        }
      }
      // We should never have leftover requests after this step
      if(Object.keys(this.categoryRequests).length !== 0) debugger;
      this.createFakeNavItem("all", "all", "All", cardIds, {
        pathname: "/discover",
        search: ""
      }, "a");
      this.createFakeNavItem("dashboard", "dashboard", "Dashboard", [], {
        pathname: "/",
        search: ""
      }, "Dashboard");

    }
    createFakeNavItem(id, slug, label, cardIds, navigation, sortBy) {
      this.navIdMap[id] = {
        id: id,
        slug: slug,
        cards: cardIds,
        navigation: navigation
      }
      const item = this.createNavElement(id, label)
      this.navIdMap[id].navElement = item;
      this.append(item, sortBy);
    }
  }

  class CardManager extends OrderedDomView {
    isResourceLoaded;
    viewManager;

    cardIdMap;
    constructor(viewManager) {
      super("cardManager");
      this.viewManager = viewManager;
      this.isResourceLoaded = false;
      this.cardIdMap = {};
    }
    loadResource(resourceUrl) {
      return new Promise(resolve => {
        originalFetch(resourceUrl)
          .then(result => result.json())
          .then(json => {
            this.handleResource(json)
            this.isResourceLoaded = true;
            resolve();
          })
      })
    }
    getCardIds() {
      return Object.keys(this.cardIdMap);
    }
    handleResource(json) {
      for(const card of json.cardsConfiguration) {
        this.cardIdMap[card.id] = {card: card}
        // For all the embedded cards, fetch each individual resource and handle it
        if(card.type === "WysiwygCard") {
          originalFetch("https://experience.elluciancloud.com/api/embedded-html/" + card.id)
            .then(result => result.json())
            .then(htmlString => {
              this.handleCard(dom.string(htmlString, {
                imageSubstitute: card.title
              }), card);
            })
        } else if(card.type === "all-accounts|Ellucian|Foundation|Quick%20Links") {
          const linkList = card.configurationData.card.customConfiguration.client.linkList
          const links = linkList.map(link => {
            return dom("a", {href: link.url}, [
              dom("p", {text: link.name})
            ])
          })
          this.handleCard(links, card);

        }
      }
    }
    createCardElement(contents, card) {
      const title = [
        dom("span", {
          class: "card-title",
          text: card.title
        }),
      ]
      if (card.externalLinkUrl) { // The "..." on the default cards
        title.push(
          dom("a", {
            class: "title-link",
            href: card.externalLinkUrl
          }, [
            dom("button", {
              text: card.externalLinkLabel && card.externalLinkLabel !== "" ? card.externalLinkLabel : "Link",
            })
          ]),
        )
      }
      return dom("div", {class: "flattened-card"}, [
        dom("span", {class: "title-container"}, title),
        dom("div", {class: "card-contents"}, contents)
      ])
    }
    handleCard(contents, card) {
      const cardElement = this.createCardElement(contents, card);
      this.viewManager.getCardCategory(card.id)
        .then(categoryId => cardElement.classList.add(...categoryId)) // request the category id
      this.cardIdMap[card.id].cardElement = cardElement;
      this.append(cardElement, card.title); // add to dom, sort by title
    }
  }

  // coordinates navManager and cardManager, attaches them to shadow dom
  class ViewManager {
    navManager;
    cardManager;
    userDataManager;
    domElement;
    body;
    constructor() {
      this.navManager = new NavManager(this);
      this.cardManager = new CardManager(this);
      this.userDataManager = new UserDataManager();
    }
    build() {
      /*
       * Custom view-element dispatches a "disconnect" event when removed from the dom
       */
      this.domElement = dom("view-element", {
        id: "MyMSUViewManager",
        //TODO: Better padding
        style: {
          "padding-top": "4em",
          "padding-right": "1em",
          "padding-left": "1em"
        }
      });
      this.domElement.addEventListener("disconnected", event => {
        event.stopImmediatePropagation();
        event.preventDefault();
        // Appending to a new parent dispatches the event as well
        if(!this.domElement.isConnected) this.attach();
      })

      this.domElement.attachShadow({mode: "open"})
      this.body = dom("div", {
        class: "body"
      }, [
        this.navManager.getElement(),
        dom("div", {class: "yellow-bar"}),
        this.cardManager.getElement()
      ]);
      const resetElement = dom("div", {
        class: "reset",
        style: {
          all: "initial"
        }
      }, [
        this.body
      ])
      this.domElement.shadowRoot.appendChild(resetElement);
      this.loadResources();
      // Cheap way to hide native navbar
      const oldNavSheet = new CSSStyleSheet()
      oldNavSheet.replaceSync("#dashboard_tabs_container{display:none !important;}")
      document.adoptedStyleSheets.push(oldNavSheet);

      this.attach();

    }
    attach() {
      // Insert below native nav bar
      document.documentElement.appendChild(this.domElement);
      waitForElementId("maincontent")
        .then(element => {
          document.getElementById("dashboard_tabs_container")
          element.parentElement.insertBefore(this.domElement, element);
        });
    }
    getCurrentSlug() {
      // get slug from current url
      const pathName = window.location.pathname;
      const filter = "/montana"
      const filterIndex = pathName.indexOf(filter);
      if(filterIndex !== -1) {
        const path = pathName.slice(filter.length);
        const params = new URLSearchParams(window.location.search)
        const category = params.get("category")
        const result = path === "/discover" ? "all" : (!category || category === "home" ? "dashboard" : category)
        return encodeURIComponent(result);
      } else {
        return false;
      }
    }
    loadResources() {
      this.navManager.loadResource("https://experience.elluciancloud.com/api/categories")
        .then(() => this.checkIsLoaded())
      this.cardManager.loadResource("https://experience.elluciancloud.com/api/dashboard-load")
        .then(() => this.checkIsLoaded())
    }
    checkIsLoaded() {
      if(this.cardManager.isResourceLoaded && this.navManager.isResourceLoaded) {
        // When both resources are loaded, feed cards into nav for filtering
        this.navManager.showNavForCardIds(this.cardManager.getCardIds())
        const currentSlug = this.getCurrentSlug()
        const categoryItem = this.navManager.getCategoryBySlug(currentSlug)
        // Update nav state if needed
        if(categoryItem) {
          this.navManager.setNavSelection(categoryItem.id)
          this.updateNav(categoryItem.id, categoryItem.navigation, false)
        }
      }
    }
    updateNav(id, navigation, shouldPush) {
      // apply css that unhides a specific class of cards
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(`.id-${id} {display: initial !important}`)
      this.domElement.shadowRoot.adoptedStyleSheets = [sheet]
      shouldPush && this.navManager.pushHistory(navigation);
    }
    getCardCategory(cardId) {
      return this.navManager.getCategory(cardId)
    }

  }

  const viewManager = new ViewManager();
  viewManager.build();
})()
