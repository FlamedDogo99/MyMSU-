(function() {
  // basic dom builder
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

  // creates a shadow dom with an ordered set of elements
  class OrderedBuilder {
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

    // Insert the child into the shadow dom, sorted by sortBy
    append(child, sortBy) {
      const childPair = {
        sortBy: sortBy,
        child: child
      }
      if(this.children.length === 0) {                // If the list is empty, just push the item
        this.children.push(childPair)
        this.body.appendChild(child);
      } else {
        const index = this.children.findIndex(el => { //Get what item index alphabetically by sortBy
          return el.sortBy.localeCompare(sortBy) >= 0
        })
        if(index === -1) {                            // if the index is at the end
          this.children.push(childPair)               // push the item
          this.body.appendChild(child);
        } else {                                        // otherwise
          const beforeChild = this.children[index].child;  // insert the item at the index
          this.children.splice(index, 0, childPair)
          this.body.insertBefore(child, beforeChild)
        }
      }
    }
  }

  class NavBuilder extends OrderedBuilder {
    isResourceLoaded
    viewBuilder
    navIdMap;
    constructor(viewBuilder) {
      super("navBuilder");
      this.viewBuilder = viewBuilder;
      this.isResourceLoaded = false;
      this.navIdMap = {};
    }
    loadResource(resourceUrl) {
      return new Promise(resolve => {
        fetch(resourceUrl)
          .then(result => result.json())
          .then(json => {
            this.handleResource(json)
            this.isResourceLoaded = true;
            resolve();
          })
      })
    }

    handleResource(json) {
      for(const category of json) {
        const navElement = this.createNavElement(category, category.id)
        const slugComponent = encodeURIComponent(category.slug.toLowerCase())

        this.navIdMap[category.id] = {
          category: category,
          navElement: navElement,
          slugComponent: slugComponent
        }
      }
    }
    createNavElement(category, id) {
      const item = dom("span", {
        class: "nav-item",
        text: category.label,
      })
      const self = this
      item.addEventListener("click", function(_){
        self.viewBuilder.updateNav(id);
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

    showNavForCardIds(cardIds) {
      for(const categoryId of Object.keys(this.navIdMap)) {
        const navItem = this.navIdMap[categoryId];
        for(const cardId of navItem.category.cards) {
          if(cardIds.includes(cardId)) {
            this.append(navItem.navElement, navItem.category.label)
            break;
          }
        }
      }
      const allItem = this.createNavElement({label: "All"}, "all")
      const self = this
      allItem.addEventListener("click", function(_){
        self.setNavSelection("all")
      }, false)
      this.append(allItem, "a");
      this.navIdMap["all"] = {
        id: "all",
        navElement: allItem,
        cards: cardIds
      }
    }
  }

  class DisplayBuilder extends OrderedBuilder {
    isResourceLoaded;

    cardIdMap;
    constructor() {
      super("displayBuilder");
      this.isResourceLoaded = false;
      this.cardIdMap = {};
    }
    loadResource(resourceUrl) {
      return new Promise(resolve => {
        fetch(resourceUrl)
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
        if(card.type === "WysiwygCard") {
          fetch("https://experience.elluciancloud.com/api/embedded-html/" + card.id)
            .then(result => result.json())
            .then(htmlString => {
              this.handleCardResource(htmlString, card);
            })
        }
      }
    }
    createCardElement(htmlString, card) {
      const title = [
        dom("span", {
          class: "card-title",
          text: card.title
        }),
      ]
      if (card.externalLinkUrl) {
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
        dom("div", {class: "card-contents"}, dom.string(htmlString, {
          imageSubstitute: card.title
        }))
      ])
    }
    handleCardResource(htmlString, card) {
      const cardElement = this.createCardElement(htmlString, card);
      this.cardIdMap[card.id].cardElement = cardElement;
      this.append(cardElement, card.title);
    }
  }

  class ViewBuilder {
    navBuilder;
    displayBuilder;
    domElement;
    body;
    constructor() {
      this.navBuilder = new NavBuilder(this);
      this.displayBuilder = new DisplayBuilder();
    }
    getNavSelection() {
      if(window.location.pathname === "/montana/discover") return {
        type: "all",
        id: false
      }
      const params = new URLSearchParams(window.location.search);
      return {
        type: params.get("category"),
        id: true
      }
    }
    updateNav(id) {

    }
    attach(element) {
      element.parentElement.insertBefore(this.domElement, element);
    }
    build() {
      this.domElement = dom("div", {
        id: "MyMSUNavBuilder",
        //TODO: Better padding
        style: {
          "padding-top": "4em",
          "padding-right": "1em",
          "padding-left": "1em"
        }
      });
      this.domElement.attachShadow({mode: "open"})
      this.body = dom("div", {
        class: "body"
      }, [
        this.navBuilder.getElement(),
        this.displayBuilder.getElement()
      ]);
      // Needed for removing inherited styles
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
      if(document.getElementById("root")) {
        this.attach(document.getElementById("root"));
      } else { // or wait until it exists
        const observer = new MutationObserver(_ => {
          if (document.getElementById("root")) {
            observer.disconnect();
            this.attach(document.getElementById("root"));
          }
        });
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
    }
    loadResources() {
      this.navBuilder.loadResource("https://experience.elluciancloud.com/api/categories")
        .then(() => this.checkIsLoaded())
      this.displayBuilder.loadResource("https://experience.elluciancloud.com/api/dashboard-load")
        .then(() => this.checkIsLoaded())
    }
    checkIsLoaded() {
      if(this.displayBuilder.isResourceLoaded && this.navBuilder.isResourceLoaded) {
        this.navBuilder.showNavForCardIds(this.displayBuilder.getCardIds())
        this.navBuilder.setNavSelection("all")

      }
    }

    locationChange() {

    }
  }

  const viewBuilder = new ViewBuilder();
  viewBuilder.build();

  // Temporary solution for updating the fake nav bar when the real one changes
  const oldPushState = history.pushState;
  history.pushState = function(...args) {
    oldPushState.call(this, ...args)
    viewBuilder.locationChange();
  }

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
        });
      }
      return data;
    });
    return response;
  };
})()