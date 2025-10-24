(function() {
  // create elements
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
    if(options.onClick) element.addEventListener("click", _ => options.onClick, false);
    if(children && children.length !== 0) element.append(...children);
    return element;
  }
  // create dom from string
  //TODO: separate the filtering logic
  dom.string = function(text, options = {
    imageSubstitute: "Link"
  }) {
    const parser = new DOMParser();
    const html = parser.parseFromString(text, "text/html");
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
    element;
    children;
    body;
    constructor(id, attachId) {
      // id is the element's id
      // attachId is where to attach before
      this.element = dom("div", {
        id: id,
        style: {
          "padding-top": "4em",
          "padding-right": "1em",
          "padding-left": "1em"
        }
      });
      this.element.attachShadow({mode: "open"})
      this.body = dom("div", {
        id: "body"
      })
      // Needed for removing inherited styles
      const html = dom("div", {
        id: "html",
        style: {
          all: "initial"
        }
      }, [
        this.body
      ])
      this.element.shadowRoot.appendChild(html);
      this.children = [];
      // attach to dom
      if(document.getElementById(attachId)) {
        this.attach(document.getElementById(attachId));
      } else { // or wait until it exists
        const observer = new MutationObserver(_ => {
          if (document.getElementById(attachId)) {
            observer.disconnect();
            this.attach(document.getElementById(attachId));
          }
        });
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
    }
    // Insert the child into the shadow dom, sorted by sortBy
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
          const afterChild = this.children[index].child;
          this.children.splice(index, 0, childPair)
          this.body.insertBefore(child, afterChild)
        }
      }
    }
    attach(element) {
      throw new SyntaxError("Method attach must be implemented");
    }
    addItem() {
      throw new SyntaxError("Method addItem must be implemented");
    }
  }

  class NavBuilder extends OrderedBuilder {
    cardCategoryMap;
    categoryMap;
    cardMap;
    constructor() {
      super("MyMSU Minus Nav Builder", "root")
      this.cardCategoryMap = {}
      this.categoryMap = {}
      this.cardMap = {}
    }
    attach(element) {
      element.parentElement.insertBefore(this.element, element);
    }
    createNavItem(label, slug) {
      const item = dom("span", {
        class: "nav-item",
        text: label
      })
      item.slug = slug;
      return item;
    }
    /*
     * Alright, buckle up because this is really stupid.
     * We receive the category data that consists of categories, and their associated card id's
     * MyMSU then builds the nav only based on what cards the user is sent
     * I want to load the nav and cards at the same time, so we implement a queue for categories
     * and cards, and update them each time a category or card is added
     */
    queueItem(category) {
      const item = this.createNavItem(category.label, category.slug);

      item.cardIds = category.cards
      //TODO: Use this when we're filtering the displayed cards? It already seems like a pain to delete
      this.categoryMap[category.id] = {item: item, sortBy: category.label} // map for category id --> nav item
      for(const cardId of category.cards) { // For each card in that category
        this.cardCategoryMap[cardId] = category.id; // map card id --> category id
        if(this.cardMap[cardId]) {                  // and if that card has already been loaded
          this.addForCard(this.cardMap[cardId])     // get the nav item loaded using addForCard
          return;
        }
      }
    }
    addForCard(card) {
      const categoryId = this.cardCategoryMap[card.id]
      if(categoryId) {                                    // If we've processed a nav item that has this card
        const navItem = this.categoryMap[categoryId];
        if(navItem) {                                   // And if we haven't processed the associated nav item yet
          delete this.categoryMap[categoryId];
          this.append(navItem.item, navItem.sortBy);    // process it
        }
      } else {                                          // if we haven't seen this card from the category's cards
        this.cardMap[card.id] = card;                   // save it and it's id so we can check it when loading categories
      }
    }
  }

  class DisplayBuilder extends OrderedBuilder {
    constructor() {
      super("MyMSU Minus Display Builder", "root");
    }

    attach(element) {
      element.parentElement.insertBefore(this.element, element);
    }

    addItem(data, card) {
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
      const item = dom("div", {class: "flattened-card"}, [
        dom("span", {class: "title-container"}, title),
        dom("div", {class: "card-contents"}, dom.string(data, {
          imageSubstitute: card.title
        }))
      ])
      this.append(item, card.title);
    }
  }
  const navBuilder = new NavBuilder();
  const displayBuilder = new DisplayBuilder();

  function handleCard(card) {
    const resourceURL = "https://experience.elluciancloud.com/api/embedded-html/" + card.id
    fetch(resourceURL)
      .then(response => response.json())
      .then(data => {
        displayBuilder.addItem(data, card)
      });
  }

  const dashboard = "https://experience.elluciancloud.com/api/dashboard-load"
  fetch(dashboard)
    .then((result) => result.json())
    .then(data => {
      for (const card of data.cardsConfiguration) {
        navBuilder.addForCard(card)
        switch (card.type) {
          case "WysiwygCard":
            handleCard(card);
            break;
          default:
            console.log("Unsupported type: " + card.type);
        }
      }
    });
  const categories = "https://experience.elluciancloud.com/api/categories";
  fetch(categories)
    .then(result => result.json())
    .then(data => {
      for(const category of data) {
        navBuilder.queueItem(category);
      }
    });

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
    // overrideJson("api/categories", (data) => {
    //   if (config.method === "GET" || !config.method) {
    //     const admin = data.find((item) => item.slug === "Administrative Tools");
    //     admin.cards.push("0dce8c66-00ed-495f-bc2b-454b6c0106f5")
    //   }
    //   return data;
    // });

    return response;
  };
})()